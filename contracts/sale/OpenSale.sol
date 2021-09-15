// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import { PublicSaleStorage } from "./PublicSaleStorage.sol";


contract OpenSale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct UserInfoOpen {
        bool join;
        uint256 subscriptAmount;
        uint256 payAmount;
        uint256 saleAmount;
    }

    address public getTokenOwner;

    uint256 public startOpenSaleTime = 0;
    uint256 public endOpenSaleTime = 0;
    uint256 public startSubscriptionTime = 0;
    uint256 public endSubscriptionTime = 0;

    uint256 public totalOpenSaleAmount;         //총 OpenSale 판매 토큰량
    uint256 public totalExpectOpenSaleAmount;   //예정된 판매 토큰량
    uint256 public totalOpenPurchasedAmount;    //총 지불토큰 받은양

    address[] public subscriptors;

    mapping (address => UserInfoOpen) public usersOpen;


    constructor(address _saleTokenAddress, address _getTokenAddress, address _getTokenOwner) {
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        getTokenOwner = _getTokenOwner;
    }
}