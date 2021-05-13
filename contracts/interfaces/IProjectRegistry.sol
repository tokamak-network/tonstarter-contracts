//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import {LibProject} from "../libraries/LibProject.sol";

interface IProjectRegistry {

    function registerProject(
        uint256 _projectId,
        address _project,
        uint256 startBlock,
        uint256 endBlock,
        address token,
        string memory name,
        string memory symbol
    ) external ;

    function validProject(address _project)
        external
        view
        returns (bool valid);

    function projectById(uint256 _index)
        external
        view
        returns (address);

   function ProjectInfoDetail(address _project)
        external
        view
        returns (LibProject.ProjectInfo memory);

}
