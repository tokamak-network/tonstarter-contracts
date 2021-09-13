// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ICustomCommonLib {

    function checkCurrentPosition(address poolAddress, int24 tickLower, int24 tickUpper)
        external
        view
        returns (bool);
}