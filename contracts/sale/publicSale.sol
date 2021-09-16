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
        uint256 depositAmount;
        uint256 payAmount;
        uint256 saleAmount;
    }

    address public getTokenOwner;
    uint256 public snapshot;

    uint256 public startExclusiveTime = 0;
    uint256 public endExclusiveTime = 0;
    uint256 public startExClaimTime = 0;
    uint256 public endExClaimTime = 0;

    uint256 public startDepositTime = 0;   //청약 시작시간
    uint256 public endDepositTime = 0;     //청약 끝시간
    uint256 public startOpenSaleTime = 0;       //openSale 시작시간
    uint256 public endOpenSaleTime = 0;         //openSale 끝 시간

    uint256 public totalWhitelists = 0;         //총 화이트리스트 수 (exclusive)
    uint256 public totalExSaleAmount = 0;       //총 exclu 실제 판매토큰 양 (exclusive)
    uint256 public totalExPurchasedAmount = 0;  //총 지불토큰 받은 양 (exclusive)

    uint256 public totalDepositAmount;          //총 청약 한 양 (openSale)
    uint256 public totalOpenSaleAmount;         //총 OpenSale 실제판매 토큰량 (openSale)
    uint256 public totalOpenPurchasedAmount;    //총 지불토큰 받은양 (openSale)

    uint256 public totalExpectSaleAmount;       //예정된 판매토큰 양 (exclusive)
    uint256 public totalExpectOpenSaleAmount;   //예정된 판매 토큰량 (opensale)

    uint256 public saleTokenPrice;  //판매하는 토큰(DOC)
    uint256 public payTokenPrice;   //받는 토큰(TON)

    IERC20 public saleToken;
    IERC20 public getToken;
    IERC20Snapshot public sTOS;

    address[] public depositors;

    mapping (address => UserInfoEx) public usersEx;
    mapping (address => UserInfoOpen) public usersOpen;
    mapping (uint => uint256) public tiers;         //티어별 가격 설정
    mapping (uint => uint256) public tiersAccount;  //티어별 참여자 숫자 기록
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

    //exclusiveSale 시간 설정            
    function setExclusiveTime(uint256 _startExclusiveTime,uint256 _endExclusiveTime ) external onlyOwner {
        startExclusiveTime = _startExclusiveTime;
        endExclusiveTime = _endExclusiveTime;
    }

    //openSale 시간 설정
    function setOpenTime(
        uint256 _startDepositTime, 
        uint256 _endDepositTime, 
        uint256 _startOpenSaleTime, 
        uint256 _endOpenSaleTime
    ) external onlyOwner {
        startDepositTime = _startDepositTime;
        endDepositTime = _endDepositTime;
        startOpenSaleTime = _startOpenSaleTime;
        endOpenSaleTime = _endOpenSaleTime;
    }
    
    //세일에서 얼만큼 팔지 결정
    function setSaleAmount(uint256 _totalExpectSaleAmount, uint256 _totalOpenSaleAmount) external onlyOwner {
        totalExpectSaleAmount = _totalExpectSaleAmount;
        totalOpenSaleAmount = _totalOpenSaleAmount;
    }

    //티어제도에서 티어조건 설정 (sTOS 개수) 
    function setTier(uint256 _tier1, uint256 _tier2, uint256 _tier3, uint256 _tier4) external onlyOwner {
        tiers[1] = _tier1;
        tiers[2] = _tier2;
        tiers[3] = _tier3;
        tiers[4] = _tier4;
    }

    //티어별 풀 중량 (6%면 600으로 입력 -> 소수점 2째까지 기록 하기 위함 (60% -> 6000/10000))
    function setTierPercents(uint256 _tier1, uint256 _tier2, uint256 _tier3, uint256 _tier4) external onlyOwner {
        tiersPercents[1] = _tier1;
        tiersPercents[2] = _tier2;
        tiersPercents[3] = _tier3;
        tiersPercents[4] = _tier4;
    }

    //exclusiveSale이 끝나고 saleToken양을 openSale의 판매량 증가
    //식 : openSale토큰 판매 예정량 = openSale 판매 예정량 + (exclu 판매 예정량 - exclu 실제 판매량)
    function endExclusiveSale() external onlyOwner {
        totalExpectOpenSaleAmount = totalExpectOpenSaleAmount.add(totalExpectSaleAmount).sub(totalExSaleAmount);
    } 

    //토큰 가격설정 saleTokenPrice = 판매하는 토큰 가격, payTokenPrice = 지불할 토큰 가격
    function setTokenPrice(uint256 _saleTokenPrice, uint256 _payTokenPrice) external onlyOwner {
        saleTokenPrice = _saleTokenPrice;
        payTokenPrice = _payTokenPrice;
    }

    //saleToken 갯수 = payToken 갯수 * (payTokenPrice/saleTokenPrice)
    function calculSaleToken(uint256 _amount) public view returns(uint256) {
        uint256 tokenSaleAmount = _amount.mul(payTokenPrice).div(saleTokenPrice);
        return tokenSaleAmount;
    }

    //payToken 개수 = saleToken 개수 * (saleTokenPrice/payTokenPrice)
    function calculPayToken(uint256 _amount) public view returns(uint256) {
        uint256 tokenPayAmount = _amount.mul(saleTokenPrice).div(payTokenPrice);
        return tokenPayAmount;
    }

    //sTOS수량에 따라 티어등급을 나눈다.
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

    //내가 참여하게 되면 얼만큼 살 수 있는지 리턴, 참여했다면 현재 얼만큼 살 수 있는지 리턴 (exclusive)
    //식 : 전체 판매 token양 * 티어의 배당 % / 티어참여인 수 -> 전체 100개 티어 60%, 티어참여인 수 = 3 -> 60개를 3명이서 나누어서 사니까 개인당 20개
    function calculTierAmount(address _address) public view returns(uint256) {
        UserInfoEx memory userEx = usersEx[_address];
        uint tier = calculTier(_address);
        if(userEx.join == true){
            uint256 salePossible = totalExpectSaleAmount.div(tiersAccount[tier]).mul(tiersPercents[tier]).div(10000);
            return salePossible;
        } else {
            uint256 tierAccount = tiersAccount[tier] +1;
            uint256 salePossible = totalExpectSaleAmount.div(tierAccount).mul(tiersPercents[tier]).div(10000);
            return salePossible;
        }
    }

    //얼만큼 deposit하면 얼만큼 구매 가능한지 (OpenSale)
    //_amount를 0을 입력하면 현재 얼만큼 구매가능하지 값이 return되고
    //_amount에 값을 넣으면 _amount만큼 더 넣었을 때 얼만큼 더 구매가능해지는 지 확인합니다.
    //식 : openSale에 판매할 토큰양 * (내가 deposit한 양/전체 deposit한 양) = 내가 구매할 수 있는 토큰 양
    function calculOpenSaleAmount(address _account, uint256 _amount) public view returns(uint256) {
        UserInfoOpen memory userOpen = usersOpen[_account];
        uint256 depositAmount = userOpen.depositAmount.add(_amount);
        uint256 openSalePossible = totalExpectOpenSaleAmount.mul(depositAmount).div(totalDepositAmount);
        return openSalePossible;
    }

    function addWhiteList() external nonReentrant {
        require(block.timestamp <= startExclusiveTime, "end the whitelist time");
        uint tier = calculTier(msg.sender);
        require(tier <= 4, "need to more sTOS balance");
        tiersAccount[tier] = tiersAccount[tier] + 1;
        UserInfoEx storage userEx = usersEx[msg.sender];
        require(userEx.join != true, "already you attend whitelist");

        userEx.join = true;
        userEx.tier = tier;
        totalWhitelists = totalWhitelists + 1;
    }

    //payToken으로 saleToken을 구매하는 것이라 payToken을 approve후에 구매하여야한다.
    //_amount는 payTokenAmount
    //payToken은 getTokenOwner에게 가고 추후 saleToken을 살 수 있도록 기록한다.
    function exclusiveSale(uint256 _amount) external nonReentrant {
        UserInfoEx storage userEx = usersEx[msg.sender];
        require(userEx.join == true, "need to attend the whitelist");
        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 salePossible = calculTierAmount(msg.sender);
        require(salePossible >= tokenSaleAmount, "just buy whitelist amount");
        getToken.safeTransferFrom(msg.sender, address(this), _amount);
        getToken.safeTransfer(getTokenOwner, _amount);

        userEx.payAmount = userEx.payAmount + _amount;
        userEx.saleAmount = userEx.saleAmount + tokenSaleAmount;

        totalExPurchasedAmount = totalExPurchasedAmount + _amount;
        totalExSaleAmount = totalExSaleAmount + tokenSaleAmount;
    }

    //approve하고 그 후 deposit한다 deposit할때는 payToken을 컨트랙트에 전송함.
    //deposit은 무한대로 받을 수 있음
    function deposit(uint256 _amount) external nonReentrant {
        UserInfoOpen storage userOpen = usersOpen[msg.sender];
        getToken.safeTransferFrom(msg.sender, address(this), _amount);

        userOpen.join = true;
        userOpen.depositAmount = userOpen.depositAmount.add(_amount);
        totalDepositAmount = totalDepositAmount.add(_amount);
    }

    
    //내가 deposit한양이 구매하는데 쓰이는 것 보다 많으면 구매 후 남은 금액 반납, 
    //deposit한양이 구매가능한양보다 할당받은 것 보다 더 적게 구입(deposit한 양에 대한 것만 구입)
    function openSale() external {
        UserInfoOpen storage userOpen = usersOpen[msg.sender];
        require(userOpen.join == true, "need to attend the deposit");
        uint256 openSalePossible = calculOpenSaleAmount(msg.sender, 0);
        uint256 realPayAmount = calculPayToken(openSalePossible);
        
        if(realPayAmount <= userOpen.depositAmount) {
            uint256 returnAmount = userOpen.depositAmount.sub(realPayAmount);
            getToken.safeTransfer(msg.sender, returnAmount);
            userOpen.payAmount = userOpen.payAmount + realPayAmount;
            userOpen.saleAmount = userOpen.saleAmount + openSalePossible; 
        } else {
            userOpen.payAmount = userOpen.payAmount + userOpen.depositAmount;
            uint256 realSaleAmount = calculSaleToken(userOpen.payAmount);
            userOpen.saleAmount = userOpen.saleAmount + realSaleAmount; 
        }   
    }

}