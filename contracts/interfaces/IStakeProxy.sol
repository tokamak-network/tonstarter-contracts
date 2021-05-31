//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeProxy {
    function setProxyPause(bool _pause) external;

    function upgradeTo(address impl) external;

    function implementation() external view returns (address);
}
