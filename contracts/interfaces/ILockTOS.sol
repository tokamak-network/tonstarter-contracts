pragma solidity ^0.7.6;

interface ILockTOS {
  struct Point {
    int128 bias;
    int128 slope;
    uint256 timestamp;
    uint256 blockNumber;
  }

  struct LockedBalance {
    uint256 amount;
    uint256 end;
  }

  struct SlopeChange {
    int128 bias;
    int128 slope;
    uint256 changeTime;
  }

  /// @dev Increase amount
  function increaseAmount(uint256 _value) external;

  /// @dev Deposits value for '_addr'
  function depositFor(address _addr, uint256 _value) external;

  /// @dev Create lock
  function createLock(uint256 _value, uint256 _unlockTime) external;

  /// @dev Increase 
  function increaseUnlockTime(uint256 unlockTime) external;
}
