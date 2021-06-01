//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeDefiFactory {
    function create(
        address[3] calldata _addr,
        address _registry,
        uint256[3] calldata _intdata,
        address owner
    ) external returns (address);
}
