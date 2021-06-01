// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStake1Logic.sol";
import {IProxy} from "../interfaces/IProxy.sol";
import {IStakeFactory} from "../interfaces/IStakeFactory.sol";
import {IStakeRegistry} from "../interfaces/IStakeRegistry.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IStakeTONTokamak} from "../interfaces/IStakeTONTokamak.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./StakeProxyStorage.sol";

/// @title The logic of FLD Plaform
/// @notice Admin can createVault, createStakeContract.
/// User can excute the tokamak staking function of each contract through this logic.
contract Stake1Logic is StakeProxyStorage, AccessControl, IStake1Logic {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "");
        _;
    }

    modifier nonZero(address _addr) {
        require(_addr != address(0), "Stake1Logic:zero address");
        _;
    }

    event CreatedVault(address indexed vault, address paytoken, uint256 cap);
    event CreatedStakeContract(
        address indexed vault,
        address indexed stakeContract,
        uint256 phase
    );
    event ClosedSale(address indexed vault);
    event SetStakeRegistry(address stakeRegistry);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev upgrade to the logic of _stakeProxy
    /// @param _stakeProxy the StakeProxy address
    /// @param _implementation new logic address
    function upgradeStakeTo(address _stakeProxy, address _implementation)
        external
        onlyOwner
    {
        IProxy(_stakeProxy).upgradeTo(_implementation);
    }

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "Stake1Logic: same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev grant the role to account in target
    /// @param target target address
    /// @param role  byte32 of role
    /// @param account account address
    function grantRole(
        address target,
        bytes32 role,
        address account
    ) external onlyOwner {
        (bool success, ) =
            target.call(
                abi.encodeWithSignature(
                    "grantRole(bytes32,address)",
                    role,
                    account
                )
            );
        require(success, "Stake1Logic: grantRole fail");
    }

    /// @dev revoke the role to account in target
    /// @param target target address
    /// @param role  byte32 of role
    /// @param account account address
    function revokeRole(
        address target,
        bytes32 role,
        address account
    ) external onlyOwner {
        (bool success, ) =
            target.call(
                abi.encodeWithSignature(
                    "revokeRole(bytes32,address)",
                    role,
                    account
                )
            );
        require(success, "Stake1Logic: revokeRole fail");
    }

    /// @dev Sets FLD address
    /// @param _fld new FLD address
    function setFLD(address _fld) public onlyOwner nonZero(_fld) {
        fld = _fld;
    }

    /// @dev Sets Stake Registry address
    /// @param _stakeRegistry new StakeRegistry address
    function setStakeRegistry(address _stakeRegistry)
        public
        onlyOwner
        nonZero(_stakeRegistry)
    {
        stakeRegistry = IStakeRegistry(_stakeRegistry);
        emit SetStakeRegistry(_stakeRegistry);
    }

    /// @dev Sets StakeFactory address
    /// @param _stakeFactory new StakeFactory address
    function setStakeFactory(address _stakeFactory)
        public
        onlyOwner
        nonZero(_stakeFactory)
    {
        stakeFactory = IStakeFactory(_stakeFactory);
    }

    /// @dev Sets StakeTONFactory address
    /// @param _stakeTONFactory new StakeTONFactory address
    function setStakeTONFactory(address _stakeTONFactory)
        public
        onlyOwner
        nonZero(_stakeTONFactory)
    {
        stakeFactory.setStakeTONFactory(_stakeTONFactory);
    }

    /// @dev Sets StakeSimpleFactory address
    /// @param _stakeSimpleFactory new StakeSimpleFactory address
    function setStakeSimpleFactory(address _stakeSimpleFactory)
        public
        onlyOwner
        nonZero(_stakeSimpleFactory)
    {
        stakeFactory.setStakeSimpleFactory(_stakeSimpleFactory);
    }

    /// @dev Sets StakeDefiFactory address
    /// @param _stakeDefiFactory new StakeDefiFactory address
    function setStakeDefiFactory(address _stakeDefiFactory)
        public
        onlyOwner
        nonZero(_stakeDefiFactory)
    {
        stakeFactory.setStakeDefiFactory(_stakeDefiFactory);
    }

    /// @dev Sets StakeVaultFactory address
    /// @param _stakeVaultFactory new StakeVaultFactory address
    function setStakeVaultFactory(address _stakeVaultFactory)
        public
        onlyOwner
        nonZero(_stakeVaultFactory)
    {
        stakeVaultFactory = IStakeVaultFactory(_stakeVaultFactory);
    }

    /// Set initial variables
    /// @param _fld  FLD token address
    /// @param _stakeRegistry the registry address
    /// @param _stakeFactory the StakeFactory address
    /// @param _stakeVaultFactory the StakeVaultFactory address
    /// @param _ton  TON address in Tokamak
    /// @param _wton WTON address in Tokamak
    /// @param _depositManager DepositManager address in Tokamak
    /// @param _seigManager SeigManager address in Tokamak
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
        override
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

    /// @dev create vault
    /// @param _paytoken the token used for staking by user
    /// @param _cap  allocated reward amount
    /// @param _saleStartBlock  the start block that can stake by user
    /// @param _stakeStartBlock the start block that end staking by user and start that can claim reward by user
    /// @param _phase  phase of FLD platform
    /// @param _vaultName  vault's name's hash
    /// @param _stakeType  stakeContract's type, if 0, StakeTON, else if 1 , StakeSimple , else if 2, StakeDefi
    /// @param _defiAddr  extra defi address , default is zero address
    function createVault(
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        uint256 _phase,
        bytes32 _vaultName,
        uint256 _stakeType,
        address _defiAddr
    ) external override nonZero(address(stakeVaultFactory)) {
        address vault =
            stakeVaultFactory.create(
                [fld, _paytoken, address(stakeFactory), _defiAddr],
                [_stakeType, _cap, _saleStartBlock, _stakeStartBlock],
                address(this)
            );
        require(vault != address(0), "Stake1Logic: vault is zero");
        stakeRegistry.addVault(vault, _phase, _vaultName);

        emit CreatedVault(vault, _paytoken, _cap);
    }

    /// @dev create stake contract in vault
    /// @param _phase the phase of FLD platform
    /// @param _vault  vault's address
    /// @param token  the reward token's address
    /// @param paytoken  the token used for staking by user
    /// @param periodBlock  the period that generate reward
    /// @param _name  the stake contract's name
    function createStakeContract(
        uint256 _phase,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name
    ) external override onlyOwner {
        require(
            stakeRegistry.validVault(_phase, _vault),
            "Stake1Logic: unvalidVault"
        );

        IStake1Vault vault = IStake1Vault(_vault);

        (
            address[2] memory addrInfos,
            ,
            uint256 stakeType,
            uint256[3] memory iniInfo,
            ,

        ) = vault.infos();

        require(paytoken == addrInfos[0], "Stake1Logic: differrent paytoken");
        uint256 phase = _phase;
        address[4] memory _addr = [token, addrInfos[0], _vault, addrInfos[1]];

        // solhint-disable-next-line max-line-length
        address _contract =
            stakeFactory.create(
                stakeType,
                _addr,
                address(stakeRegistry),
                iniInfo
            );
        require(_contract != address(0), "Stake1Logic: deploy fail");

        IStake1Vault(_vault).addSubVaultOfStake(_name, _contract, periodBlock);
        stakeRegistry.addStakeContract(address(vault), _contract);

        emit CreatedStakeContract(address(vault), _contract, phase);
    }

    /// @dev create stake contract in vault
    /// @param _phase phase of FLD platform
    /// @param _vaultName vault's name's hash
    /// @param _vault vault's address
    function addVault(
        uint256 _phase,
        bytes32 _vaultName,
        address _vault
    ) external override onlyOwner {
        stakeRegistry.addVault(_vault, _phase, _vaultName);
    }

    /// @dev end to staking by user
    /// @param _vault vault's address
    function closeSale(address _vault) external override {
        IStake1Vault(_vault).closeSale();

        emit ClosedSale(_vault);
    }

    /// @dev list of stakeContracts in vault
    /// @param _vault vault's address
    function stakeContractsOfVault(address _vault)
        external
        view
        override
        nonZero(_vault)
        returns (address[] memory)
    {
        return IStake1Vault(_vault).stakeAddressesAll();
    }

    /// @dev list of vaults in _phaseIndex phase
    /// @param _phaseIndex the phase number
    function vaultsOfPhase(uint256 _phaseIndex)
        external
        view
        override
        returns (address[] memory)
    {
        return stakeRegistry.phasesAll(_phaseIndex);
    }

    /// @dev stake in tokamak's layer2
    /// @param _stakeContract the stakeContract's address
    /// @param _layer2 the layer2 address in Tokamak
    function tokamakStaking(address _stakeContract, address _layer2)
        external
        override
    {
        IStakeTONTokamak(_stakeContract).tokamakStaking(_layer2);
    }

    /// @dev Requests unstaking in tokamak's layer2
    /// @param _stakeContract the stakeContract's address
    /// @param _layer2 the layer2 address in Tokamak
    /// @param amount the amount of unstaking
    function tokamakRequestUnStaking(
        address _stakeContract,
        address _layer2,
        uint256 amount
    ) external override {
        IStakeTONTokamak(_stakeContract).tokamakRequestUnStaking(
            _layer2,
            amount
        );
    }

    /// @dev Processes unstaking the requested unstaking amount in tokamak's layer2
    /// @param _stakeContract the stakeContract's address
    /// @param _layer2 the layer2 address in Tokamak
    function tokamakProcessUnStaking(address _stakeContract, address _layer2)
        external
        override
    {
        IStakeTONTokamak(_stakeContract).tokamakProcessUnStaking(_layer2);
    }

    /// @dev Swap TON to FLD using uniswap v3
    /// @dev this function used in StakeTON ( stakeType=0 )
    /// @param _stakeContract the stakeContract's address
    /// @param amountIn the input amount
    /// @param amountOutMinimum the minimun output amount
    /// @param deadline deadline
    /// @param sqrtPriceLimitX96 sqrtPriceLimitX96
    /// @param _type the function type, if 0, use exactInputSingle function, else if, use exactInput function
    function exchangeWTONtoFLD(
        address _stakeContract,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline,
        uint160 sqrtPriceLimitX96,
        uint256 _type
    ) external override returns (uint256 amountOut) {
        return
            IStakeTONTokamak(_stakeContract).exchangeWTONtoFLD(
                amountIn,
                amountOutMinimum,
                deadline,
                sqrtPriceLimitX96,
                _type
            );
    }

    /// @dev Swap TON to FLD
    function exchangeWTONtoFLDv2(
        address _stakeContract,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline,
        uint160 sqrtPriceLimitX96,
        uint256 _type
    ) external returns (uint256 amountOut) {
        return
            IStakeTONTokamak(_stakeContract).exchangeWTONtoFLDv2(
                amountIn,
                amountOutMinimum,
                deadline,
                sqrtPriceLimitX96,
                _type
            );
    }

    /// @dev Get addresses of vaults of index phase
    /// @param _phase the pahse number
    function vaultsOfPahse(uint256 _phase)
        external
        view
        override
        nonZero(address(stakeRegistry))
        returns (address[] memory)
    {
        return stakeRegistry.phasesAll(_phase);
    }
}
