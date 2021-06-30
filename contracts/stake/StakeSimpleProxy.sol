// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
//pragma abicoder v2;

import "./Stake1Storage.sol";
import "../common/AccessibleCommon.sol";
import "./ProxyBase.sol";

/// @title Proxy for Simple Stake contracts
/// @notice
contract StakeSimpleProxy is Stake1Storage, AccessibleCommon, ProxyBase {

    event Upgraded(address indexed implementation);

    constructor(address _logic) {
        assert(IMPLEMENTATION_SLOT == bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1));
        require(_logic != address(0), "StakeSimpleProxy: logic is zero");

        _setImplementation(_logic);

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, address(this));
    }

    /// @notice Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external onlyOwner {
        pauseProxy = _pause;
    }

    /// @notice Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external onlyOwner {
        require(impl != address(0), "StakeSimpleProxy: input is zero");
        require(_implementation() != impl, "StakeSimpleProxy: same");
        _setImplementation(impl);
        emit Upgraded(impl);
    }

    /// @dev returns the implementation
    function implementation() public view returns (address) {
        return _implementation();
    }

    receive() external payable {
        _fallback();
    }

    fallback() external payable {
        _fallback();
    }

    function _fallback() internal {
        address _impl = _implementation();
        require(
            _impl != address(0) && !pauseProxy,
            "StakeSimpleProxy: impl is zero OR proxy is false"
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
    /// @param _addr the array addresses of token, paytoken, vault
    /// @param _intdata the array valued of saleStartBlock, stakeStartBlock, periodBlocks
    function setInit(address[3] memory _addr, uint256[3] memory _intdata)
        external
        onlyOwner
    {
        require(
            _addr[2] != address(0) && _intdata[0] < _intdata[1],
            "StakeSimpleProxy: setInit fail"
        );
        token = _addr[0];
        paytoken = _addr[1];
        vault = _addr[2];

        saleStartBlock = _intdata[0];
        startBlock = _intdata[1];
        endBlock = startBlock + _intdata[2];
    }
}
