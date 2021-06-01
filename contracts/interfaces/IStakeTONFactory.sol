//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTONFactory {
    function create(
        address[4] calldata _addr,
        address _registry,
        uint256[3] calldata _intdata,
        address owner
    ) external returns (address);
}
