//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../libraries/LibUniswapV3Stake.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

/// @title The base storage of stakeContract
contract StakeUniswapV3Storage {
    /// @dev reward token : TOS
    address public token;

    /// @dev registry
    address public stakeRegistry;

    /// @dev paytoken is the token that the user stakes. ( if paytoken is ether, paytoken is address(0) )
    address public paytoken;

    /// @dev A vault that holds tos rewards.
    address public vault;

    /// @dev the start block for sale.
    uint256 public saleStartBlock;

    /// @dev the staking start block, once staking starts, users can no longer apply for staking.
    uint256 public startBlock;

    /// @dev the staking end block.
    uint256 public endBlock;

    /// @dev the total amount claimed
    uint256 public rewardClaimedTotal;

    /// @dev the total staked amount
    uint256 public totalStakedAmount;

    /// @dev stakes for user's tokenId
    mapping (address => mapping(uint256 => LibUniswapV3Stake.StakeLiquidity)) public stakes;

    /// @dev total stakers
    uint256 public totalStakers;

    /// @dev lock
    uint256 internal _lock;
    
    /// @dev Rewards per second liquidity inside
    uint256 internal REWARDS_PER_SECOND;

    /// @dev UniswapV3 Nonfungible position manager
    INonfungiblePositionManager public nonfungiblePositionManager;
    
    /// @dev UniswapV3 pool factory 
    address public uniswapV3FactoryAddress;
    
    

    /// @dev user's staked information
    function getUserStaked(address user, uint256 tokenId)
        external
        view
        returns (
            uint256 liquidity,
            int24 tickLower,
            int24 tickUpper,
            uint256 secondsPerLiquidityInsideX128Last,
            uint256 claimedAmount
        )
    {
        LibUniswapV3Stake.StakeLiquidity memory stake = stakes[user][tokenId];
        return (
            stake.liquidity,
            stake.tickLower,
            stake.tickUpper,
            stake.secondsPerLiquidityInsideX128Last,
            stake.claimedAmount
        );
    }

    /// @dev Give the infomation of this stakeContracts
    /// @return paytoken, vault, [saleStartBlock, startBlock, endBlock], rewardClaimedTotal, totalStakedAmount, totalStakers
    function infos()
        external
        view
        returns (
            address,
            address,
            uint256[3] memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            paytoken,
            vault,
            [saleStartBlock, startBlock, endBlock],
            rewardClaimedTotal,
            totalStakedAmount,
            totalStakers
        );
    }
}
