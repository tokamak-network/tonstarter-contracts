// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { SafeMath } from "../utils/math/SafeMath.sol";

import "./StakeProxyStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import { IStakeFactory } from "../interfaces/IStakeFactory.sol";
import { IStakeRegistry } from "../interfaces/IStakeRegistry.sol";
import { IStake1Vault } from "../interfaces/IStake1Vault.sol";
import { IStake1 } from "../interfaces/IStake1.sol";
import { Stake1Vault } from "./Stake1Vault.sol";

contract Stake1Logic is StakeProxyStorage, AccessControl {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant ZERO_HASH = 0x0000000000000000000000000000000000000000000000000000000000000000;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Stake1Proxy: Caller is not an admin");
        _;
    }

    modifier nonZero(address _addr) {
        require(_addr != address(0), "Stake1Proxy: zero address");
        _;
    }
    modifier nonZeroHash(bytes32 _hash) {
        require(_hash != ZERO_HASH, "Stake1Proxy: zero hash");
        _;
    }

    //////////////////////////////
    // Events
    //////////////////////////////
    event CreatedVault(address indexed vault, address paytoken, uint256 cap);


    //////////////////////////////////////////////////////////////////////
    // setters
    function setStore(
        address _fld,
        address _stakeRegistry,
        address _stakeFactory,
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager
    )
        external
        onlyOwner
        nonZero(_ton)
        nonZero(_wton)
        nonZero(_depositManager)
    {
        setFLD(_fld);
        setStakeRegistry(_stakeRegistry);
        setStakeFactory(_stakeFactory);
        ton =  _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;
    }

    function setFLD(address _fld) public  onlyOwner nonZero(_fld) {
        fld = _fld;
    }

    function setStakeRegistry(address _stakeRegistry) public  onlyOwner nonZero(_stakeRegistry) {
        stakeRegistry = IStakeRegistry(_stakeRegistry);
    }

    function setStakeFactory(address _stakeFactory) public   onlyOwner nonZero(_stakeFactory) {
        stakeFactory = IStakeFactory(_stakeFactory);
    }

    //////////////////////////////////////////////////////////////////////
    // Admin Functions
    function createVault(
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlcok,
        uint256 _stakeStartBlcok,
        uint256 _pahse,
        bytes32 _vaultName
    )   external
    {
        Stake1Vault vault = new Stake1Vault();
        vault.initialize(fld, _paytoken, _cap, _saleStartBlcok, _stakeStartBlcok, address(stakeFactory));
        stakeRegistry.addVault(_pahse, _vaultName, address(vault));

        emit CreatedVault(address(vault), _paytoken, _cap);
    }

    function createStakeContract(
        uint256 _pahse,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name
    )   external onlyOwner
    {
        require(stakeRegistry.validVault(_pahse, _vault), "Stake1Proxy: unvalidVault");
        // solhint-disable-next-line max-line-length
        address _contract = stakeFactory.deploy(_pahse, _vault, _name, token, paytoken, periodBlock, [ton, wton, depositManager, seigManager]);
        require(_contract != address(0), "Stake1Proxy: stakeFactory.deploy fail");
        stakeRegistry.addStakeContract(_vault, _contract);
    }

    function closeSale(
        address _vault
    )
        external
    {
        IStake1Vault(_vault).closeSale();
    }

    function addVault(
        uint _pahse,
        bytes32 _vaultName,
        address _vault
    )   external onlyOwner
    {
        stakeRegistry.addVault(_pahse, _vaultName, _vault);
    }

    function stakeContractsOfVault(address _vault)
        external view nonZero(_vault)
        returns (address[] memory)
    {
        return IStake1Vault(_vault).stakeAddressesAll();
    }

    function vaultsOfPahse(uint256 _phaseIndex)
        external view
        returns (address[] memory)
    {
        return stakeRegistry.phasesAll(_phaseIndex);
    }

    function tokamakStaking(
        address _stakeContract,
        address _layer2,
        uint256 _amount
    )   external onlyOwner
    {
        IStake1(_stakeContract).tokamakStaking(_layer2, _amount);
    }

    function tokamakRequestUnStakingAll(
        address _stakeContract,
        address _layer2
    )   external onlyOwner
    {
        IStake1(_stakeContract).tokamakRequestUnStakingAll(_layer2);
    }

    function tokamakRequestUnStaking(
        address _stakeContract,
        address _layer2,
        uint256 _amount
    )   external onlyOwner
    {
        IStake1(_stakeContract).tokamakRequestUnStaking(_layer2, _amount);
    }

    function tokamakProcessUnStaking(
        address _stakeContract,
        address _layer2,
        bool receiveTON
    )   external onlyOwner
    {
        IStake1(_stakeContract).tokamakProcessUnStaking(_layer2, receiveTON);
    }
}