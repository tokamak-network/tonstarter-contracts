// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IStakeTONProxyFactory {
    function deploy(
        address _logic,
        address[4] calldata _addr,
        address _registry,
        uint256[3] calldata _intdata,
        address owner
    ) external returns (address);
}
