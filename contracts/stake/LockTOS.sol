pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/ILockTOS.sol";

contract LockTOS is ILockTOS, AccessControl {
  Point[] private pointHistory;
  mapping (address => Point[]) public userPointHistory;
  mapping (address => LockedBalance) public lockedBalances;
  mapping (uint256 => int128) public slopeChanges;

  uint256 public constant ONE_WEEK = 1 weeks;
  uint256 public constant MAXTIME = 4 * (365 days);
  uint256 public constant MULTIPLIER = 1e18;
  address public tos;

  constructor(address _tos) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    tos = _tos;
  }

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

  function _recordHistoryPoints() internal returns (Point memory lastWeekPoint) {
    uint256 timestamp = block.timestamp;
    if (pointHistory.length > 0) {
      lastWeekPoint = pointHistory[pointHistory.length - 1];
    } else {
      lastWeekPoint = Point({bias: 0, slope: 0, timestamp: timestamp, blockNumber: block.number});
    }

    uint256 pointTimestampIterator = (lastWeekPoint.timestamp / ONE_WEEK) * ONE_WEEK;
    while (pointTimestampIterator != timestamp) {
      pointTimestampIterator = Math.min(pointTimestampIterator + ONE_WEEK, timestamp);

      int128 deltaSlope = slopeChanges[pointTimestampIterator];
      uint256 deltaTime = pointTimestampIterator - lastWeekPoint.timestamp;
      lastWeekPoint.bias -= lastWeekPoint.slope * int128(deltaTime);
      lastWeekPoint.slope += deltaSlope;
      lastWeekPoint.bias = lastWeekPoint.bias > 0 ? lastWeekPoint.bias : 0;
      lastWeekPoint.slope = lastWeekPoint.slope > 0 ? lastWeekPoint.slope : 0;
      lastWeekPoint.timestamp = pointTimestampIterator;
      pointHistory.push(lastWeekPoint);
    }
    return lastWeekPoint;
  }

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
    Point memory userPoint = Point({
      timestamp: block.timestamp,
      blockNumber: block.number,
      slope: userSlope,
      bias: userBias
    });
    userPointHistory[_addr].push(userPoint);
  }

  function increaseAmount(uint256 _value) override external {
    depositFor(msg.sender, _value);
  }

  function depositFor(address _addr, uint256 _value) override public {
    require(_value > 0, "Value locked should be non-zero");
    require(lockedBalances[msg.sender].end > block.timestamp, "Withdraw old tokens");
    require(lockedBalances[msg.sender].amount == 0, "Withdraw old tokens");
    _deposit(_addr, _value, 0);
  }

  function createLock(uint256 _value, uint256 _unlockTime) override external {
    require(_value > 0, "Value locked should be non-zero");
    require (_unlockTime > block.timestamp, "Unlock time");
    require(lockedBalances[msg.sender].amount == 0, "Withdraw old tokens");

    uint256 unlockTime = (_unlockTime / ONE_WEEK) * ONE_WEEK;
    _deposit(msg.sender, _value, unlockTime);
  }

  function increaseUnlockTime(uint256 unlockTime) override external {
    require (lockedBalances[msg.sender].end > block.timestamp, "Unlock time");
    require (lockedBalances[msg.sender].end > unlockTime, "Unlock time");
    require(lockedBalances[msg.sender].amount > 0, "No existing locked TOS");
    _deposit(msg.sender, 0, unlockTime);
  }
}