//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeVaultFactory {
    function create(
        address[4] memory _addr,
        uint256[4] memory _intInfo,
        address owner
    ) external returns (address);
}
