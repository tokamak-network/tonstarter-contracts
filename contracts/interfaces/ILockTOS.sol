pragma solidity ^0.7.6;

interface ILockTOS {
  struct Point {
    int128 bias;
    int128 slope;
    uint256 timestamp;
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

  /// @dev Returns current vote weight at
  function voteWeightOf(address _addr) external view returns (int128);

  /// @dev Returns vote weight at `_timestamp`
  function voteWeightOfAt(address _addr, uint256 _timestamp) external view returns (int128);

  /// @dev Increase amount
  function increaseAmount(uint256 _value) external;

  /// @dev Deposits value for '_addr'
  function depositFor(address _addr, uint256 _value) external;

  /// @dev Create lock
  function createLock(uint256 _value, uint256 _unlockTime) external;

  /// @dev Increase 
  function increaseUnlockTime(uint256 unlockTime) external;
  
  /// @dev Withdraw TOS
  function withdraw() external;
  }
