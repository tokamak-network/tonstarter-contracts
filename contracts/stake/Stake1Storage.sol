//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import { IERC20 } from "../interfaces/IERC20.sol";
import "../libraries/LibTokenStake1.sol";

contract Stake1Storage  {

    // The token being sold
    address public token;

    // The paytoken payed ( if paytoken is ether, paytoken is address(0) )
    address public paytoken;
    address public vault;

    // start and end timestamps where mining are allowed (both inclusive)
    uint256 public saleStartBlock;
    uint256 public startBlock;
    uint256 public endBlock;

    // amount of raised FLD in wei unit, (reward/mining FLD )
    uint256 public rewardClaimedTotal;
    uint256 public totalStakedAmount;

    // the current lock storage of your account.
    mapping(address => LibTokenStake1.StakedAmount) public userStaked;
    uint internal _lock;

}