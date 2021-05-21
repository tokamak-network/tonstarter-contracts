// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import {SafeMath} from "../utils/math/SafeMath.sol";

import "./StakeProxyStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import {IProxy} from "../interfaces/IProxy.sol";
import {IStakeFactory} from "../interfaces/IStakeFactory.sol";
import {IStakeRegistry} from "../interfaces/IStakeRegistry.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IStakeTON} from "../interfaces/IStakeTON.sol";
import {StakeVaultFactory} from "../factory/StakeVaultFactory.sol";


contract Stake1Logic is StakeProxyStorage, AccessControl {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            ""
        );
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
    event CreatedStakeContract(address indexed vault, address indexed stakeContract, uint256 phase);
    /*
    event ClosedSale(address indexed vault, address from);
    event TokamakStaked(address indexed stakeContract, address from, address layer2);
    event TokamakRequestedUnStakingAll(address indexed stakeContract, address from, address layer2);
    event TokamakRequestedUnStakingReward(address indexed stakeContract, address from, address layer2);
    event TokamakProcessedUnStaking(address indexed stakeContract, address from, address layer2, bool receiveTON);
    */
    event SetStakeFactory(address stakeFactory);
    event SetStakeRegistry(address stakeRegistry);
    event SetStakeTONFactory(address stakeTONFactory);
    event SetStakeStableCoinFactory(address stakeStableCoinFactory);

    //////////////////////////////////////////////////////////////////////
    // setters
    function setStore(
        address _fld,
        address _stakeRegistry,
        address _stakeFactory,
        address _stakeVaultFactory,
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager
    )
        external
        onlyOwner
        nonZero(_stakeVaultFactory)
        nonZero(_ton)
        nonZero(_wton)
        nonZero(_depositManager)
    {
        setFLD(_fld);
        setStakeRegistry(_stakeRegistry);
        setStakeFactory(_stakeFactory);
        stakeVaultFactory = IStakeVaultFactory(_stakeVaultFactory);

        ton = _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;

    }

    ///
    // function setFactory(address _stakeFactory) external onlyOwner {
    //     setStakeFactory(_stakeFactory);
    // }

    //////////////////////////////////////////////////////////////////////
    // Admin Functions
    function createVault(
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        uint256 _phase,
        bytes32 _vaultName,
        uint256 _stakeType,
        address _defiAddr
    ) external nonZero(address(stakeVaultFactory)) {
        /*
        Stake1Vault vault = new Stake1Vault();
        vault.initialize(
            fld,
            _paytoken,
            _cap,
            _saleStartBlcok,
            _stakeStartBlcok,
            address(stakeFactory),
            _stakeType,
            _defiAddr
        );
        stakeRegistry.addVault(address(vault), _phase, _vaultName);

        emit CreatedVault(address(vault), _paytoken, _cap);

        */
        address vault = stakeVaultFactory.create(
            [fld, _paytoken, address(stakeFactory), _defiAddr],
            [_stakeType, _cap, _saleStartBlock, _stakeStartBlock],
            address(this)
        );
        require(vault != address(0), "vault is zero");
        stakeRegistry.addVault(vault, _phase, _vaultName);

        emit CreatedVault(vault, _paytoken, _cap);
    }

    function createStakeContract(
        uint256 _phase,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name
    ) external onlyOwner {
        require(
            stakeRegistry.validVault(_phase, _vault),
            "Stake1Logic: unvalidVault"
        );

        IStake1Vault vault = IStake1Vault(_vault);
        uint256 saleStart = vault.saleStartBlock();
        uint256 stakeStart = vault.stakeStartBlock();
        uint256 stakeType = vault.stakeType();
        address defiAddr = vault.defiAddr();
        uint256 phase = _phase;
        uint256[3] memory iniInfo = [saleStart, stakeStart, periodBlock];
        address[4] memory _addr = [token, paytoken, _vault, defiAddr];
        //address[4] memory tokamakAddr = [ton, wton, depositManager, seigManager];

        // solhint-disable-next-line max-line-length
        address _contract =
            stakeFactory.create(
                phase,
                stakeType,
                _addr,
                address(stakeRegistry),
                iniInfo
            );
        require(
            _contract != address(0),
            "Stake1Logic: deploy fail"
        );

        IStake1Vault(_vault).addSubVaultOfStake(_name, _contract, periodBlock);
        stakeRegistry.addStakeContract(address(vault), _contract);

        emit CreatedStakeContract(address(vault), _contract, phase);
    }

    function currentBlock() external view returns (uint256) {
        return block.number;
    }

    function closeSale(address _vault) external {
        IStake1Vault(_vault).closeSale();

        // emit ClosedSale(_vault, msg.sender);
    }

    function addVault(
        uint256 _phase,
        bytes32 _vaultName,
        address _vault
    ) external onlyOwner {

        stakeRegistry.addVault(_vault, _phase, _vaultName);
    }

    function upgradeStakeTo(address _stakeProxy, address _implementation) external onlyOwner {
        IProxy(_stakeProxy).upgradeTo(_implementation);
    }

    function stakeContractsOfVault(address _vault)
        external
        view
        nonZero(_vault)
        returns (address[] memory)
    {
        return IStake1Vault(_vault).stakeAddressesAll();
    }

    function vaultsOfPhase(uint256 _phaseIndex)
        external
        view
        returns (address[] memory)
    {
        return stakeRegistry.phasesAll(_phaseIndex);
    }

    function tokamakStaking(
        address _stakeContract,
        address _layer2
    ) external {
        IStakeTON(_stakeContract).tokamakStaking(_layer2);
        //emit TokamakStaked(_stakeContract, msg.sender, _layer2);
    }

    /// @dev Requests unstaking all
    function tokamakRequestUnStakingAll(address _stakeContract, address _layer2)
        external
    {
        IStakeTON(_stakeContract).tokamakRequestUnStakingAll(_layer2);
        //emit TokamakRequestedUnStakingAll(_stakeContract, msg.sender, _layer2);
    }

    /// @dev Requests unstaking
    function tokamakRequestUnStakingReward(
        address _stakeContract,
        address _layer2
    ) external {
        IStakeTON(_stakeContract).tokamakRequestUnStakingReward(_layer2);
        //emit TokamakRequestedUnStakingReward(_stakeContract, msg.sender, _layer2);
    }

    /// @dev Processes unstaking
    function tokamakProcessUnStaking(
        address _stakeContract,
        address _layer2,
        bool receiveTON
    ) external {
        IStakeTON(_stakeContract).tokamakProcessUnStaking(_layer2, receiveTON);
        //emit TokamakProcessedUnStaking(_stakeContract, msg.sender, _layer2, receiveTON);
    }

    /// @dev Sets FLD address
    function setFLD(address _fld) public onlyOwner nonZero(_fld) {
        fld = _fld;
    }

    /// @dev Sets Stake Registry address
    function setStakeRegistry(address _stakeRegistry)
        public
        onlyOwner
        nonZero(_stakeRegistry)
    {
        stakeRegistry = IStakeRegistry(_stakeRegistry);
        emit SetStakeRegistry(_stakeRegistry);
    }

    /// @dev Sets Stake Factory address
    function setStakeFactory(address _stakeFactory)
        public
        onlyOwner
        nonZero(_stakeFactory)
    {
        stakeFactory = IStakeFactory(_stakeFactory);
        emit SetStakeFactory(_stakeFactory);
    }

    function setStakeTONFactory(address _stakeTONFactory)
        public
        onlyOwner
        nonZero(_stakeTONFactory)
    {
        stakeFactory.setStakeTONFactory(_stakeTONFactory);
        emit SetStakeTONFactory(_stakeTONFactory);
    }

    function setStakeStableCoinFactory(address _stakeStableCoinFactory)
        public
        onlyOwner
        nonZero(_stakeStableCoinFactory)
    {
        stakeFactory.setStakeStableCoinFactory(_stakeStableCoinFactory);
        emit SetStakeStableCoinFactory(_stakeStableCoinFactory);
    }

    function setStakeVaultFactory(address _stakeVaultFactory)
        public
        onlyOwner
        nonZero(_stakeVaultFactory)
    {
        stakeVaultFactory = IStakeVaultFactory(_stakeVaultFactory);
    }

    function vaultsOfPahse(uint256 _phase)
        public
        view
        nonZero(address(stakeRegistry))
        returns (address[] memory)
    {
        return stakeRegistry.phasesAll(_phase);
    }

    function grantRole(address target, bytes32 role, address account) external onlyOwner  {
        (bool success, ) = target.call(abi.encodeWithSignature("grantRole(bytes32,address)",role, account));
        require(success,"grantRole fail");
    }

    function revokeRole(address target, bytes32 role, address account) external onlyOwner  {
        (bool success, ) = target.call(abi.encodeWithSignature("revokeRole(bytes32,address)",role, account));
        require(success,"revokeRole fail");
    }

}
