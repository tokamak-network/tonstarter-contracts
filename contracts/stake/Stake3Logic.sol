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
/*
    /// @dev create stake contract in vault
    /// @param _phase the phase of TOS platform
    /// @param _vault  vault's address
    /// @param token  the reward token's address
    /// @param paytoken  the token used for staking by user
    /// @param periodBlock  the period that generate reward
    /// @param _name  the stake contract's name
    /// @param _logicIndexInVaultFactory  vaultFactory's logic index
    function createStakeContractWithLogicIndex(
        uint256 _phase,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name,
        uint256 _logicIndexInVaultFactory
    ) external override onlyOwner {
        require(
            stakeRegistry.validVault(_phase, _vault),
            "Stake3Logic: unvalidVault"
        );
        require(_logicIndexInVaultFactory == 1, "Stake3Logic: unsupported logicIndex");
        IStake1Vault vault = IStake1Vault(_vault);

        (
            address[2] memory addrInfos,
            ,
            uint256 stakeType,
            uint256[3] memory iniInfo,
            ,

        ) = vault.infos();

        require(paytoken == addrInfos[0], "Stake3Logic: differrent paytoken");
        uint256 phase = _phase;
        address[4] memory _addr = [token, addrInfos[0], _vault, addrInfos[1]];

        // solhint-disable-next-line max-line-length
        address _contract =
            stakeFactory.create(
                stakeType,
                _addr,
                address(stakeRegistry),
                [iniInfo[0], iniInfo[1], periodBlock]
            );
        require(_contract != address(0), "Stake3Logic: deploy fail");

        IStake1Vault(_vault).addSubVaultOfStake(_name, _contract, periodBlock);
        stakeRegistry.addStakeContract(address(vault), _contract);

        emit CreatedStakeContract(address(vault), _contract, phase);
    }
    */
}
