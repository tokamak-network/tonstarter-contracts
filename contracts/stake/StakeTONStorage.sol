//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "./Stake1Storage.sol";

contract StakeTONStorage is Stake1Storage {
    address public tokamakLayer2;

    // uniswap-v3
    // address internal _uniswapRouter;
    //address internal npm;
    //bytes internal routerPath;
    // address public wethAddress;
    // uint256 public feeMedium;

    // tokamak
    uint256 public toTokamak;
    uint256 public fromTokamak;
    uint256 public toUniswapTON;
    uint256 public swappedAmountFLD;
    uint256 public defiStatus;

    uint256 public requestNum;

    bool public withdrawFlag;
}
