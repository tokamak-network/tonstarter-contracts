// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/ILockTOS.sol";
import "../interfaces/ITOS.sol";
import "../libraries/LibLockTOS.sol";


contract LockTOS is ILockTOS {
    uint256 public constant ONE_WEEK = 1 weeks;
    uint256 public constant MAXTIME = 3 * (365 days); // 3 years
    uint256 public constant MULTIPLIER = 1e18;

    LibLockTOS.Point[] private pointHistory;
    mapping (uint256 => LibLockTOS.Point[]) public lockPointHistory;
    mapping (address => mapping(uint256 =>LibLockTOS.LockedBalance)) public lockedBalances;

    mapping (uint256 =>LibLockTOS.LockedBalance) public allLocks;
    mapping (address => uint256[]) public userLocks;
    mapping (uint256 => int256) public slopeChanges;
    address public tos;
    uint256 public lockIdCounter = 1;
    uint256 public phase3StartTime;


    constructor(address _tos, uint256 _phase3StartTime) {
        tos = _tos;
        phase3StartTime = _phase3StartTime;
    }

    /// @inheritdoc ILockTOS
    function increaseAmount(uint256 _lockId, uint256 _value) override external {
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
    ) override external returns (uint256 lockId) {
        ITOS(tos).permit(
            msg.sender,
            address(this),
            _value,
            _deadline,
            _v,
            _r,
            _s
        );
        createLock(_value, _unlockWeeks);
    }

    /// @inheritdoc ILockTOS
    function createLock(uint256 _value, uint256 _unlockWeeks) override public returns (uint256 lockId) {
        require(_value > 0, "Value locked should be non-zero");
        require (_unlockWeeks > 0, "Unlock period less than a week");

        lockId = lockIdCounter ++;
        uint256 unlockTime = block.timestamp + _unlockWeeks * ONE_WEEK;
        unlockTime = (unlockTime / ONE_WEEK) * ONE_WEEK;
        require(unlockTime - block.timestamp < MAXTIME, "Max unlock time is 3 years");
        _deposit(msg.sender, lockId, _value, unlockTime);
        userLocks[msg.sender].push(lockId);
    }

    /// @inheritdoc ILockTOS
    function increaseUnlockTime(uint256 _lockId, uint256 _unlockWeeks) override external {
        require (_unlockWeeks > 0, "Unlock period less than a week");

       LibLockTOS.LockedBalance memory lock = lockedBalances[msg.sender][_lockId];
        uint256 unlockTime = lock.end + _unlockWeeks * ONE_WEEK;
        unlockTime = (unlockTime / ONE_WEEK) * ONE_WEEK;
        require(unlockTime - lock.start < MAXTIME, "Max unlock time is 3 years");
        require (lock.end > block.timestamp, "Lock time already finished");
        require (lock.end < unlockTime, "New lock time must be greater");
        require(lock.amount > 0, "No existing locked TOS");
        _deposit(msg.sender, _lockId, 0, unlockTime);
    }

    /// @inheritdoc ILockTOS
    function withdraw(uint256 _lockId) override external {
       LibLockTOS.LockedBalance memory lockedOld = lockedBalances[msg.sender][_lockId];
       LibLockTOS.LockedBalance memory lockedNew =LibLockTOS.LockedBalance({amount: 0, start: 0, end: 0});
        require(lockedOld.start > 0, "Lock does not exist");
        require(lockedOld.end < block.timestamp, "Lock time not finished");
        require(lockedOld.amount > 0, "Already withdrawn");
        _checkpoint(lockedNew, lockedOld);
        
        IERC20(tos).transfer(msg.sender, lockedOld.amount);
        lockedBalances[msg.sender][_lockId] = lockedNew;   
    }

    /// @inheritdoc ILockTOS
    function globalCheckpoint() override external {
        _recordHistoryPoints();
    }

    /// @inheritdoc ILockTOS
    function depositFor(address _addr, uint256 _lockId, uint256 _value) override public {
        require(_value > 0, "Value locked should be non-zero");
       LibLockTOS.LockedBalance memory locked = lockedBalances[_addr][_lockId];
        require(locked.start > 0, "Lock does not exist");
        require(locked.end > block.timestamp, "Lock time is finished");
        _deposit(_addr, _lockId, _value, 0);
    }

    /// @inheritdoc ILockTOS
    function totalSupplyAt(uint256 _timestamp) override public view returns (uint256) {
        (bool success, LibLockTOS.Point memory point) = _findClosestPoint(pointHistory, _timestamp);
        if (!success) {
            return 0;
        }
        int256 currentBias = point.slope * int256(_timestamp - point.timestamp);
        return uint256(point.bias > currentBias ? point.bias - currentBias : 0) / MULTIPLIER;
    }

    /// @inheritdoc ILockTOS
    function totalSupply() override external view returns (uint256) {
        if (pointHistory.length == 0) {
            return 0;
        }

        LibLockTOS.Point memory point = pointHistory[pointHistory.length - 1];
        int256 currentBias = point.slope * int256(block.timestamp - point.timestamp);
        return uint256(point.bias > currentBias ? point.bias - currentBias : 0) / MULTIPLIER;
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
        int256 currentBias = point.slope * int256(_timestamp - point.timestamp);
        return uint256(point.bias > currentBias ? point.bias - currentBias : 0) / MULTIPLIER;
    }

    /// @inheritdoc ILockTOS
    function balanceOfLock(uint256 _lockId) override public view returns (uint256) {
        uint256 len = lockPointHistory[_lockId].length;
        if (len == 0) {
            return 0;
        }

        LibLockTOS.Point memory point = lockPointHistory[_lockId][len - 1];
        int256 currentBias = point.slope * int256(block.timestamp - point.timestamp);
        return uint256(point.bias > currentBias ? point.bias - currentBias : 0) / MULTIPLIER;
    }

    /// @inheritdoc ILockTOS
    function balanceOfAt(address _addr, uint256 _timestamp) override public view returns (uint256 balance) {
        uint256[] memory locks = userLocks[_addr];
        if (locks.length == 0) return 0;
        for (uint256 i = 0; i < locks.length; ++i) {
            balance += balanceOfLockAt(locks[i], _timestamp);
        }
    }

    /// @inheritdoc ILockTOS
    function balanceOf(address _addr) override public view returns (uint256 balance) {
        uint256[] memory locks = userLocks[_addr];
        if (locks.length == 0) return 0;
        for (uint256 i = 0; i < locks.length; ++i) {
            balance += balanceOfLock(locks[i]);
        }
    }


    function locksInfo(uint256 _lockId)
        override
        public
        view
        returns (uint256, uint256, uint256) 
    {
        return (
            allLocks[_lockId].start,
            allLocks[_lockId].end,
            allLocks[_lockId].amount
        );
    }

    /// @inheritdoc ILockTOS
    function locksOf(address _addr) override public view returns (uint256[] memory) {
        return userLocks[_addr];
    }

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
            uint256 mid = (left + right) / 2;
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
    function _deposit(address _addr, uint256 _lockId, uint256 _value, uint256 _unlockTime) internal {
       LibLockTOS.LockedBalance memory lockedOld = lockedBalances[_addr][_lockId];
       LibLockTOS.LockedBalance memory lockedNew = LibLockTOS.LockedBalance({
            amount: lockedOld.amount,
            start: lockedOld.start,
            end: lockedOld.end
        });

        lockedNew.amount += _value;
        if (_unlockTime > 0) {
            lockedNew.end = _unlockTime;
        }
        if (lockedNew.start == 0) {
            lockedNew.start = block.timestamp;
        }

        _checkpoint(lockedNew, lockedOld);

        // Transfer tos
        IERC20(tos).transferFrom(msg.sender, address(this), _value);
        lockedBalances[_addr][_lockId] = lockedNew;
        allLocks[_lockId] = lockedNew;

        // Save user point
        int256 userSlope = int256(lockedNew.amount * MULTIPLIER / MAXTIME);
        int256 userBias = userSlope * int256(lockedNew.end - block.timestamp);
        LibLockTOS.Point memory userPoint = LibLockTOS.Point({
            timestamp: block.timestamp,
            slope: userSlope * (block.timestamp <= phase3StartTime ? 2 : 1), // Boost slope if staked before phase3
            bias: userBias
        });
        lockPointHistory[_lockId].push(userPoint);
    }

    /// @dev Apply changes
    function _checkpoint(
        LibLockTOS.LockedBalance memory lockedNew,
        LibLockTOS.LockedBalance memory lockedOld
    )
        internal 
    {
        uint256 timestamp = block.timestamp;
        LibLockTOS.SlopeChange memory changeNew = LibLockTOS.SlopeChange({slope: 0, bias: 0, changeTime: 0});
        LibLockTOS.SlopeChange memory changeOld = LibLockTOS.SlopeChange({slope: 0, bias: 0, changeTime: 0});

        if (lockedNew.end > timestamp && lockedNew.amount > 0) {
            changeNew.slope = int256(lockedNew.amount * MULTIPLIER / MAXTIME);
            changeNew.bias = changeNew.slope * int256(lockedNew.end - timestamp);
            changeNew.changeTime = lockedNew.end;
        }
        if (lockedOld.end > timestamp && lockedOld.amount > 0) {
            changeOld.slope = int256(lockedOld.amount * MULTIPLIER / MAXTIME);
            changeOld.bias = changeOld.slope * int256(lockedOld.end - timestamp);
            changeOld.changeTime = lockedOld.end;
        }

        // Record history gaps
        LibLockTOS.Point memory currentWeekPoint = _recordHistoryPoints();
        currentWeekPoint.bias += (changeNew.bias - changeOld.bias);
        currentWeekPoint.slope += (changeNew.slope - changeOld.slope);
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

        uint256 pointTimestampIterator = (lastWeek.timestamp / ONE_WEEK) * ONE_WEEK;
        while (pointTimestampIterator != timestamp) {
            pointTimestampIterator = Math.min(pointTimestampIterator + ONE_WEEK, timestamp);

            int256 deltaSlope = slopeChanges[pointTimestampIterator];
            uint256 deltaTime = pointTimestampIterator - lastWeek.timestamp;
            lastWeek.bias -= lastWeek.slope * int256(deltaTime);
            lastWeek.slope += deltaSlope;
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
            deltaSlopeOld += changeOld.slope;
            if (changeOld.changeTime == changeNew.changeTime) {
                deltaSlopeOld -= changeNew.slope;
            }
            slopeChanges[changeOld.changeTime] = deltaSlopeOld;
        }
        if (changeNew.changeTime > block.timestamp && changeNew.changeTime > changeOld.changeTime) {
            deltaSlopeNew -= changeNew.slope;
            slopeChanges[changeNew.changeTime] = deltaSlopeNew;
        }
    }
}