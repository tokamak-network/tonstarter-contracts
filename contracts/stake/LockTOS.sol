// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../interfaces/ILockTOS.sol";
import "../interfaces/ITOS.sol";
import "../libraries/LibLockTOS.sol";
import "../common/AccessibleCommon.sol";
import "./LockTOSStorage.sol";

import "hardhat/console.sol";

contract LockTOS is LockTOSStorage, AccessibleCommon, ILockTOS {
    using SafeMath for uint256;
    using SafeCast for uint256;
    using SignedSafeMath for int256;

    event LockCreated(address account, uint256 lockId, uint256 value, uint256 unlockTime);
    event LockAmountIncreased(address account, uint256 lockId, uint256 value);
    event LockUnlockTimeIncreased(address account, uint256 lockId, uint256 unlockTime);
    event LockDeposited(address account, uint256 lockId, uint256 value);
    event LockWithdrawn(address account, uint256 lockId, uint256 value);

    /// @dev Check if a function is used or not
    modifier ifFree {
        require(free == 1, "LockId is already in use");
        free = 0;
        _;
        free = 1;
    }

    /// @inheritdoc ILockTOS
    function setPhase3StartTime(uint256 _phase3StartTime) external override onlyOwner {
        phase3StartTime = _phase3StartTime;
    }

    /// @inheritdoc ILockTOS
    function increaseAmount(uint256 _lockId, uint256 _value) external override {
        depositFor(msg.sender, _lockId, _value);
    }

    /// @inheritdoc ILockTOS
    function createLockWithPermit(
        uint256 _value,
        uint256 _unlockWeeks,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external override returns (uint256 lockId) {
        ITOS(tos).permit(
            msg.sender,
            address(this),
            _value,
            _deadline,
            _v,
            _r,
            _s
        );
        lockId = createLock(_value, _unlockWeeks);
    }

    /// @inheritdoc ILockTOS
    function increaseUnlockTime(uint256 _lockId, uint256 _unlockWeeks) external override {
        require(_unlockWeeks > 0, "Unlock period less than a week");

        LibLockTOS.LockedBalance memory lock = lockedBalances[msg.sender][_lockId];
        uint256 unlockTime = lock.end.add(_unlockWeeks.mul(epochUnit));
        unlockTime = unlockTime.div(epochUnit).mul(epochUnit);
        require(unlockTime - lock.start < maxTime, "Max unlock time is 3 years");
        require(lock.end > block.timestamp, "Lock time already finished");
        require(lock.end < unlockTime, "New lock time must be greater");
        require(lock.amount > 0, "No existing locked TOS");
        _deposit(msg.sender, _lockId, 0, unlockTime);

        emit LockUnlockTimeIncreased(msg.sender, _lockId, unlockTime);
    }

    /// @inheritdoc ILockTOS
    function withdrawAll() external override ifFree {
        uint256[] storage locks = userLocks[msg.sender];

        if (locks.length == 0) {
            return;
        }

        for (uint256 i = locks.length - 1; i >= 0; i--) {
            LibLockTOS.LockedBalance memory lock = allLocks[locks[i]];
            if (lock.amount > 0 && lock.start > 0 && lock.end < block.timestamp) {
                _withdraw(locks[i]);
                locks[i] = locks[locks.length - 1];
                delete locks[locks.length - 1];
            }

            if (i == 0) break; // i is unsigned
        } 
    }

    /// @inheritdoc ILockTOS
    function globalCheckpoint() external override {
        _recordHistoryPoints();
    }

    /// @inheritdoc ILockTOS
    function withdraw(uint256 _lockId) public override ifFree {
        _withdraw(_lockId);
        uint256[] storage locks = userLocks[msg.sender];
        for (uint256 i = 0; i < locks.length; ++i) {
            if (locks[i] == _lockId) {
                locks[i] = locks[locks.length - 1];
                delete locks[locks.length - 1];
            }
        }
    }

    function _withdraw(uint256 _lockId) internal {
        LibLockTOS.LockedBalance memory lockedOld = lockedBalances[msg.sender][_lockId];
        require(lockedOld.start > 0, "Lock does not exist");
        require(lockedOld.end < block.timestamp, "Lock time not finished");
        require(lockedOld.amount > 0, "Already withdrawn");

        LibLockTOS.LockedBalance memory lockedNew = LibLockTOS.LockedBalance({
            amount: 0,
            start: 0,
            end: 0,
            boostValue: 0
        });

        // Checkpoint
        _checkpoint(lockedNew, lockedOld);

        // Transfer TOS back        
        lockedBalances[msg.sender][_lockId] = lockedNew;
        allLocks[_lockId] = lockedNew;

        IERC20(tos).transfer(msg.sender, lockedOld.amount);
        emit LockWithdrawn(msg.sender, _lockId, lockedOld.amount);
    }

    /// @inheritdoc ILockTOS
    function createLock(uint256 _value, uint256 _unlockWeeks) public override  returns (uint256 lockId) {
        require(_value > 0, "Value locked should be non-zero");
        require(_unlockWeeks > 0, "Unlock period less than a week");

        lockId = lockIdCounter++;
        uint256 unlockTime = block.timestamp.add(_unlockWeeks.mul(epochUnit));
        unlockTime = unlockTime.div(epochUnit).mul(epochUnit);
        require(unlockTime - block.timestamp < maxTime, "Max unlock time is 3 years");
        _deposit(msg.sender, lockId, _value, unlockTime);
        userLocks[msg.sender].push(lockId);

        emit LockCreated(msg.sender, lockId, _value, unlockTime);
    }

    /// @inheritdoc ILockTOS
    function depositFor(address _addr, uint256 _lockId, uint256 _value) public override{
        require(_value > 0, "Value locked should be non-zero");
        LibLockTOS.LockedBalance memory locked = lockedBalances[_addr][_lockId];
        require(locked.start > 0, "Lock does not exist");
        require(locked.end > block.timestamp, "Lock time is finished");
        _deposit(_addr, _lockId, _value, 0);
        emit LockDeposited(msg.sender, _lockId, _value);
    }

    /// @inheritdoc ILockTOS
    function totalSupplyAt(uint256 _timestamp) public view override returns (uint256) {
        (bool success, LibLockTOS.Point memory point) = _findClosestPoint(pointHistory, _timestamp);
        if (!success) {
            return 0;
        }
        int256 currentBias = point.slope * (_timestamp.sub(point.timestamp).toInt256());
        return uint256(point.bias > currentBias ? point.bias - currentBias : 0).div(MULTIPLIER);
    }

    /// @inheritdoc ILockTOS
    function totalSupply() override external view returns (uint256) {
        if (pointHistory.length == 0) {
            return 0;
        }

        LibLockTOS.Point memory point = pointHistory[pointHistory.length - 1];
        int256 currentBias = point.slope.mul(block.timestamp.sub(point.timestamp).toInt256());
        return uint256(point.bias > currentBias ? point.bias.sub(currentBias) : 0).div(MULTIPLIER);
    }

    /// @inheritdoc ILockTOS
    function balanceOfLockAt(uint256 _lockId, uint256 _timestamp)
        override
        public
        view
        returns (uint256)
    {
        (bool success, LibLockTOS.Point memory point) = _findClosestPoint(lockPointHistory[_lockId], _timestamp);
        if (!success) {
            return 0;
        }
        int256 currentBias = point.slope.mul(_timestamp.sub(point.timestamp).toInt256());
        return uint256(point.bias > currentBias ? point.bias.sub(currentBias) : 0).div(MULTIPLIER);
    }

    /// @inheritdoc ILockTOS
    function balanceOfLock(uint256 _lockId) override public view returns (uint256) {
        uint256 len = lockPointHistory[_lockId].length;
        if (len == 0) {
            return 0;
        }

        LibLockTOS.Point memory point = lockPointHistory[_lockId][len - 1];
        int256 currentBias = point.slope.mul(block.timestamp.sub(point.timestamp).toInt256());
        return uint256(point.bias > currentBias ? point.bias.sub(currentBias) : 0).div(MULTIPLIER);
    }

    /// @inheritdoc ILockTOS
    function balanceOfAt(address _addr, uint256 _timestamp) override public view returns (uint256 balance) {
        uint256[] memory locks = userLocks[_addr];
        if (locks.length == 0) return 0;
        for (uint256 i = 0; i < locks.length; ++i) {
            balance = balance.add(balanceOfLockAt(locks[i], _timestamp));
        }
    }

    /// @inheritdoc ILockTOS
    function balanceOf(address _addr) override public view returns (uint256 balance) {
        uint256[] memory locks = userLocks[_addr];
        if (locks.length == 0) return 0;
        for (uint256 i = 0; i < locks.length; ++i) {
            balance = balance.add(balanceOfLock(locks[i]));
        }
    }

    /// @inheritdoc ILockTOS
    function locksInfo(uint256 _lockId)
        override
        public
        view
        returns (uint256, uint256, uint256, int256) 
    {
        return (
            allLocks[_lockId].start,
            allLocks[_lockId].end,
            allLocks[_lockId].amount,
            allLocks[_lockId].boostValue
        );
    }

    /// @inheritdoc ILockTOS
    function locksOf(address _addr) override public view returns (uint256[] memory) {
        return userLocks[_addr];
    }

    /// @inheritdoc ILockTOS
    function pointHistoryOf(uint256 _lockId) override public view returns (LibLockTOS.Point[] memory) {
        return lockPointHistory[_lockId];
    }

    /// @dev Finds closest point
    function _findClosestPoint(LibLockTOS.Point[] storage _history, uint256 _timestamp)
        internal
        view
        returns (bool success, LibLockTOS.Point memory point)
    {
        if (_history.length == 0) {
            return (false, point);
        }

        uint256 left = 0;
        uint256  right = _history.length;
        while (left + 1 < right) {
            uint256 mid = left.add(right).div(2);
            if (_history[mid].timestamp <= _timestamp) {
                left = mid;
            } else {
                right = mid;
            }
        }

        if (_history[left].timestamp <= _timestamp) {
            return (true, _history[left]);
        }
        return (false, point);
    }

    /// @dev Deposit
    function _deposit(address _addr, uint256 _lockId, uint256 _value, uint256 _unlockTime) internal ifFree {
       LibLockTOS.LockedBalance memory lockedOld = lockedBalances[_addr][_lockId];
       LibLockTOS.LockedBalance memory lockedNew = LibLockTOS.LockedBalance({
            amount: lockedOld.amount,
            start: lockedOld.start,
            end: lockedOld.end,
            boostValue: lockedOld.boostValue
        });

        // Make new lock
        lockedNew.amount = lockedNew.amount.add(_value);
        if (_unlockTime > 0) {
            lockedNew.end = _unlockTime;
        }
        if (lockedNew.start == 0) {
            lockedNew.start = block.timestamp;
        }
        if (lockedNew.boostValue == 0) {
            lockedNew.boostValue = block.timestamp <= phase3StartTime ? 2 : 1;
        }

        // Checkpoint
        _checkpoint(lockedNew, lockedOld);

        // Save new lock
        lockedBalances[_addr][_lockId] = lockedNew;
        allLocks[_lockId] = lockedNew;

        // Save user point
        int256 userSlope = lockedNew.amount.mul(MULTIPLIER).div(maxTime).toInt256();
        int256 userBias = userSlope.mul(lockedNew.end.sub(block.timestamp).toInt256());
        LibLockTOS.Point memory userPoint = LibLockTOS.Point({
            timestamp: block.timestamp,
            slope: userSlope.mul(lockedNew.boostValue), // Boost slope if staked before phase3
            bias: userBias
        });
        lockPointHistory[_lockId].push(userPoint);

        // Transfer TOS
        IERC20(tos).transferFrom(msg.sender, address(this), _value);
    }

    /// @dev Checkpoint
    function _checkpoint(
        LibLockTOS.LockedBalance memory lockedNew,
        LibLockTOS.LockedBalance memory lockedOld
    )
        internal 
    {
        uint256 timestamp = block.timestamp;
        LibLockTOS.SlopeChange memory changeNew = LibLockTOS.SlopeChange({slope: 0, bias: 0, changeTime: 0});
        LibLockTOS.SlopeChange memory changeOld = LibLockTOS.SlopeChange({slope: 0, bias: 0, changeTime: 0});

        // Initialize slope changes
        if (lockedNew.end > timestamp && lockedNew.amount > 0) {
            changeNew.slope = lockedNew.amount.mul(MULTIPLIER).div(maxTime).toInt256();
            changeNew.bias = changeNew.slope.mul(lockedNew.end.sub(timestamp).toInt256());
            changeNew.changeTime = lockedNew.end;
        }
        if (lockedOld.end > timestamp && lockedOld.amount > 0) {
            changeOld.slope = lockedOld.amount.mul(MULTIPLIER).div(maxTime).toInt256();
            changeOld.bias = changeOld.slope.mul(lockedOld.end.sub(timestamp).toInt256());
            changeOld.changeTime = lockedOld.end;
        }

        // Record history gaps
        LibLockTOS.Point memory currentWeekPoint = _recordHistoryPoints();
        currentWeekPoint.bias = currentWeekPoint.bias.add(changeNew.bias.sub(changeOld.bias));
        currentWeekPoint.slope = currentWeekPoint.slope.add(changeNew.slope.sub(changeOld.slope));
        currentWeekPoint.bias = currentWeekPoint.bias > 0 ? currentWeekPoint.bias : 0;
        currentWeekPoint.slope = currentWeekPoint.slope > 0 ? currentWeekPoint.slope : 0;
        pointHistory[pointHistory.length - 1] = currentWeekPoint;
        
        // Update slope changes
        _updateSlopeChanges(changeNew, changeOld);
    }

    /// @dev Fill the gaps
    function _recordHistoryPoints() internal returns (LibLockTOS.Point memory lastWeek) {
        uint256 timestamp = block.timestamp;
        if (pointHistory.length > 0) {
            lastWeek = pointHistory[pointHistory.length - 1];
        } else {
            lastWeek = LibLockTOS.Point({bias: 0, slope: 0, timestamp: timestamp});
        }

        // Iterate through all past unrecoreded weeks and record
        uint256 pointTimestampIterator = lastWeek.timestamp.div(epochUnit).mul(epochUnit);
        while (pointTimestampIterator != timestamp) {
            pointTimestampIterator = Math.min(pointTimestampIterator.add(epochUnit), timestamp);
            int256 deltaSlope = slopeChanges[pointTimestampIterator];
            int256 deltaTime = pointTimestampIterator.sub(lastWeek.timestamp).toInt256();
            lastWeek.bias = lastWeek.bias.sub(lastWeek.slope.mul(deltaTime));
            lastWeek.slope = lastWeek.slope.add(deltaSlope);
            lastWeek.bias = lastWeek.bias > 0 ? lastWeek.bias : 0;
            lastWeek.slope = lastWeek.slope > 0 ? lastWeek.slope : 0;
            lastWeek.timestamp = pointTimestampIterator;
            pointHistory.push(lastWeek);
        }
        return lastWeek;
    }

    /// @dev Update slope changes
    function _updateSlopeChanges(
        LibLockTOS.SlopeChange memory changeNew,
        LibLockTOS.SlopeChange memory changeOld
    ) internal {
        int256 deltaSlopeNew = slopeChanges[changeNew.changeTime];
        int256 deltaSlopeOld = slopeChanges[changeOld.changeTime];
        if (changeOld.changeTime > block.timestamp) {
            deltaSlopeOld = deltaSlopeOld.add(changeOld.slope);
            if (changeOld.changeTime == changeNew.changeTime) {
                deltaSlopeOld = deltaSlopeOld.sub(changeNew.slope);
            }
            slopeChanges[changeOld.changeTime] = deltaSlopeOld;
        }
        if (changeNew.changeTime > block.timestamp && changeNew.changeTime > changeOld.changeTime) {
            deltaSlopeNew = deltaSlopeNew.sub(changeNew.slope);
            slopeChanges[changeNew.changeTime] = deltaSlopeNew;
        }
    }
}