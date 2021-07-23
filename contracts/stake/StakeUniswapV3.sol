// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
//import "@uniswap/v3-periphery/contracts/base/Multicall.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IStakeRegistry.sol";
import "../interfaces/IStakeUniswapV3.sol";
import "../interfaces/AutoRefactorCoinageI.sol";
import "../interfaces/IIStake2Vault.sol";
import "../libraries/LibTokenStake1.sol";
import {DSMath} from "../libraries/DSMath.sol";
import "../common/AccessibleCommon.sol";
import "../stake/StakeUniswapV3Storage.sol";

/// @title Simple Stake Contract
/// @notice Stake contracts can interact with the vault to claim tos tokens
contract StakeUniswapV3 is
    StakeUniswapV3Storage,
    AccessibleCommon,
    IStakeUniswapV3,
    DSMath
{
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

    modifier lock() {
        require(_lock == 0, "StakeUniswapV3: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    /// @dev event on staking
    /// @param to the sender
    /// @param amount the amount of staking
    event Staked(address indexed to, address indexed poolAddress, uint256 tokenId, uint256 amount);

    /// @dev event on claim
    /// @param to the sender
    /// @param poolAddress pool address
    /// @param tokenId tokenId
    /// @param miningAmount the amount of mining
    event Claimed(address indexed to, address poolAddress, uint256 tokenId,  uint256 miningAmount);

    /// @dev event on withdrawal
    /// @param to the sender
    /// @param tokenId the uniswapV3 Lp token
    event WithdrawalToken(address indexed to, uint256 tokenId);

    /// @dev constructor of StakeCoinage
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev receive ether - revert
    receive() external payable {
        revert();
    }

    function _calcNewFactor(
        uint256 source,
        uint256 target,
        uint256 oldFactor
    ) internal pure returns (uint256) {
        return rdiv(rmul(target, oldFactor), source);
    }

    function miningCoinage() internal lock {
        if (block.timestamp > coinageLastMintBlockTimetamp) {
            uint256 rewardMintAmount =
                ( block.timestamp - coinageLastMintBlockTimetamp ) * IIStake2Vault(vault).miningPerSecond();

            if (rewardMintAmount > 0) {
                uint256 prevTotalSupply =
                    AutoRefactorCoinageI(coinage).totalSupply();
                uint256 afterTotalSupply = prevTotalSupply + rewardMintAmount;
                AutoRefactorCoinageI(coinage).setFactor(
                    _calcNewFactor(
                        prevTotalSupply,
                        afterTotalSupply,
                        AutoRefactorCoinageI(coinage).factor()
                    )
                );
                AutoRefactorCoinageI(coinage).mint(
                    msg.sender,
                    rewardMintAmount * (10**9)
                );

                coinageLastMintBlockTimetamp = block.timestamp;
            }
        }
    }

    function burnCoinage(address user, uint256 amount) internal {
        require(amount > 0, "StakeUniswapV3: amount is zero");
        uint256 _amount = amount * (10**9);
        require(
            _amount <= AutoRefactorCoinageI(coinage).balanceOf(user),
            "StakeUniswapV3: coinages's user's balanceOf is insufficent"
        );

        uint256 prevTotalSupply = AutoRefactorCoinageI(coinage).totalSupply();
        AutoRefactorCoinageI(coinage).burnFrom(user, _amount);

        uint256 afterTotalSupply = AutoRefactorCoinageI(coinage).totalSupply();

        AutoRefactorCoinageI(coinage).setFactor(
            _calcNewFactor(
                prevTotalSupply,
                afterTotalSupply,
                AutoRefactorCoinageI(coinage).factor()
            )
        );
    }


    function setPoolAddress(uint256 tokenId) public
        nonZeroAddress(token)
        nonZeroAddress(vault)
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(poolToken0)
        nonZeroAddress(poolToken1)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3FactoryAddress)
    {
        require(poolAddress == address(0), "StakeUniswapV3: already set poolAddress");
        (
            ,
            ,
            address token0,
            address token1,
            uint24 fee,
            ,
            ,
            ,
            ,
            ,
            ,
        ) = nonfungiblePositionManager.positions(tokenId);

        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        poolAddress =
            PoolAddress.computeAddress(
                uniswapV3FactoryAddress,
                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
            );
    }

    function stake(uint256 tokenId)
        external
        override
        nonZeroAddress(token)
        nonZeroAddress(vault)
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(poolToken0)
        nonZeroAddress(poolToken1)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3FactoryAddress)
    {
        require(
            nonfungiblePositionManager.ownerOf(tokenId) == msg.sender,
            "StakeUniswapV3: Caller is not tokenId's owner"
        );
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

        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        require(liquidity > 0, "StakeUniswapV3: liquidity is zero");


        if(poolAddress == address(0)){
            poolAddress = PoolAddress.computeAddress(
                                uniswapV3FactoryAddress,
                                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
                            );
        }

        require(
            poolAddress != address(0),
            "StakeUniswapV3: poolAddress is zero"
        );

        (, int24 tick, , , , , bool unlocked) = IUniswapV3Pool(poolAddress).slot0();
        require(unlocked, "StakeUniswapV3: pool is closed");
        require(tickLower < tick && tick < tickUpper, "StakeUniswapV3: out of tick range");

        (, , uint32 secondsInside) =
            IUniswapV3Pool(poolAddress).snapshotCumulativesInside(
                tickLower,
                tickUpper
            );

        uint256 tokenId_ = _tokenId;

        nonfungiblePositionManager.transferFrom(
            msg.sender,
            address(this),
            tokenId_
        );

        // save tokenid
        userStakedTokenIds[msg.sender].push(tokenId_);

        //depositTokens 사용자가 디파짓한 토큰정보
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId_];
        _depositTokens.owner = msg.sender;
        _depositTokens.idIndex = userStakedTokenIds[msg.sender].length;
        _depositTokens.liquidity = liquidity;
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;
        _depositTokens.startTime = block.timestamp;
        _depositTokens.endTime = 0;
        _depositTokens.claimedTime = 0;
        _depositTokens.secondsInsideInitial = secondsInside;
        _depositTokens.secondsInsideLast = 0;

        //stakedCoinageTokens 토큰별로 코인에에지에 들어가는 정보
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens = stakedCoinageTokens[tokenId_];
        _stakedCoinageTokens.amount = liquidity;
        _stakedCoinageTokens.startTime = block.timestamp;
        _stakedCoinageTokens.claimedTime = 0;
        _stakedCoinageTokens.claimedAmount = 0;
        _stakedCoinageTokens.nonMiningAmount = 0;

        //StakedTotalTokenAmount 사용자가 총 디파짓한 정보
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked = userTotalStaked[msg.sender];
        if (!_userTotalStaked.staked) totalStakers++;
        _userTotalStaked.staked = true;
        _userTotalStaked.totalDepositAmount += liquidity;


        // 풀에 총 디파짓 되는 정보
        totalStakedAmount += liquidity;


        //mint coinage of user amount
        AutoRefactorCoinageI(coinage).mint(msg.sender, liquidity * (10**9));

        // coinage update reward
        miningCoinage();

        emit Staked(msg.sender, poolAddress, tokenId_, liquidity);
    }

    function getClaimLiquidity(uint256 tokenId)
        public
        view
        override
        returns (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint32 secondsInside,
            uint256 balanceCoinageOfUser,
            uint256 _coinageReward
        )
    {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId];

        (, , secondsInside ) = IUniswapV3Pool(poolAddress).snapshotCumulativesInside(_depositTokens.tickLower, _depositTokens.tickUpper);

        // 사용자가 디파짓 했을때의 정보를 가져온다. 배교대상이다.
        uint160 secondsInsideLast = _depositTokens.secondsInsideInitial;
        uint256 claimedTime = _depositTokens.startTime;

        if (_depositTokens.claimedTime > 0) {
            secondsInsideLast = _depositTokens.secondsInsideLast;
            claimedTime = _depositTokens.claimedTime;
        }

        uint160 secondsInsedeStaking = secondsInside - secondsInsideLast;
        uint256 secondsAbsolute = block.timestamp - claimedTime;

        (balanceCoinageOfUser, _coinageReward) = rewardAllocatedAmountCoinage(
            msg.sender,
            _depositTokens.liquidity
        );

        if(secondsInsedeStaking < secondsAbsolute ){
            miningAmount = _coinageReward * (secondsInsedeStaking / secondsAbsolute);
            nonMiningAmount = _coinageReward - miningAmount;
        }
        else miningAmount = _coinageReward;
    }

    /// @dev Claim for reward
    function claim(uint256 tokenId)
        public override
    {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId];

        require(
            _depositTokens.owner == msg.sender,
            "StakeUniswapV3: caller is not tokenId's staker"
        );
        // 사용자의 할당량의 원금에 대한 코인에이지의 리워드.
        // coinage update reward
        miningCoinage();
        // uint32 secondsInside ;
        // uint256 balanceCoinageOfUser;
        (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint32 secondsInside,
            ,
            uint256 minableAmount
        ) = getClaimLiquidity(tokenId);

        require(miningAmount > 0, "StakeUniswapV3: miningAmount is zero");

        _depositTokens.claimedTime = block.timestamp;
        _depositTokens.secondsInsideLast = secondsInside;

        burnCoinage(msg.sender, minableAmount);

        // storage  stakedCoinageTokens
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];
        _stakedCoinageTokens.claimedTime = block.timestamp;
        _stakedCoinageTokens.claimedAmount += miningAmount;
        _stakedCoinageTokens.nonMiningAmount += nonMiningAmount;

        // storage  StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked = userTotalStaked[msg.sender];
        _userTotalStaked.totalClaimedAmount += miningAmount;
        _userTotalStaked.totalUnableClaimAmount += nonMiningAmount;

        // total
        miningAmountTotal += miningAmount;
        nonMiningAmountTotal += nonMiningAmount;

        require(IIStake2Vault(vault).claimMining(msg.sender, minableAmount, miningAmount, nonMiningAmount));
        emit Claimed(msg.sender, poolAddress, tokenId, miningAmount );
    }

    /// @dev withdraw
    function withdraw(uint256 tokenId) external override {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId];
        require(
            _depositTokens.owner == msg.sender,
            "StakeUniswapV3: caller is not tokenId's staker"
        );

        totalStakedAmount -= _depositTokens.liquidity;

        claim(tokenId);
        burnCoinage(msg.sender, _depositTokens.liquidity);

        deleteUserToken(tokenId, _depositTokens.idIndex);
        delete depositTokens[tokenId];
        delete stakedCoinageTokens[tokenId];

        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked = userTotalStaked[msg.sender];

        _userTotalStaked.totalDepositAmount -= _depositTokens.liquidity;
        if (_userTotalStaked.totalDepositAmount == 0) {
            totalStakers--;
            delete userTotalStaked[msg.sender];
        }

        nonfungiblePositionManager.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        emit WithdrawalToken(msg.sender, tokenId);
    }

    /// @dev
    function getUserStakedTokenIds(address user)
        external
        view
        override
        returns (uint256[] memory ids)
    {
        return userStakedTokenIds[user];
    }

    /// @dev tokenId's deposited information
    /// @param tokenId   tokenId
    /// @return poolAddress   poolAddress
    /// @return tick tick,
    /// @return liquidity liquidity,
    /// @return args liquidity,  startTime, endTime, claimedTime, startBlock, claimedBlock, claimedAmount
    /// @return secondsPL secondsPerLiquidityInsideInitialX128, secondsPerLiquidityInsideX128Las
    function getDepositToken(uint256 tokenId)
        external
        view
        override
        returns (
            address poolAddress,
            int24[2] memory tick,
            uint128 liquidity,
            uint256[6] memory args,
            uint160[2] memory secondsPL
        )
    {
        LibUniswapV3Stake.StakeLiquidity memory _depositTokens = depositTokens[tokenId];
        LibUniswapV3Stake.StakedTokenAmount memory _stakedCoinageTokens = stakedCoinageTokens[tokenId];

        return (
            poolAddress,
            [_depositTokens.tickLower, _depositTokens.tickUpper],
            _depositTokens.liquidity,
            [
                _depositTokens.startTime,
                _depositTokens.endTime,
                _depositTokens.claimedTime,
                _stakedCoinageTokens.startTime,
                _stakedCoinageTokens.claimedTime,
                _stakedCoinageTokens.claimedAmount
            ],
            [
                _depositTokens.secondsInsideInitial,
                _depositTokens.secondsInsideLast
            ]
        );
    }

    function getUserStakedTotal(address user)
        external
        view
        override
        returns (
            uint256 totalDepositAmount,
            uint256 totalClaimedAmount,
            uint256 totalUnableClaimAmount
        )
    {
        return (
            userTotalStaked[user].totalDepositAmount,
            userTotalStaked[user].totalClaimedAmount,
            userTotalStaked[user].totalUnableClaimAmount
        );
    }

    /// @dev Give the infomation of this stakeContracts
    /// @return return1  [token, vault, stakeRegistry, coinage]
    /// @return return2  [poolToken0, poolToken1, nonfungiblePositionManager, uniswapV3FactoryAddress]
    /// @return return3  [totalStakers, totalStakedAmount, miningAmountTotal,nonMiningAmountTotal]
    function infos()
        external
        view
        override
        returns (
            address[4] memory,
            address[4] memory,
            uint256[4] memory
        )
    {
        return (
            [token, vault, stakeRegistry, coinage],
            [
                poolToken0,
                poolToken1,
                address(nonfungiblePositionManager),
                uniswapV3FactoryAddress
            ],
            [
                totalStakers,
                totalStakedAmount,
                miningAmountTotal,
                nonMiningAmountTotal
            ]
        );
    }


    // 사용자의 할당량의 원금에 대한, 코인에이지의 리워드
    function rewardAllocatedAmountCoinage(address user, uint256 amount)
        internal
        view
        returns (uint256 balanceCoinageOfUser, uint256 remainReward)
    {
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userStaked = userTotalStaked[user];

        require(amount <= _userStaked.totalDepositAmount);
        balanceCoinageOfUser = 0;

        uint256 balanceOfUserRay =
            AutoRefactorCoinageI(coinage).balanceOf(user);
        if (balanceOfUserRay > 0) {
            balanceCoinageOfUser = balanceOfUserRay / (10**9);
            if (balanceCoinageOfUser > _userStaked.totalDepositAmount) {
                remainReward =(balanceCoinageOfUser - _userStaked.totalDepositAmount) * (amount / _userStaked.totalDepositAmount);
            }
        }
    }

    function deleteUserToken(uint256 tokenId, uint256 _index) internal {
        uint256 _tokenid = userStakedTokenIds[msg.sender][_index];
        uint256 lastIndex = userStakedTokenIds[msg.sender].length - 1;
        if (tokenId > 0 && _tokenid == tokenId) {
            if (_index < lastIndex) {
                userStakedTokenIds[msg.sender][_index] = userStakedTokenIds[
                    msg.sender
                ][lastIndex];
            }
            userStakedTokenIds[msg.sender].pop();
        }
    }

    function poolInfos()
        public view
        nonZeroAddress(poolAddress)
        returns
        (
            address factory,
            address token0,
            address token1 ,
            uint24 fee,
            int24 tickSpacing,
            uint128 maxLiquidityPerTick,
            uint128 liquidity
        )
    {
        liquidity = IUniswapV3Pool(poolAddress).liquidity();
        factory = IUniswapV3Pool(poolAddress).factory();
        token0 = IUniswapV3Pool(poolAddress).token0();
        token1 = IUniswapV3Pool(poolAddress).token1();
        fee = IUniswapV3Pool(poolAddress).fee();
        tickSpacing = IUniswapV3Pool(poolAddress).tickSpacing();
        maxLiquidityPerTick = IUniswapV3Pool(poolAddress).maxLiquidityPerTick();
    }

    /// @param key hash(owner, tickLower, tickUpper)
    function poolPositions(bytes32 key)
        public view
        nonZeroAddress(poolAddress)
        returns
        (
            uint128 _liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        ( _liquidity,
             feeGrowthInside0LastX128,
             feeGrowthInside1LastX128,
             tokensOwed0,
             tokensOwed1 )  = IUniswapV3Pool(poolAddress).positions(key);
    }

    function poolSlot0()
        public view
        nonZeroAddress(poolAddress)
        returns
        (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex ,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {
        ( sqrtPriceX96, tick, observationIndex , observationCardinality,
            observationCardinalityNext, feeProtocol, unlocked ) = IUniswapV3Pool(poolAddress).slot0();
    }

}
