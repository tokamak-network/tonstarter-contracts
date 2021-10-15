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
    event DepositWithdrawal(address indexed from, uint256 amount);

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
        uint256[4] calldata _claimTime
    ) external onlyOwner beforeStartAddWhiteTime {
        require(
            (_exclusiveTime[0] < _exclusiveTime[1]) &&
                (_exclusiveTime[2] < _exclusiveTime[3])
        );
        require(
            (_openSaleTime[0] < _openSaleTime[1]) &&
                (_openSaleTime[2] < _openSaleTime[3])
        );
        setSnapshot(_snapshot);
        setExclusiveTime(
            _exclusiveTime[0],
            _exclusiveTime[1],
            _exclusiveTime[2],
            _exclusiveTime[3]
        );
        setOpenTime(
            _openSaleTime[0],
            _openSaleTime[1],
            _openSaleTime[2],
            _openSaleTime[3]
        );
        setClaim(
            _claimTime[0],
            _claimTime[1],
            _claimTime[2],
            _claimTime[3]
        );
    }

    /// @inheritdoc IPublicSale
    function setSnapshot(uint256 _snapshot)
        public
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
        public
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
        public
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
        uint256 _claimPeriod,
        uint256 _claimFirst
    )
        public
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
        claimFirst = _claimFirst;
    }

    function resetAllData() external onlyOwner {
        startAddWhiteTime = 0;
        totalWhitelists = 0;
        totalExSaleAmount = 0;
        totalExPurchasedAmount = 0;
        totalDepositAmount = 0;

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
        setTier(
            _tier[0],
            _tier[1],
            _tier[2],
            _tier[3]
        );
        setTierPercents(
            _tierPercent[0],
            _tierPercent[1],
            _tierPercent[2],
            _tierPercent[3]
        );
    }

    /// @inheritdoc IPublicSale
    function setTier(
        uint256 _tier1,
        uint256 _tier2,
        uint256 _tier3,
        uint256 _tier4
    )
        public
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
        public
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
        setSaleAmount(
            _expectAmount[0],
            _expectAmount[1]
        );
        setTokenPrice(
            _priceAmount[0],
            _priceAmount[1]
        );
    }

    /// @inheritdoc IPublicSale
    function setSaleAmount(
        uint256 _totalExpectSaleAmount,
        uint256 _totalExpectOpenSaleAmount
    )
        public
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
        public
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
    function totalExpectOpenSaleAmountView() public view override returns(uint256){
        if(block.timestamp < endExclusiveTime) return totalExpectOpenSaleAmount;
        else return totalExpectOpenSaleAmount.add(totalRound1NonSaleAmount());
    }

    function totalRound1NonSaleAmount() public view returns(uint256){
        return totalExpectSaleAmount.sub(totalExSaleAmount);
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
            totalExpectOpenSaleAmountView().mul(depositAmount).div(
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
        (uint256 realPayAmount, uint256 realSaleAmount, uint256 refundAmount) = totalSaleUserAmount(_account);

        if (userClaim.claimAmount >= realSaleAmount || realSaleAmount == 0 ) return 0;


        uint256 difftime = block.timestamp.sub(startClaimTime);
        uint256 totalClaimReward = realSaleAmount;
        uint256 firstReward = totalClaimReward.mul(claimFirst).div(100);
        uint256 periodReward = (totalClaimReward.sub(firstReward)).div(claimPeriod.sub(1));
;
        if (difftime < claimInterval) {
            return firstReward;
        } else {
            uint256 period = (difftime / claimInterval).add(1);
            if (period >= claimPeriod) {
                uint256 reward =
                    totalClaimReward.sub(userClaim.claimAmount);
                return reward;
            } else {
                uint256 reward =
                    (periodReward.mul(period.sub(1))).sub(userClaim.claimAmount).add(firstReward);
                return reward;
            }
        }
    }

    function totalSaleUserAmount(address user) public view returns (uint256 _realPayAmount, uint256 _realSaleAmount, uint256 _refundAmount) {
        UserInfoEx storage userEx = usersEx[user];

        if(userEx.join){
            (uint256 realPayAmount, uint256 realSaleAmount, uint256 refundAmount) = openSaleUserAmount(user);
            return ( realPayAmount.add(userEx.payAmount), realSaleAmount.add(userEx.saleAmount), refundAmount);
        }else {
            return openSaleUserAmount(user);
        }
    }

    function openSaleUserAmount(address user) public view returns (uint256 _realPayAmount, uint256 _realSaleAmount, uint256 _refundAmount) {
        UserInfoOpen storage userOpen = usersOpen[user];

        if(!userOpen.join || userOpen.depositAmount == 0) return (0, 0, 0);

        uint256 openSalePossible = calculOpenSaleAmount(user, 0);
        uint256 realPayAmount = calculPayToken(openSalePossible);
        uint256 depositAmount = userOpen.depositAmount;
        uint256 realSaleAmount = 0;
        uint256 returnAmount = 0;

        if (realPayAmount < depositAmount) {
           returnAmount = depositAmount.sub(realPayAmount);
           realSaleAmount = calculSaleToken(realPayAmount);

        } else {
            realSaleAmount = calculSaleToken(depositAmount);
        }

        return (realPayAmount, realSaleAmount, returnAmount);
    }

    function totalOpenSaleAmount() public view returns (uint256){
        uint256 _calculSaleToken = calculSaleToken(totalDepositAmount);
        uint256 _totalAmount = totalExpectOpenSaleAmountView();
        if(_calculSaleToken < _totalAmount) return _calculSaleToken;
        else return _totalAmount;
    }

    function totalOpenPurchasedAmount() public view returns (uint256){
        uint256 _calculSaleToken = calculSaleToken(totalDepositAmount);
        uint256 _totalAmount = totalExpectOpenSaleAmountView();
        if(_calculSaleToken < _totalAmount) return calculPayToken(totalDepositAmount);
        else return  calculPayToken(_totalAmount);
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
        userEx.saleAmount = 0;
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
        nonZero(_amount)
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
        require(userEx.join == true, "PublicSale: not registered in whitelist");
        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 salePossible = calculTierAmount(msg.sender);
        // require(
        //     salePossible >= tokenSaleAmount,
        //     "PublicSale: just buy whitelist amount"
        // );
        require(
            salePossible >= userEx.saleAmount.add(tokenSaleAmount),
            "PublicSale: just buy tier's allocated amount"
        );

        UserClaim storage userClaim = usersClaim[msg.sender];

        userEx.payAmount = userEx.payAmount.add(_amount);
        userEx.saleAmount = userEx.saleAmount.add(tokenSaleAmount);

        userClaim.totalClaimReward = userClaim.totalClaimReward.add(
            tokenSaleAmount
        );
        userClaim.firstReward = userClaim.totalClaimReward.mul(claimFirst).div(100);
        uint256 periodReward = (userClaim.totalClaimReward.sub(userClaim.firstReward)).div(claimPeriod.sub(1));
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

        UserInfoOpen storage userOpen = usersOpen[msg.sender];

        if (!userOpen.join) {
            depositors.push(msg.sender);
            userOpen.join = true;
        }
        userOpen.depositAmount = userOpen.depositAmount.add(_amount);
        userOpen.saleAmount = 0;
        totalDepositAmount = totalDepositAmount.add(_amount);

        getToken.safeTransferFrom(msg.sender, address(this), _amount);

        emit Deposited(msg.sender, _amount);
    }

    /// @inheritdoc IPublicSale
    function claim() external override {
        require(
            block.timestamp >= startClaimTime,
            "PublicSale: don't start claimTime"
        );
        UserClaim storage userClaim = usersClaim[msg.sender];

        (uint256 realPayAmount, uint256 realSaleAmount, uint256 refundAmount) = totalSaleUserAmount(msg.sender);

        if(!userClaim.exec) {
            userClaim.totalClaimReward = userClaim.totalClaimReward.add(
                realSaleAmount
            );
            userClaim.firstReward = userClaim.totalClaimReward.mul(claimFirst).div(100);
            uint256 periodReward = (userClaim.totalClaimReward.sub(userClaim.firstReward)).div(claimPeriod.sub(1));
            userClaim.periodReward = periodReward;
            userClaim.exec = true;
        }

        UserInfoOpen storage userOpen = usersOpen[msg.sender];

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

        if(refundAmount > 0 && userClaim.refundAmount == 0){
            userClaim.refundAmount = refundAmount;
            getToken.safeTransfer(msg.sender, refundAmount);
        }

        emit Claimed(msg.sender, reward);
    }

    /// @inheritdoc IPublicSale
    function withdraw() external override onlyOwner{
        if(block.timestamp <= endOpenSaleTime){
            uint256 balance = saleToken.balanceOf(address(this));
            require(balance > totalExpectSaleAmount.add(totalExpectOpenSaleAmount), "PublicSale: no withdrawable amount");
            uint256 withdrawAmount = balance.sub(totalExpectSaleAmount.add(totalExpectOpenSaleAmount));
            require(withdrawAmount != 0, "PublicSale: don't exist withdrawAmount");
            saleToken.safeTransfer(msg.sender, withdrawAmount);
            emit Withdrawal(msg.sender, withdrawAmount);
        } else {
            require(block.timestamp > endOpenSaleTime, "PublicSale: end the openSaleTime");
            require(!adminWithdraw, "already admin called withdraw");
            adminWithdraw = true;
            uint256 saleAmount = totalOpenSaleAmount();
            require(totalExpectSaleAmount.add(totalExpectOpenSaleAmount) > totalExSaleAmount.add(saleAmount), "PublicSale: don't exist withdrawAmount");

            uint256 withdrawAmount = totalExpectSaleAmount.add(totalExpectOpenSaleAmount).sub(totalExSaleAmount).sub(saleAmount);
            require(withdrawAmount != 0, "PublicSale: don't exist withdrawAmount");
            saleToken.safeTransfer(msg.sender, withdrawAmount);
            emit Withdrawal(msg.sender, withdrawAmount);
        }
    }
}