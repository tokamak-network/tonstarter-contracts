pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/ILockTOS.sol";

import "hardhat/console.sol";

contract LockTOS is ILockTOS, AccessControl {
  uint256 public constant ONE_WEEK = 1 weeks;
  uint256 public constant MAXTIME = 4 * (365 days);
  // uint256 public totalSupply = 0;

  Point[] private pointHistory;
  mapping (address => Point[]) public userPointHistory;
  mapping (address => LockedBalance) public lockedBalances;
  mapping (uint256 => int128) public slopeChanges;
  address public tos;


  constructor(address _tos) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    tos = _tos;
  }

  /// @inheritdoc ILockTOS
  function increaseAmount(uint256 _value) override external {
    depositFor(msg.sender, _value);
  }


  /// @inheritdoc ILockTOS
  function depositFor(address _addr, uint256 _value) override public {
    require(_value > 0, "Value locked should be non-zero");
    require(lockedBalances[msg.sender].end > block.timestamp, "Withdraw old tokens");
    require(lockedBalances[msg.sender].amount == 0, "Withdraw old tokens");
    _deposit(_addr, _value, 0);
  }

  /// @inheritdoc ILockTOS
  function createLock(uint256 _value, uint256 _unlockTime) override external {
    require(_value > 0, "Value locked should be non-zero");
    require (_unlockTime > block.timestamp, "Unlock time");
    require(lockedBalances[msg.sender].amount == 0, "Withdraw old tokens");

    uint256 unlockTime = (_unlockTime / ONE_WEEK) * ONE_WEEK;
    _deposit(msg.sender, _value, unlockTime);
  }

  /// @inheritdoc ILockTOS
  function increaseUnlockTime(uint256 unlockTime) override external {
    require (lockedBalances[msg.sender].end > block.timestamp, "Unlock time");
    require (lockedBalances[msg.sender].end < unlockTime, "Unlock time");
    require(lockedBalances[msg.sender].amount > 0, "No existing locked TOS");
    _deposit(msg.sender, 0, unlockTime);
  }

  /// @inheritdoc ILockTOS
  function withdraw() override external {
    LockedBalance memory lockedOld = lockedBalances[msg.sender];
    LockedBalance memory lockedNew = LockedBalance({amount: 0, end: 0});
    require(lockedOld.end < block.timestamp, "");

    lockedBalances[msg.sender] = lockedNew;
    _checkpoint(lockedNew, lockedOld);
  }

  /// @inheritdoc ILockTOS
  function voteWeightOf(address _addr) override public view returns (int128) {
    if (userPointHistory[_addr].length == 0) return 0;
    Point memory lastPoint = userPointHistory[_addr][userPointHistory[_addr].length - 1];
    int128 currentBias = lastPoint.slope * int128(block.timestamp - lastPoint.timestamp + 1);
    console.log("Vote Weight: %d", uint256(currentBias));
    return lastPoint.bias > currentBias ? lastPoint.bias - currentBias : 0;
  }

  /// @inheritdoc ILockTOS
  function voteWeightOfAt(address _addr, uint256 _timestamp) override external view returns (int128) {
    (bool success, Point memory point) = _findClosestPoint(userPointHistory[_addr], _timestamp);
    if (!success) {
      return 0;
    }
    int128 currentBias = point.slope * int128(_timestamp - point.timestamp);
    console.log("Vote Weight At: %d", uint256(currentBias));
    return point.bias > currentBias ? point.bias - currentBias : 0;
  }

  /// @dev Finds closest point
  function _findClosestPoint(Point[] storage _history, uint256 _timestamp) internal view returns (bool success, Point memory point) {
    if (_history.length == 0) {
      return (false, point);
    }

    uint256 left = 0;
    uint256  right = _history.length - 1;
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
  function _deposit(address _addr, uint256 _value, uint256 _unlockTime) internal {
    LockedBalance memory lockedOld = lockedBalances[_addr];
    LockedBalance memory lockedNew = LockedBalance({amount: lockedOld.amount, end: lockedOld.end});

    lockedNew.amount += _value;
    if (_unlockTime > 0) {
      lockedNew.end = _unlockTime;
    }
    _checkpoint(lockedNew, lockedOld);

    // Transfer tos
    IERC20(tos).transferFrom(_addr, address(this), _value);

    // Save user point
    int128 userSlope = int128(lockedNew.amount / MAXTIME);
    int128 userBias = userSlope * int128(lockedNew.end - block.timestamp);
    console.log("Deposit, amount: %d, end: %d", uint256(lockedNew.amount), uint256(lockedNew.end));
    console.log("Time: %d", block.timestamp);
    console.log("MAXTIME: %d", MAXTIME);
    console.log("Deposit, bias: %d, slope: %d", uint256(userBias), uint256(userSlope));

    Point memory userPoint = Point({
      timestamp: block.timestamp,
      slope: userSlope,
      bias: userBias
    });
    userPointHistory[_addr].push(userPoint);
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

    // Compute history
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
      lastWeek = Point({bias: 0, slope: 0, timestamp: timestamp});
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