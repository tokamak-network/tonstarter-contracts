//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import {IStakeFactory} from "../interfaces/IStakeFactory.sol";
import {IStakeRegistry} from "../interfaces/IStakeRegistry.sol";
import {IStakeVaultFactory} from "../interfaces/IStakeVaultFactory.sol";

contract StakeProxyStorage {
    IStakeRegistry public stakeRegistry;
    IStakeFactory public stakeFactory;
    IStakeVaultFactory public stakeVaultFactory;

    address public fld;
    address public ton;
    address public wton;
    address public depositManager;
    address public seigManager;
}
