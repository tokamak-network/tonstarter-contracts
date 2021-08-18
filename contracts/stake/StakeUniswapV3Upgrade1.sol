// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";

//import "../interfaces/IStakeRegistry.sol";
//import "../interfaces/IStakeUniswapV3.sol";
import "../interfaces/IAutoRefactorCoinageWithTokenId.sol";
import "../interfaces/IIStake2Vault.sol";
import "../libraries/DSMath.sol";
import "../common/AccessibleCommon.sol";
import "../stake/StakeUniswapV3Storage.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../libraries/SafeMath32.sol";

/// @title StakeUniswapV3
/// @notice Uniswap V3 Contract for staking LP and mining TOS
contract StakeUniswapV3Upgrade1 is
    StakeUniswapV3Storage,
    AccessibleCommon,
    DSMath
{
    using SafeMath for uint256;
    using SafeMath32 for uint32;
    /*
    struct safeApproveParams {
        address token;
        uint256 total;
    }

    struct collectParams {
        uint256 tokenId;
        uint128 amount0Max;
        uint128 amount1Max;
    }
    */
    event MinedCoinage(
        uint256 curTime,
        uint256 miningInterval,
        uint256 miningAmount,
        uint256 prevTotalSupply,
        uint256 afterTotalSupply,
        uint256 factor
    );

    event IncreasedLiquidity(
        address indexed sender,
        uint256 indexed tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    event Collected(address indexed sender, uint256 indexed tokenId, uint256 amount0, uint256 amount1);

    event DecreasedLiquidity(
        address indexed sender,
        uint256 indexed tokenId,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    /// @dev constructor of StakeCoinage
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);

        miningIntervalSeconds = 15;
    }

    /// @dev receive ether - revert
    receive() external payable {
        revert();
    }


    /// @dev mining on coinage, Mining conditions :  the sale start time must pass,
    /// the stake start time must pass, the vault mining start time (sale start time) passes,
    /// the mining interval passes, and the current total amount is not zero,
    function miningCoinage() public lock {
        if (saleStartTime == 0 || saleStartTime > block.timestamp) return;
        if (stakeStartTime == 0 || stakeStartTime > block.timestamp) return;
        if (
            IIStake2Vault(vault).miningStartTime() > block.timestamp ||
            IIStake2Vault(vault).miningEndTime() < block.timestamp
        ) return;

        if (coinageLastMintBlockTimetamp == 0)
            coinageLastMintBlockTimetamp = stakeStartTime;

        if (
            block.timestamp >
            (coinageLastMintBlockTimetamp.add(miningIntervalSeconds))
        ) {
            uint256 miningInterval =
                block.timestamp.sub(coinageLastMintBlockTimetamp);
            uint256 miningAmount =
                miningInterval.mul(IIStake2Vault(vault).miningPerSecond());
            uint256 prevTotalSupply =
                IAutoRefactorCoinageWithTokenId(coinage).totalSupply();

            if (miningAmount > 0 && prevTotalSupply > 0) {
                uint256 afterTotalSupply =
                    prevTotalSupply.add(miningAmount.mul(10**9));
                uint256 factor =
                    IAutoRefactorCoinageWithTokenId(coinage).setFactor(
                        _calcNewFactor(
                            prevTotalSupply,
                            afterTotalSupply,
                            IAutoRefactorCoinageWithTokenId(coinage).factor()
                        )
                    );
                coinageLastMintBlockTimetamp = block.timestamp;

                emit MinedCoinage(
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

    function _calcNewFactor(
        uint256 source,
        uint256 target,
        uint256 oldFactor
    ) internal pure returns (uint256) {
        return rdiv(rmul(target, oldFactor), source);
    }

    function safeApprove(bytes calldata params) external returns (bool){
        (address token, uint256 total) = abi.decode(params, (address,uint256));
        TransferHelper.safeApprove(token, address(nonfungiblePositionManager), total);
        return true;
    }

    function increaseLiquidity(bytes calldata params)
        external
        payable
        returns ( bool )
    {
        (uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired,
         uint256 amount0Min, uint256 amount1Min, uint256 deadline )
         = abi.decode(params, (uint256,uint256,uint256,uint256,uint256,uint256));

        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId];
        require(msg.sender == _depositTokens.owner, 'not owner');
        require(!_depositTokens.claimLock && !_depositTokens.withdraw, "StakeUniswapV3: in process");
        require(poolToken0 != address(0) && poolToken1 != address(0), 'zeroAddress token');
        _depositTokens.claimLock = true;

        miningCoinage();

        TransferHelper.safeTransferFrom(poolToken0, msg.sender, address(this), amount0Desired);
        TransferHelper.safeTransferFrom(poolToken1, msg.sender, address(this), amount1Desired);

        (uint128 liquidity, uint256 amount0, uint256 amount1) = nonfungiblePositionManager.increaseLiquidity(
            INonfungiblePositionManager.IncreaseLiquidityParams(
                {
                    tokenId: tokenId,
                    amount0Desired: amount0Desired,
                    amount1Desired: amount1Desired,
                    amount0Min: amount0Min,
                    amount1Min: amount1Min,
                    deadline: deadline
                }
            ));
        (,,,,,int24 tickLower,int24 tickUpper,,,,,) = nonfungiblePositionManager.positions(tokenId);
        _depositTokens.liquidity += liquidity;
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;

        totalStakedAmount = totalStakedAmount.add(uint256(liquidity));

        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        _userTotalStaked.totalDepositAmount = _userTotalStaked
            .totalDepositAmount
            .add(uint256(liquidity));
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];
        _stakedCoinageTokens.amount = _stakedCoinageTokens.amount.add(uint256(liquidity));

        uint256 tokenId_ = tokenId;

        //mint coinage of user amount
        IAutoRefactorCoinageWithTokenId(coinage).mint(
            msg.sender,
            tokenId_,
            uint256(liquidity).mul(10**9)
        );
        _depositTokens.claimLock = false;

        emit IncreasedLiquidity(msg.sender, tokenId_, liquidity, amount0, amount1);
        return true;
    }

    function collect(bytes calldata params)
        external returns (bool)
    {
        (uint256 tokenId, uint128 amount0Max, uint128 amount1Max)
         = abi.decode(params, (uint256,uint128,uint128));

        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId];
        require(msg.sender == _depositTokens.owner, 'not owner');
        require(!_depositTokens.claimLock && !_depositTokens.withdraw, "StakeUniswapV3: in process");
        require(poolToken0 != address(0) && poolToken1 != address(0), 'zeroAddress token');
        (,,,,,,,,,,uint128 tokensOwed0, uint128 tokensOwed1) = nonfungiblePositionManager.positions(tokenId);
        require(amount0Max <= tokensOwed0 && amount1Max <= tokensOwed1, 'tokensOwed is exceed');

        _depositTokens.claimLock = true;

        (uint256 amount0, uint256 amount1) = nonfungiblePositionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: _depositTokens.owner,
                amount0Max: amount0Max,
                amount1Max: amount1Max
            }));

       _depositTokens.claimLock = false;
       emit Collected(msg.sender, tokenId, amount0, amount1);
       return true;
    }

    function decreaseLiquidity(bytes calldata params)
        external
        payable
        returns (uint256 amount0, uint256 amount1)
    {

        (uint256 tokenId, uint128 paramliquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)
         = abi.decode(params, (uint256,uint128,uint256,uint256,uint256));

        LibUniswapV3Stake.StakeLiquidity storage _depositTokens = depositTokens[tokenId];
        require(msg.sender == _depositTokens.owner, 'not owner');
        require(_depositTokens.liquidity > paramliquidity, 'insufficient liquidity');

        require(!_depositTokens.claimLock && !_depositTokens.withdraw, "StakeUniswapV3: in process");
        _depositTokens.claimLock = true;

        //uint128 positionLiquidity = liquidity;
        miningCoinage();
        (amount0, amount1) = nonfungiblePositionManager.decreaseLiquidity(INonfungiblePositionManager.DecreaseLiquidityParams(
            {
                tokenId: tokenId,
                liquidity: paramliquidity,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: deadline
            }
        ));
        (,,,,, int24 tickLower, int24 tickUpper, uint128 liquidity,,,,) = nonfungiblePositionManager.positions(tokenId);
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;

        //_depositTokens.liquidity -= positionLiquidity;
        uint128 diffLiquidity = _depositTokens.liquidity - liquidity;
        _depositTokens.liquidity = liquidity;

        totalStakedAmount = totalStakedAmount.sub(uint256(diffLiquidity));

        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        _userTotalStaked.totalDepositAmount = _userTotalStaked
            .totalDepositAmount
            .sub(uint256(diffLiquidity));
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];
        _stakedCoinageTokens.amount = _stakedCoinageTokens.amount.sub(uint256(diffLiquidity));

        //mint coinage of user amount
        IAutoRefactorCoinageWithTokenId(coinage).burn(
            msg.sender,
            tokenId,
            uint256(diffLiquidity).mul(10**9)
        );
        uint256 amount0_ = amount0;
        uint256 amount1_ = amount1;
        _depositTokens.claimLock = false;

        emit DecreasedLiquidity(msg.sender, tokenId, diffLiquidity, amount0_, amount1_);
    }

}
