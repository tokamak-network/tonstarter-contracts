// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ILockTOS.sol";
import "../common/AccessibleCommon.sol";
import "./PublicSaleStorage.sol";

contract PublicSale is PublicSaleStorage, AccessibleCommon, ReentrancyGuard{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    function setSnapshot(uint256 _snapshot) external onlyOwner {
        snapshot = _snapshot;
    }

    //exclusiveSale 시간 설정            
    function setExclusiveTime(
        uint256 _startAddWhiteTime,
        uint256 _endAddWhiteTime,
        uint256 _startExclusiveTime,
        uint256 _endExclusiveTime 
    ) external onlyOwner {
        startAddWhiteTime = _startAddWhiteTime;
        endAddWhiteTime = _endAddWhiteTime;
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

    function setClaim(
        uint256 _startClaimTime,
        uint256 _claimInterval,
        uint256 _claimPeriod
    ) external onlyOwner {
        startClaimTime = _startClaimTime;
        claimInterval = _claimInterval;
        claimPeriod = _claimPeriod;
    }
    
    //세일에서 얼만큼 팔지 결정
    function setSaleAmount(uint256 _totalExpectSaleAmount, uint256 _totalExpectOpenSaleAmount) external onlyOwner {
        totalExpectSaleAmount = _totalExpectSaleAmount;
        totalExpectOpenSaleAmount = _totalExpectOpenSaleAmount;
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
            tier = 0;
        }
        return tier;
    }

    //내가 참여하게 되면 얼만큼 살 수 있는지 리턴, 참여했다면 현재 얼만큼 살 수 있는지 리턴 (exclusive)
    //식 : 전체 판매 token양 * 티어의 배당 % / 티어참여인 수 -> 전체 100개 티어 60%, 티어참여인 수 = 3 -> 60개를 3명이서 나누어서 사니까 개인당 20개
    function calculTierAmount(address _address) public view returns(uint256) {
        UserInfoEx storage userEx = usersEx[_address];
        uint tier = calculTier(_address);
        if(userEx.join == true){
            uint256 salePossible = totalExpectSaleAmount.mul(tiersPercents[tier]).div(tiersAccount[tier]).div(10000);
            return salePossible;
        } else {
            uint256 tierAccount = tiersAccount[tier] +1;
            uint256 salePossible = totalExpectSaleAmount.mul(tiersPercents[tier]).div(tierAccount).div(10000);
            return salePossible;
        }
    }

    //얼만큼 deposit하면 얼만큼 구매 가능한지 (OpenSale)
    //_amount를 0을 입력하면 현재 얼만큼 구매가능한지 값이 return되고
    //_amount에 값을 넣으면 _amount만큼 더 넣었을 때 얼만큼 더 구매가능해지는 지 확인합니다.
    //식 : openSale에 판매할 토큰양 * (내가 deposit한 양/전체 deposit한 양) = 내가 구매할 수 있는 토큰 양
    function calculOpenSaleAmount(address _account, uint256 _amount) public view returns(uint256) {
        UserInfoOpen storage userOpen = usersOpen[_account];
        uint256 depositAmount = userOpen.depositAmount.add(_amount);
        uint256 openSalePossible = totalExpectOpenSaleAmount.mul(depositAmount).div(totalDepositAmount.add(_amount));
        return openSalePossible;
    }

    function calculCalimAmount(
        address _account
    ) public view returns(uint256) {
        require(block.timestamp >= startClaimTime, "don't start claimTime");
        UserClaim storage userClaim = usersClaim[_account];
        uint difftime = block.timestamp - startClaimTime;

        if (difftime < claimInterval) {
            uint period = 1;
            uint256 reward = (userClaim.periodReward.mul(period)).sub(userClaim.claimAmount);
            return reward;
        } else {
            uint period = (difftime/claimInterval)+1;
            if (period >= claimPeriod) {
                uint256 reward = userClaim.totalClaimReward.sub(userClaim.claimAmount);
                return reward; 
            } else {
                uint256 reward = (userClaim.periodReward.mul(period)).sub(userClaim.claimAmount);
                return reward;
            }
        }
    }

    function addWhiteList() external nonReentrant {
        require(block.timestamp >= startAddWhiteTime, "need to whitelistStartTime");
        require(block.timestamp < endAddWhiteTime, "end the whitelistTime");
        uint tier = calculTier(msg.sender);
        require(tier >= 1, "need to more sTOS balance");
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
        require(block.timestamp >= startExclusiveTime, "need to exclusiveStartTime");
        require(block.timestamp < endExclusiveTime, "end the exclusiveTime");
        UserInfoEx storage userEx = usersEx[msg.sender];
        require(userEx.join == true, "need to attend the whitelist");
        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 salePossible = calculTierAmount(msg.sender);

        require(salePossible >= tokenSaleAmount, "just buy whitelist amount");
        require(salePossible >= userEx.saleAmount.add(tokenSaleAmount), "just buy whitelisted amount");
        getToken.safeTransferFrom(msg.sender, address(this), _amount);
        getToken.safeTransfer(getTokenOwner, _amount);

        UserClaim storage userClaim = usersClaim[msg.sender];

        userEx.payAmount = userEx.payAmount + _amount;
        userEx.saleAmount = userEx.saleAmount + tokenSaleAmount;

        userClaim.totalClaimReward = userClaim.totalClaimReward + tokenSaleAmount;
        uint256 periodReward = userClaim.totalClaimReward.div(claimPeriod);
        userClaim.periodReward = periodReward;

        totalExPurchasedAmount = totalExPurchasedAmount + _amount;
        totalExSaleAmount = totalExSaleAmount + tokenSaleAmount;
    }

    //approve하고 그 후 deposit한다 deposit할때는 payToken을 컨트랙트에 전송함.
    //deposit은 무한대로 받을 수 있음
    function deposit(uint256 _amount) external nonReentrant {
        require(block.timestamp >= startDepositTime, "don't start depositTime");
        require(block.timestamp < endDepositTime, "end the depositTime");
        UserInfoOpen storage userOpen = usersOpen[msg.sender];
        getToken.safeTransferFrom(msg.sender, address(this), _amount);

        userOpen.join = true;
        userOpen.depositAmount = userOpen.depositAmount.add(_amount);
        totalDepositAmount = totalDepositAmount.add(_amount);
        depositors.push(msg.sender);
    }

    
    //내가 deposit한양이 구매하는데 쓰이는 것 보다 많으면 구매 후 남은 금액 반납, 
    //deposit한양이 구매가능한양보다 할당받은 것 보다 더 적게 구입(deposit한 양에 대한 것만 구입)
    function openSale() external {
        require(block.timestamp >= startOpenSaleTime, "don't start openSaleTime");
        require(block.timestamp < endOpenSaleTime, "end the openSaleTime");
        UserInfoOpen storage userOpen = usersOpen[msg.sender];
        UserClaim storage userClaim = usersClaim[msg.sender];
        require(userOpen.join == true, "need to attend the deposit");
        uint256 openSalePossible = calculOpenSaleAmount(msg.sender, 0);
        uint256 realPayAmount = calculPayToken(openSalePossible);
        
        if(realPayAmount < userOpen.depositAmount) {
            uint256 returnAmount = userOpen.depositAmount.sub(realPayAmount);
            getToken.safeTransfer(msg.sender, returnAmount);
            getToken.safeTransfer(getTokenOwner, realPayAmount);
            userOpen.payAmount = userOpen.payAmount + realPayAmount;
            userOpen.saleAmount = userOpen.saleAmount + openSalePossible;
            totalOpenSaleAmount = totalOpenSaleAmount + openSalePossible;

            userClaim.totalClaimReward = userClaim.totalClaimReward + openSalePossible;
            uint256 periodReward = userClaim.totalClaimReward.div(claimPeriod);
            userClaim.periodReward = periodReward; 
        } else {
            getToken.safeTransfer(getTokenOwner, userOpen.depositAmount);
            userOpen.payAmount = userOpen.payAmount + userOpen.depositAmount;
            uint256 realSaleAmount = calculSaleToken(userOpen.depositAmount);
            userOpen.saleAmount = userOpen.saleAmount + realSaleAmount; 
            totalOpenSaleAmount = totalOpenSaleAmount + realSaleAmount;

            userClaim.totalClaimReward = userClaim.totalClaimReward + realSaleAmount;
            uint256 periodReward = userClaim.totalClaimReward.div(claimPeriod);
            userClaim.periodReward = periodReward; 
        }   
    }

    function claim() external {
        require(block.timestamp >= startClaimTime, "don't start claimTime");
        UserClaim storage userClaim = usersClaim[msg.sender];
        require(userClaim.totalClaimReward > 0, "need the participation");

        uint256 reward = calculCalimAmount(msg.sender);

        require(userClaim.totalClaimReward - userClaim.claimAmount >= reward, "user is already getAllreward");
        require(saleToken.balanceOf(address(this)) >= reward, "dont have saleToken in pool");
        
        userClaim.claimAmount = userClaim.claimAmount + reward;

        saleToken.safeTransfer(msg.sender, reward);
    }

}