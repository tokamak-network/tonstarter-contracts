//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

contract BaseStorage  {
    bool public pauseProxy;

    mapping(uint256 => address) public proxyImplementation;
    mapping(address => bool) public aliveImplementation;
    mapping(bytes4 => address) public selectorImplementation;
}