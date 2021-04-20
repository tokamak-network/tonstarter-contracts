//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;
import "../libraries/LibTokenMining.sol";
interface IFLDVault {
    function setFLD(address _ton) external;
    function approveFLD(address _to, uint256 _amount) external;
    function approveERC20(address _token, address _to, uint256 _amount) external;
    function claimFLD(address _to, uint256 _amount) external returns (bool);
    function claimERC20(address _token, address _to, uint256 _amount) external;

    function VaultInfo(bytes32 _hash) external view returns (LibTokenMining.VAULT memory _vaultInfo);
    function addPhaseVault(bytes32 _hash, uint256 _total) external;
    function changeVaultTotal(uint _index, uint256 _total) external ;

    function claimVault(address _to, uint256 _amount)
        external
        returns (bool);
    function validClaimVault(uint256 _amount) external  returns (bool);
}
