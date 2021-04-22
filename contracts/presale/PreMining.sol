//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../interfaces/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "../libraries/LibTokenSale.sol";
import './PreMiningStorageSetting.sol';
import './StepFixedRatio.sol';

/**
 * @title PreMining
 * @dev
 */
contract PreMining
    is
    PreMiningStorageSetting, StepFixedRatio, Initializable  {
    /**
    * event for token purchase logging
    * @param purchaser who paid for the tokens
    * @param value weis paid for purchase
    * @param duration staking period
    * @param amount amount of tokens purchased
    */
    event TokenPurchase(address indexed paytoken, address indexed purchaser, uint256 value, uint256 duration, uint256 amount);
    event TokenRePurchase(address indexed paytoken, address indexed purchaser, uint256 value, uint256 duration, uint256 amount);
    event Withdraw(address indexed paytoken, address indexed from, address token, uint256 value);

  // event Withdraw(address indexed from, address indexed beneficiary,);

    function initialize(
        uint256 _startTime,
        uint256 _endTime,
        address _token,
        uint256 _cap,
        address _paytoken
    )
        external
        initializer
    {
        require(_startTime >= 0);
        require(_endTime >= _startTime && _endTime >= block.timestamp);
        require(_token != address(0));
        require(_cap > 0);

        _initialize();

        if(_token != address(0)) token = _token;
        startTime = _startTime;
        endTime = _endTime;
        cap = _cap;
        paytoken = _paytoken;
        maxRatio = 1;
        ratioType = uint(REWARD_RATIOTYPE.LINEAR_TIME);
        defaultDuration = 60*60*24*14; // 2 weeks ;

    }

    receive() external payable {
      require(paytoken == address(0) && defaultDuration > 0 && msg.value > 0 );
      buyToken(defaultDuration);
    }


    // low level token purchase function
    function buyToken(uint256 duration) public payable {
      require(paytoken == address(0), "Crowdsale: paytoken is non Zero");
      require(validPurchaseETH(duration), "Crowdsale: validPurchaseETH is fail");

      uint256 weiAmount = msg.value;  // stake amount

      // calculate token amount to be created
      uint256 rewardAmount = calculateAmountByRatio(weiAmount, duration);

      // lock
      addLockStakedToken(msg.sender, weiAmount, block.timestamp+duration);

      // update state
      weiRaised += rewardAmount;

      // transfer token rewardAmount
      require(IERC20(token).transfer(msg.sender, rewardAmount));
      emit TokenPurchase(address(0), msg.sender, weiAmount, duration, rewardAmount);

      //forwardFunds();
    }


    // low level token purchase function
    function buyTokens(address _paytoken, uint256 amount, uint256 duration) external {
      require(paytoken != address(0) && paytoken == _paytoken);
      require(validPurchase(amount, duration));

      // calculate token amount to be created
      uint256 rewardAmount = calculateAmountByRatio(amount, duration);

      // lock
      addLockStakedToken(msg.sender, amount, block.timestamp+duration);

      // update state
      weiRaised += rewardAmount;

      //paytoken transfer
      require(IERC20(paytoken).transferFrom(msg.sender, address(this), amount));

      // transfer token rewardAmount
      require(IERC20(token).transfer(msg.sender, rewardAmount));
      emit TokenPurchase(_paytoken, msg.sender, amount, duration, rewardAmount);

      //forwardFunds();
    }

    // send ether to the fund collection wallet
    // override to create custom fund forwarding mechanisms
    //function forwardFunds() internal {
    //  wallet.transfer(msg.value);
    //}

    // @return true if the transaction can buy tokens
    function validPurchase(uint256 _amount, uint256 duration) public view returns (bool) {
      return validPeriod(duration) && validCap(_amount, duration);
    }

    function validPeriod(uint256 duration) public view returns (bool) {
      bool withinPeriod = block.timestamp >= startTime && (block.timestamp + duration) <= endTime;
      return withinPeriod;
    }
    function validCap(uint256 _amount, uint256 duration) public view returns (bool) {
      bool withinCap = (weiRaised + calculateAmountByRatio(_amount, duration)) <= cap;
      return withinCap;
    }

    function validPurchaseETH(uint256 duration) internal view returns (bool) {
      bool nonZeroPurchase = msg.value != 0;
      return nonZeroPurchase && validPurchase(msg.value, duration);
    }

    // @return true if crowdsale event has ended
    function hasEnded() public view returns (bool) {
      bool capReached = weiRaised >= cap;
      return block.timestamp > endTime || capReached;
    }

    function getRatio(uint256 _duration) public view returns (uint256 ratio) {
      if( ratioType == uint(REWARD_RATIOTYPE.LINEAR_TIME) ) return getLinearRatioByDuration(_duration);
      else return getRatioByDuration(_duration);
    }

    function calculateAmountByRatio(uint256 _amount, uint256 _duration) public view returns (uint256 ratio) {
      if( ratioType == uint(REWARD_RATIOTYPE.LINEAR_TIME) ) return calculateAmountLinearRatioByDuration(_amount, _duration);
      else return calculateAmountWithRatioByDuration(_amount, _duration);
    }

    function withdraw() external returns (bool){
      uint256 unLockAmount = releaseUserLockStakedToken(msg.sender);
      require(unLockAmount > 0, "Crowdsale: There is no amount that can be withdrawn.");
      if(paytoken == address(0)){
          address payable self = address(uint160(address(this)));
          require(self.balance >= unLockAmount, "Crowdsale: balance i slack to withdraw.");

          // msg.sender.transfer(unLockAmount);
          (bool success, ) = msg.sender.call{value: unLockAmount}("");
          require(success, "Crowdsale: withdraw failed.");
          emit Withdraw(paytoken, msg.sender, address(0), unLockAmount );
      } else {
          IERC20(paytoken).transfer(msg.sender, unLockAmount);
          emit Withdraw(paytoken, msg.sender, paytoken, unLockAmount);
      }
      return true;
    }

    function rebuyToken(uint256 _duration) external {

      // Extend lock's releaseTime
      uint256 rebuyAmount = rebuyUserLockStakedToken(msg.sender, block.timestamp + _duration);
      require(validPurchase(rebuyAmount, _duration));

      // calculate token amount to be created
      uint256 rewardAmount = calculateAmountByRatio(rebuyAmount, _duration);

      // update state
      weiRaised += rewardAmount;

      // transfer token rewardAmount
      IERC20(token).transfer(msg.sender, rewardAmount);
      emit TokenRePurchase(paytoken, msg.sender, rebuyAmount, _duration, rewardAmount);
    }

    function rebuyUserLockStakedToken(address _user, uint256 _releaseTime) internal returns (uint256 rebuyAmount) {
      LibTokenSale.LockAmount[] storage userLocks = userLockStakedToken[_user];
      rebuyAmount = 0;

      for (uint256 i = 0; i< userLocks.length; i++){
        if (userLocks[i].released == false && userLocks[i].releaseTime < block.timestamp) {
          userLocks[i].releaseTime = _releaseTime;
          rebuyAmount += userLocks[i].amount;
        }
      }
    }


    function releaseUserLockStakedToken(address _user) internal returns (uint256 unLockAmount) {
      LibTokenSale.LockAmount[] storage userLocks = userLockStakedToken[_user];
      unLockAmount = 0;

      for (uint256 i = 0; i< userLocks.length; i++){
        if (userLocks[i].released == false && userLocks[i].releaseTime < block.timestamp) {
          userLocks[i].released = true;
          unLockAmount += userLocks[i].amount;
        }
      }
    }

    function curBlockTimeStamp() public view returns (uint256 curTime) {
       return block.timestamp;
    }
    function curBlockNumber() public view returns (uint256 curNumber) {
       return block.number;
    }

    function canWithdrawAmount(address _user) public view returns (uint256 validAmount) {
      validAmount = 0;
      for (uint256 i = 0; i< userLockStakedToken[_user].length; i++){
        if (userLockStakedToken[_user][i].released == false && userLockStakedToken[_user][i].releaseTime < block.timestamp) {
          validAmount += userLockStakedToken[_user][i].amount;
        }
      }
    }

    function getAllUserLocks(address _user) public view returns (LibTokenSale.LockAmount[] memory) {
      return userLockStakedToken[_user];
    }

    function lengthAllUserLocks(address _user) public view returns (uint256 counts) {
      counts = userLockStakedToken[_user].length;
    }

    function getUserLocks(address _user, uint256 _index) public view returns (LibTokenSale.LockAmount memory) {
      require(_index < userLockStakedToken[_user].length);
      return userLockStakedToken[_user][_index];
    }


    // low level token purchase function
    function addLockStakedToken(
        address _user,
        uint256 _amount,
        uint256 _releaseTime
    )
        internal
    {
        require(_user != address(0) && _amount > 0 && _releaseTime > block.timestamp );
        bool addLock = false;
        LibTokenSale.LockAmount[] storage userLocks = userLockStakedToken[_user];

        for (uint256 i = 0; i< userLocks.length; i++){
          if (userLocks[i].released == true && userLocks[i].releaseTime < block.timestamp) {
            userLocks[i].released = false;
            userLocks[i].releaseTime = _releaseTime;
            userLocks[i].amount = _amount;
            addLock = true;
          }
        }
        if(!addLock) userLocks.push(LibTokenSale.LockAmount(false, _releaseTime, _amount));
    }
}
