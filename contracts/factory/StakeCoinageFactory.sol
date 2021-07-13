// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {AutoRefactorCoinage} from "../tokens/AutoRefactorCoinage.sol";
import {IStakeCoinageFactory} from "../interfaces/IStakeCoinageFactory.sol";

contract StakeCoinageFactory is IStakeCoinageFactory {
    uint256 public constant RAY = 10**27; // 1 RAY
    uint256 internal constant _DEFAULT_FACTOR = RAY;

    function deploy() external override returns (address) {
        AutoRefactorCoinage c =
            new AutoRefactorCoinage("", "", _DEFAULT_FACTOR);

        //c.addMinter(msg.sender);
        //c.renounceMinter();
        //c.transferOwnership(msg.sender);

        //c.transferAdmin(msg.sender);

        return address(c);
    }
}
