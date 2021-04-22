//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;
import "../libraries/LibTokenMining.sol";
interface IFLDVault {

    /**
    * Set the FLD address.
    */
    function setFLD(address _ton) external;
    function approveFLD(address _to, uint256 _amount) external;
    function approveERC20(address _token, address _to, uint256 _amount) external;

    /**
    * The vault sends FLD to addressTo as much as _amount.
    */
    function claimFLD(address _to, uint256 _amount) external returns (bool);

    /**
    * The vault sends _token to addressTo as much as _amount.
    */
    function claimERC20(address _token, address _to, uint256 _amount) external;

    /**
    * Returns the vault information.
    */
    function VaultInfo(bytes32 _hash) external view returns (LibTokenMining.VAULT memory _vaultInfo);

    /**
    * Add a vault with a specific name (_hash) and put _total amount.
    */
    function addPhaseVault(bytes32 _hash, uint256 _total) external;

    /**
    * set Contract Vault Name of sender (contract).
    */
    function setContractVaultName(address to, bytes32 _hash) external;

    /**
    * change the cap of vault.
    */
    function changeVaultTotal(uint _index, uint256 _total) external ;

    /**
    * The sender approves spender(_to) to spend sender's  tokens(_token) in the amount(_amount).
    */
    function claimVault(address _to, uint256 _amount)
        external
        returns (bool);

    /**
    * check if you can claim FLD.
    */
    function validClaimVault(uint256 _amount) external  returns (bool);
}
