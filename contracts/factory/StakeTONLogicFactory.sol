// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {StakeTON} from "../stake/StakeTON.sol";

contract StakeTONLogicFactory {

    function deploy() public returns (address) {
        StakeTON logic = new StakeTON();
        require(address(logic) != address(0), "StakeTONLogic zero");

        return address(logic);
    }
}
