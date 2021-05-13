// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {ProjectToken} from "../project/ProjectToken.sol";

contract ProjectTokenFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    function deploy(
        string memory _tokenName,
        string memory _symbol,
        uint256 _totalSupply,
        address to
    ) public returns (address) {

        ProjectToken token = new ProjectToken(
            _tokenName,
            _symbol,
            _totalSupply,
            to
        );

        token.grantRole(ADMIN_ROLE, to);
        token.revokeRole(ADMIN_ROLE, address(this));
        return address(token);
    }
}
