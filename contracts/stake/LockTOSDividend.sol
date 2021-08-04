// SPDX-License-Identifier: Unlicense
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/ILockTOSDividend.sol";
import "../interfaces/ILockTOS.sol";


contract LockTOSDividend is ILockTOSDividend {
    uint256 public constant ONE_WEEK = 1 weeks;

    address public lockTOS;
    uint256 public genesis;
    mapping (address => Distribution) public distributions;

    struct Distribution {
        uint256 totalDistribution;
        mapping (uint256 => uint256) tokensPerWeek;
        mapping (uint256 => uint256) claimStartWeeklyEpoch;
    }

    constructor(address _lockTOS) {
        lockTOS = _lockTOS;
    }

    /// @inheritdoc ILockTOSDividend
    function distribute(address _token, uint256 _amount) override public {
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        Distribution storage distr = distributions[_token];

        distr.totalDistribution += _amount;

        uint256 weeklyEpoch = getCurrentWeeklyEpoch();
        distr.tokensPerWeek[weeklyEpoch] += _amount;
    }

    /// @inheritdoc ILockTOSDividend
    function redistribute(address _token, uint256 _weeklyEpoch) override public {
        require(_weeklyEpoch < getCurrentWeeklyEpoch());
        uint256 timestamp = genesis + _weeklyEpoch * ONE_WEEK + ONE_WEEK;

        require(
            ILockTOS(lockTOS).totalSupplyAt(timestamp) == 0,
            "Locked Token exists for that epoch"
        );

        uint256 newEpoch = _weeklyEpoch + 1;
        uint256 newTimestamp = timestamp + ONE_WEEK;
        while (newTimestamp <= block.timestamp) {
            if (ILockTOS(lockTOS).totalSupplyAt(newTimestamp) > 0) {
                break;
            }
            newTimestamp += ONE_WEEK;
            newEpoch += 1;
        }
        require(newTimestamp <= block.timestamp, "Cannot find epoch to redistribute");
        
        Distribution storage distr = distributions[_token];
        distr.tokensPerWeek[newEpoch] += distr.tokensPerWeek[_weeklyEpoch];
        distr.tokensPerWeek[_weeklyEpoch] = 0;
    }

    /// @inheritdoc ILockTOSDividend
    function getWeeklyEpoch(uint256 _timestamp)
        public
        view
        override
        returns (uint256)
    {
        return (_timestamp - genesis) / ONE_WEEK;
    }

    /// @inheritdoc ILockTOSDividend
    function getCurrentWeeklyEpoch()
        public
        view
        override
        returns (uint256)
    {
        return getWeeklyEpoch(block.timestamp);
    }

    function _claimUpTo(address _token, uint256 _timestamp) public {
        uint256 weeklyEpoch = getWeeklyEpoch(_timestamp);
        uint256[] memory userLocks = ILockTOS(lockTOS).locksOf(msg.sender);
        uint256 amountToClaim = 0;
        for (uint256 i = 0; i < userLocks.length; ++i) {
            amountToClaim += _recordClaim(_token, userLocks[i], weeklyEpoch);
        }
        if (amountToClaim > 0) {
            IERC20(_token).transfer(msg.sender, amountToClaim);   
        }
    }

    function _recordClaim(
        address _token,
        uint256 _lockId,
        uint256 _weeklyEpoch
    ) internal returns (uint256 amountToClaim) {
        Distribution storage distr = distributions[_token];
        amountToClaim = _canClaim(distr, _lockId, _weeklyEpoch);
        distr.claimStartWeeklyEpoch[_lockId] = _weeklyEpoch + 1;
        distr.totalDistribution -= amountToClaim;
        return amountToClaim;
    }

    function _canClaim(
        Distribution storage _distr,
        uint256 _lockId,
        uint256 _weeklyEpoch
    ) internal view returns (uint256) {
        (uint256 start, uint256 end, uint256 amount) = ILockTOS(lockTOS).locksInfo(_lockId);
        uint256 epochIterator = getWeeklyEpoch(start);
        uint256 epochEnd = getWeeklyEpoch(end);

        uint256 accumulated = 0;
        while (epochIterator <= epochEnd) {
            uint256 timestamp = genesis + epochIterator * ONE_WEEK + ONE_WEEK;
            int256 balance = ILockTOS(lockTOS).balanceOfLockAt(_lockId, timestamp);
            int256 supply = ILockTOS(lockTOS).totalSupplyAt(timestamp);
            accumulated += uint256(balance / supply);
        }
        return accumulated;
    }
}