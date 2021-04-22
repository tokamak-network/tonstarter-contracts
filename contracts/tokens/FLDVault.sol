//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;
import "@openzeppelin/contracts/access/AccessControl.sol";
import { IFLDVault } from "../interfaces/IFLDVault.sol";
import { IFLD } from "../interfaces/IFLD.sol";
import { IERC20 } from "../interfaces/IERC20.sol";

import "../libraries/LibTokenMining.sol";
/**
FLD Token's Vault
*/
contract FLDVault is  IFLDVault , AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER");
    bytes32 public constant ZERO_HASH = 0x0000000000000000000000000000000000000000000000000000000000000000;

    IFLD public fld;

    mapping(bytes32 => LibTokenMining.VAULT) private vault;
    mapping(address => bytes32) public contractVaultName;
    bytes32[] public PhaseVaultHash;

    //mapping(bytes32 => uint) private lock;
    uint private _lock;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "FLDVault: Caller is not an admin");
        _;
    }

    modifier onlyClaimer() {
        require(hasRole(CLAIMER_ROLE, msg.sender), "FLDVault: Caller is not a claimer");
        _;
    }

    modifier lock() {
        require(_lock == 0, "FLDVault: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }
    //////////////////////////////
    // Events
    //////////////////////////////

    event ClaimedFLD(address indexed from, address indexed to, uint256 amount);
    event ClaimedToken(address indexed token, address indexed from, address indexed to, uint256 amount);
    event Approved(address indexed token, address indexed to, uint256 amount);
    event ClaimVault(address indexed from, bytes32 indexed vaultHash, address to, uint256 amount);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CLAIMER_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(CLAIMER_ROLE, msg.sender);

        //PhaseVaulthash.push(keccak256("PHASE1_VAULT"));
        //PhaseVaulthash.push(keccak256("PHASE2_VAULT"));
    }


    receive() external payable {

    }

    /**
    * Returns the vault information.
    */
    function VaultInfo(bytes32 _hash) external view override returns (LibTokenMining.VAULT memory _vaultInfo) {
        return vault[_hash];
    }

    /**
    * Set the FLD address.
    */
    function setFLD(address _fld) external override onlyOwner {
        require(_fld != address(0), "FLDVault: input is zero");
        fld = IFLD(_fld);
    }

    /**
    * Add a vault with a specific name (_hash) and put _total amount.
    */
    function addPhaseVault(bytes32 _hash, uint256 _total) external override onlyOwner {
        require(_hash != ZERO_HASH && _total > 0 && vault[_hash].total == 0 , "FLDVault: addPhaseVault is fail");
        PhaseVaultHash.push(_hash);
        vault[_hash].total = _total;
    }

    /**
    * set Contract Vault Name of sender (contract).
    */
    function setContractVaultName(address to, bytes32 _hash) external override onlyOwner {
        require(_hash != ZERO_HASH, "FLDVault: setContractVaultName input is zero");
        contractVaultName[to] = _hash;
    }

    /**
    * change the cap of vault.
    */
    function changeVaultTotal(uint _index, uint256 _total) external override onlyOwner {
        require(_index < PhaseVaultHash.length && _total > 0 , "FLDVault:setVaultTotal: input is zero");
        vault[PhaseVaultHash[_index]].total = _total;
    }

    /**
    * The sender authorize spender(_to) to spend sender's FLD tokens in the amount(_amount).
    */
    function approveFLD(address _to, uint256 _amount) external override onlyClaimer {
        fld.approve(_to, _amount);
        emit Approved(address(fld), _to, _amount);
    }

    /**
    * The sender approves spender(_to) to spend sender's  tokens(_token) in the amount(_amount).
    */
    /// @notice Approves ERC20 token to specific address
    /// @param _token Token address
    /// @param _to Address to be approved
    /// @param _amount Approving ERC20 token amount
    function approveERC20(address _token, address _to, uint256 _amount) external override onlyClaimer {
        IERC20(_token).approve(_to, _amount);
        emit Approved(address(_token), _to, _amount);
    }

    /**
    * The sender approves spender(_to) to spend sender's  tokens(_token) in the amount(_amount).
    */
    function claimVault(address _to, uint256 _amount)
        external lock override
        returns (bool)
    {
        require(contractVaultName[msg.sender] != ZERO_HASH, "FLDVault: contract vault name is zero");

        bytes32 vaultHash = contractVaultName[msg.sender];
        require(vault[vaultHash].total > 0, "FLDVault: claimVault total is zero");
        require(vault[vaultHash].total - (vault[vaultHash].used + _amount) >= 0,
             "FLDVault: vault is lack.");

        LibTokenMining.VAULT storage _vault = vault[vaultHash];
        _vault.used += _amount;

        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "FLDVault:claimVault: not enough balance");

        require(fld.transfer(_to, _amount));
        emit ClaimVault(msg.sender, vaultHash, _to, _amount);
        return true;
    }

    /**
    * check if you can claim FLD.
    */
    function validClaimVault(uint256 _amount) external view override returns (bool) {
        require(contractVaultName[msg.sender] != ZERO_HASH, "FLDVault: contract vault name is zero");
        bytes32 vaultHash = contractVaultName[msg.sender];
        return vault[vaultHash].total - (vault[vaultHash].used + _amount) >= 0;
    }

    /**
    * Returns the FLD balance stored in the vault.
    */
    function claimFLDAvailableAmount()
        external
        view
        onlyClaimer
        returns (uint256)
    {
        return  fld.balanceOf(address(this));
    }

    /**
    * The vault sends FLD to addressTo as much as _amount.
    */
    function claimFLD(address _to, uint256 _amount)
        external
        override
        onlyClaimer
        returns (bool)
    {
        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "FLDVault: not enough balance");

        fld.transfer(_to, _amount);
        emit ClaimedFLD(msg.sender, _to, _amount);
        return true;
    }

    /**
    * The vault sends _token to addressTo as much as _amount.
    */
    /// @notice Transfers ERC20 token to specific address
    /// @param _to Address to receive
    /// @param _amount Transfer ERC20 token amount
    function claimERC20(address _token, address _to, uint256 _amount)
        external
        override
        onlyClaimer
    {
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "FLDVault: not enough balance");
        IERC20(_token).transfer(_to, _amount);
        emit ClaimedToken(_token, msg.sender, _to, _amount);
    }

    function _toRAY(uint256 v) internal pure returns (uint256) {
        return v * 10 ** 9;
    }

    function _toWAD(uint256 v) internal pure returns (uint256) {
        return v / 10 ** 9;
    }

}
