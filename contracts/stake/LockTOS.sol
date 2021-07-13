pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/ILockTOS.sol";

import "hardhat/console.sol";

contract LockTOS is ILockTOS, AccessControl {
  uint256 public constant ONE_WEEK = 1 weeks;
  uint256 public constant MAXTIME = 3 * (365 days); // 3 years
  uint256 public constant MULTIPLIER = 1e18;

  Point[] private pointHistory;
  mapping (address => mapping(uint256 => Point[])) public userPointHistory;
  mapping (address => mapping(uint256 => LockedBalance)) public lockedBalances;

  mapping (address => uint256[]) public userLocks;
  mapping (uint256 => int128) public slopeChanges;
  address public tos;
  uint256 public lockIdCounter = 1;

  uint256 public phase3StartTime;

  constructor(address _tos, uint256 _phase3StartTime) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    tos = _tos;
    phase3StartTime = _phase3StartTime;
  }

  /// @inheritdoc ILockTOS
  function lockInfo(address _addr, uint256 _lockId) override external view returns (uint256,uint256, uint256) {
    return (
      lockedBalances[_addr][_lockId].start,
      lockedBalances[_addr][_lockId].end,
      lockedBalances[_addr][_lockId].amount
    );
  }

  /// @inheritdoc ILockTOS
  function increaseAmount(uint256 _lockId, uint256 _value) override external {
    depositFor(msg.sender, _lockId,  _value);
  }


  /// @inheritdoc ILockTOS
  function depositFor(address _addr, uint256 _lockId, uint256 _value) override public {
    require(_value > 0, "Value locked should be non-zero");
    LockedBalance memory locked = lockedBalances[_addr][_lockId];
    require(locked.end > block.timestamp, "Withdraw old tokens");
    require(locked.amount == 0, "Withdraw old tokens");
    _deposit(_addr, _lockId, _value, 0);
  }

  /// @inheritdoc ILockTOS
  function createLock(uint256 _value, uint256 _unlockTime) override external returns (uint256 lockId) {
    require(_value > 0, "Value locked should be non-zero");
    require (_unlockTime > block.timestamp + ONE_WEEK, "Unlock time");

    lockId = lockIdCounter ++;

    uint256 unlockTime = (_unlockTime / ONE_WEEK) * ONE_WEEK;
    _deposit(msg.sender, lockId,  _value, unlockTime);
    userLocks[msg.sender].push(lockId);
  }

  /// @inheritdoc ILockTOS
  function increaseUnlockTime(uint256 _lockId, uint256 _unlockTime) override external {
    LockedBalance memory lock = lockedBalances[msg.sender][_lockId];
    require (lock.end > block.timestamp, "Unlock time");
    require (lock.end < _unlockTime, "Unlock time");
    require(lock.amount > 0, "No existing locked TOS");
    _deposit(msg.sender, _lockId, 0, _unlockTime);
  }

  /// @inheritdoc ILockTOS
  function withdraw(uint256 _lockId) override external {
    LockedBalance memory lockedOld = lockedBalances[msg.sender][_lockId];
    LockedBalance memory lockedNew = LockedBalance({amount: 0, start: 0, end: 0});
    require(lockedOld.end < block.timestamp, "");
    require(lockedOld.amount != 0, "");
    _checkpoint(lockedNew, lockedOld);
    IERC20(tos).transferFrom(address(this), msg.sender, lockedOld.amount);
    lockedBalances[msg.sender][_lockId] = lockedNew;   
  }

  /// @inheritdoc ILockTOS
  function totalVoteWeightAt(uint256 _timestamp) override public view returns (int128) {
    (bool success, Point memory point) = _findClosestPoint(pointHistory, _timestamp);
    if (!success) {
      return 0;
    }
    int128 currentBias = point.slope * int128(_timestamp - point.timestamp);
    return (point.bias > currentBias ? point.bias - currentBias : 0) * point.boostValue;
  }

  /// @inheritdoc ILockTOS
  function totalVoteWeight() override external view returns (int128) {
    if (pointHistory.length == 0) {
      return 0;
    }

    Point memory point = pointHistory[pointHistory.length - 1];
    int128 currentBias = point.slope * int128(block.timestamp - point.timestamp);
    return (point.bias > currentBias ? point.bias - currentBias : 0) * point.boostValue;
  }

  /// @inheritdoc ILockTOS
  function voteWeightOfLockAt(address _addr, uint256 _lockId, uint256 _timestamp) override public view returns (int128) {
    (bool success, Point memory point) = _findClosestPoint(userPointHistory[_addr][_lockId], _timestamp);
    if (!success) {
      return 0;
    }
    int128 currentBias = point.slope * int128(_timestamp - point.timestamp);
    return (point.bias > currentBias ? point.bias - currentBias : 0) * point.boostValue;
  }

  /// @inheritdoc ILockTOS
  function voteWeightOfLock(address _addr, uint256 _lockId) override public view returns (int128) {
    uint256 len = userPointHistory[_addr][_lockId].length;
    if (len == 0) {
      return 0;
    }

    Point memory point = userPointHistory[_addr][_lockId][len - 1];
    int128 currentBias = point.slope * int128(block.timestamp - point.timestamp);
    return (point.bias > currentBias ? point.bias - currentBias : 0) * point.boostValue;
  }

  /// @inheritdoc ILockTOS
  function voteWeightOfAt(address _addr, uint256 _timestamp) override public view returns (int128 voteWeight) {
    uint256[] memory locks = userLocks[_addr];
    if (locks.length == 0) return 0;
    for (uint256 i = 0; i < locks.length; ++i) {
      voteWeight += voteWeightOfLockAt(_addr, locks[i], _timestamp);
    }
  }

  /// @inheritdoc ILockTOS
  function voteWeightOf(address _addr) override public view returns (int128 voteWeight) {
    uint256[] memory locks = userLocks[_addr];
    if (locks.length == 0) return 0;
    for (uint256 i = 0; i < locks.length; ++i) {
      voteWeight += voteWeightOfLock(_addr, locks[i]);
    }
  }

  /// @inheritdoc ILockTOS
  function locksOf(address _addr) override public view returns (uint256[] memory) {
    return userLocks[_addr];
  }

  /// @dev Finds closest point
  function _findClosestPoint(Point[] storage _history, uint256 _timestamp) internal view returns (bool success, Point memory point) {
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
    return (true, _history[left]);
  }

  /// @dev Deposit
  function _deposit(address _addr, uint256 _lockId, uint256 _value, uint256 _unlockTime) internal {
    LockedBalance memory lockedOld = lockedBalances[_addr][_lockId];
    LockedBalance memory lockedNew = LockedBalance({amount: lockedOld.amount, start: block.timestamp, end: lockedOld.end});

    lockedNew.amount += _value;
    if (_unlockTime > 0) {
      lockedNew.end = _unlockTime;
    }
    _checkpoint(lockedNew, lockedOld);

    // Transfer tos
    IERC20(tos).transferFrom(_addr, address(this), _value);

    // Save user point
    int128 userSlope = int128(lockedNew.amount * MULTIPLIER / MAXTIME);
    int128 userBias = userSlope * int128(lockedNew.end - block.timestamp);
    console.log("Deposit, amount: %d, end: %d", uint256(lockedNew.amount), uint256(lockedNew.end));
    console.log("Time: %d", block.timestamp);
    console.log("MAXTIME: %d", MAXTIME);
    console.log("Deposit, bias: %d, slope: %d", uint256(userBias), uint256(userSlope));
    Point memory userPoint = Point({
      timestamp: block.timestamp,
      slope: userSlope,
      bias: userBias,
      boostValue: 1
    });
    if (userPoint.timestamp < phase3StartTime) {
      // userPoint.boostValue = 2;
    }
    userPointHistory[_addr][_lockId].push(userPoint);
  }

  /// @dev Apply changes
  function globalCheckpoint() external {
    _recordHistoryPoints();
  }

  /// @dev Apply changes
  function _checkpoint(
    LockedBalance memory lockedNew,
    LockedBalance memory lockedOld
  ) internal {
    uint256 timestamp = block.timestamp;
    SlopeChange memory changeNew = SlopeChange({slope: 0, bias: 0, changeTime: 0});
    SlopeChange memory changeOld = SlopeChange({slope: 0, bias: 0, changeTime: 0});

    if (lockedNew.end > timestamp && lockedNew.amount > 0) {
      changeNew.slope = int128(lockedNew.amount / MAXTIME);
      changeNew.bias = changeNew.slope * int128(lockedNew.end - timestamp);
      changeNew.changeTime = lockedNew.end;
    }
    if (lockedOld.end > timestamp && lockedOld.amount > 0) {
      changeOld.slope = int128(lockedNew.amount / MAXTIME);
      changeOld.bias = changeOld.slope * int128(lockedNew.end - timestamp);
      changeOld.changeTime = lockedNew.end;
    }

    // Record history gaps
    Point memory currentWeekPoint = _recordHistoryPoints();
    currentWeekPoint.bias += (changeNew.bias - changeOld.bias);
    currentWeekPoint.slope += (changeNew.slope - changeOld.slope);
    currentWeekPoint.bias = currentWeekPoint.bias > 0 ? currentWeekPoint.bias : 0;
    currentWeekPoint.slope = currentWeekPoint.slope > 0 ? currentWeekPoint.slope : 0;
    pointHistory.push(currentWeekPoint);

    // Update slope changes
    _updateSlopeChanges(changeNew, changeOld);
  }

  /// @dev Fill the gaps
  function _recordHistoryPoints() internal returns (Point memory lastWeek) {
    uint256 timestamp = block.timestamp;
    if (pointHistory.length > 0) {
      lastWeek = pointHistory[pointHistory.length - 1];
    } else {
      lastWeek = Point({bias: 0, slope: 0, boostValue: 1, timestamp: timestamp});
    }

    uint256 pointTimestampIterator = (lastWeek.timestamp / ONE_WEEK) * ONE_WEEK;
    while (pointTimestampIterator != timestamp) {
      pointTimestampIterator = Math.min(pointTimestampIterator + ONE_WEEK, timestamp);

      int128 deltaSlope = slopeChanges[pointTimestampIterator];
      uint256 deltaTime = pointTimestampIterator - lastWeek.timestamp;
      lastWeek.bias -= lastWeek.slope * int128(deltaTime);
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
    SlopeChange memory changeNew,
    SlopeChange memory changeOld
  ) internal {
    int128 deltaSlopeNew = 0;
    int128 deltaSlopeOld = slopeChanges[changeOld.changeTime];
    if (changeNew.changeTime != 0) {
      if (changeNew.changeTime == changeOld.changeTime) {
        deltaSlopeNew = deltaSlopeOld;
      } else {
        deltaSlopeNew = slopeChanges[changeNew.changeTime];
      }
    }
    if (changeOld.changeTime > block.timestamp) {
      deltaSlopeOld += changeOld.slope;
      if (changeOld.changeTime == changeNew.changeTime) {
        deltaSlopeOld -= changeNew.slope;
      }
      slopeChanges[changeOld.changeTime] = deltaSlopeOld;
    }
    if (changeNew.changeTime > block.timestamp &&changeNew.changeTime > changeOld.changeTime) {
      deltaSlopeNew -= changeNew.slope;
      slopeChanges[changeNew.changeTime] = deltaSlopeNew;
    }
  }
}