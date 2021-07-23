// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/base/Multicall.sol";
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
    modifier lock() {
        require(_lock == 0, "StakeUniswapV3: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    /// @dev event on staking
    /// @param to the sender
    /// @param amount the amount of staking
    event Staked(address indexed to, uint256 amount);

    /// @dev event on claim
    /// @param to the sender
    /// @param amount the amount of claim
    /// @param claimBlock the block of claim
    event Claimed(address indexed to, uint256 amount, uint256 claimBlock);

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

    /*
    function mintRewardBlockCoinage() internal {
        if (block.number > coinageMintBlock) {
            uint256 rewardMintAmount =
                block.number -
                    (coinageMintBlock) *
                    IIStake2Vault(vault).rewardPerBlock();

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
                coinageMintBlock = block.number;
            }
        }
    }
    */

    function miningCoinage() internal {
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

    // 사용자의 할당량의 원금에 대한, 코인에이지의 리워드
    function rewardAllocatedAmountCoinage(address user, uint256 amount)
        internal
        view
        returns (uint256 balanceCoinageOfUser, uint256 remainReward)
    {
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userStaked =
            userTotalStaked[user];

        require(amount <= _userStaked.totalDepositAmount);
        balanceCoinageOfUser = 0;

        uint256 balanceOfUserRay =
            AutoRefactorCoinageI(coinage).balanceOf(user);
        if (balanceOfUserRay > 0) {
            balanceCoinageOfUser = balanceOfUserRay / (10**9);
            if (balanceCoinageOfUser > _userStaked.totalDepositAmount) {
                remainReward =
                    (balanceCoinageOfUser - _userStaked.totalDepositAmount) *
                    (amount / _userStaked.totalDepositAmount);
            }
        }
    }

    /*
    // 사용자의 코인에이지의 리워드
    function setPool(
        address token0,
        address token1,
        string calldata defiInfoName
    )
        external
        override
        onlyOwner
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(token0)
        nonZeroAddress(token1)
    {
        (   ,
            ,
            address _uniswapV3NonfungiblePositionManager,
            address _uniswapV3FactoryAddress,
            ,
        ) =
            IStakeRegistry(stakeRegistry).defiInfo(
                keccak256(abi.encodePacked(defiInfoName))
            );
        require(
            _uniswapV3NonfungiblePositionManager != address(0),
            "StakeUniswapV3Proxy: _uniswapV3NonfungiblePositionManager is zero"
        );
        require(
            _uniswapV3FactoryAddress != address(0),
            "StakeUniswapV3Proxy: _uniswapV3FactoryAddress is zero"
        );

        nonfungiblePositionManager = INonfungiblePositionManager(
            _uniswapV3NonfungiblePositionManager
        );
        uniswapV3FactoryAddress = _uniswapV3FactoryAddress;

        poolToken0 = token0;
        poolToken0 = token1;
    }
    */

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
            uint128 tokensOwed0,
            uint128 tokensOwed1
        ) = nonfungiblePositionManager.positions(_tokenId);

        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        //require(liquidity > 0, "StakeUniswapV3: liquidity is zero");

        address poolAddress =
            PoolAddress.computeAddress(
                uniswapV3FactoryAddress,
                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
            );

        require(
            poolAddress != address(0),
            "StakeUniswapV3: poolAddress is zero"
        );

        (uint160 sqrtPriceX96, int24 tick, , , , , bool unlocked) = IUniswapV3Pool(poolAddress).slot0();
        require(unlocked, "StakeUniswapV3: pool is closed");
        require(tickLower < tick && tick < tickUpper, "StakeUniswapV3: out of tick range");

        (, uint160 secondsPerLiquidityInsideX128, uint32 secondsInside) =
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

        //depositTokens
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId_];
        _depositTokens.owner = msg.sender;
        _depositTokens.idIndex = userStakedTokenIds[msg.sender].length;
        _depositTokens.poolAddress = poolAddress;
        _depositTokens.liquidity = liquidity;
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;
        _depositTokens.startTime = block.timestamp;
        _depositTokens.endTime = 0;
        _depositTokens.claimedTime = 0;
        _depositTokens
            .secondsPerLiquidityInsideX128Initial = secondsPerLiquidityInsideX128;
        _depositTokens.secondsPerLiquidityInsideX128Last = 0;

        //stakedCoinageTokens
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId_];
        _stakedCoinageTokens.amount = liquidity;
        _stakedCoinageTokens.startBlock = block.number;
        _stakedCoinageTokens.claimedBlock = 0;
        _stakedCoinageTokens.claimedAmount = 0;
        _stakedCoinageTokens.rewardNonLiquidityClaimAmount = 0;

        //StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        if (!_userTotalStaked.staked) totalStakers++;
        _userTotalStaked.staked = true;
        _userTotalStaked.totalDepositAmount += liquidity;

        totalStakedAmount += liquidity;
        //mint coinage of user amount
        AutoRefactorCoinageI(coinage).mint(msg.sender, liquidity * (10**9));

        // coinage update reward
        miningCoinage();

        emit Staked(msg.sender, liquidity);
    }

    function _modifyPosition(ModifyPositionParams memory params)
        private
        noDelegateCall
        returns (
            Position.Info storage position,
            int256 amount0,
            int256 amount1
        )
    {
        checkTicks(params.tickLower, params.tickUpper);

        Slot0 memory _slot0 = slot0; // SLOAD for gas optimization

        position = _updatePosition(
            params.owner,
            params.tickLower,
            params.tickUpper,
            params.liquidityDelta,
            _slot0.tick
        );

        if (params.liquidityDelta != 0) {
            if (_slot0.tick < params.tickLower) {
                // current tick is below the passed range; liquidity can only become in range by crossing from left to
                // right, when we'll need _more_ token0 (it's becoming more valuable) so user must provide it
                amount0 = SqrtPriceMath.getAmount0Delta(
                    TickMath.getSqrtRatioAtTick(params.tickLower),
                    TickMath.getSqrtRatioAtTick(params.tickUpper),
                    params.liquidityDelta
                );
            } else if (_slot0.tick < params.tickUpper) {
                // current tick is inside the passed range
                uint128 liquidityBefore = liquidity; // SLOAD for gas optimization

                // write an oracle entry
                (slot0.observationIndex, slot0.observationCardinality) = observations.write(
                    _slot0.observationIndex,
                    _blockTimestamp(),
                    _slot0.tick,
                    liquidityBefore,
                    _slot0.observationCardinality,
                    _slot0.observationCardinalityNext
                );

                amount0 = SqrtPriceMath.getAmount0Delta(
                    _slot0.sqrtPriceX96,
                    TickMath.getSqrtRatioAtTick(params.tickUpper),
                    params.liquidityDelta
                );
                amount1 = SqrtPriceMath.getAmount1Delta(
                    TickMath.getSqrtRatioAtTick(params.tickLower),
                    _slot0.sqrtPriceX96,
                    params.liquidityDelta
                );

                liquidity = LiquidityMath.addDelta(liquidityBefore, params.liquidityDelta);
            } else {
                // current tick is above the passed range; liquidity can only become in range by crossing from right to
                // left, when we'll need _more_ token1 (it's becoming more valuable) so user must provide it
                amount1 = SqrtPriceMath.getAmount1Delta(
                    TickMath.getSqrtRatioAtTick(params.tickLower),
                    TickMath.getSqrtRatioAtTick(params.tickUpper),
                    params.liquidityDelta
                );
            }
        }
    }


    /// @dev Gets and updates a position with the given liquidity delta
    /// @param owner the owner of the position
    /// @param tickLower the lower tick of the position's tick range
    /// @param tickUpper the upper tick of the position's tick range
    /// @param tick the current tick, passed to avoid sloads
    function _updatePosition(
        address owner,
        int24 tickLower,
        int24 tickUpper,
        int128 liquidityDelta,
        int24 tick
    ) private returns (Position.Info storage position) {
        position = positions.get(owner, tickLower, tickUpper);

        uint256 _feeGrowthGlobal0X128 = feeGrowthGlobal0X128; // SLOAD for gas optimization
        uint256 _feeGrowthGlobal1X128 = feeGrowthGlobal1X128; // SLOAD for gas optimization

        // if we need to update the ticks, do it
        bool flippedLower;
        bool flippedUpper;
        if (liquidityDelta != 0) {
            uint32 time = _blockTimestamp();
            (int56 tickCumulative, uint160 secondsPerLiquidityCumulativeX128) =
                observations.observeSingle(
                    time,
                    0,
                    slot0.tick,
                    slot0.observationIndex,
                    liquidity,
                    slot0.observationCardinality
                );

            flippedLower = ticks.update(
                tickLower,
                tick,
                liquidityDelta,
                _feeGrowthGlobal0X128,
                _feeGrowthGlobal1X128,
                secondsPerLiquidityCumulativeX128,
                tickCumulative,
                time,
                false,
                maxLiquidityPerTick
            );
            flippedUpper = ticks.update(
                tickUpper,
                tick,
                liquidityDelta,
                _feeGrowthGlobal0X128,
                _feeGrowthGlobal1X128,
                secondsPerLiquidityCumulativeX128,
                tickCumulative,
                time,
                true,
                maxLiquidityPerTick
            );

            if (flippedLower) {
                tickBitmap.flipTick(tickLower, tickSpacing);
            }
            if (flippedUpper) {
                tickBitmap.flipTick(tickUpper, tickSpacing);
            }
        }

        (uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128) =
            ticks.getFeeGrowthInside(tickLower, tickUpper, tick, _feeGrowthGlobal0X128, _feeGrowthGlobal1X128);

        position.update(liquidityDelta, feeGrowthInside0X128, feeGrowthInside1X128);

        // clear any tick data that is no longer needed
        if (liquidityDelta < 0) {
            if (flippedLower) {
                ticks.clear(tickLower);
            }
            if (flippedUpper) {
                ticks.clear(tickUpper);
            }
        }
    }

    /*
    /// @dev Stake TokenId
    /// @param tokenId  uniswapV3 LP token (ERC721)
    function stake(
        uint256 tokenId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
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
        uint256 _deadline = deadline;
        uint8 _v = v;
        bytes32 _r = r;
        bytes32 _s = s;

        //https://github.com/Uniswap/uniswap-v3-periphery/blob/main/contracts/interfaces/IERC721Permit.sol
        nonfungiblePositionManager.permit(
            address(this),
            _tokenId,
            _deadline,
            _v,
            _r,
            _s
        );

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

        address poolAddress =
            PoolAddress.computeAddress(
                uniswapV3FactoryAddress,
                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
            );
        require(
            poolAddress != address(0),
            "StakeUniswapV3: poolAddress is zero"
        );

        (, uint160 secondsPerLiquidityInsideX128, ) =
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

        //depositTokens
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId_];
        _depositTokens.owner = msg.sender;
        _depositTokens.idIndex = userStakedTokenIds[msg.sender].length;
        _depositTokens.poolAddress = poolAddress;
        _depositTokens.liquidity = liquidity;
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;
        _depositTokens.startTime = block.timestamp;
        _depositTokens.endTime = 0;
        _depositTokens.claimedTime = 0;
        _depositTokens
            .secondsPerLiquidityInsideX128Initial = secondsPerLiquidityInsideX128;
        _depositTokens.secondsPerLiquidityInsideX128Last = 0;

        //stakedCoinageTokens
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId_];
        _stakedCoinageTokens.amount = liquidity;
        _stakedCoinageTokens.startBlock = block.number;
        _stakedCoinageTokens.claimedBlock = 0;
        _stakedCoinageTokens.claimedAmount = 0;
        _stakedCoinageTokens.rewardNonLiquidityClaimAmount = 0;

        //StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        if (!_userTotalStaked.staked) totalStakers++;
        _userTotalStaked.staked = true;
        _userTotalStaked.totalDepositAmount += liquidity;

        totalStakedAmount += liquidity;
        //mint coinage of user amount
        AutoRefactorCoinageI(coinage).mint(msg.sender, liquidity * (10**9));

        // coinage update reward
        miningCoinage();

        emit Staked(msg.sender, liquidity);
    }
    */

    function getClaimLiquidity(uint256 tokenId)
        public
        view
        override
        returns (
            uint256 realReward,
            uint256 unableClaimReward,
            uint160 secondsPerLiquidityInsideX128,
            uint256 balanceCoinageOfUser,
            uint256 _coinageReward
        )
    {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];
        (, secondsPerLiquidityInsideX128, ) = IUniswapV3Pool(
            _depositTokens
                .poolAddress
        )
            .snapshotCumulativesInside(
            _depositTokens.tickLower,
            _depositTokens.tickUpper
        );

        uint160 secondsPerLiquidityInsideX128Last =
            _depositTokens.secondsPerLiquidityInsideX128Initial;
        uint256 claimedTime = _depositTokens.startTime;
        if (_depositTokens.claimedTime > 0) {
            secondsPerLiquidityInsideX128Last = _depositTokens
                .secondsPerLiquidityInsideX128Last;
            claimedTime = _depositTokens.claimedTime;
        }

        uint160 secondsPerLiquidity =
            secondsPerLiquidityInsideX128 - secondsPerLiquidityInsideX128Last;
        uint256 secondsAbsolute = block.timestamp - claimedTime;

        (balanceCoinageOfUser, _coinageReward) = rewardAllocatedAmountCoinage(
            msg.sender,
            _depositTokens.liquidity
        );
        realReward = _coinageReward * (secondsPerLiquidity / secondsAbsolute);
        unableClaimReward = _coinageReward - realReward;
    }

    /// @dev Claim for reward
    function claim(uint256 tokenId) public override {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];

        require(
            _depositTokens.owner == msg.sender,
            "StakeUniswapV3: caller is not tokenId's staker"
        );
        // 사용자의 할당량의 원금에 대한 코인에이지의 리워드.
        // coinage update reward
        miningCoinage();

        (
            uint256 realReward,
            uint256 unableClaimReward,
            uint160 secondsPerLiquidityInsideX128,
            ,
            uint256 coinageReward
        ) = getClaimLiquidity(tokenId);
        require(realReward > 0, "StakeUniswapV3: reward is zero");

        _depositTokens.claimedTime = block.timestamp;
        _depositTokens
            .secondsPerLiquidityInsideX128Last = secondsPerLiquidityInsideX128;

        burnCoinage(msg.sender, coinageReward);

        // storage  stakedCoinageTokens
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];
        _stakedCoinageTokens.claimedBlock = block.number;
        _stakedCoinageTokens.claimedAmount += realReward;
        _stakedCoinageTokens.rewardNonLiquidityClaimAmount += unableClaimReward;

        // storage  StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        _userTotalStaked.totalClaimedAmount += realReward;
        _userTotalStaked.totalUnableClaimAmount += unableClaimReward;

        // total
        rewardClaimedTotal += realReward;
        rewardNonLiquidityClaimTotal += unableClaimReward;

        // 나머지 리워드는 어디로 보내는지.. 확인

        require(IIStake2Vault(vault).claim(msg.sender, realReward));
        emit Claimed(msg.sender, realReward, block.number);
    }

    /// @dev withdraw
    function withdraw(uint256 tokenId) external override {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];
        require(
            _depositTokens.owner == msg.sender,
            "StakeUniswapV3: caller is not tokenId's staker"
        );
        // coinage update reward
        miningCoinage();

        totalStakedAmount -= _depositTokens.liquidity;
        (uint256 realReward, , , , ) = getClaimLiquidity(tokenId);
        if (realReward > 0) claim(tokenId);
        burnCoinage(msg.sender, _depositTokens.liquidity);

        /*
        // storage  StakedTokenAmount
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageToken = stakedCoinageTokens[tokenId];
        _stakedCoinageToken.releasedBlock  = block.number;

        // storage  StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked = userTotalStaked[msg.sender];
        _userTotalStaked.totalDepositAmount -= _depositTokens.liquidity;
        */
        deleteUserToken(tokenId, _depositTokens.idIndex);
        delete depositTokens[tokenId];
        delete stakedCoinageTokens[tokenId];

        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        _userTotalStaked.totalDepositAmount -= _depositTokens.liquidity;
        if (_userTotalStaked.totalDepositAmount == 0) {
            //_userTotalStaked.staked = false;
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
        LibUniswapV3Stake.StakeLiquidity memory _depositTokens =
            depositTokens[tokenId];
        LibUniswapV3Stake.StakedTokenAmount memory _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];

        return (
            _depositTokens.poolAddress,
            [_depositTokens.tickLower, _depositTokens.tickUpper],
            _depositTokens.liquidity,
            [
                _depositTokens.startTime,
                _depositTokens.endTime,
                _depositTokens.claimedTime,
                _stakedCoinageTokens.startBlock,
                _stakedCoinageTokens.claimedBlock,
                _stakedCoinageTokens.claimedAmount
            ],
            [
                _depositTokens.secondsPerLiquidityInsideX128Initial,
                _depositTokens.secondsPerLiquidityInsideX128Last
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
    /// @return return3  [totalStakers, totalStakedAmount, rewardClaimedTotal,rewardNonLiquidityClaimTotal]
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
                rewardClaimedTotal,
                rewardNonLiquidityClaimTotal
            ]
        );
    }
}
