// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {ProjectDevVault} from "../project/ProjectDevVault.sol";

contract ProjectDevVaultFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    function deploy(
        address project
    ) public returns (address) {

        ProjectDevVault vault = new ProjectDevVault();
        vault.initialize(project);

        vault.grantRole(ADMIN_ROLE, msg.sender);

        vault.revokeRole(ADMIN_ROLE, address(this));
        return address(vault);
    }
}
