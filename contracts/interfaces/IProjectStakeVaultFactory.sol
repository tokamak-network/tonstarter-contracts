//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IProjectStakeVaultFactory {
    function deploy(address project, address token) external returns (address);
}
