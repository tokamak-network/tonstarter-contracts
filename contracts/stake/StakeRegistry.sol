//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Stake Registry
/// @notice Manage the vault list by phase. Manage the list of staking contracts in the vault.
contract StakeRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    // Addresses for Tokamak staking
    address public ton;
    address public wton;
    address public depositManager;
    address public seigManager;

    // Contracts included in the phase
    mapping(uint256 => address[]) public phases;

    // Vault address mapping with vault name hash
    mapping(bytes32 => address) public vaults;

    // Vault name hash mapping with vault address
    mapping(address => bytes32) public vaultNames;

    // List of staking contracts included in the vault
    mapping(address => address[]) public stakeContractsOfVault;

    // Vault address of staking contract
    mapping(address => address) public stakeContractVault;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "StakeRegistry: Caller is not an admin"
        );
        _;
    }

    modifier nonZero(address _addr) {
        require(_addr != address(0), "zero address");
        _;
    }

    //////////////////////////////
    // Events
    //////////////////////////////
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

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev Set address for Tokamak integration
    function setTokamak(
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
        nonZero(_seigManager)
    {
        ton = _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;

        emit SetTokamak(ton, wton, depositManager, seigManager);
    }

    /// @dev Adds vault
    function addVault(
        address _vault,
        uint256 _phase,
        bytes32 _vaultName
    ) external onlyOwner {
        require(
            vaultNames[_vault] == ZERO_HASH || vaults[_vaultName] == address(0),
            "StakeRegistry: addVault input value is not zero"
        );
        vaults[_vaultName] = _vault;
        vaultNames[_vault] = _vaultName;
        phases[_phase].push(_vault);

        emit AddedVault(_vault, _phase);
    }

    /// @dev Stores vault and stake, and maps them togethers
    function addStakeContract(address _vault, address _stakeContract)
        external
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
    function getTokamak()
        external
        view
        returns (
            address,
            address,
            address,
            address
        )
    {
        return (ton, wton, depositManager, seigManager);
    }

    /// @dev Get addresses of vaults of index phase
    function phasesAll(uint256 _index)
        external
        view
        returns (address[] memory)
    {
        return phases[_index];
    }

    /// @dev Get addresses of staker of _vault
    function stakeContractsOfVaultAll(address _vault)
        external
        view
        returns (address[] memory)
    {
        return stakeContractsOfVault[_vault];
    }

    /// @dev Checks if a vault is withing the given phase
    function validVault(uint256 _phase, address _vault)
        external
        view
        returns (bool valid)
    {
        require(phases[_phase].length > 0, "StakeRegistry: validVault is fail");

        for (uint256 i = 0; i < phases[_phase].length; i++) {
            if (_vault == phases[_phase][i]) valid = true;
        }
    }
}
