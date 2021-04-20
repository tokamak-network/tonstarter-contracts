//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../libraries/LibTokenMining.sol";
import './MiningStorage.sol';
contract MiningStorageSetting is MiningStorage {

    enum REWARD_RATIOTYPE { LINEAR_TIME, FIXED_STEP  }

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "MiningStorageSetting: Caller is not an admin");
        _;
    }

    /**
    * external
    */
    function changeVault(
        address _vault
    )
        external
        onlyOwner
    {
        require(_vault != address(0));

        vault = _vault;
    }

    function changeVaultHashName(
        bytes32 _hash
    )
        external
        onlyOwner
    {
        require(_hash != 0x0);

        vaultHashName = _hash;
    }

    function changeStartTime(
        uint256 _startTime
    )
        external
        onlyOwner
    {
        require(_startTime > 0 && _startTime != startTime);

        startTime = _startTime;
    }

    function changeUintMiningPeriods(
        uint256 _uintMiningPeriods
    )
        external
        onlyOwner
    {
        require(_uintMiningPeriods > 0 && uintMiningPeriods != _uintMiningPeriods);

        uintMiningPeriods = _uintMiningPeriods;
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
        require(maxRatio > 0 && uintMiningPeriods > 0 );

        ratio = _duration / uintMiningPeriods * maxRatio;
    }

    function calculateAmountLinearRatioByDuration(uint _amount, uint256 _duration)
      public view returns (uint256 _newAmount) {
        require(maxRatio > 0 && uintMiningPeriods > 0);

        _newAmount = _amount * _duration / uintMiningPeriods * maxRatio;
    }

}
