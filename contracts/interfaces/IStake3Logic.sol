//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStake3Logic {

    /// @dev event on create vault
    /// @param vault the vault address created
    /// @param paytoken the token used for staking by user
    /// @param cap  allocated reward amount
    event CreatedVault(address indexed vault, address paytoken, uint256 cap);

    /// @dev event on create stake contract in vault
    /// @param vault the vault address
    /// @param stakeContract the stake contract address created
    /// @param phase the phase of TOS platform
    event CreatedStakeContract(
        address indexed vault,
        address indexed stakeContract,
        uint256 phase
    );

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
    ) external;

}
