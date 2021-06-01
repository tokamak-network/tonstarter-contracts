//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IStake1Storage.sol";
import "../libraries/LibTokenStake1.sol";

/// @title The base storage of stakeContract
contract Stake1Storage is IStake1Storage {
    /// @dev reward token : FLD
    address public override token;

    /// @dev registry
    address public override stakeRegistry;

    /// @dev paytoken is the token that the user stakes. ( if paytoken is ether, paytoken is address(0) )
    address public override paytoken;

    /// @dev A vault that holds fld rewards.
    address public override vault;

    /// @dev the start block for sale.
    uint256 public override saleStartBlock;

    /// @dev the staking start block, once staking starts, users can no longer apply for staking.
    uint256 public override startBlock;

    /// @dev the staking end block.
    uint256 public override endBlock;

    /// @dev the total amount claimed
    uint256 public override rewardClaimedTotal;

    /// @dev the total staked amount
    uint256 public override totalStakedAmount;

    /// @dev information staked by user
    mapping(address => LibTokenStake1.StakedAmount) public userStaked;

    /// @dev total stakers
    uint256 public override totalStakers;

    uint256 internal _lock;

    /// @dev user's staked information
    function getUserStaked(address user)
        external
        view
        override
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        return (
            userStaked[user].amount,
            userStaked[user].claimedBlock,
            userStaked[user].claimedAmount,
            userStaked[user].releasedBlock,
            userStaked[user].releasedAmount,
            userStaked[user].releasedFLDAmount,
            userStaked[user].released
        );
    }
}
