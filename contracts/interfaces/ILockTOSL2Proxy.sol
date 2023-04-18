//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface ILockTOSL2Proxy {
    /// @dev initialize
    function initialize(
        address _tos,
        uint256 _epochUnit,
        uint256 _maxTime
    ) external;
}
