// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
//pragma abicoder v2;

import "./Stake1Storage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Proxy for Simple Stake contracts
/// @notice
contract StakeDefiProxy is Stake1Storage, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    address internal _implementation;
    bool public pauseProxy;

    event Upgraded(address indexed implementation);

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "not an admin"
        );
        _;
    }

    constructor(address _logic) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, address(this));
        _implementation = _logic;
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
            "StakeYearnProxy: impl is zero OR proxy is false"
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

    function setInit(
        address[3] memory _addr,
        address _registry,
        uint256[3] memory _intdata
    ) external onlyOwner {
        require(
                _addr[2] != address(0) &&
                _intdata[0] < _intdata[1], "setInit fail"
        );
        token = _addr[0];
        paytoken = _addr[1];
        vault = _addr[2];

        saleStartBlock = _intdata[0];
        startBlock = _intdata[1];
        endBlock = startBlock + _intdata[2];
    }

}