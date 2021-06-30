// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./AccessRoleCommon.sol";

contract AccessibleCommon is AccessRoleCommon, AccessControl {

    modifier onlyOwner() {

        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Accessible: Caller is not an admin"
        );
        _;
    }

    function setAdmin() public onlyOwner {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }


    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external virtual onlyOwner {
        require(msg.sender != newOwner, "Accessible: same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }

}