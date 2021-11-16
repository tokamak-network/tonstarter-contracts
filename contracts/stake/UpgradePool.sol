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
        uint256 startTime;
        uint256 endTime;
        uint256 tokenPerSecond;
        uint256 totalReward;
    }

    struct PoolInfo {
        uint256 startStakeTime;
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

    uint256[][] public vaultIds;

    INonfungiblePositionManager public nonfungiblePositionManager;

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

    /// @dev Total staked information of users
    mapping(address => LibUniswapV3Stake.StakedTotalTokenAmount)
        public userTotalStaked;

    /// @dev Amount that Token ID put into Coinage
    mapping(uint256 => LibUniswapV3Stake.StakedTokenAmount)
        public stakedCoinageTokens;

    mapping (address => mapping(uint256 => VaultInfo)) public vaultInfo;
    mapping (uint256 => TokenInfo) public tokenInfo;
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
        uint256[2] calldata _times,
        uint256 _tokenPerSecond,
        uint256 _totalReward
    ) external onlyOwner {
        require(block.timestamp < _times[0] && _times[0] < _times[1], "time setting incorrect");
        vaultInfo[_poolAddress][vaultIds.length] = VaultInfo({
            rewardToken: _rewardToken,
            poolAddress: _poolAddress,
            startTime: _times[0],
            endTime: _times[1],
            tokenPerSecond: _tokenPerSecond,
            totalReward: _totalReward
        });
        vaultIds[_poolAddress].push(vaultIds.length);

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
            (coinageLastMintBlockTimetamp.add(miningIntervalSeconds))
        ) {
            uint256 miningInterval =
                block.timestamp.sub(coinageLastMintBlockTimetamp[_pool]);
            uint256 miningAmount =
                miningInterval.mul(IIStake2Vault(vault).miningPerSecond());
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
                coinageLastMintBlockTimetamp = block.timestamp;

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
        if (pool.startStakeTime) pool.startStakeTime = block.timestamp;

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





    function claim(uint256 _vNum) external onlyOwner {
        VaultInfo storage vault = vaultInfo[_vNum];

        (uint256 totalDepositAmount, uint256 totalMiningAmount, uint256 totalNonMiningAmount) = IStakeUniswapV3(vault.poolAddress).getUserStakedTotal(msg.sender);
    }




}