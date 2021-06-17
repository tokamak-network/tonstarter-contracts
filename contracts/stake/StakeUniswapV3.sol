//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint128.sol";
import "@uniswap/v3-core/contracts/libraries/FullMath.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/base/Multicall.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../interfaces/IStakeUniswapV3.sol";
import { IIStake1Vault } from "../interfaces/IIStake1Vault.sol";
import { IIERC20 } from "../interfaces/IIERC20.sol";

import "../libraries/LibTokenStake1.sol";
import { SafeMath } from "../utils/math/SafeMath.sol";
import "../stake/Stake1Storage.sol";

/// @title Simple Stake Contract
/// @notice Stake contracts can interact with the vault to claim tos tokens
contract StakeUniswapV3 is Stake1Storage, AccessControl, IStakeUniswapV3 {
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

    struct StakeLiquidity {
      address owner;
      IUniswapV3Pool pool;
      uint256 liquidity;
      int24 tickLower;
      int24 tickUpper;
      uint256 secondsPerLiquidityInsideX128Initial;
      uint256 claimedAmount;
    }

    INonfungiblePositionManager public nonfungiblePositionManager;
    IUniswapV3Factory public factory;
    uint256 private REWARDS_PER_SECOND;

    address public WTONAddress;
    address public TOSAddress;
    address public WETHAddress;

    mapping (address => mapping(uint256 => StakeLiquidity)) public stakes;
    
    /// @inheritdoc IStakeUniswapV3
    function stakeETHtoTOS(uint256 tokenId) external override {
      (,,address token0, address token1,,,,,,,,) = nonfungiblePositionManager.positions(tokenId);
      require (
        token0 == WETHAddress && token1 == TOSAddress,
        "Wrong tokenId"
      );
    }


    /// @inheritdoc IStakeUniswapV3
    function stakeWTONtoTOS(uint256 tokenId) external override {
      (,, address token0, address token1,,,,,,,,) = nonfungiblePositionManager.positions(tokenId);
      require (
        token0 == WTONAddress && token1 == TOSAddress,
        "Wrong tokenId"
      );
    }

    /// @dev _stakeLiquidity
    function _stakeLiquidity(uint256 tokenId) internal {
        require(
            block.number >= saleStartBlock && block.number < startBlock,
            "StakeSimple: period is not allowed"
        );
        require(!IIStake1Vault(vault).saleClosed(), "not end");
        // require(
            nonfungiblePositionManager.transferFrom(msg.sender, address(this), tokenId);
        //     "Cannot transfer"
        // );

        (,,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,,,,) = nonfungiblePositionManager.positions(tokenId);
        address poolAddress = PoolAddress.computeAddress(
            address(factory),
            PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
        );
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        (, uint160 secondsPerLiquidityInsideX128, ) = pool.snapshotCumulativesInside(tickLower, tickUpper);

        stakes[msg.sender][tokenId] = StakeLiquidity({
            owner: msg.sender,
            pool: pool,
            liquidity: liquidity,
            tickLower: tickLower,
            tickUpper: tickUpper,
            secondsPerLiquidityInsideX128Initial: secondsPerLiquidityInsideX128,
            claimedAmount: 0
        });
    }


    /// @inheritdoc IStakeUniswapV3
    function withdraw(uint256 tokenId) external override {
        require(
            endBlock > 0 && endBlock < block.number,
            "StakeSimple: not end"
        );

        StakeLiquidity storage stake = stakes[msg.sender][tokenId];
        require(stake.owner == msg.sender, "Not authenticated");
        // require(
            nonfungiblePositionManager.safeTransferFrom(address(this), msg.sender, tokenId);
        ///    "Cannot transfer"
        // );
        delete stakes[msg.sender][tokenId];
        emit Withdrawal(msg.sender, tokenId);
    }
    
    /// @inheritdoc IStakeUniswapV3
    function claim(uint256 tokenId) external override lock {
        require(
            IIStake1Vault(vault).saleClosed() == true,
            "StakeTON: not closed"
        );


        uint256 rewardClaim = canRewardAmount(msg.sender, tokenId);
        require(rewardClaim > 0, "StakeTON: reward is zero");

        uint256 rewardTotal = IIStake1Vault(vault).totalRewardAmount(address(this));
        require(
            rewardClaimedTotal.add(rewardClaim) <= rewardTotal,
            "StakeTON: total reward exceeds"
        );

        StakeLiquidity storage stake = stakes[msg.sender][tokenId];
        (, uint160 secondsPerLiquidityInsideX128, ) = stake.pool.snapshotCumulativesInside(stake.tickLower, stake.tickUpper);
        stake.secondsPerLiquidityInsideX128Initial = secondsPerLiquidityInsideX128;
        stake.claimedAmount = stake.claimedAmount.add(rewardClaim);
        rewardClaimedTotal = rewardClaimedTotal.add(rewardClaim);
        require(IIStake1Vault(vault).claim(msg.sender, rewardClaim), "Cannot claim");

        emit Claimed(msg.sender, rewardClaim, block.number);
    }

    /// @inheritdoc IStakeUniswapV3
    function canRewardAmount(address account, uint256 tokenId) override public view returns (uint256 reward) {
        StakeLiquidity memory stake = stakes[account][tokenId];
        (, uint160 secondsPerLiquidityInsideX128, ) = stake.pool.snapshotCumulativesInside(stake.tickLower, stake.tickUpper);
        uint256 secondsInside = (secondsPerLiquidityInsideX128 - stake.secondsPerLiquidityInsideX128Initial) * stake.liquidity;
        reward = secondsInside * REWARDS_PER_SECOND;
    }
}
