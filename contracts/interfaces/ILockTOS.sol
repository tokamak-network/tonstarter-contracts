pragma solidity ^0.7.6;


interface ILockTOS {
    /// @dev Returns all locks of `_addr`
    function locksOf(address _addr) external view returns (uint256[] memory);

    /// @dev Total vote weight
    function totalSupply() external view returns (int128);

    /// @dev Total vote weight at `_timestamp`
    function totalSupplyAt(uint256 _timestamp) external view returns (int128);

    /// @dev Vote weight of lock at `_timestamp`
    function balanceOfLockAt(address _addr, uint256 _lockId, uint256 _timestamp) external view returns (int128);

    /// @dev Vote weight of lock
    function balanceOfLock(address _addr, uint256 _lockId) external view returns (int128);

    /// @dev Vote weight of a user at `_timestamp`
    function balanceOfAt(address _addr, uint256 _timestamp) external view returns (int128 balance);

    /// @dev Vote weight of a iser
    function balanceOf(address _addr) external view returns (int128 balance);

    /// @dev Increase amount
    function increaseAmount(uint256 _lockId, uint256 _value) external;

    /// @dev Deposits value for '_addr'
    function depositFor(address _addr, uint256 _lockId, uint256 _value) external;

    /// @dev Create lock using permit
    function createLockPermit(
        uint256 _value,
        uint256 _unlockTime,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external returns (uint256 lockId);

    /// @dev Create lock
    function createLock(uint256 _value, uint256 _unlockTime) external returns (uint256 lockId);

    /// @dev Increase 
    function increaseUnlockTime(uint256 _lockId, uint256 unlockTime) external;

    /// @dev Withdraw TOS
    function withdraw(uint256 _lockId) external;

    /// @dev Global checkpoint
    function globalCheckpoint() external;
}
