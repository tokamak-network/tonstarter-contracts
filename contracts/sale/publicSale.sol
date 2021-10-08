// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ILockTOS.sol";
import "../interfaces/IPublicSale.sol";
import "../common/AccessibleCommon.sol";
import "./PublicSaleStorage.sol";

contract PublicSale is
    PublicSaleStorage,
    AccessibleCommon,
    ReentrancyGuard,
    IPublicSale
{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    event EndedExclusiveSale();
    event AddedWhiteList(address indexed from, uint256 tier);
    event ExclusiveSaled(address indexed from, uint256 amount);
    event Deposited(address indexed from, uint256 amount);
    event OpenSaled(
        address indexed from,
        uint256 realPayAmount,
        uint256 returnAmount
    );
    event Claimed(address indexed from, uint256 amount);
    event Withdrawal(address indexed from, uint256 amount);

    modifier nonZero(uint256 _value) {
        require(_value > 0, "PublicSale: zero");
        _;
    }

    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "PublicSale: zero address");
        _;
    }

    modifier beforeStartAddWhiteTime() {
        require(
            startAddWhiteTime == 0 ||
                (startAddWhiteTime > 0 && block.timestamp < startAddWhiteTime),
            "PublicSale: not beforeStartAddWhiteTime"
        );
        _;
    }

    modifier beforeEndAddWhiteTime() {
        require(
            endAddWhiteTime == 0 ||
                (endAddWhiteTime > 0 && block.timestamp < endAddWhiteTime),
            "PublicSale: not beforeEndAddWhiteTime"
        );
        _;
    }

    modifier greaterThan(uint256 _value1, uint256 _value2) {
        require(_value1 > _value2, "PublicSale: non greaterThan");
        _;
    }

    modifier lessThan(uint256 _value1, uint256 _value2) {
        require(_value1 < _value2, "PublicSale: non less than");
        _;
    }

    function changeTONOwner(address _address) external onlyOwner {
        getTokenOwner = _address;
    }

    function setAllValue(
        uint256 _snapshot,
        uint256[4] calldata _exclusiveTime,
        uint256[4] calldata _openSaleTime,
        uint256[3] calldata _claimTime
    ) external onlyOwner beforeStartAddWhiteTime {
        require(
            (_exclusiveTime[0] < _exclusiveTime[1]) &&
                (_exclusiveTime[2] < _exclusiveTime[3])
        );
        require(
            (_openSaleTime[0] < _openSaleTime[1]) &&
                (_openSaleTime[2] < _openSaleTime[3])
        );
        snapshot = _snapshot;
        startAddWhiteTime = _exclusiveTime[0];
        endAddWhiteTime = _exclusiveTime[1];
        startExclusiveTime = _exclusiveTime[2];
        endExclusiveTime = _exclusiveTime[3];
        startDepositTime = _openSaleTime[0];
        endDepositTime = _openSaleTime[1];
        startOpenSaleTime = _openSaleTime[2];
        endOpenSaleTime = _openSaleTime[3];
        startClaimTime = _claimTime[0];
        claimInterval = _claimTime[1];
        claimPeriod = _claimTime[2];
    }

    /// @inheritdoc IPublicSale
    function setSnapshot(uint256 _snapshot)
        external
        override
        onlyOwner
        nonZero(_snapshot)
    {
        snapshot = _snapshot;
    }

    /// @inheritdoc IPublicSale
    function setExclusiveTime(
        uint256 _startAddWhiteTime,
        uint256 _endAddWhiteTime,
        uint256 _startExclusiveTime,
        uint256 _endExclusiveTime
    )
        external
        override
        onlyOwner
        nonZero(_startAddWhiteTime)
        nonZero(_endAddWhiteTime)
        nonZero(_startExclusiveTime)
        nonZero(_endExclusiveTime)
        beforeStartAddWhiteTime
    {
        startAddWhiteTime = _startAddWhiteTime;
        endAddWhiteTime = _endAddWhiteTime;
        startExclusiveTime = _startExclusiveTime;
        endExclusiveTime = _endExclusiveTime;
    }

    /// @inheritdoc IPublicSale
    function setOpenTime(
        uint256 _startDepositTime,
        uint256 _endDepositTime,
        uint256 _startOpenSaleTime,
        uint256 _endOpenSaleTime
    )
        external
        override
        onlyOwner
        nonZero(_startDepositTime)
        nonZero(_endDepositTime)
        nonZero(_startOpenSaleTime)
        nonZero(_endOpenSaleTime)
        beforeStartAddWhiteTime
    {
        startDepositTime = _startDepositTime;
        endDepositTime = _endDepositTime;
        startOpenSaleTime = _startOpenSaleTime;
        endOpenSaleTime = _endOpenSaleTime;
    }

    /// @inheritdoc IPublicSale
    function setClaim(
        uint256 _startClaimTime,
        uint256 _claimInterval,
        uint256 _claimPeriod
    )
        external
        override
        onlyOwner
        nonZero(_startClaimTime)
        nonZero(_claimInterval)
        nonZero(_claimPeriod)
        beforeStartAddWhiteTime
    {
        startClaimTime = _startClaimTime;
        claimInterval = _claimInterval;
        claimPeriod = _claimPeriod;
    }

    function resetAllData() external onlyOwner {
        startAddWhiteTime = 0;
        totalWhitelists = 0;
        totalExSaleAmount = 0;
        totalExPurchasedAmount = 0;
        totalDepositAmount = 0;
        totalOpenSaleAmount = 0;
        totalOpenPurchasedAmount = 0;

        for (uint256 i = 0; i < whitelists.length; i++) {
            UserInfoEx storage userEx = usersEx[whitelists[i]];
            userEx.join = false;
            userEx.payAmount = 0;
            userEx.saleAmount = 0;
            UserClaim storage userClaim = usersClaim[whitelists[i]];
            userClaim.claimAmount = 0;
            userClaim.periodReward = 0;
            userClaim.totalClaimReward = 0;
        }
        for (uint256 j = 0; j < depositors.length; j++) {
            UserInfoOpen storage userOpen = usersOpen[depositors[j]];
            userOpen.depositAmount = 0;
            userOpen.join = false;
            userOpen.payAmount = 0;
            userOpen.saleAmount = 0;
            UserClaim storage userClaim = usersClaim[depositors[j]];
            userClaim.claimAmount = 0;
            userClaim.periodReward = 0;
            userClaim.totalClaimReward = 0;
        }
        for (uint256 k = 1; k < 5; k++) {
            tiersAccount[k] = 0;
            tiersExAccount[k] = 0;
        }
    }

    function setAllTier(
        uint256[4] calldata _tier,
        uint256[4] calldata _tierPercent
    ) external onlyOwner {
        tiers[1] = _tier[0];
        tiers[2] = _tier[1];
        tiers[3] = _tier[2];
        tiers[4] = _tier[3];
        tiersPercents[1] = _tierPercent[0];
        tiersPercents[2] = _tierPercent[1];
        tiersPercents[3] = _tierPercent[2];
        tiersPercents[4] = _tierPercent[3];
    }

    /// @inheritdoc IPublicSale
    function setTier(
        uint256 _tier1,
        uint256 _tier2,
        uint256 _tier3,
        uint256 _tier4
    )
        external
        override
        onlyOwner
        nonZero(_tier1)
        nonZero(_tier2)
        nonZero(_tier3)
        nonZero(_tier4)
        beforeStartAddWhiteTime
    {
        tiers[1] = _tier1;
        tiers[2] = _tier2;
        tiers[3] = _tier3;
        tiers[4] = _tier4;
    }

    /// @inheritdoc IPublicSale
    //티어별 풀 중량 (6%면 600으로 입력 -> 소수점 2째까지 기록 하기 위함 (60% -> 6000/10000))
    function setTierPercents(
        uint256 _tier1,
        uint256 _tier2,
        uint256 _tier3,
        uint256 _tier4
    )
        external
        override
        onlyOwner
        nonZero(_tier1)
        nonZero(_tier2)
        nonZero(_tier3)
        nonZero(_tier4)
        beforeStartAddWhiteTime
    {
        require(
            _tier1.add(_tier2).add(_tier3).add(_tier4) == 10000,
            "PublicSale: Sum should be 10000"
        );
        tiersPercents[1] = _tier1;
        tiersPercents[2] = _tier2;
        tiersPercents[3] = _tier3;
        tiersPercents[4] = _tier4;
    }

    function setAllAmount(
        uint256[2] calldata _expectAmount,
        uint256[2] calldata _priceAmount
    ) external onlyOwner {
        totalExpectSaleAmount = _expectAmount[0];
        totalExpectOpenSaleAmount = _expectAmount[1];
        saleTokenPrice = _priceAmount[0];
        payTokenPrice = _priceAmount[1];
    }

    /// @inheritdoc IPublicSale
    function setSaleAmount(
        uint256 _totalExpectSaleAmount,
        uint256 _totalExpectOpenSaleAmount
    )
        external
        override
        onlyOwner
        nonZero(_totalExpectSaleAmount.add(_totalExpectOpenSaleAmount))
        beforeStartAddWhiteTime
    {
        totalExpectSaleAmount = _totalExpectSaleAmount;
        totalExpectOpenSaleAmount = _totalExpectOpenSaleAmount;
    }

    /// @inheritdoc IPublicSale
    //토큰 가격설정 saleTokenPrice = 판매하는 토큰 가격, payTokenPrice = 지불할 토큰 가격
    function setTokenPrice(uint256 _saleTokenPrice, uint256 _payTokenPrice)
        external
        override
        onlyOwner
        nonZero(_saleTokenPrice)
        nonZero(_payTokenPrice)
        beforeStartAddWhiteTime
    {
        saleTokenPrice = _saleTokenPrice;
        payTokenPrice = _payTokenPrice;
    }

    /// @inheritdoc IPublicSale
    //exclusiveSale이 끝나고 saleToken양을 openSale의 판매량 증가
    //식 : openSale토큰 판매 예정량 = openSale 판매 예정량 + (exclu 판매 예정량 - exclu 실제 판매량)
    function endExclusiveSale() public override {
        require(
            !endExclusiveSaleExec,
            "PublicSale: allready endExclusiveSaleExec"
        );
        require(
            block.timestamp >= endExclusiveTime,
            "PublicSale: didn't end exclusiveSale"
        );
        endExclusiveSaleExec = true;
        totalExpectOpenSaleAmount = totalExpectOpenSaleAmount
            .add(totalExpectSaleAmount)
            .sub(totalExSaleAmount);
        totalExpectSaleAmount = totalExSaleAmount;
        emit EndedExclusiveSale();
    }

    /// @inheritdoc IPublicSale
    function totalExpectOpenSaleAmountView() external view override returns(uint256){
        if(block.timestamp < endExclusiveTime || endExclusiveSaleExec) return totalExpectOpenSaleAmount;
        else return totalExpectOpenSaleAmount.add(totalExpectSaleAmount).sub(totalExSaleAmount);
    }

    /// @inheritdoc IPublicSale
    //saleToken 갯수 = payToken 갯수 * (payTokenPrice/saleTokenPrice)
    function calculSaleToken(uint256 _amount)
        public
        view
        override
        returns (uint256)
    {
        uint256 tokenSaleAmount =
            _amount.mul(payTokenPrice).div(saleTokenPrice);
        return tokenSaleAmount;
    }

    /// @inheritdoc IPublicSale
    //payToken 개수 = saleToken 개수 * (saleTokenPrice/payTokenPrice)
    function calculPayToken(uint256 _amount)
        public
        view
        override
        returns (uint256)
    {
        uint256 tokenPayAmount = _amount.mul(saleTokenPrice).div(payTokenPrice);
        return tokenPayAmount;
    }

    /// @inheritdoc IPublicSale
    //sTOS수량에 따라 티어등급을 나눈다.
    function calculTier(address _address)
        public
        view
        override
        nonZeroAddress(address(sTOS))
        nonZero(tiers[1])
        nonZero(tiers[2])
        nonZero(tiers[3])
        nonZero(tiers[4])
        returns (uint256)
    {
        uint256 sTOSBalance = sTOS.balanceOfAt(_address, snapshot);
        uint256 tier;
        if (sTOSBalance >= tiers[1] && sTOSBalance < tiers[2]) {
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

    /// @inheritdoc IPublicSale
    //내가 참여하게 되면 얼만큼 살 수 있는지 리턴, 참여했다면 현재 얼만큼 살 수 있는지 리턴 (exclusive)
    //식 : 전체 판매 token양 * 티어의 배당 % / 티어참여인 수 -> 전체 100개 티어 60%, 티어참여인 수 = 3 -> 60개를 3명이서 나누어서 사니까 개인당 20개
    function calculTierAmount(address _address)
        public
        view
        override
        returns (uint256)
    {
        UserInfoEx storage userEx = usersEx[_address];
        uint256 tier = calculTier(_address);
        if (userEx.join == true && tier > 0) {
            uint256 salePossible =
                totalExpectSaleAmount
                    .mul(tiersPercents[tier])
                    .div(tiersAccount[tier])
                    .div(10000);
            return salePossible;
        } else if (tier > 0) {
            uint256 tierAccount = tiersAccount[tier].add(1);
            uint256 salePossible =
                totalExpectSaleAmount
                    .mul(tiersPercents[tier])
                    .div(tierAccount)
                    .div(10000);
            return salePossible;
        } else {
            return 0;
        }
    }

    /// @inheritdoc IPublicSale
    //얼만큼 deposit하면 얼만큼 구매 가능한지 (OpenSale)
    //_amount를 0을 입력하면 현재 얼만큼 구매가능한지 값이 return되고
    //_amount에 값을 넣으면 _amount만큼 더 넣었을 때 얼만큼 더 구매가능해지는 지 확인합니다.
    //식 : openSale에 판매할 토큰양 * (내가 deposit한 양/전체 deposit한 양) = 내가 구매할 수 있는 토큰 양
    function calculOpenSaleAmount(address _account, uint256 _amount)
        public
        view
        override
        returns (uint256)
    {
        UserInfoOpen storage userOpen = usersOpen[_account];
        uint256 depositAmount = userOpen.depositAmount.add(_amount);
        uint256 openSalePossible =
            totalExpectOpenSaleAmount.mul(depositAmount).div(
                totalDepositAmount.add(_amount)
            );
        return openSalePossible;
    }

    /// @inheritdoc IPublicSale
    function calculClaimAmount(address _account)
        public
        view
        override
        returns (uint256)
    {
        require(
            block.timestamp >= startClaimTime,
            "PublicSale: don't start claimTime"
        );
        UserClaim storage userClaim = usersClaim[_account];
        if (userClaim.totalClaimReward == 0) return 0;
        if (userClaim.totalClaimReward == userClaim.claimAmount) return 0;

        uint256 difftime = block.timestamp.sub(startClaimTime);

        if (difftime < claimInterval) {
            uint256 period = 1;
            uint256 reward =
                (userClaim.periodReward.mul(period)).sub(userClaim.claimAmount);
            return reward;
        } else {
            uint256 period = (difftime / claimInterval).add(1);
            if (period >= claimPeriod) {
                uint256 reward =
                    userClaim.totalClaimReward.sub(userClaim.claimAmount);
                return reward;
            } else {
                uint256 reward =
                    (userClaim.periodReward.mul(period)).sub(
                        userClaim.claimAmount
                    );
                return reward;
            }
        }
    }

    /// @inheritdoc IPublicSale
    function addWhiteList() external override nonReentrant {
        require(
            block.timestamp >= startAddWhiteTime,
            "PublicSale: whitelistStartTime has not passed"
        );
        require(
            block.timestamp < endAddWhiteTime,
            "PublicSale: end the whitelistTime"
        );
        uint256 tier = calculTier(msg.sender);
        require(tier >= 1, "PublicSale: need to more sTOS");
        UserInfoEx storage userEx = usersEx[msg.sender];
        require(userEx.join != true, "PublicSale: already attended");

        if (!userEx.join) whitelists.push(msg.sender);
        userEx.join = true;
        userEx.tier = tier;
        totalWhitelists = totalWhitelists.add(1);
        tiersAccount[tier] = tiersAccount[tier].add(1);

        emit AddedWhiteList(msg.sender, tier);
    }

    /// @inheritdoc IPublicSale
    //payToken으로 saleToken을 구매하는 것이라 payToken을 approve후에 구매하여야한다.
    //_amount는 payTokenAmount
    //payToken은 getTokenOwner에게 가고 추후 saleToken을 살 수 있도록 기록한다.
    function exclusiveSale(uint256 _amount)
        external
        override
        nonZero(claimPeriod)
        nonReentrant
    {
        require(
            block.timestamp >= startExclusiveTime,
            "PublicSale: exclusiveStartTime has not passed"
        );
        require(
            block.timestamp < endExclusiveTime,
            "PublicSale: end the exclusiveTime"
        );
        UserInfoEx storage userEx = usersEx[msg.sender];
        require(userEx.join == true, "PublicSale: Whitelist not registered");
        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 salePossible = calculTierAmount(msg.sender);
        require(
            salePossible >= tokenSaleAmount,
            "PublicSale: just buy whitelist amount"
        );
        require(
            salePossible >= userEx.saleAmount.add(tokenSaleAmount),
            "PublicSale: just buy whitelisted amount"
        );

        UserClaim storage userClaim = usersClaim[msg.sender];

        userEx.payAmount = userEx.payAmount.add(_amount);
        userEx.saleAmount = userEx.saleAmount.add(tokenSaleAmount);

        userClaim.totalClaimReward = userClaim.totalClaimReward.add(
            tokenSaleAmount
        );
        uint256 periodReward = userClaim.totalClaimReward.div(claimPeriod);
        userClaim.periodReward = periodReward;

        totalExPurchasedAmount = totalExPurchasedAmount.add(_amount);
        totalExSaleAmount = totalExSaleAmount.add(tokenSaleAmount);

        uint256 tier = calculTier(msg.sender);
        tiersExAccount[tier] = tiersExAccount[tier].add(1);

        getToken.safeTransferFrom(msg.sender, address(this), _amount);
        getToken.safeTransfer(getTokenOwner, _amount);

        emit ExclusiveSaled(msg.sender, _amount);
    }

    /// @inheritdoc IPublicSale
    //approve하고 그 후 deposit한다 deposit할때는 payToken을 컨트랙트에 전송함.
    //deposit은 무한대로 받을 수 있음
    function deposit(uint256 _amount) external override nonReentrant {
        require(
            block.timestamp >= startDepositTime,
            "PublicSale: don't start depositTime"
        );
        require(
            block.timestamp < endDepositTime,
            "PublicSale: end the depositTime"
        );

        if (endExclusiveSaleExec == false) endExclusiveSale();

        UserInfoOpen storage userOpen = usersOpen[msg.sender];

        if (!userOpen.join) depositors.push(msg.sender);
        userOpen.join = true;
        userOpen.depositAmount = userOpen.depositAmount.add(_amount);
        totalDepositAmount = totalDepositAmount.add(_amount);

        getToken.safeTransferFrom(msg.sender, address(this), _amount);

        emit Deposited(msg.sender, _amount);
    }

    /// @inheritdoc IPublicSale
    //내가 deposit한양이 구매하는데 쓰이는 것 보다 많으면 구매 후 남은 금액 반납,
    //deposit한양이 구매가능한양보다 할당받은 것 보다 더 적게 구입(deposit한 양에 대한 것만 구입)
    function openSale() external override nonZero(claimPeriod) {
        require(
            block.timestamp >= startOpenSaleTime,
            "PublicSale: don't start openSaleTime"
        );
        require(
            block.timestamp < endOpenSaleTime,
            "PublicSale: end the openSaleTime"
        );
        UserInfoOpen storage userOpen = usersOpen[msg.sender];
        UserClaim storage userClaim = usersClaim[msg.sender];
        require(
            userOpen.join == true,
            "PublicSale: need to attend the deposit"
        );
        uint256 openSalePossible = calculOpenSaleAmount(msg.sender, 0);
        uint256 realPayAmount = calculPayToken(openSalePossible);

        if (realPayAmount < userOpen.depositAmount) {
            uint256 returnAmount = userOpen.depositAmount.sub(realPayAmount);

            userOpen.payAmount = userOpen.payAmount.add(realPayAmount);
            totalOpenPurchasedAmount = totalOpenPurchasedAmount.add(
                realPayAmount
            );
            userOpen.saleAmount = userOpen.saleAmount.add(openSalePossible);
            totalOpenSaleAmount = totalOpenSaleAmount.add(openSalePossible);

            userClaim.totalClaimReward = userClaim.totalClaimReward.add(
                openSalePossible
            );
            uint256 periodReward = userClaim.totalClaimReward.div(claimPeriod);
            userClaim.periodReward = periodReward;

            getToken.safeTransfer(msg.sender, returnAmount);
            getToken.safeTransfer(getTokenOwner, realPayAmount);

            emit OpenSaled(msg.sender, realPayAmount, returnAmount);
        } else {
            userOpen.payAmount = userOpen.payAmount.add(userOpen.depositAmount);
            totalOpenPurchasedAmount = totalOpenPurchasedAmount.add(
                userOpen.depositAmount
            );
            uint256 realSaleAmount = calculSaleToken(userOpen.depositAmount);
            userOpen.saleAmount = userOpen.saleAmount.add(realSaleAmount);
            totalOpenSaleAmount = totalOpenSaleAmount.add(realSaleAmount);

            userClaim.totalClaimReward = userClaim.totalClaimReward.add(
                realSaleAmount
            );
            uint256 periodReward = userClaim.totalClaimReward.div(claimPeriod);
            userClaim.periodReward = periodReward;

            getToken.safeTransfer(getTokenOwner, userOpen.depositAmount);

            emit OpenSaled(msg.sender, userOpen.depositAmount, 0);
        }
    }

    /// @inheritdoc IPublicSale
    function claim() external override {
        require(
            block.timestamp >= startClaimTime,
            "PublicSale: don't start claimTime"
        );
        UserClaim storage userClaim = usersClaim[msg.sender];
        require(
            userClaim.totalClaimReward > 0,
            "PublicSale: need the participation"
        );

        uint256 reward = calculClaimAmount(msg.sender);
        require(reward > 0, "PublicSale: no reward");
        require(
            userClaim.totalClaimReward.sub(userClaim.claimAmount) >= reward,
            "PublicSale: user is already getAllreward"
        );
        require(
            saleToken.balanceOf(address(this)) >= reward,
            "PublicSale: dont have saleToken in pool"
        );

        userClaim.claimAmount = userClaim.claimAmount.add(reward);

        saleToken.safeTransfer(msg.sender, reward);
        emit Claimed(msg.sender, reward);
    }

    function withdraw() external override onlyOwner {
        require(
            block.timestamp > endOpenSaleTime,
            "PublicSale: end the openSaleTime"
        );
        uint256 withdrawAmount =
            totalExpectSaleAmount
                .add(totalExpectOpenSaleAmount)
                .sub(totalExSaleAmount)
                .sub(totalOpenSaleAmount);
        saleToken.safeTransfer(msg.sender, withdrawAmount);
        emit Withdrawal(msg.sender, withdrawAmount);
    }
}
