// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {StakeDefiProxy} from "../stake/StakeDefiProxy.sol";

contract StakeDefiFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    address public stakeDefiLogic;

    constructor(address _stakeDefiLogic) {
        require(_stakeDefiLogic != address(0), "StakeDefiFactory zero");
        stakeDefiLogic = _stakeDefiLogic;
    }

    function create(
        address[3] memory _addr,
        address _registry,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address) {
        StakeDefiProxy proxy = new StakeDefiProxy(stakeDefiLogic);
        require(address(proxy) != address(0), "proxy zero");

        proxy.setInit(_addr, _registry, _intdata);
        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
