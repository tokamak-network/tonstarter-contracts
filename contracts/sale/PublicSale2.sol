// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/IPublicSale.sol";
import "../interfaces/IWTON.sol";
import "../interfaces/ITON.sol";
import "../common/ProxyAccessCommon.sol";
import "./PublicSaleStorage.sol";

import "../libraries/TickMath.sol";
import "../libraries/OracleLibrary.sol";

interface IIUniswapV3Factory {
    function getPool(address,address,uint24) external view returns (address);
}

interface IIUniswapV3Pool {
    function token0() external view returns (address);
    function token1() external view returns (address);

    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );

}

interface IIERC20Burnable {
    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) external ;
}

contract PublicSale2 is
    PublicSaleStorage,
    ProxyAccessCommon,
    ReentrancyGuard,
    IPublicSale
{
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    bool public exchangeTOS;

    event AddedWhiteList(address indexed from, uint256 tier);
    event ExclusiveSaled(address indexed from, uint256 amount);
    event Deposited(address indexed from, uint256 amount);

    event Claimed(address indexed from, uint256 amount);
    event Withdrawal(address indexed from, uint256 amount);
    event DepositWithdrawal(address indexed from, uint256 amount, uint256 liquidityAmount);

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

    function changeTONOwner(
        address _address
    )
        external
        override
        onlyOwner
    {
        getTokenOwner = _address;
    }

    function setAllsetting(
        uint256[8] calldata _Tier,
        uint256[6] calldata _amount,
        uint256[8] calldata _time,
        uint256[] calldata _claimTimes,
        uint256[] calldata _claimPercents
    )
        external
        override
        onlyOwner
        beforeStartAddWhiteTime
    {
        uint256 balance = saleToken.balanceOf(address(this));
        require((_amount[0] + _amount[1]) <= balance && 1 ether <= balance, "amount err");
        require(_time[6] < _claimTimes[0], "time err");
        require((deployTime + delayTime) < _time[0], "snapshot need later");
        require(_time[0] < _time[1], "whitelist before snapshot");
        require(_claimTimes.length > 0 &&  _claimTimes.length == _claimPercents.length, "need the claimSet");
        
        if(snapshot != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }

        setTier(
            _Tier[0], _Tier[1], _Tier[2], _Tier[3]
        );
        setTierPercents(
            _Tier[4], _Tier[5], _Tier[6], _Tier[7]
        );
        setSaleAmount(
            _amount[0],
            _amount[1]
        );
        setTokenPrice(
            _amount[2],
            _amount[3]
        );
        setHardcap(
            _amount[4],
            _amount[5]
        );
        setSnapshot(_time[0]);
        setExclusiveTime(
            _time[1],
            _time[2],
            _time[3],
            _time[4]
        );
        setOpenTime(
            _time[5],
            _time[6]
        );
        setEachClaim(
            _time[7],
            _claimTimes,
            _claimPercents
        );
    }

    /// @inheritdoc IPublicSale
    function setSnapshot(
        uint256 _snapshot
    )
        public
        override
        onlyOwner
        nonZero(_snapshot)
        beforeStartAddWhiteTime
    {
        if(snapshot != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }

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
        if(startAddWhiteTime != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }

        require(
            (_startAddWhiteTime < _endAddWhiteTime) &&
            (_endAddWhiteTime < _startExclusiveTime) &&
            (_startExclusiveTime < _endExclusiveTime),
            "PublicSale : Round1time err"
        );
        startAddWhiteTime = _startAddWhiteTime;
        endAddWhiteTime = _endAddWhiteTime;
        startExclusiveTime = _startExclusiveTime;
        endExclusiveTime = _endExclusiveTime;
    }

    /// @inheritdoc IPublicSale
    function setOpenTime(
        uint256 _startDepositTime,
        uint256 _endDepositTime
    )
        public
        override
        onlyOwner
        nonZero(_startDepositTime)
        nonZero(_endDepositTime)
        beforeStartAddWhiteTime
    {
        if(startDepositTime != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }

        require(
            (_startDepositTime < _endDepositTime),
            "PublicSale : Round2time err"
        );

        startDepositTime = _startDepositTime;
        endDepositTime = _endDepositTime;
    }

    function setEachClaim(
        uint256 _claimCounts,
        uint256[] calldata _claimTimes,
        uint256[] calldata _claimPercents
    )
        public
        override
        onlyOwner
        beforeStartAddWhiteTime
    {
        if(totalClaimCounts != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }
        
        totalClaimCounts = _claimCounts;
        uint256 i = 0;
        uint256 y = 0;
        for (i = 0; i < _claimCounts; i++) {
            claimTimes.push(_claimTimes[i]);
            if (i != 0){
                require(claimTimes[i-1] < claimTimes[i], "PublicSale: claimtime err");
            }
            y = y + _claimPercents[i];
            claimPercents.push(y);
        }

        require(y == 100, "claimPercents err");
    }

    /// @inheritdoc IPublicSale
    function setAllTier(
        uint256[4] calldata _tier,
        uint256[4] calldata _tierPercent
    ) external override onlyOwner {
        require(
            stanTier1 <= _tier[0] &&
            stanTier2 <= _tier[1] &&
            stanTier3 <= _tier[2] &&
            stanTier4 <= _tier[3],
            "tier set error"
        );
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
        if(tiers[1] != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }
        tiers[1] = _tier1;
        tiers[2] = _tier2;
        tiers[3] = _tier3;
        tiers[4] = _tier4;
    }

    /// @inheritdoc IPublicSale
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
        if(tiersPercents[1] != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }
        require(
            _tier1.add(_tier2).add(_tier3).add(_tier4) == 10000,
            "PublicSale: Sum should be 10000"
        );
        tiersPercents[1] = _tier1;
        tiersPercents[2] = _tier2;
        tiersPercents[3] = _tier3;
        tiersPercents[4] = _tier4;
    }

    /// @inheritdoc IPublicSale
    function setAllAmount(
        uint256[2] calldata _expectAmount,
        uint256[2] calldata _priceAmount
    ) external override onlyOwner {
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
        nonZero(_totalExpectSaleAmount)
        beforeStartAddWhiteTime
    {
        if(totalExpectSaleAmount != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }
        totalExpectSaleAmount = _totalExpectSaleAmount;
        totalExpectOpenSaleAmount = _totalExpectOpenSaleAmount;
    }

    /// @inheritdoc IPublicSale
    function setTokenPrice(
        uint256 _saleTokenPrice,
        uint256 _payTokenPrice
    )
        public
        override
        onlyOwner
        nonZero(_saleTokenPrice)
        nonZero(_payTokenPrice)
        beforeStartAddWhiteTime
    {
        if(saleTokenPrice != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }
        saleTokenPrice = _saleTokenPrice;
        payTokenPrice = _payTokenPrice;
    }

    function setHardcap (
        uint256 _hardcapAmount,
        uint256 _changePercent
    )
        public
        override
        onlyOwner
        nonZero(_changePercent)
        beforeStartAddWhiteTime
    {
        if(changeTOS != 0) {
            require(isProxyAdmin(msg.sender), "only DAO can set");
        }
        require(_changePercent <= maxPer && _changePercent >= minPer,"PublicSale: need to set min,max");
        hardCap = _hardcapAmount;
        changeTOS = _changePercent;
    }

    function distributionByRounds(
        uint256 startRound,
        uint256 endRound
    ) 
        public
        view
        returns(uint256[] memory)
    {   
        if(startRound == 0) {
            startRound = 1;
        }
        if(totalClaimCounts < startRound) {
            startRound = totalClaimCounts;
        }
        if(endRound < startRound) {
            endRound = startRound;
        }
        if(totalClaimCounts < endRound || endRound == 0) {
            endRound = totalClaimCounts;
        }

        uint length = endRound.sub(startRound.sub(1));
        uint256[] memory claims = new uint256[](length);
        uint256 subClaimPercent = claimPercents[(endRound-1)].sub(claimPercents[(startRound-1)]);
        if(block.timestamp > endExclusiveTime && startRound != 0 ) {
            for(uint256 i = 0; i < length; i++) {
                // 실제판매량들 실제판매 시간 이후 계산
                // uint256 amount = (((totalExSaleAmount.add(totalOpenSaleAmount())).mul(claimPercents[startRound.add(i).sub(1)])).div(100));
                if(i > 1) {
                    subClaimPercent = claimPercents[(i-1)].sub(claimPercents[(i-2)]);
                } else {
                    subClaimPercent = claimPercents[(i-1)];
                }
                uint256 amount = (((totalExSaleAmount.add(totalOpenSaleAmount())).mul(subClaimPercent)).div(100));
                claims[i] = amount;
            }
        } else {
            for(uint256 i = 0; i < length; i++) {
                // 판매 예정값들 아직 판매시간 안되었을때 계산
                // uint256 amount = (((totalExpectSaleAmount.add(totalExpectOpenSaleAmount)).mul(claimPercents[startRound.add(i).sub(1)])).div(100));
                 if(i > 1) {
                    subClaimPercent = claimPercents[(i-1)].sub(claimPercents[(i-2)]);
                } else {
                    subClaimPercent = claimPercents[(i-1)];
                }
                uint256 amount = (((totalExpectSaleAmount.add(totalExpectOpenSaleAmount)).mul(subClaimPercent)).div(100));
                claims[i] = amount;
            }
        }
        return claims;
    }

    function distributionByRound(
        uint256 _round
    )
        public
        view
        returns(uint256)
    {
        if(block.timestamp > endExclusiveTime && _round != 0) {
            // return (((totalExSaleAmount.add(totalOpenSaleAmount())).mul(claimPercents[(_round-1)])).div(100));
            if(_round == 1) {
                return (((totalExSaleAmount.add(totalOpenSaleAmount())).mul(claimPercents[(_round-1)])).div(100));
            } else {
                uint256 subClaimPercent = claimPercents[(_round-1)].sub(claimPercents[(_round-2)]);
                return (((totalExSaleAmount.add(totalOpenSaleAmount())).mul(subClaimPercent)).div(100));
            }
        } else {
            return 0;
        }
    }

    /// @inheritdoc IPublicSale
    //1라운드에서 미판매된 물량 + 2라운드 판매에 정해진 물량
    function totalExpectOpenSaleAmountView()
        public
        view
        override
        returns(uint256)
    {
        if (block.timestamp < endExclusiveTime) return totalExpectOpenSaleAmount;
        else return totalExpectOpenSaleAmount.add(totalRound1NonSaleAmount());
    }

    /// @inheritdoc IPublicSale
    function totalRound1NonSaleAmount()
        public
        view
        override
        returns(uint256)
    {
        return totalExpectSaleAmount.sub(totalExSaleAmount);
    }


    function _toRAY(uint256 v) internal pure returns (uint256) {
        return v * 10 ** 9;
    }

    /// @inheritdoc IPublicSale
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
    function calculTierAmount(address _address)
        public
        view
        override
        returns (uint256)
    {
        LibPublicSale.UserInfoEx storage userEx = usersEx[_address];
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
    function calculOpenSaleAmount(address _account, uint256 _amount)
        public
        view
        override
        returns (uint256)
    {
        LibPublicSale.UserInfoOpen storage userOpen = usersOpen[_account];
        uint256 depositAmount = userOpen.depositAmount.add(_amount);
        uint256 openSalePossible =
            totalExpectOpenSaleAmountView().mul(depositAmount).div(
                totalDepositAmount.add(_amount)
            );
        return openSalePossible;
    }

    function currentRound() public view returns (uint256 round) {
        if (block.timestamp > claimTimes[totalClaimCounts-1]) {
            return totalClaimCounts;
        }
        for (uint256 i = 0; i < totalClaimCounts; i++) {
            if (block.timestamp < claimTimes[i]) {
                return i;
            }
        }
    }

    function calculClaimAmount(address _account, uint256 _round)
        public
        view
        override
        returns (uint256 _reward, uint256 _totalClaim, uint256 _refundAmount)
    {
        if (block.timestamp < startClaimTime) return (0, 0, 0);
        if (_round > totalClaimCounts) return (0, 0, 0);

        LibPublicSale.UserClaim storage userClaim = usersClaim[_account];
        (, uint256 realSaleAmount, uint256 refundAmount) = totalSaleUserAmount(_account);   //유저가 총 구매한 token의 양을 Return 함

        if (realSaleAmount == 0 ) return (0, 0, 0);
        if (userClaim.claimAmount >= realSaleAmount) return (0, 0, 0);    //userClaim.claimAmount  = contract에서 유저에게 준양

        uint256 round = currentRound();

        uint256 amount;
        if (totalClaimCounts == round && _round == 0) {
            amount = realSaleAmount - userClaim.claimAmount;
            return (amount, realSaleAmount, refundAmount);
        }

        //해당 라운드에서 받아야하는 토큰의 양 -> (realSaleAmount * claimPercents[i] / 100) : 해당 라운드에서 받아야하는 토큰의 양
        //Round를 0으로 넣으면 현재 내가 받을 수 있는 양을 리턴해주고 1 이상을 넣으면 해당 라운드에서 받을 수 있는 토큰의 양을 리턴해줌
        if(_round == 0) {
            amount = realSaleAmount.mul(claimPercents[round.sub(1)]).div(100);
            amount = amount - userClaim.claimAmount;
            return (amount, realSaleAmount, refundAmount);
        } else if(_round == 1) {
            amount = realSaleAmount.mul(claimPercents[round.sub(1)]).div(100);
            return (amount, realSaleAmount, refundAmount);
        } else {
            uint256 amount1 = realSaleAmount.mul(claimPercents[round.sub(1)]).div(100);
            uint256 amount2 = realSaleAmount.mul(claimPercents[round.sub(2)]).div(100);
            amount = amount1.sub(amount2);
            return (amount, realSaleAmount, refundAmount);
        }
    }

    /// @inheritdoc IPublicSale
    function totalSaleUserAmount(address user) public override view returns (uint256 _realPayAmount, uint256 _realSaleAmount, uint256 _refundAmount) {
        LibPublicSale.UserInfoEx storage userEx = usersEx[user];

        if (userEx.join) {
            (uint256 realPayAmount, uint256 realSaleAmount, uint256 refundAmount) = openSaleUserAmount(user);
            return ( realPayAmount.add(userEx.payAmount), realSaleAmount.add(userEx.saleAmount), refundAmount);
        } else {
            return openSaleUserAmount(user);
        }
    }

    /// @inheritdoc IPublicSale
    function openSaleUserAmount(address user) public override view returns (uint256 _realPayAmount, uint256 _realSaleAmount, uint256 _refundAmount) {
        LibPublicSale.UserInfoOpen storage userOpen = usersOpen[user];

        if (!userOpen.join || userOpen.depositAmount == 0) return (0, 0, 0);

        uint256 openSalePossible = calculOpenSaleAmount(user, 0);
        uint256 realPayAmount = calculPayToken(openSalePossible);
        uint256 depositAmount = userOpen.depositAmount;
        uint256 realSaleAmount = 0;
        uint256 returnAmount = 0;

        if (realPayAmount < depositAmount) {
            returnAmount = depositAmount.sub(realPayAmount);
            realSaleAmount = calculSaleToken(realPayAmount);
        } else {
            realPayAmount = userOpen.depositAmount;
            realSaleAmount = calculSaleToken(depositAmount);
        }

        return (realPayAmount, realSaleAmount, returnAmount);
    }

    /// @inheritdoc IPublicSale
    function totalOpenSaleAmount() public override view returns (uint256){
        uint256 _calculSaleToken = calculSaleToken(totalDepositAmount);
        uint256 _totalAmount = totalExpectOpenSaleAmountView();

        if (_calculSaleToken < _totalAmount) return _calculSaleToken;
        else return _totalAmount;
    }

    /// @inheritdoc IPublicSale
    //2라운드에서 판매로 이용된 TON양
    function totalOpenPurchasedAmount() public override view returns (uint256){
        //2라운드 총 입금된 양을 판매토큰 수량으로 변경 (1)
        uint256 _calculSaleToken = calculSaleToken(totalDepositAmount);
        //2라운드 총 판매 토큰 수량 (2)
        uint256 _totalAmount = totalExpectOpenSaleAmountView();
        // (1)이 (2)보다 작으면 2라운드 판매량이 100%가 아님 -> 판매량은 그래도 입금된 양이됨
        // (1)이 (2)보다 크면 2라운드 판매량이 100%를 넘었음 -> 판매량은 2라운드 판매 토큰 수량이 됨
        if (_calculSaleToken < _totalAmount) return totalDepositAmount;
        else return  calculPayToken(_totalAmount);
    }

    function totalWhitelists() external view returns (uint256) {
        return whitelists.length;
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
        LibPublicSale.UserInfoEx storage userEx = usersEx[msg.sender];
        require(userEx.join != true, "PublicSale: already attended");

        whitelists.push(msg.sender);

        userEx.join = true;
        userEx.tier = tier;
        userEx.saleAmount = 0;
        tiersAccount[tier] = tiersAccount[tier].add(1);

        emit AddedWhiteList(msg.sender, tier);
    }

    function _toWAD(uint256 v) public override pure returns (uint256) {
        return v / 10 ** 9;
    }

    function _decodeApproveData(
        bytes memory data
    ) public override pure returns (uint256 approveData) {
        assembly {
            approveData := mload(add(data, 0x20))
        }
    }

    function calculTONTransferAmount(
        uint256 _amount,
        address _sender
    )
        internal
        nonZero(_amount)
        nonZeroAddress(_sender)

    {
        uint256 tonAllowance = IERC20(getToken).allowance(_sender, address(this));
        uint256 tonBalance = IERC20(getToken).balanceOf(_sender);

        if (tonAllowance > tonBalance) {
            tonAllowance = tonBalance; //tonAllowance가 tonBlance보다 더 클때 문제가 된다.
        }
        if (tonAllowance < _amount) {
            uint256 needUserWton;
            uint256 needWton = _amount.sub(tonAllowance);
            needUserWton = _toRAY(needWton);
            require(IWTON(wton).allowance(_sender, address(this)) >= needUserWton, "PublicSale: wton exceeds allowance");
            require(IWTON(wton).balanceOf(_sender) >= needUserWton, "need more wton");
            IERC20(wton).safeTransferFrom(_sender,address(this),needUserWton);
            IWTON(wton).swapToTON(needUserWton);
            require(tonAllowance >= _amount.sub(needWton), "PublicSale: ton exceeds allowance");
            if (_amount.sub(needWton) > 0) {
                IERC20(getToken).safeTransferFrom(_sender, address(this), _amount.sub(needWton));
            }
        } else {
            require(tonAllowance >= _amount && tonBalance >= _amount, "PublicSale: ton exceeds allowance");
            IERC20(getToken).safeTransferFrom(_sender, address(this), _amount);
        }

        if (block.timestamp < endExclusiveTime) {
            emit ExclusiveSaled(_sender, _amount);
        } else {
            emit Deposited(_sender, _amount);
        }
    }


    /// @inheritdoc IPublicSale
    function exclusiveSale(
        address _sender,
        uint256 _amount
    )
        public
        override
        nonZero(_amount)
        nonZero(totalClaimCounts)
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
        LibPublicSale.UserInfoEx storage userEx = usersEx[_sender];
        require(userEx.join == true, "PublicSale: not registered in whitelist");
        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 salePossible = calculTierAmount(_sender);

        require(
            salePossible >= userEx.saleAmount.add(tokenSaleAmount),
            "PublicSale: just buy tier's allocated amount"
        );

        uint256 tier = calculTier(_sender);

        if(userEx.payAmount == 0) {
            totalRound1Users = totalRound1Users.add(1);
            totalUsers = totalUsers.add(1);
            tiersExAccount[tier] = tiersExAccount[tier].add(1);
        }

        userEx.payAmount = userEx.payAmount.add(_amount);
        userEx.saleAmount = userEx.saleAmount.add(tokenSaleAmount);

        totalExPurchasedAmount = totalExPurchasedAmount.add(_amount);
        totalExSaleAmount = totalExSaleAmount.add(tokenSaleAmount);

        calculTONTransferAmount(_amount, _sender);
    }

    /// @inheritdoc IPublicSale
    function deposit(
        address _sender,
        uint256 _amount
    )
        public
        override
        nonReentrant
    {
        require(
            block.timestamp >= startDepositTime,
            "PublicSale: don't start depositTime"
        );
        require(
            block.timestamp < endDepositTime,
            "PublicSale: end the depositTime"
        );

        LibPublicSale.UserInfoOpen storage userOpen = usersOpen[_sender];

        if (!userOpen.join) {
            depositors.push(_sender);
            userOpen.join = true;

            totalRound2Users = totalRound2Users.add(1);
            LibPublicSale.UserInfoEx storage userEx = usersEx[_sender];
            if (userEx.payAmount == 0) totalUsers = totalUsers.add(1);
        }
        userOpen.depositAmount = userOpen.depositAmount.add(_amount);
        totalDepositAmount = totalDepositAmount.add(_amount);

        calculTONTransferAmount(_amount, _sender);
    }

    /// @inheritdoc IPublicSale
    function claim() external override {
        require(
            block.timestamp >= claimTimes[0],
            "PublicSale: don't start claimTime"
        );
        LibPublicSale.UserInfoOpen storage userOpen = usersOpen[msg.sender];
        LibPublicSale.UserClaim storage userClaim = usersClaim[msg.sender];
        uint256 hardcapcut = hardcapCalcul();
        if (hardcapcut == 0) {
            require(userClaim.exec != true, "PublicSale: already getRefund");
            LibPublicSale.UserInfoEx storage userEx = usersEx[msg.sender];
            uint256 refundTON = userEx.payAmount.add(userOpen.depositAmount);
            userClaim.exec = true;
            IERC20(getToken).safeTransfer(msg.sender, refundTON);
        } else {
            (uint256 reward, uint256 realSaleAmount, uint256 refundAmount) = calculClaimAmount(msg.sender, 0);
            require(
                realSaleAmount > 0,
                "PublicSale: no purchase amount"
            );
            require(reward > 0, "PublicSale: no reward");
            require(
                realSaleAmount.sub(userClaim.claimAmount) >= reward,
                "PublicSale: already getAllreward"
            );
            require(
                saleToken.balanceOf(address(this)) >= reward,
                "PublicSale: dont have saleToken in pool"
            );

            userClaim.claimAmount = userClaim.claimAmount.add(reward);

            saleToken.safeTransfer(msg.sender, reward);

            if (!userClaim.exec && userOpen.join) {
                totalRound2UsersClaim = totalRound2UsersClaim.add(1);
                userClaim.exec = true;
            }

            if (refundAmount > 0 && userClaim.refundAmount == 0){
                require(refundAmount <= IERC20(getToken).balanceOf(address(this)), "PublicSale: dont have refund ton");
                userClaim.refundAmount = refundAmount;
                IERC20(getToken).safeTransfer(msg.sender, refundAmount);
            }

            emit Claimed(msg.sender, reward);
        }
    }

    function hardcapCalcul() public view returns (uint256){
        //1차 2차 라운드에서 토큰판매에 대한 TON양
        uint256 totalPurchaseTONamount = totalExPurchasedAmount.add(totalOpenPurchasedAmount());
        uint256 calculAmount;
        if (totalPurchaseTONamount >= hardCap) {
            //토큰판매에 대한 TON양 중 TOS로 변경해야할 TON양을 리턴함
            return calculAmount = totalPurchaseTONamount.mul(changeTOS).div(100);
        } else {
            return 0;
        }
    }

    /// @inheritdoc IPublicSale
    //TON보상 중 liquidityVault로 가야하는 수량의 TON이 다 옮겨지고 난 후에 이걸 실행해서 TON분배 Vault로 TON을 이동
    function depositWithdraw() external override {
        require(adminWithdraw != true && exchangeTOS == true,"PublicSale : need the exchangeWTONtoTOS");

        uint256 getAmount;
        uint256 liquidityTON = hardcapCalcul();
        if (totalRound2Users == totalRound2UsersClaim){
            getAmount = IERC20(getToken).balanceOf(address(this)).sub(liquidityTON);
        } else {
            getAmount = totalExPurchasedAmount.add(totalOpenPurchasedAmount()).sub(liquidityTON).sub(2 ether);
        }        
        require(getAmount <= IERC20(getToken).balanceOf(address(this)), "PublicSale: no token to receive");
        
        adminWithdraw = true;
        IERC20(getToken).safeTransfer(getTokenOwner, getAmount);

        uint256 burnAmount = totalExpectSaleAmount.add(totalExpectOpenSaleAmount).sub(totalOpenSaleAmount()).sub(totalExSaleAmount);
        IIERC20Burnable(address(saleToken)).burn(burnAmount);

        emit DepositWithdrawal(msg.sender, getAmount, liquidityTON);
    }

    //amountIn은 wton의 수량이다.
    function exchangeWTONtoTOS(
        uint256 amountIn
    ) external {
        require(amountIn > 0, "zero input amount");
        require(block.timestamp > endDepositTime,"PublicSale: need to end the depositTime");

        uint256 liquidityTON = hardcapCalcul();
        require(liquidityTON > 0, "PublicSale: don't pass the hardCap");

        IIUniswapV3Pool pool = IIUniswapV3Pool(getPoolAddress());
        require(address(pool) != address(0), "pool didn't exist");

        (uint160 sqrtPriceX96, int24 tick,,,,,) =  pool.slot0();
        require(sqrtPriceX96 > 0, "pool is not initialized");

        int24 timeWeightedAverageTick = OracleLibrary.consult(address(pool), 120);
        require(
            acceptMinTick(timeWeightedAverageTick, 60, 8) <= tick
            && tick < acceptMaxTick(timeWeightedAverageTick, 60, 8),
            "It's not allowed changed tick range."
        );

        (uint256 amountOutMinimum, , uint160 sqrtPriceLimitX96)
            = limitPrameters(amountIn, address(pool), wton, address(saleToken), 18);

        // 초기 한번만 ton을 wton으로 변경한다.
        uint256 wtonAmount = IERC20(wton).balanceOf(address(this));
        require(wtonAmount >= amountIn, "PublicSale : amountIn is too large");
        //wton이 없으면 ton을 변경한적이 없다는 가정하에 변경
        if(wtonAmount == 0) {
            IWTON(wton).swapFromTON(liquidityTON);
            exchangeTOS = true;
        }

        //변경 뒤 입력한 amount만큼 스왑해줌
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: wton,
                tokenOut: address(tos),
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp + 100,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });
        uint256 amountOut = ISwapRouter(uniswapRouter).exactInputSingle(params);
        tos.safeTransfer(liquidityVaultAddress, amountOut);
    }

    function getQuoteAtTick(
        int24 tick,
        uint128 amountIn,
        address baseToken,
        address quoteToken
    ) public pure returns (uint256 amountOut) {
        return OracleLibrary.getQuoteAtTick(tick, amountIn, baseToken, quoteToken);
    }

    function getPoolAddress() public view returns(address) {
        address factory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
        return IIUniswapV3Factory(factory).getPool(wton, address(tos), 3000);
    }

    function getMiniTick(int24 tickSpacings) public pure returns (int24){
        return (TickMath.MIN_TICK / tickSpacings) * tickSpacings ;
    }

    function getMaxTick(int24 tickSpacings) public pure  returns (int24){
        return (TickMath.MAX_TICK / tickSpacings) * tickSpacings ;
    }

    function acceptMinTick(int24 _tick, int24 _tickSpacings, int24 _acceptTickInterval) public pure returns (int24) {
        int24 _minTick = getMiniTick(_tickSpacings);
        int24 _acceptMinTick = _tick - (_tickSpacings * _acceptTickInterval);

        if(_minTick < _acceptMinTick) return _acceptMinTick;
        else return _minTick;
    }

    function acceptMaxTick(int24 _tick, int24 _tickSpacings, int24 _acceptTickInterval) public pure returns (int24) {
        int24 _maxTick = getMaxTick(_tickSpacings);
        int24 _acceptMinTick = _tick + (_tickSpacings * _acceptTickInterval);

        if(_maxTick < _acceptMinTick) return _maxTick;
        else return _acceptMinTick;
    }
    
    function limitPrameters(
        uint256 amountIn,
        address _pool,
        address token0,
        address token1,
        int24 acceptTickCounts
    ) public view returns  (uint256 amountOutMinimum, uint256 priceLimit, uint160 sqrtPriceX96Limit) {
        IIUniswapV3Pool pool = IIUniswapV3Pool(_pool);
        (, int24 tick,,,,,) =  pool.slot0();

        int24 _tick = tick;
        if(token0 < token1) {
            _tick = tick - acceptTickCounts * 60;
            if(_tick < TickMath.MIN_TICK ) _tick =  TickMath.MIN_TICK ;
        } else {
            _tick = tick + acceptTickCounts * 60;
            if(_tick > TickMath.MAX_TICK ) _tick =  TickMath.MAX_TICK ;
        }
        address token1_ = token1;
        address token0_ = token0;
        return (
              getQuoteAtTick(
                _tick,
                uint128(amountIn),
                token0_,
                token1_
                ),
             getQuoteAtTick(
                _tick,
                uint128(10**27),
                token0_,
                token1_
             ),
             TickMath.getSqrtRatioAtTick(_tick)
        );
    }
}
