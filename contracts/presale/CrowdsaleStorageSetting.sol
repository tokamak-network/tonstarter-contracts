//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "../libraries/LibTokenSale.sol";
import './CrowdsaleStorage.sol';
contract CrowdsaleStorageSetting is CrowdsaleStorage {

    enum REWARD_RATIOTYPE { LINEAR_TIME, FIXED_STEP  }

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Pharse1StakeSetting: Caller is not an admin");
        _;
    }

    /**
    * external
    */
    function changeStartEndTime(
        uint256 _startTime,
        uint256 _endTime
    )
        external
        onlyOwner
    {
        require(_startTime > 0 && _endTime > 0 && _startTime < _endTime);
        require(_startTime != startTime || _endTime != endTime );

        startTime = _startTime;
        endTime = _endTime;
    }

    function changeDefaultDuration(
        uint256 _defaultDuration
    )
        external
        onlyOwner
    {
        require(_defaultDuration > 0);
        defaultDuration = _defaultDuration;
    }

    function changeCap(
        uint256 _cap
    )
        external
        onlyOwner
    {
        require(_cap > 0);
        cap = _cap;
    }

    function changeRewardRatioType(
        uint _ratioType
    )
        external
        onlyOwner
    {
        require(_ratioType >= uint(REWARD_RATIOTYPE.LINEAR_TIME) && _ratioType <= uint(REWARD_RATIOTYPE.FIXED_STEP));
        ratioType = _ratioType;
    }

    /**
    * public
    */

    function getLinearRatioByDuration(uint256 _duration) public view returns (uint256 ratio) {
        require(maxRatio > 0 && startTime > 0 && startTime < endTime);

        ratio = _duration / (endTime-startTime) * maxRatio;
    }

    function calculateAmountLinearRatioByDuration(uint _amount, uint256 _duration)
      public view returns (uint256 _newAmount) {
        require(maxRatio > 0 && startTime > 0 && startTime < endTime);

        _newAmount = _amount * _duration / (endTime-startTime) * maxRatio;
    }

}
