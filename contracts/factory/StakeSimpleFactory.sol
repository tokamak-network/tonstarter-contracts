// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {StakeSimple} from "../stake/StakeSimple.sol";
import {StakeSimpleProxy} from "../stake/StakeSimpleProxy.sol";

contract StakeSimpleFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeSimpleLogic;

    constructor(address _stakeSimpleLogic) {
        require(
            _stakeSimpleLogic != address(0),
            "StakeSimpleFactory zero"
        );
        stakeSimpleLogic = _stakeSimpleLogic;
    }

    function create
    (
        address[3] memory _addr,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address) {

        // StakeSimple logic = new StakeSimple();
        // require(address(logic) != address(0), "logic zero");

        StakeSimpleProxy proxy = new StakeSimpleProxy(stakeSimpleLogic);
        require(address(proxy) != address(0), "proxy zero");

        proxy.setInit(_addr, _intdata);
        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
