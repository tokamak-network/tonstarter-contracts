// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStake3Logic.sol";
import {IProxy} from "../interfaces/IProxy.sol";
import {IStakeFactory} from "../interfaces/IStakeFactory.sol";
import {IStakeRegistry} from "../interfaces/IStakeRegistry.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IStakeTONTokamak} from "../interfaces/IStakeTONTokamak.sol";
import {IStakeUniswapV3} from "../interfaces/IStakeUniswapV3.sol";

import "../common/AccessibleCommon.sol";

import "./StakeProxyStorage.sol";

/// @title The logic of TOS Plaform
/// @notice Admin can createVault, createStakeContract.
/// User can excute the tokamak staking function of each contract through this logic.
contract Stake3Logic is StakeProxyStorage, AccessibleCommon, IStake3Logic {
    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "Stake3Logic:zero address");
        _;
    }

    constructor() {}

    /// @dev create vault with particular vault's logic
    /// @param _paytoken the token used for staking by user
    /// @param _cap  allocated reward amount
    /// @param _saleStartBlock  the start block that can stake by user
    /// @param _stakeStartBlock the start block that end staking by user and start that can claim reward by user
    /// @param _phase  phase of TOS platform
    /// @param _vaultName  vault's name's hash
    /// @param _stakeType  stakeContract's type, if 0, StakeTON, else if 1 , StakeSimple , else if 2, StakeDefi
    /// @param _defiAddr  extra defi address , default is zero address
    /// @param _logicIndexInVaultFactory  vaultFactory's logic index
    function createdVaultWithLogicIndex(
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        uint256 _phase,
        bytes32 _vaultName,
        uint256 _stakeType,
        address _defiAddr,
        uint256 _logicIndexInVaultFactory
    ) external override onlyOwner nonZeroAddress(address(stakeVaultFactory)) {
        address vault =
            stakeVaultFactory.create(
                _logicIndexInVaultFactory,
                [tos, _paytoken, address(stakeFactory), _defiAddr],
                [_stakeType, _cap, _saleStartBlock, _stakeStartBlock],
                address(this)
            );
        require(vault != address(0), "Stake3Logic: vault is zero");
        stakeRegistry.addVault(vault, _phase, _vaultName);

        emit CreatedVault(vault, _paytoken, _cap);
    }
}
