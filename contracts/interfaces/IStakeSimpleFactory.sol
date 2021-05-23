//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeSimpleFactory {
    function create(
        address[3] memory _addr,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address);
}
