//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IProjectDevVaultFactory {

    function deploy(
        address project
    ) external returns (address);

}
