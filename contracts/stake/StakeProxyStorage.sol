//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import {IStakeFactory} from "../interfaces/IStakeFactory.sol";
import {IStakeRegistry} from "../interfaces/IStakeRegistry.sol";

contract StakeProxyStorage {
    IStakeRegistry public stakeRegistry;
    IStakeFactory public stakeFactory;
    uint256 public secondsPerBlock;
    address public fld;

    address public ton;
    address public wton;
    address public depositManager;
    address public seigManager;
    //address public uniswapRouter;
    //address public yearnV2Vault;

    modifier validStakeRegistry() {
        require(
            address(stakeRegistry) != address(0),
            "StakeStorage: stakeRegistry is zero"
        );
        _;
    }

    modifier validStakeFactory() {
        require(
            address(stakeFactory) != address(0),
            "StakeStorage: invalid stakeFactory"
        );
        _;
    }
}