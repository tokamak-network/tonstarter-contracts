//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTON_NEW {

    function version() external returns (string memory);

    function getVaultAddress() external returns (address);

}
