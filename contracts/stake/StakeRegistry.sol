//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IStakeRegistry.sol";
import "../libraries/LibTokenStake1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Stake Registry
/// @notice Manage the vault list by phase. Manage the list of staking contracts in the vault.
contract StakeRegistry is AccessControl, IStakeRegistry {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    /// @dev FLD address
    address public fld;

    /// @dev TON address in Tokamak
    address public ton;

    /// @dev WTON address in Tokamak
    address public wton;

    /// @dev Depositmanager address in Tokamak
    address public depositManager;

    /// @dev SeigManager address in Tokamak
    address public seigManager;

    /// Contracts included in the phase
    mapping(uint256 => address[]) public phases;

    /// Vault address mapping with vault name hash
    mapping(bytes32 => address) public vaults;

    /// Vault name hash mapping with vault address
    mapping(address => bytes32) public vaultNames;

    /// List of staking contracts included in the vault
    mapping(address => address[]) public stakeContractsOfVault;

    /// Vault address of staking contract
    mapping(address => address) public stakeContractVault;

    /// Defi Info
    mapping(bytes32 => LibTokenStake1.DefiInfo) public defiInfo;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "StakeRegistry: Caller is not an admin"
        );
        _;
    }

    modifier nonZero(address _addr) {
        require(_addr != address(0), "StakeRegistry: zero address");
        _;
    }

    event AddedVault(address indexed vault, uint256 phase);
    event AddedStakeContract(
        address indexed vault,
        address indexed stakeContract
    );
    event SetTokamak(
        address ton,
        address wton,
        address depositManager,
        address seigManager
    );

    event AddedDefiInfo(
        bytes32 nameHash,
        string name,
        address router,
        address ex1,
        address ex2,
        uint256 fee,
        address routerV2
    );

    /// @dev constructor of StakeRegistry
    /// @param _fld FLD address
    constructor(address _fld) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        fld = _fld;
    }

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "StakeRegistry:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev Set addresses for Tokamak integration
    /// @param _ton TON address
    /// @param _wton WTON address
    /// @param _depositManager DepositManager address
    /// @param _seigManager SeigManager address
    function setTokamak(
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager
    )
        external
        override
        onlyOwner
        nonZero(_ton)
        nonZero(_wton)
        nonZero(_depositManager)
        nonZero(_seigManager)
    {
        ton = _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;

        emit SetTokamak(ton, wton, depositManager, seigManager);
    }

    /// @dev Add information related to Defi
    /// @param _name name . ex) UNISWAP_V3
    /// @param _router entry point of defi
    /// @param _ex1  additional variable . ex) positionManagerAddress in Uniswap V3
    /// @param _ex2  additional variable . ex) WETH Address in Uniswap V3
    /// @param _fee  fee
    function addDefiInfo(
        string calldata _name,
        address _router,
        address _ex1,
        address _ex2,
        uint256 _fee,
        address _routerV2
    ) external override onlyOwner nonZero(_router) {
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        require(nameHash != ZERO_HASH, "StakeRegistry: nameHash zero");

        LibTokenStake1.DefiInfo storage _defiInfo = defiInfo[nameHash];
        _defiInfo.name = _name;
        _defiInfo.router = _router;
        _defiInfo.ext1 = _ex1;
        _defiInfo.ext2 = _ex2;
        _defiInfo.fee = _fee;
        _defiInfo.routerV2 = _routerV2;

        emit AddedDefiInfo(
            nameHash,
            _name,
            _router,
            _ex1,
            _ex2,
            _fee,
            _routerV2
        );
    }

    /// @dev Add Vault
    /// @dev It is excuted by proxy
    /// @param _vault vault address
    /// @param _phase phase ex) 1,2,3
    /// @param _vaultName  hash of vault's name
    function addVault(
        address _vault,
        uint256 _phase,
        bytes32 _vaultName
    ) external override onlyOwner {
        require(
            vaultNames[_vault] == ZERO_HASH || vaults[_vaultName] == address(0),
            "StakeRegistry: addVault input value is not zero"
        );
        vaults[_vaultName] = _vault;
        vaultNames[_vault] = _vaultName;
        phases[_phase].push(_vault);

        emit AddedVault(_vault, _phase);
    }

    /// @dev Add StakeContract in vault
    /// @dev It is excuted by proxy
    /// @param _vault vault address
    /// @param _stakeContract  StakeContract address
    function addStakeContract(address _vault, address _stakeContract)
        external
        override
        onlyOwner
    {
        require(
            vaultNames[_vault] != ZERO_HASH &&
                stakeContractVault[_stakeContract] == address(0),
            "StakeRegistry: input is zero"
        );
        stakeContractVault[_stakeContract] = _vault;
        stakeContractsOfVault[_vault].push(_stakeContract);

        emit AddedStakeContract(_vault, _stakeContract);
    }

    /// @dev Get addresses for Tokamak interface
    /// @return (ton, wton, depositManager, seigManager)
    function getTokamak()
        external
        view
        override
        returns (
            address,
            address,
            address,
            address
        )
    {
        return (ton, wton, depositManager, seigManager);
    }

    /// @dev Get indos for UNISWAP_V3 interface
    /// @return (uniswapRouter, npm, wethAddress, fee)
    function getUniswap()
        external
        view
        override
        returns (
            address,
            address,
            address,
            uint256,
            address
        )
    {
        //string _name = "UNISWAP_V3";
        bytes32 nameHash = keccak256(abi.encodePacked("UNISWAP_V3"));
        return (
            defiInfo[nameHash].router,
            defiInfo[nameHash].ext1,
            defiInfo[nameHash].ext2,
            defiInfo[nameHash].fee,
            defiInfo[nameHash].routerV2
        );
    }

    /// @dev Get addresses of vaults of index phase
    /// @param _index the phase number
    /// @return the list of vaults of phase[_index]
    function phasesAll(uint256 _index)
        external
        view
        override
        returns (address[] memory)
    {
        return phases[_index];
    }

    /// @dev Get addresses of staker of _vault
    /// @param _vault the vault's address
    /// @return the list of stakeContracts of vault
    function stakeContractsOfVaultAll(address _vault)
        external
        view
        override
        returns (address[] memory)
    {
        return stakeContractsOfVault[_vault];
    }

    /// @dev Checks if a vault is withing the given phase
    /// @param _phase the phase number
    /// @param _vault the vault's address
    /// @return valid true or false
    function validVault(uint256 _phase, address _vault)
        external
        view
        override
        returns (bool valid)
    {
        require(phases[_phase].length > 0, "StakeRegistry: validVault is fail");

        for (uint256 i = 0; i < phases[_phase].length; i++) {
            if (_vault == phases[_phase][i]) valid = true;
        }
    }
}
