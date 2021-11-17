// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "../common/AccessibleCommon.sol";
import {DSMath} from "../libraries/DSMath.sol";
import "../libraries/SafeMath32.sol";
import "../libraries/LibUniswapV3Stake.sol";
import "../interfaces/IStakeUniswapV3.sol";
import "../interfaces/IAutoRefactorCoinageWithTokenId.sol";


contract UpgradePool is AccessibleCommon, DSMath {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using SafeMath32 for uint32;

    struct TokenInfo {
        address owner;
        address poolAddress;
        uint256 stakeTime;
        uint128 liquidity;
        int24 tickLower;
        int24 tickUpper;
        uint32 startTime;
        uint32 claimedTime;
        uint160 secondsInsideInitial;
        uint160 secondsInsideLast;
        bool claimLock;
        bool withdraw;
    }

    struct VaultInfo {
        address rewardToken;
        address poolAddress;
        uint32 startTime;
        uint32 endTime;
        uint256 tokenPerSecond;
        uint256 totalReward;
    }

    struct PoolInfo {
        uint256 startStakeTime;
    }

    struct ClaimInfo {
        uint256 claimAmount;
        uint32 claimTime;
    }

    struct PositionInfo {
        // the amount of liquidity owned by this position
        uint128 liquidity;
        // fee growth per unit of liquidity as of the last update to liquidity or fees owed
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        // the fees owed to the position owner in token0/token1
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    struct Slot0 {
        // the current price
        uint160 sqrtPriceX96;
        // the current tick
        int24 tick;
        // the most-recently updated index of the observations array
        uint16 observationIndex;
        // the current maximum number of observations that are being stored
        uint16 observationCardinality;
        // the next maximum number of observations to store, triggered in observations.write
        uint16 observationCardinalityNext;
        // the current protocol fee as a percentage of the swap fee taken on withdrawal
        // represented as an integer denominator (1/x)%
        uint8 feeProtocol;
        // whether the pool is locked
        bool unlocked;
    }

    /// @dev event on staking
    /// @param to the sender
    /// @param poolAddress the pool address of uniswapV3
    /// @param tokenId the uniswapV3 Lp token
    /// @param amount the amount of staking
    event Staked(
        address indexed to,
        address indexed poolAddress,
        uint256 tokenId,
        uint256 amount
    );

    /// @dev event on mining in coinage
    /// @param curTime the current time
    /// @param miningInterval mining period (sec)
    /// @param miningAmount the mining amount
    /// @param prevTotalSupply Total amount of coinage before mining
    /// @param afterTotalSupply Total amount of coinage after being mined
    /// @param factor coinage's Factor
    event MinedCoinage(
        address pool,
        uint256 curTime,
        uint256 miningInterval,
        uint256 miningAmount,
        uint256 prevTotalSupply,
        uint256 afterTotalSupply,
        uint256 factor
    );

    INonfungiblePositionManager public nonfungiblePositionManager;

    uint256 public miningPerSecond = 10;

    /// @dev UniswapV3 pool factory
    address public uniswapV3FactoryAddress;

    /// @dev total tokenIds
    uint256 public totalTokens;

    /// @dev the total staked amount
    uint256 public totalStakedAmount;

    /// @dev total stakers
    uint256 public totalStakers;

    /// @dev Mining interval can be given to save gas cost.
    uint256 public miningIntervalSeconds;

    /// @dev lock
    uint256 internal _lock;

    /// @dev coinage for reward 리워드 계산을 위한 코인에이지
    mapping(address => address) public coinage;

    /// @dev  recently mined time (in seconds)
    mapping(address => uint256) public coinageLastMintBlockTimetamp;

    /// @dev user's tokenIds
    mapping(address => uint256[]) public userStakedTokenIds;

    mapping(address => uint256[]) public vaultIds;

    /// @dev Total staked information of users
    mapping(address => LibUniswapV3Stake.StakedTotalTokenAmount)
        public userTotalStaked;

    /// @dev Amount that Token ID put into Coinage
    mapping(uint256 => LibUniswapV3Stake.StakedTokenAmount)
        public stakedCoinageTokens;

    /// @dev [poolAddress][programNumber] program에 대한 정보를 관리
    mapping (address => mapping(uint256 => VaultInfo)) public vaultInfo;
    
    /// @dev [poolAddress][programNumber][tokenId] Pool의 program에 Claim한 토큰들의 정보를 관리
    mapping (address => mapping(uint256 => mapping(uint256 => ClaimInfo))) public claimInfo;

    /// @dev [tokenId] -> tokenId는 어짜피 고유한 것이라서 다른 것과 안 묶어도됨
    mapping (uint256 => TokenInfo) public tokenInfo;

    /// @dev [poolAddres]
    mapping (address => PoolInfo) public poolInfo;

    mapping (uint256 => mapping(uint256 => PositionInfo)) public positionInfo;
    mapping (uint256 => mapping(uint256 => Slot0)) public slot0;


    constructor(address _owner) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, _owner);

        miningIntervalSeconds = 15;
    }

    receive() external payable {
        revert();
    }

    modifier lock() {
        require(_lock == 0, "StakeUniswapV3Storage: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    /// @dev calculate the factor of coinage
    /// @param source tsource
    /// @param target target
    /// @param oldFactor oldFactor
    function _calcNewFactor(
        uint256 source,
        uint256 target,
        uint256 oldFactor
    ) internal pure returns (uint256) {
        return rdiv(rmul(target, oldFactor), source);
    }

    //address[0] = rewardToken, address[1] = poolAddress
    function createVault(
        address _rewardToken,
        address _poolAddress,
        uint32[2] calldata _times,
        uint256 _tokenPerSecond,
        uint256 _totalReward
    ) external onlyOwner {
        require(block.timestamp < _times[0] && _times[0] < _times[1], "time setting incorrect");
        vaultInfo[_poolAddress][vaultIds[_poolAddress].length] = VaultInfo({
            rewardToken: _rewardToken,
            poolAddress: _poolAddress,
            startTime: _times[0],
            endTime: _times[1],
            tokenPerSecond: _tokenPerSecond,
            totalReward: _totalReward
        });
        vaultIds[_poolAddress].push(vaultIds[_poolAddress].length);

        IERC20(_rewardToken).safeTransferFrom(msg.sender, address(this), _totalReward);
    }

    /// @dev mining on coinage, Mining conditions :  the sale start time must pass,
    /// the stake start time must pass, the vault mining start time (sale start time) passes,
    /// the mining interval passes, and the current total amount is not zero,
    function miningCoinage(address _pool) public lock {
        PoolInfo storage pool = poolInfo[_pool];
        if (coinageLastMintBlockTimetamp[_pool] == 0)
            coinageLastMintBlockTimetamp[_pool] = pool.startStakeTime;

        if (
            block.timestamp >
            (coinageLastMintBlockTimetamp[_pool].add(miningIntervalSeconds))
        ) {
            uint256 miningInterval =
                block.timestamp.sub(coinageLastMintBlockTimetamp[_pool]);
            uint256 miningAmount =
                miningInterval.mul(miningPerSecond);
            uint256 prevTotalSupply =
                IAutoRefactorCoinageWithTokenId(coinage[_pool]).totalSupply();

            if (miningAmount > 0 && prevTotalSupply > 0) {
                uint256 afterTotalSupply =
                    prevTotalSupply.add(miningAmount.mul(10**9));
                uint256 factor =
                    IAutoRefactorCoinageWithTokenId(coinage[_pool]).setFactor(
                        _calcNewFactor(
                            prevTotalSupply,
                            afterTotalSupply,
                            IAutoRefactorCoinageWithTokenId(coinage[_pool]).factor()
                        )
                    );
                coinageLastMintBlockTimetamp[_pool] = block.timestamp;

                emit MinedCoinage(
                    _pool,
                    block.timestamp,
                    miningInterval,
                    miningAmount,
                    prevTotalSupply,
                    afterTotalSupply,
                    factor
                );
            }
        }
    }

    function claimMiningCoinage(address _pool, uint256 _vNum) public lock {
        if (
            block.timestamp >
            (coinageLastMintBlockTimetamp[_pool].add(miningIntervalSeconds))
        ) {
            uint256 miningInterval =
                block.timestamp.sub(coinageLastMintBlockTimetamp[_pool]);
            uint256 miningAmount =
                miningInterval.mul(miningPerSecond);
            uint256 prevTotalSupply =
                IAutoRefactorCoinageWithTokenId(coinage[_pool]).totalSupply();

            if (miningAmount > 0 && prevTotalSupply > 0) {
                uint256 afterTotalSupply =
                    prevTotalSupply.add(miningAmount.mul(10**9));
                uint256 factor =
                    IAutoRefactorCoinageWithTokenId(coinage[_pool]).setFactor(
                        _calcNewFactor(
                            prevTotalSupply,
                            afterTotalSupply,
                            IAutoRefactorCoinageWithTokenId(coinage[_pool]).factor()
                        )
                    );
                coinageLastMintBlockTimetamp[_pool] = block.timestamp;

                emit MinedCoinage(
                    _pool,
                    block.timestamp,
                    miningInterval,
                    miningAmount,
                    prevTotalSupply,
                    afterTotalSupply,
                    factor
                );
            }
        }
    }

    /// @dev view mining information of tokenId
    /// @param tokenId  tokenId
    function getMiningTokenId(uint256 tokenId,uint256 _vNum)
        public
        view
        returns (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint256 minableAmount,
            uint160 secondsInside,
            uint256 secondsInsideDiff256,
            uint256 liquidity,
            uint256 balanceOfTokenIdRay,
            uint256 minableAmountRay,
            uint256 secondsInside256,
            uint256 secondsAbsolute256
        )
    {
        TokenInfo storage token = tokenInfo[tokenId];
        PoolInfo storage pool = poolInfo[token.poolAddress];
        VaultInfo storage vault = vaultInfo[token.poolAddress][_vNum];
        ClaimInfo storage claim = claimInfo[token.poolAddress][_vNum][tokenId];

        if (
            pool.startStakeTime < block.timestamp
        ) {
            TokenInfo storage token = tokenInfo[tokenId];

            liquidity = token.liquidity;

            uint32 secondsAbsolute = 0;
            balanceOfTokenIdRay = IAutoRefactorCoinageWithTokenId(coinage[token.poolAddress])
                .balanceOf(tokenId);

            if (token.liquidity > 0 && balanceOfTokenIdRay > 0) {
                if (balanceOfTokenIdRay > liquidity.mul(10**9)) {
                    minableAmountRay = balanceOfTokenIdRay.sub(
                        liquidity.mul(10**9)
                    );
                    minableAmount = minableAmountRay.div(10**9);
                }
                if (minableAmount > 0) {
                    (, , secondsInside) = IUniswapV3Pool(token.poolAddress)
                        .snapshotCumulativesInside(
                        token.tickLower,
                        token.tickUpper
                    );
                    secondsInside256 = uint256(secondsInside);

                    if (claim.claimTime > 0) {
                        secondsAbsolute = uint32(block.timestamp).sub(
                            claim.claimTime
                        );
                    } else if (token.startTime > vault.startTime) {
                        secondsAbsolute = uint32(block.timestamp).sub(
                            token.startTime
                        );
                    } else {
                        secondsAbsolute = uint32(block.timestamp).sub(
                            vault.startTime
                        );
                    }
                    secondsAbsolute256 = uint256(secondsAbsolute);

                    if (secondsAbsolute > 0) {
                        if (token.secondsInsideLast > 0) {
                            secondsInsideDiff256 = secondsInside256.sub(
                                uint256(token.secondsInsideLast)
                            );
                        } else {
                            secondsInsideDiff256 = secondsInside256.sub(
                                uint256(token.secondsInsideInitial)
                            );
                        }

                        if (
                            secondsInsideDiff256 < secondsAbsolute256 &&
                            secondsInsideDiff256 > 0
                        ) {
                            miningAmount = minableAmount
                                .mul(secondsInsideDiff256)
                                .div(secondsAbsolute256);
                            nonMiningAmount = minableAmount.sub(miningAmount);
                        } else if(secondsInsideDiff256 > 0){
                            miningAmount = minableAmount;
                        } else {
                            nonMiningAmount = minableAmount;
                        }
                    }
                }
            }
        }
    }


    function stake(uint256 tokenId)
        external
    {
        require(
            nonfungiblePositionManager.ownerOf(tokenId) == msg.sender,
            "not owner"
        );

        _stake(tokenId);
    }

    function _stake(uint256 tokenId) internal {

        uint256 _tokenId = tokenId;
        (
            ,
            ,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            ,
            ,
            ,

        ) = nonfungiblePositionManager.positions(_tokenId);

        require(liquidity > 0, "zero liquidity");

        TokenInfo storage token = tokenInfo[_tokenId];

        token.poolAddress = PoolAddress.computeAddress(
            uniswapV3FactoryAddress,
            PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
        );

        require(token.poolAddress != address(0), "StakeUniswapV3: zero poolAddress");

        (, int24 tick, , , , , bool unlocked) =
            IUniswapV3Pool(token.poolAddress).slot0();
        require(unlocked, "StakeUniswapV3: unlocked pool");
        require(
            tickLower < tick && tick < tickUpper,
            "StakeUniswapV3: out of tick range"
        );

        (, , uint32 secondsInside) =
            IUniswapV3Pool(token.poolAddress).snapshotCumulativesInside(
                tickLower,
                tickUpper
            );

        uint256 tokenId_ = _tokenId;

        PoolInfo storage pool = poolInfo[token.poolAddress];
        // initial pool start time
        if (pool.startStakeTime == 0) pool.startStakeTime = block.timestamp;

        token.owner = msg.sender;
        token.liquidity = liquidity;
        token.tickLower = tickLower;
        token.tickUpper = tickUpper;
        token.stakeTime = block.timestamp;
        token.startTime = uint32(block.timestamp);
        token.claimedTime = 0;
        token.secondsInsideInitial = secondsInside;
        token.secondsInsideLast = 0;

        nonfungiblePositionManager.transferFrom(
            msg.sender,
            address(this),
            tokenId_
        );

        // save tokenid
        userStakedTokenIds[msg.sender].push(tokenId_);

        totalStakedAmount = totalStakedAmount.add(liquidity);
        totalTokens = totalTokens.add(1);

        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        if (!_userTotalStaked.staked) totalStakers = totalStakers.add(1);
        _userTotalStaked.staked = true;
        _userTotalStaked.totalDepositAmount = _userTotalStaked
            .totalDepositAmount
            .add(liquidity);

        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId_];
        _stakedCoinageTokens.amount = liquidity;
        _stakedCoinageTokens.startTime = uint32(block.timestamp);

        //mint coinage of user amount
        IAutoRefactorCoinageWithTokenId(coinage[token.poolAddress]).mint(
            msg.sender,
            tokenId_,
            uint256(liquidity).mul(10**9)
        );

        miningCoinage(token.poolAddress);

        emit Staked(msg.sender, token.poolAddress, tokenId_, liquidity);
    }



    function claim(uint256 tokenId, uint256 _vNum) external  {
        TokenInfo storage token = tokenInfo[tokenId];
        require(token.owner == msg.sender, "not staker");

        require(token.claimLock == false, "StakeUniswapV3: claiming");
        ClaimInfo storage claim = claimInfo[token.poolAddress][_vNum][tokenId];

        require(claim.claimTime < uint32(block.timestamp.sub(miningIntervalSeconds)), "already claimed");       
        
        miningCoinage(token.poolAddress);

        (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint256 minableAmount,
            uint160 secondsInside,
            ,
            ,
            ,
            uint256 minableAmountRay,
            ,

        ) = getMiningTokenId(tokenId,_vNum);


        token.claimLock = true;


        token.claimLock = false;

    }




}