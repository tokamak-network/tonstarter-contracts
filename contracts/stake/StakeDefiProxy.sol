// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeDefiProxy.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import "./Stake1Storage.sol";
import "../common/AccessibleCommon.sol";
import "./ProxyBase.sol";

/// @title Proxy for stake defi contract
contract StakeDefiProxy is Stake1Storage, AccessibleCommon, ProxyBase, IStakeDefiProxy {

    event Upgraded(address indexed implementation);

    /// @dev constructor of StakeDefiProxy
    /// @param _logic the logic address that used in proxy
    constructor(address _logic) {
        assert(IMPLEMENTATION_SLOT == bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1));

        require(_logic != address(0), "StakeDefiProxy: logic is zero");

        _setImplementation(_logic);

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, address(this));

    }

    /// @dev Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external override onlyOwner {
        pauseProxy = _pause;
    }

    /// @dev Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external override onlyOwner {
        require(impl != address(0), "StakeDefiProxy: input is zero");
        require(_implementation() != impl, "same");
        _setImplementation(impl);
        emit Upgraded(impl);
    }

    /// @dev returns the implementation
    function implementation() external view override returns (address) {
        return _implementation();
    }

    /// @dev receive ether
    receive() external payable {
        _fallback();
    }

    /// @dev fallback function , execute on undefined function call
    fallback() external payable {
        _fallback();
    }

    /// @dev fallback function , execute on undefined function call
    function _fallback() internal {
        address _impl = _implementation();
        require(
            _impl != address(0) && !pauseProxy,
            "StakeDefiProxy: impl is zero OR proxy is false"
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

    /// @dev set initial storage
    /// @param _addr the array addresses of token, paytoken, vault, defiAddr
    /// @param _registry teh registry address
    /// @param _intdata the array valued of saleStartBlock, stakeStartBlock, periodBlocks
    function setInit(
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata
    ) external onlyOwner {
        require(token == address(0), "StakeDefiProxy: already initialized");
        require(
            _addr[2] != address(0) && _intdata[0] < _intdata[1],
            "StakeDefiProxy: setInit fail"
        );
        token = _addr[0];
        paytoken = _addr[1];
        vault = _addr[2];
        defiAddr = _addr[3];

        stakeRegistry = _registry;

        saleStartBlock = _intdata[0];
        startBlock = _intdata[1];
        endBlock = startBlock + _intdata[2];
    }
}
