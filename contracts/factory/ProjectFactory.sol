// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {Project} from "../project/Project.sol";

contract ProjectFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant DEV_ROLE = keccak256("DEVELOPER");

    function deploy(
        uint256 _projectId,
        string memory _projectName,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _tokenPrice,
        address _developer,
        address _token,
        string memory _tokenName,
        string memory _symbol
    ) public returns (address) {
        Project project = new Project();
        project.initialize(
            _projectId,
            _projectName,
            _startBlock,
            _endBlock,
            _tokenPrice,
            _developer,
            msg.sender,
            _token,
            _tokenName,
            _symbol
        );

        project.grantRole(ADMIN_ROLE, msg.sender);
        project.grantRole(DEV_ROLE, _developer);

        project.revokeRole(ADMIN_ROLE, address(this));
        return address(project);
    }
}
