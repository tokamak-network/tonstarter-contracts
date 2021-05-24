//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../libraries/LibTokenStake1.sol";

contract Stake1Storage {
    // reward token : FLD
    address public token;

    // paytoken is the token that the user stakes. ( if paytoken is ether, paytoken is address(0) )
    address public paytoken;
    // A vault that holds fld rewards.
    address public vault;

    // the start block for sale.
    uint256 public saleStartBlock;
    // the staking start block, once staking starts, users can no longer apply for staking.
    uint256 public startBlock;
    // the staking end block.
    uint256 public endBlock;

    // the total amount claimed
    uint256 public rewardClaimedTotal;
    // the total staked amount
    uint256 public totalStakedAmount;

    // information staked by user
    mapping(address => LibTokenStake1.StakedAmount) public userStaked;

    // total stakers
    uint256 public totalStakers;

    uint256 internal _lock;

}
