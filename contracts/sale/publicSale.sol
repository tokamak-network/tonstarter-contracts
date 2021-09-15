// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ERC20/IERC20Snapshot.sol";

contract PublicSale is Ownable, ReentrancyGuard{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct UserInfoEx {
        bool join;
        uint tier;
        uint256 payAmount;
        uint256 saleAmount;
    }

    struct UserInfoOpen {
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
    uint256 public totalExPurchasedAmount = 0;  //총 지불토큰 받은 양 (exclusive)

    uint256 public totalOpenSaleAmount;         //총 OpenSale 판매 토큰량
    uint256 public totalOpenPurchasedAmount;    //총 지불토큰 받은양

    uint256 public totalExpectSaleAmount = 0;   //예정된 판매토큰 양 (exclusive)
    uint256 public totalExpectOpenSaleAmount;   //예정된 판매 토큰량

    uint256 public rateSaleToken;   //구매시 받을 토큰 계산
    uint256 public saleTokenPrice;  //판매하는 토큰(DOC)
    uint256 public payTokenPrice;   //받는 토큰(TON)

    IERC20 public saleToken;
    IERC20 public getToken;
    IERC20Snapshot public sTOS;

    address[] public subscriptors;

    mapping (address => UserInfoEx) public usersEx;
    mapping (address => UserInfoOpen) public usersOpen;
    mapping (uint => uint256) public tiers;         //티어별 가격 설정
    mapping (uint => uint256) public tiersAccount;  //티어별 참여자 기록
    mapping (uint => uint256) public tiersPercents;  //티어별 퍼센트 기록


    constructor(address _saleTokenAddress, address _getTokenAddress, address _getTokenOwner,address _sTOS) {
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        getTokenOwner = _getTokenOwner;
        sTOS = IERC20Snapshot(_sTOS);
    }

    function setSnapshot(uint256 _snapshot) external onlyOwner {
        snapshot = _snapshot;
    }

    function setExclusiveTime(uint256 _startExclusiveTime,uint256 _endExclusiveTime ) external onlyOwner {
        startExclusiveTime = _startExclusiveTime;
        endExclusiveTime = _endExclusiveTime;
    }

    function setTokenPrice(uint256 _saleTokenPrice, uint256 _payTokenPrice) external onlyOwner {
        saleTokenPrice = _saleTokenPrice;
        payTokenPrice = _payTokenPrice;
    }

    function setExclusiveSaleAmount(uint256 _totalExpectSaleAmount) external onlyOwner {
        totalExpectSaleAmount = _totalExpectSaleAmount;
    }

    function setTier(uint256 _tier1, uint256 _tier2, uint256 _tier3, uint256 _tier4) external onlyOwner {
        tiers[1] = _tier1;
        tiers[2] = _tier2;
        tiers[3] = _tier3;
        tiers[4] = _tier4;
    }

    //6%면 600으로 입력 -> 소수점 2째까지 기록 하기 위함 (60% -> 6000/10000)
    function setTierPercents(uint256 _tier1, uint256 _tier2, uint256 _tier3, uint256 _tier4) external onlyOwner {
        tiersPercents[1] = _tier1;
        tiersPercents[2] = _tier2;
        tiersPercents[3] = _tier3;
        tiersPercents[4] = _tier4;
    }

    function calculTier(address _address) public view returns(uint) {
        uint256 sTOSBalance = sTOS.balanceOfAt(_address, snapshot);
        uint tier;
        if(sTOSBalance >= tiers[1] && sTOSBalance < tiers[2]) {
            tier = 1;
        } else if (sTOSBalance >= tiers[2] && sTOSBalance < tiers[3]) {
            tier = 2;
        } else if (sTOSBalance >= tiers[3] && sTOSBalance < tiers[4]) {
            tier = 3;
        } else if (sTOSBalance >= tiers[4]) {
            tier = 4;
        } else if (sTOSBalance < tiers[1]) {
            tier = 5;
        }
        return tier;
    }

    //내가 참여하게 되면 얼만큼 살 수 있는지 리턴, 참여했다면 현재 얼만큼 살 수 있는지 리턴
    function calculTierAmount(address _address) public view returns(uint256) {
        UserInfoEx memory userEx = usersEx[_address];
        uint tier = calculTier(_address);
        if(userEx.join){
            uint256 salePossible = totalExpectSaleAmount.div(tiersAccount[tier]).mul(tiersPercents[tier]).div(10000);
            return salePossible;
        } else {
            uint256 tierAccount = tiersAccount[tier] +1;
            uint256 salePossible = totalExpectSaleAmount.div(tierAccount).mul(tiersPercents[tier]).div(10000);
            return salePossible;
        }
    }

    function addWhiteList() external {
        require(block.timestamp <= startExclusiveTime, "end the whitelist time");
        uint tier = calculTier(msg.sender);
        require(tier <= 4, "need to more sTOS balance");
        tiersAccount[tier] = tiersAccount[tier] + 1;

        UserInfoEx storage userEx = usersEx[msg.sender];
        userEx.join = true;
        userEx.tier = tier;
        totalWhitelists = totalWhitelists + 1;
    }
}