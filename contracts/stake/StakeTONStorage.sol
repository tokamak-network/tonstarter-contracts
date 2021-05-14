//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

//import { IERC20 } from "../interfaces/IERC20.sol";
import "../libraries/LibTokenStake1.sol";
import "./Stake1Storage.sol";

contract StakeTONStorage is Stake1Storage {
    address public ton;
    address public wton;
    address public depositManager;
    address public seigManager;
    address public tokamakLayer2;
    address internal _uniswapRouter;

    // reward from tokamak
    uint256 public rewardTokamak;

}
