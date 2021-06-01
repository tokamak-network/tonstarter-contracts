//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeProxy {

    /// @dev Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external;

    /// @dev Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external;

    /// @dev view implementation address
    /// @return the logic address
    function implementation() external view returns (address);
}
