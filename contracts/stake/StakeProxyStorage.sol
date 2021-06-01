//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IStakeProxyStorage.sol";
import {IStakeFactory} from "../interfaces/IStakeFactory.sol";
import {IStakeRegistry} from "../interfaces/IStakeRegistry.sol";
import {IStakeVaultFactory} from "../interfaces/IStakeVaultFactory.sol";

/// @title The storage of StakeProxy
contract StakeProxyStorage is IStakeProxyStorage {
    /// @dev stakeRegistry
    IStakeRegistry public stakeRegistry;

    /// @dev stakeFactory
    IStakeFactory public stakeFactory;

    /// @dev stakeVaultFactory
    IStakeVaultFactory public stakeVaultFactory;

    /// @dev FLD address
    address public override fld;

    /// @dev TON address in Tokamak
    address public override ton;

    /// @dev WTON address in Tokamak
    address public override wton;

    /// @dev Depositmanager address in Tokamak
    address public override depositManager;

    /// @dev SeigManager address in Tokamak
    address public override seigManager;
}
