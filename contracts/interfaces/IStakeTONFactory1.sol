//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTONFactory1 {
    function create(
        address[4] memory _addr,
        address[4] memory _tokamak,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address);
}
