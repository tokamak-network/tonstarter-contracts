//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "./Stake1Storage.sol";

contract StakeTONStorage is Stake1Storage {

    address public stakeRegistry;
    address public tokamakLayer2;
    address internal _uniswapRouter;

    // tokamak
    uint256 public toTokamak;
    uint256 public fromTokamak;
    uint256 public toUniswapTON;
    uint256 public swappedAmountFLD;
    uint public defiStatus;

    uint256 public requestNum;
}
