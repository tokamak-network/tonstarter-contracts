// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

//import "@openzeppelin/contracts/access/AccessControl.sol";
import "./StakeVaultStorage.sol";

/// @title Proxy for Stake contracts in Phase 1
/// @notice
contract StakeVaultProxy is StakeVaultStorage {
    //bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    address internal _implementation;
    bool public pauseProxy;

    event Upgraded(address indexed implementation);

    // modifier onlyOwner() {
    //     require(
    //         hasRole(ADMIN_ROLE, msg.sender),
    //         "no admin"
    //     );
    //     _;
    // }

    constructor(address impl) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, address(this));
         _implementation = impl;
    }

    /// @notice Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external onlyOwner {
        pauseProxy = _pause;
    }

    /// @notice Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external onlyOwner {
        require(impl != address(0), "input is zero");
        require(
            _implementation != impl,
            "same"
        );
        _implementation = impl;
        emit Upgraded(impl);
    }

    /// @dev returns the implementation
    function implementation() public view returns (address) {
        return _implementation;
    }

    receive() external payable {
        _fallback();
    }

    fallback() external payable {
        _fallback();
    }

    function _fallback() internal {
        address _impl = implementation();
        require(
            _impl != address(0) && !pauseProxy,
            "impl OR proxy is false"
        );

        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
                // delegatecall returns 0 on error.
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }

    function initialize(
        address _fld,
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        address _stakefactory,
        uint256 _stakeType,
        address _defiAddr
    ) external onlyOwner {
        require(
            _fld != address(0) && _stakefactory != address(0),
            "Stake1Vault: input is zero"
        );
        require(_cap > 0, "Stake1Vault: _cap is zero");
        require(
            _saleStartBlock < _stakeStartBlock && _stakeStartBlock > 0,
            "Stake1Vault: startBlock is unavailable"
        );

        fld = IFLD(_fld);
        cap = _cap;
        paytoken = _paytoken;
        saleStartBlock = _saleStartBlock;
        stakeStartBlock = _stakeStartBlock;
        stakeType = _stakeType;
        defiAddr = _defiAddr;

        grantRole(ADMIN_ROLE, _stakefactory);
    }

}
