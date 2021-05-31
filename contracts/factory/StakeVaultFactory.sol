// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeVaultFactory.sol";
import {StakeVaultProxy} from "../stake/StakeVaultProxy.sol";

/// @title A factory that creates a vault that hold reward
contract StakeVaultFactory is IStakeVaultFactory{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeVaultLogic;

    constructor(address _stakeVaultLogic) {
        require(_stakeVaultLogic != address(0), "StakeVaultFactory: logic zero");
        stakeVaultLogic = _stakeVaultLogic;
    }

    /// Create a vault that hold reward, _cap is allocated reward amount.
    /// @param _addr the array of [token, paytoken, vault, defiAddr]
    /// @param _intInfo array of [_stakeType, _cap, _saleStartBlock, _stakeStartBlock]
    /// @param owner the owner adderess
    /// @return a vault address
    function create(
        address[4] calldata _addr,
        uint256[4] calldata _intInfo,
        address owner
    ) external override returns (address) {
        address _fld = _addr[0];
        address _paytoken = _addr[1];
        address _stakefactory = _addr[2];
        address _defiAddr = _addr[3];
        uint256 _stakeType = _intInfo[0];
        uint256 _cap = _intInfo[1];
        uint256 _saleStartBlock = _intInfo[2];
        uint256 _stakeStartBlock = _intInfo[3];

        StakeVaultProxy proxy = new StakeVaultProxy(stakeVaultLogic);
        require(address(proxy) != address(0), "StakeVaultFactory: proxy zero");

        proxy.initialize(
            _fld,
            _paytoken,
            _cap,
            _saleStartBlock,
            _stakeStartBlock,
            _stakefactory,
            _stakeType,
            _defiAddr
        );

        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
