pragma solidity ^0.7.6;


interface ILockTOS {
    /// @dev Returns all locks of `_addr`
    function locksOf(address _addr) external view returns (uint256[] memory);

    /// @dev Total vote weight
    function totalVoteWeight() external view returns (int128);

    /// @dev Total vote weight at `_timestamp`
    function totalVoteWeightAt(uint256 _timestamp) external view returns (int128);

    /// @dev Vote weight of lock at `_timestamp`
    function voteWeightOfLockAt(address _addr, uint256 _lockId, uint256 _timestamp) external view returns (int128);

    /// @dev Vote weight of lock
    function voteWeightOfLock(address _addr, uint256 _lockId) external view returns (int128);

    /// @dev Vote weight of a user at `_timestamp`
    function voteWeightOfAt(address _addr, uint256 _timestamp) external view returns (int128);

    /// @dev Vote weight of a iser
    function voteWeightOf(address _addr) external view returns (int128 voteWeight);

    /// @dev Increase amount
    function increaseAmount(uint256 _lockId, uint256 _value) external;

    /// @dev Deposits value for '_addr'
    function depositFor(address _addr, uint256 _lockId, uint256 _value) external;

    /// @dev Create lock
    function createLock(uint256 _value, uint256 _unlockTime) external returns (uint256 lockId);

    /// @dev Increase 
    function increaseUnlockTime(uint256 _lockId, uint256 unlockTime) external;

    /// @dev Withdraw TOS
    function withdraw(uint256 _lockId) external;

    /// @dev Global checkpoint
    function globalCheckpoint() external;
}
