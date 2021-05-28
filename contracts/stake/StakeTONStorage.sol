//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "./Stake1Storage.sol";

contract StakeTONStorage is Stake1Storage {
    address public tokamakLayer2;

    // tokamak
    uint256 public toTokamak;   // wei
    uint256 public fromTokamak; // wton ray
    uint256 public toUniswapWTON;
    uint256 public swappedAmountFLD;
    uint256 public finalBalanceTON;
    uint256 public finalBalanceWTON;
    uint256 public defiStatus;

    uint256 public requestNum;

    bool public withdrawFlag;
}
