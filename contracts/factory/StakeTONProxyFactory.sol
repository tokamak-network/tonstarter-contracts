// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {StakeTONProxy} from "../stake/StakeTONProxy.sol";

contract StakeTONProxyFactory {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    function deploy
    (
        address _logic,
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address) {

        StakeTONProxy proxy = new StakeTONProxy(_logic);

        require(address(proxy) != address(0), "StakeTONProxy zero");

        proxy.setInit(_addr, _registry, _intdata);

        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
