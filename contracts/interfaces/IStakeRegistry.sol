//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeRegistry {
    function addVault(
        uint256 _pahse,
        bytes32 _vaultName,
        address _vault
    ) external;

    function addStakeContract(address _vault, address _stakeContract) external;

    function validVault(uint256 _pahse, address _vault)
        external
        view
        returns (bool valid);

    function phasesAll(uint256 _index) external view returns (address[] memory);

    function stakeContractsOfVaultAll(address _vault)
        external
        view
        returns (address[] memory);
}
