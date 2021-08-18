// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibLockTOS.sol";


interface ILockTOS {
    /// @dev Set phase3 start time
    function setPhase3StartTime(uint256 _phase3StartTime) external;

    /// @dev Returns all locks of `_addr`
    function locksOf(address _addr) external view returns (uint256[] memory);
    
    /// @dev Returns all locks of `_addr`
    function locksInfo(uint256 _lockId) external view returns (uint256, uint256, uint256, int256);

    /// @dev Returns all history of `_addr`
    function pointHistoryOf(uint256 _lockId) external view returns (LibLockTOS.Point[] memory);

    /// @dev Total vote weight
    function totalSupply() external view returns (uint256);

    /// @dev Total vote weight at `_timestamp`
    function totalSupplyAt(uint256 _timestamp) external view returns (uint256);

    /// @dev Vote weight of lock at `_timestamp`
    function balanceOfLockAt(uint256 _lockId, uint256 _timestamp) external view returns (uint256);

    /// @dev Vote weight of lock
    function balanceOfLock(uint256 _lockId) external view returns (uint256);

    /// @dev Vote weight of a user at `_timestamp`
    function balanceOfAt(address _addr, uint256 _timestamp) external view returns (uint256 balance);

    /// @dev Vote weight of a iser
    function balanceOf(address _addr) external view returns (uint256 balance);

    /// @dev Increase amount
    function increaseAmount(uint256 _lockId, uint256 _value) external;

    /// @dev Deposits value for '_addr'
    function depositFor(address _addr, uint256 _lockId, uint256 _value) external;

    /// @dev Create lock using permit
    function createLockWithPermit(
        uint256 _value,
        uint256 _unlockTime,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external returns (uint256 lockId);

    /// @dev Edit lock (only for test)
    function editLock(
        uint256 _lockId,
        uint256 _start,
        uint256 _end,
        uint256 _value,
        int256 _boostValue
    ) external;

    /// @dev Create lock
    function createLock(uint256 _value, uint256 _unlockTime) external returns (uint256 lockId);

    /// @dev Increase 
    function increaseUnlockTime(uint256 _lockId, uint256 unlockTime) external;

    /// @dev Withdraw all TOS
    function withdrawAll() external;

    /// @dev Withdraw TOS
    function withdraw(uint256 _lockId) external;

    /// @dev Global checkpoint
    function globalCheckpoint() external;
}
