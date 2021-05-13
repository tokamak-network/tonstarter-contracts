// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {ProjectStakeVault} from "../project/ProjectStakeVault.sol";

contract ProjectStakeVaultFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    function deploy(
        address project,
        address token
    ) public returns (address) {

        ProjectStakeVault vault = new ProjectStakeVault();
        vault.initialize(project, token);

        vault.grantRole(ADMIN_ROLE, msg.sender);

        vault.revokeRole(ADMIN_ROLE, address(this));
        return address(vault);
    }
}
