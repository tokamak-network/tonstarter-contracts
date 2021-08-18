// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../libraries/LibLockTOS.sol";

/// @title The base storage of stakeContract
contract LockTOSStorage {
    /// @dev flag for pause proxy
    bool public pauseProxy;

    uint256 public constant ONE_WEEK = 1 weeks;
    uint256 public constant MAXTIME = 3 * (365 days); // 3 years
    uint256 public constant MULTIPLIER = 1e18;

    LibLockTOS.Point[] public pointHistory;
    mapping (uint256 => LibLockTOS.Point[]) public lockPointHistory;
    mapping (address => mapping(uint256 =>LibLockTOS.LockedBalance)) public lockedBalances;

    mapping (uint256 => LibLockTOS.LockedBalance) public allLocks;
    mapping (address => uint256[]) public userLocks;
    mapping (uint256 => int256) public slopeChanges;
    mapping (uint256 => bool) public inUse;

    address public tos;
    uint256 public lockIdCounter = 1;
    uint256 public phase3StartTime;
    uint256 internal free = 1;
}
