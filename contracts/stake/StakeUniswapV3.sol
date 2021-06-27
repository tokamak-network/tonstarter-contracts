//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint128.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import '@uniswap/v3-core/contracts/libraries/FullMath.sol';

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/base/Multicall.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../libraries/LibUniswapV3Stake.sol";

import "../interfaces/IStakeUniswapV3.sol";
import { IIStake1Vault } from "../interfaces/IIStake1Vault.sol";
import { IIERC20 } from "../interfaces/IIERC20.sol";

import "../libraries/LibTokenStake1.sol";
import { SafeMath } from "../utils/math/SafeMath.sol";
import "./StakeUniswapV3Storage.sol";

/// @title Simple Stake Contract
/// @notice Stake contracts can interact with the vault to claim tos tokens
contract StakeUniswapV3 is StakeUniswapV3Storage, AccessControl, IStakeUniswapV3 {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "StakeSimple: not an admin");
        _;
    }
    modifier lock() {
        require(_lock == 0, "StakeSimple: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    /// @dev event on staking
    /// @param to the sender
    /// @param tokenId the amount of staking
    event Staked(address indexed to, uint256 tokenId);

    /// @dev event on claim
    /// @param to the sender
    /// @param amount the amount of claim
    /// @param claimBlock the block of claim
    event Claimed(address indexed to, uint256 amount, uint256 claimBlock);

    /// @dev event on withdrawal
    /// @param to the sender
    /// @param tokenId the tokenId of the position
    event Withdrawal(address indexed to, uint256 tokenId);

    /// @dev constructor of StakeSimple
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "StakeSimple: same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev Initialize
    /// @param _token  the reward token address , It is TOS address.
    /// @param _paytoken  Tokens staked by users, can be used as ERC20 tokens.
    //                     (In case of ETH, input address(0))
    /// @param _vault  the _ault's address
    /// @param _saleStartBlock  the sale start block
    /// @param _startBlock  the staking start block
    /// @param _period the period that user can generate reward amount
    function initialize(
        address _token,
        address _paytoken,
        address _vault,
        uint256 _saleStartBlock,
        uint256 _startBlock,
        uint256 _period
    ) external override onlyOwner {
        require(
            _token != address(0) &&
                _vault != address(0) &&
                _saleStartBlock < _startBlock,
            "StakeSimple: initialize zero"
        );
        token = _token;
        paytoken = _paytoken;
        vault = _vault;
        saleStartBlock = _saleStartBlock;
        startBlock = _startBlock;
        endBlock = startBlock.add(_period);
    }
    
    /// @inheritdoc IStakeUniswapV3
    function stakeLiquidity(uint256 tokenId) external override {
        require(
            !IIStake1Vault(vault).saleClosed(),
            "StakeUniswapV3: not end"
        );
        require(
            saleStartBlock <= block.number && block.number < startBlock,
            "StakeUniswapV3: period is not allowed"
        );

        (,,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,,,,) = nonfungiblePositionManager.positions(tokenId);
        require (
            (token0 == address(token) && token1 == address(paytoken)) ||
            (token0 == address(paytoken) && token1 == address(token)),
            "StakeUniswapV3: wrong tokens"
        );
        nonfungiblePositionManager.transferFrom(msg.sender, address(this), tokenId);

        address poolAddress = PoolAddress.computeAddress(
            uniswapV3FactoryAddress,
            PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
        );
        (, uint160 secondsPerLiquidityInsideX128, ) = IUniswapV3Pool(poolAddress).snapshotCumulativesInside(tickLower, tickUpper);

        stakes[msg.sender][tokenId] = LibUniswapV3Stake.StakeLiquidity({
            owner: msg.sender,
            poolAddress: poolAddress,
            liquidity: liquidity,
            tickLower: tickLower,
            tickUpper: tickUpper,
            secondsPerLiquidityInsideX128Last: secondsPerLiquidityInsideX128,
            claimedAmount: 0,
            claimedBlock: block.number
        });
    }


    modifier ifOwner(uint256 tokenId) {
        require(stakes[msg.sender][tokenId].owner == msg.sender, "Not an owner");
        _;
    }

    /// @inheritdoc IStakeUniswapV3
    function increaseLiquidity(INonfungiblePositionManager.IncreaseLiquidityParams calldata params)
        external
        override
        ifOwner(params.tokenId)
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        ) 
    {
        claim(params.tokenId);
        LibUniswapV3Stake.StakeLiquidity storage stake = stakes[msg.sender][params.tokenId];
        (liquidity, amount0, amount1) = nonfungiblePositionManager.increaseLiquidity(params);
        stake.liquidity = liquidity;
    }

    /// @inheritdoc IStakeUniswapV3
    function decreaseLiquidity(INonfungiblePositionManager.DecreaseLiquidityParams calldata params)
        external
        override
        ifOwner(params.tokenId)
        returns (
            uint256 amount0,
            uint256 amount1
        ) 
    {
        claim(params.tokenId);
        LibUniswapV3Stake.StakeLiquidity storage stake = stakes[msg.sender][params.tokenId];
        (amount0, amount1) = nonfungiblePositionManager.decreaseLiquidity(params);
        stake.liquidity -= params.liquidity;
    }
    
    function modifyPosition(LibUniswapV3Stake.ModifyPositionParams calldata params)
        override
        external
        ifOwner(params.tokenId)
        returns (
            uint256 newTokenId,
            uint128 newLiquidity,
            uint256 newAmount0,
            uint256 newAmount1
        )
    {
        (,,address token0, address token1,,,,uint128 liquidity,,,,) = nonfungiblePositionManager.positions(params.tokenId);
        claim(params.tokenId);
        (uint256 amount0, uint256 amount1) = _removeLiquidityAndTransferToken(params.tokenId, liquidity);
        delete stakes[msg.sender][params.tokenId];

        (newTokenId, newLiquidity, newAmount0, newAmount1) = _createNewTokenStake(LibUniswapV3Stake.CreateNewTokenStakeParams({
            token0: token0,
            token1: token1,
            amount0: amount0,
            amount1: amount1,
            fee: params.newFee,
            tickLower: params.newTickLower,
            tickUpper: params.newTickUpper
        }));
    }

    function _removeLiquidityAndTransferToken(uint256 tokenId, uint128 liquidity)
        internal
        returns (
            uint256 amount0,
            uint256 amount1
        )
    {
        (amount0, amount1) = nonfungiblePositionManager.decreaseLiquidity(INonfungiblePositionManager.DecreaseLiquidityParams({
            tokenId: tokenId,
            liquidity: liquidity,
            amount0Min: 0,
            amount1Min: 0,
            deadline: block.timestamp
        }));
        nonfungiblePositionManager.transferFrom(address(this), msg.sender, tokenId);
    }

    function _createNewTokenStake(LibUniswapV3Stake.CreateNewTokenStakeParams memory params)
        internal
        returns (
            uint256 newTokenId,
            uint128 newLiquidity,
            uint256 newAmount0,
            uint256 newAmount1
        )
    {
        (newTokenId, newLiquidity, newAmount0, newAmount1) = nonfungiblePositionManager.mint(INonfungiblePositionManager.MintParams({
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            amount0Desired: params.amount0,
            amount1Desired: params.amount1,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: block.timestamp
        }));

        address poolAddress = PoolAddress.computeAddress(
            uniswapV3FactoryAddress,
            PoolAddress.PoolKey({token0: params.token0, token1: params.token1, fee: params.fee})
        );
        (, uint160 secondsPerLiquidityInsideX128, ) = IUniswapV3Pool(poolAddress).snapshotCumulativesInside(params.tickLower, params.tickUpper);
        stakes[msg.sender][newTokenId] = LibUniswapV3Stake.StakeLiquidity({
            owner: msg.sender,
            poolAddress: poolAddress,
            liquidity: newLiquidity,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            secondsPerLiquidityInsideX128Last: secondsPerLiquidityInsideX128,
            claimedAmount: 0,
            claimedBlock: block.number
        });
    }


    /// @inheritdoc IStakeUniswapV3
    function withdraw(uint256 tokenId) external override ifOwner(tokenId) {
        require(endBlock < block.number, "StakeUniswapV3: Not end");
        nonfungiblePositionManager.safeTransferFrom(address(this), msg.sender, tokenId);    
        delete stakes[msg.sender][tokenId];
        emit Withdrawal(msg.sender, tokenId);
    }
    
    /// @inheritdoc IStakeUniswapV3
    function claim(uint256 tokenId) public override lock ifOwner(tokenId) {
        require(
            IIStake1Vault(vault).saleClosed() == true,
            "StakeUniswapV3: not closed"
        );

        uint256 rewardClaim = canRewardAmount(msg.sender, tokenId);
        require(rewardClaim > 0, "StakeUniswapV3: reward is zero");

        uint256 rewardTotal = IIStake1Vault(vault).totalRewardAmount(address(this));
        require(
            rewardClaimedTotal.add(rewardClaim) <= rewardTotal,
            "StakeUniswapV3: total reward exceeds"
        );

        LibUniswapV3Stake.StakeLiquidity storage stake = stakes[msg.sender][tokenId];
        require(stake.claimedBlock < endBlock, "StakeUniswapV3: Already claimed everything");
        (, uint160 secondsPerLiquidityInsideX128, ) = IUniswapV3Pool(stake.poolAddress).snapshotCumulativesInside(stake.tickLower, stake.tickUpper);

        stake.secondsPerLiquidityInsideX128Last = secondsPerLiquidityInsideX128;
        stake.claimedAmount = stake.claimedAmount.add(rewardClaim);
        stake.claimedBlock = block.number;
        rewardClaimedTotal = rewardClaimedTotal.add(rewardClaim);
        
        require(IIStake1Vault(vault).claim(msg.sender, rewardClaim), "StakeUniswapV3: Cannot claim");

        emit Claimed(msg.sender, rewardClaim, block.number);
    }

    /// @inheritdoc IStakeUniswapV3
    function canRewardAmount(address account, uint256 tokenId) override public view returns (uint256 reward) {
        LibUniswapV3Stake.StakeLiquidity memory stake = stakes[account][tokenId];
        (, uint160 secondsPerLiquidityInsideX128, ) = IUniswapV3Pool(stake.poolAddress).snapshotCumulativesInside(stake.tickLower, stake.tickUpper);
        uint256 secondsInsideX128 = (secondsPerLiquidityInsideX128 - stake.secondsPerLiquidityInsideX128Last) * stake.liquidity;
        // uint256 totalSecondsX128 = (
        //    min(endTimestamp, block.timestamp) - max(startTimestamp, stake.claimedTime)
        // ) << 128;
        reward = secondsInsideX128 * REWARDS_PER_SECOND;
    }
}
