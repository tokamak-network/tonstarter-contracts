//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import {LibProject} from "../libraries/LibProject.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import {IFLD} from "../interfaces/IFLD.sol";

contract ProjectRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    uint256 public projectMaxIndex;
    uint256[] public tokenSalesIndex; // token sale id , if token sale close, change 0

    mapping(uint256 => address) public projectId; // project id -> project address
    mapping(address => LibProject.ProjectInfo) public projectInfo; // project address -> project simple info
    mapping(uint256 => LibProject.TokenSale) public tokenSales; // token sale id -> token sale simple info

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "ProjectRegistry: Caller is not an admin"
        );
        _;
    }

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev register project
    function registerProject(
        uint256 _projectId,
        address _project,
        uint256 startBlock,
        uint256 endBlock,
        address token,
        string memory name,
        string memory symbol
    ) external onlyOwner {

        require(_project != address(0),
            "ProjectRegistry: project is zero"
        );
        require(projectId[_projectId] == address(0),
            "ProjectRegistry: Already registered"
        );

        if (_projectId > projectMaxIndex) projectMaxIndex = _projectId;
        projectId[_projectId] = _project;

        LibProject.ProjectInfo storage info = projectInfo[_project];
        info.startBlock = startBlock;
        info.endBlock = endBlock;
        info.token = token;
        info.name = name;
        info.symbol = symbol;
        info.deployed = true;
    }

    /// @dev Checks if a vault is withing the given phase
    function validProject(address _project)
        external
        view
        returns (bool valid)
    {
        valid = projectInfo[_project].deployed;
    }

    function projectById(uint256 _index)
        external
        view
        returns (address)
    {
        return projectId[_index];
    }

    function ProjectInfoDetail(address _project)
        external
        view
        returns (LibProject.ProjectInfo memory)
    {
        return projectInfo[_project];
    }
}
