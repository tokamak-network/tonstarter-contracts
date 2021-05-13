//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import {IProject} from "../interfaces/IProject.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ProjectDevVault is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public project;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Project: Caller is not an admin"
        );
        _;
    }

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function initialize(address _project) external onlyOwner {
        project = _project;
    }
}
