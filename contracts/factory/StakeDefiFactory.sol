// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeDefiFactory.sol";
import {StakeDefiProxy} from "../stake/StakeDefiProxy.sol";
import "../common/AccessRoleCommon.sol";
/// @title A factory that creates a stake contract that can function as a DeFi function
contract StakeDefiFactory is AccessRoleCommon, IStakeDefiFactory {

    address public stakeDefiLogic;

    /// @dev constructor of StakeDefiFactory
    /// @param _stakeDefiLogic the logic address used in StakeDefiFactory
    constructor(address _stakeDefiLogic) {
        require(_stakeDefiLogic != address(0), "StakeDefiFactory: logic zero");
        stakeDefiLogic = _stakeDefiLogic;
    }

    /// @dev Create a stake contract that can operate the staked amount as a DeFi project.
    /// @param _addr array of [token, paytoken, vault]
    /// @param _registry  registry address
    /// @param _intdata array of [saleStartBlock, startBlock, periodBlocks]
    /// @param owner  owner address
    /// @return contract address
    function create(
        address[3] calldata _addr,
        address _registry,
        uint256[3] calldata _intdata,
        address owner
    ) external override returns (address) {
        StakeDefiProxy proxy = new StakeDefiProxy(stakeDefiLogic);
        require(address(proxy) != address(0), "StakeDefiFactory: proxy zero");

        proxy.setInit(_addr, _registry, _intdata);
        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
