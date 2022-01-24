// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/IWTON.sol";
import "../interfaces/IPrivateSale.sol";
import "../common/AccessibleCommon.sol";

import { OnApprove } from "./OnApprove.sol";
import "./PrivateSaleStorage.sol";


contract PrivateSale is PrivateSaleStorage, AccessibleCommon, ReentrancyGuard, OnApprove, IPrivateSale {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    event Buyinfo(
        address user,
        uint256 inputAmount,
        uint256 totalOutPutamount,
        uint256 inputTime,
        uint256 monthlyReward,
        uint256 firstReward
    );

    event FirstClaiminfo(
        address user,
        uint256 claimAmount,
        uint256 claimTime
    );

    event Claiminfo(
        address user,
        uint256 claimAmount,
        uint256 claimTime
    );

    event Withdrawinfo(
        address user,
        uint256 withdrawAmount
    );

    event addList(
        address account,
        uint256 amount
    );

    event delList(
        address account,
        uint256 amount
    );

    /// @dev calculator the SaleAmount(input TON how many get the anotherToken)
    /// @param _amount input the TON amount
    function calculSaleToken(uint256 _amount)
        public
        override
        view
        returns (uint256)
    {
        uint256 tokenSaleAmount = _amount.mul(getTokenPrice).div(saleTokenPrice);
        return tokenSaleAmount;
    }

    /// @dev calculator the getAmount(want to get _amount how many input the TON?)
    /// @param _amount input the anotherTokenAmount
    function calculGetToken(uint256 _amount)
        public
        override
        view
        returns (uint256)
    {
        uint256 tokenGetAmount = _amount.mul(saleTokenPrice).div(getTokenPrice);
        return tokenGetAmount;
    }

    /// @dev address setting
    /// @param _saleToken saleTokenAddress (contract have token)
    /// @param _getToken getTokenAddress (TON)
    /// @param _ownerToken get TON transfer to wallet
    function addressSetting(
        address _saleToken,
        address _getToken,
        address _ownerToken
    ) external override onlyOwner {
        changeTokenAddress(_saleToken,_getToken);
        changeGetAddress(_ownerToken);
    }

    function changeWTONAddress(address _wton) external override onlyOwner {
        wton = _wton;
    }

    function changeTokenAddress(address _saleToken, address _getToken) public override onlyOwner {
        saleToken = IERC20(_saleToken);
        getToken = IERC20(_getToken);
    }

    function changeGetAddress(address _address) public override onlyOwner {
        getTokenOwner = _address;
    }

    function settingAll(
        uint256[4] calldata _time,
        uint256 _saleTokenPrice,
        uint256 _getTokenPrice
    ) external override onlyOwner {
        settingPrivateTime(_time[0],_time[1],_time[2],_time[3]);
        setTokenPrice(_saleTokenPrice,_getTokenPrice);
    }

    function settingPrivateTime(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _firstTime,
        uint256 _claimTime
    ) public override onlyOwner {
        settingSaleTime(_startTime,_endTime);
        settingFirstClaimTime(_firstTime);
        settingClaimTime(_claimTime);
    }

    function settingSaleTime(uint256 _startTime,uint256 _endTime) public override onlyOwner {
        saleStartTime = _startTime;
        saleEndTime = _endTime;
    }

    function settingFirstClaimTime(uint256 _claimTime) public override onlyOwner {
        firstClaimTime = _claimTime;
    }

    function settingClaimTime(uint256 _time) public override onlyOwner {
        claimStartTime = _time;
        claimEndTime = _time.add(360 days);
    }

    function setTokenPrice(uint256 _saleTokenPrice, uint256 _getTokenPrice)
        public
        onlyOwner
    {
        saleTokenPrice = _saleTokenPrice;
        getTokenPrice = _getTokenPrice;
    }

    function claimAmount(
        address _account
    ) external override view returns (uint256) {
        UserInfoAmount memory user = usersAmount[_account];

        require(user.inputamount > 0, "user isn't buy");
        require(block.timestamp > claimStartTime, "need to time for claim");
        
        UserInfoClaim memory userclaim = usersClaim[msg.sender];

        uint difftime = block.timestamp.sub(claimStartTime);
        uint monthTime = 30 days;

        if (difftime < monthTime) {
            uint period = 1;
            uint256 reward = (user.monthlyReward.mul(period)).sub(userclaim.claimAmount);
            return reward;
        } else {
            uint period = (difftime.div(monthTime)).add(1);
            if (period >= 12) {
                uint256 reward = user.totaloutputamount.sub(userclaim.claimAmount).sub(userclaim.firstClaimAmount);
                return reward; 
            } else {
                uint256 reward = (user.monthlyReward.mul(period)).sub(userclaim.claimAmount);
                return reward;
            }
        }
    }
    
    function calculClaimAmount(
        uint256 _nowtime, 
        uint256 _preclaimamount,
        uint256 _monthlyReward,
        uint256 _usertotaloutput,
        uint256 _firstReward
    ) internal view returns (uint256) {
        uint difftime = _nowtime.sub(claimStartTime);
        uint monthTime = 30 days;

        if (difftime < monthTime) {
            uint period = 1;
            uint256 reward = (_monthlyReward.mul(period)).sub(_preclaimamount);
            return reward;
        } else {
            uint period = (difftime.div(monthTime)).add(1);
            if (period >= 12) {
                uint256 reward = _usertotaloutput.sub(_preclaimamount).sub(_firstReward);
                return reward; 
            } else {
                uint256 reward = (_monthlyReward.mul(period)).sub(_preclaimamount);
                return reward;
            }
        }
    }

    /**
     * @dev transform WAD to RAY
     */
    function _toRAY(uint256 v) internal pure returns (uint256) {
        return v * 10 ** 9;
    }

    /**
     * @dev transform RAY to WAD
     */
    function _toWAD(uint256 v) public override pure returns (uint256) {
        return v / 10 ** 9;
    }
    
    function addWhiteList(address _account,uint256 _amount) external override onlyOwner {
        WhiteList storage userwhite = usersWhite[_account];
        userwhite.amount = userwhite.amount.add(_amount);

        emit addList(_account, _amount);
    }

    function addWhiteListArray(address[] calldata _account, uint256[] calldata _amount) external override onlyOwner {
        for(uint i = 0; i < _account.length; i++) {
            WhiteList storage userwhite = usersWhite[_account[i]];
            userwhite.amount = userwhite.amount.add(_amount[i]);

            emit addList(_account[i], _amount[i]);
        }
    }

    function delWhiteList(address _account, uint256 _amount) external override onlyOwner {
        WhiteList storage userwhite = usersWhite[_account];
        userwhite.amount = userwhite.amount.sub(_amount);

        emit delList(_account, _amount);
    }

    function onApprove(
        address sender,
        address spender,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        require(msg.sender == address(getToken) || msg.sender == address(IWTON(wton)), "PrivateSale: only accept TON and WTON approve callback");
        if(msg.sender == address(getToken)) {
            uint256 wtonAmount = _decodeApproveData(data);
            if(wtonAmount == 0){
                buy(sender,amount);
            } else {
                uint256 totalAmount = amount + wtonAmount;
                buy(sender,totalAmount);
            }
        } else if (msg.sender == address(IWTON(wton))) {
            uint256 wtonAmount = _toWAD(amount);
            buy(sender,wtonAmount);
        }

        return true;
    }

    function _decodeApproveData(
        bytes memory data
    ) public override pure returns (uint256 approveData) {
        assembly {
            approveData := mload(add(data, 0x20))
        }
    }

    function buy(
        address _sender,
        uint256 _amount
    ) public override {
        require(saleStartTime != 0 && saleEndTime != 0, "need to setting saleTime");
        require(block.timestamp >= saleStartTime && block.timestamp <= saleEndTime, "privaSale period end");
        WhiteList storage userwhite = usersWhite[_sender];
        require(userwhite.amount >= _amount, "need to add whiteList amount");
        _buy(_sender,_amount);
        userwhite.amount = userwhite.amount.sub(_amount);
    }

    function _buy(
        address _sender,
        uint256 _amount
    )
        internal
    {
        UserInfoAmount storage user = usersAmount[_sender];

        uint256 tokenSaleAmount = calculSaleToken(_amount);
        uint256 Saledtoken = totalSaleAmount.add(tokenSaleAmount);
        uint256 tokenBalance = saleToken.balanceOf(address(this));

        require(
            tokenBalance >= Saledtoken,
            "don't have token amount"
        );

        uint256 tonAllowance = getToken.allowance(_sender, address(this));
        uint256 tonBalance = getToken.balanceOf(_sender);
        if(tonAllowance > tonBalance) {
            tonAllowance = tonBalance;  //tonAllowance가 tonBlance보다 더 클때 문제가 된다.
        }
        if(tonAllowance < _amount) {
            uint256 needUserWton;
            uint256 needWton = _amount.sub(tonAllowance);
            needUserWton = _toRAY(needWton);
            require(IWTON(wton).allowance(_sender, address(this)) >= needUserWton, "privateSale: wton amount exceeds allowance");
            require(IWTON(wton).balanceOf(_sender) >= needUserWton, "need more wton");
            IERC20(wton).safeTransferFrom(_sender,address(this),needUserWton);
            IWTON(wton).swapToTON(needUserWton);
            require(tonAllowance >= _amount.sub(needWton), "privateSale: ton amount exceeds allowance");
            if(_amount.sub(needWton) > 0) {
                getToken.safeTransferFrom(_sender, address(this), _amount.sub(needWton));   
            }
            getToken.safeTransfer(getTokenOwner, _amount);
        } else {
            require(tonAllowance >= _amount && tonBalance >= _amount, "privateSale: ton amount exceeds allowance");

            getToken.safeTransferFrom(_sender, address(this), _amount);
            getToken.safeTransfer(getTokenOwner, _amount);
        }

        user.inputamount = user.inputamount.add(_amount);
        user.totaloutputamount = user.totaloutputamount.add(tokenSaleAmount);
        user.firstReward = user.totaloutputamount.mul(5).div(100);
        user.monthlyReward = (user.totaloutputamount.sub(user.firstReward)).div(12);
        user.inputTime = block.timestamp;

        totalGetAmount = totalGetAmount.add(_amount);
        totalSaleAmount = totalSaleAmount.add(tokenSaleAmount);

        emit Buyinfo(
            msg.sender, 
            user.inputamount, 
            user.totaloutputamount,
            user.inputTime,
            user.monthlyReward,
            user.firstReward
        );
    }

    function claim() external override {
        require(firstClaimTime != 0 && saleEndTime != 0, "need to setting Time");
        require(block.timestamp > saleEndTime && block.timestamp > firstClaimTime, "need the fisrClaimtime");
        if(block.timestamp < claimStartTime) {
            firstClaim();
        } else if(claimStartTime < block.timestamp){
            _claim();
        }
    }


    function firstClaim() public {
        UserInfoAmount storage user = usersAmount[msg.sender];
        UserInfoClaim storage userclaim = usersClaim[msg.sender];

        require(user.inputamount > 0, "need to buy the token");
        require(userclaim.firstClaimAmount == 0, "already getFirstreward");

        userclaim.firstClaimAmount = userclaim.firstClaimAmount.add(user.firstReward);
        userclaim.firstClaimTime = block.timestamp;

        saleToken.safeTransfer(msg.sender, user.firstReward);

        emit FirstClaiminfo(msg.sender, userclaim.firstClaimAmount, userclaim.firstClaimTime);
    }

    function _claim() public {
        require(block.timestamp >= claimStartTime, "need the time for claim");

        UserInfoAmount storage user = usersAmount[msg.sender];
        UserInfoClaim storage userclaim = usersClaim[msg.sender];

        require(user.inputamount > 0, "need to buy the token");
        require(!(user.totaloutputamount == (userclaim.claimAmount.add(userclaim.firstClaimAmount))), "already getAllreward");

        if(userclaim.firstClaimAmount == 0) {
            firstClaim();
        }

        uint256 giveTokenAmount = calculClaimAmount(block.timestamp, userclaim.claimAmount, user.monthlyReward, user.totaloutputamount, userclaim.firstClaimAmount);
    
        require(user.totaloutputamount.sub(userclaim.claimAmount) >= giveTokenAmount, "user is already getAllreward");
        require(saleToken.balanceOf(address(this)) >= giveTokenAmount, "dont have saleToken in pool");

        userclaim.claimAmount = userclaim.claimAmount.add(giveTokenAmount);
        userclaim.claimTime = block.timestamp;

        saleToken.safeTransfer(msg.sender, giveTokenAmount);

        emit Claiminfo(msg.sender, userclaim.claimAmount, userclaim.claimTime);
    }


    function withdraw(uint256 _amount) external onlyOwner {
        require(
            saleToken.balanceOf(address(this)) >= _amount,
            "dont have token amount"
        );
        saleToken.safeTransfer(msg.sender, _amount);

        emit Withdrawinfo(msg.sender, _amount);
    }

}
