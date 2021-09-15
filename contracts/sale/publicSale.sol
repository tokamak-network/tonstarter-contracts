// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract publicSale is Ownable, ReentrancyGuard{
    using SafeERC20 for IERC20;

    struct userInfoEx {
        bool join;
        uint tier;
        uint256 payAmount;
        uint256 saleAmount;
    }

    struct userInfoOpen {
        bool join;
        uint256 subscriptAmount;
        uint256 payAmount;
        uint256 saleAmount;
    }


    address public getTokenOwner;
    uint256 public snapshot;

    uint256 public startExclusiveTime = 0;
    uint256 public endExclusiveTime = 0;
    uint256 public startExClaimTime = 0;
    uint256 public endExClaimTime = 0;

    uint256 public startOpenSaleTime = 0;
    uint256 public endOpenSaleTime = 0;
    uint256 public startSubscriptionTime = 0;
    uint256 public endSubscriptionTime = 0;

    uint256 public totalWhitelists = 0;         //총 화이트리스트 수 (exclusive)
    uint256 public totalExSaleAmount = 0;       //총 판매토큰 양 (exclusive)
    uint256 public totalExpectSaleAmount = 0;   //예정된 판매토큰 양 (exclusive)
    uint256 public totalExPurchasedAmount = 0;  //총 지불토큰 받은 양 (exclusive)

    uint256 public totalOpenSaleAmount;         //총 OpenSale 판매 토큰량
    uint256 public totalExpectOpenSaleAmount;   //예정된 판매 토큰량
    uint256 public totalOpenPurchasedAmount;    //총 지불토큰 받은양

    uint256 public rateSaleToken;   //구매시 받을 토큰 계산
    uint256 public saleTokenPrice;  //판매하는 토큰(DOC)
    uint256 public payTokenPrice;   //받는 토큰(TON)

    IERC20 public saleToken;
    IERC20 public getToken;

    address[] subscriptors;

    mapping (address => userInfoEx) public usersEx;
    mapping (address => userInfoOpen) public usersOpen;


    constructor(address _saleTokenAddress, address _getTokenAddress, address _getTokenOwner) {
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        getTokenOwner = _getTokenOwner;
    }
}