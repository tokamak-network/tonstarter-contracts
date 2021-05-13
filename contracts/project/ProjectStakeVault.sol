//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IProject {
    function developer() external view returns (address);

    function startBlock() external view returns (uint256);

    function endBlock() external view returns (uint256);

    function token() external view returns (address);

    function pair() external view returns (address);
}

contract ProjectStakeVault is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public project;
    address public staketoken;

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

    function initialize(address _project, address _staketoken)
        external
        onlyOwner
    {
        require(
            _project != address(0) && _staketoken != address(0),
            "ProjectStakeVault: zero"
        );
        project = _project;
        staketoken = _staketoken;
    }
}
