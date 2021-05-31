// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeTONFactory.sol";
import "../interfaces/IStakeTONProxyFactory.sol";

/// @title A factory that creates a stake contract that can stake TON
contract StakeTONFactory is IStakeTONFactory{
    address public stakeTONProxyFactory;
    address public stakeTONLogic;

    constructor(address _stakeTONProxyFactory, address _stakeTONLogic) {
        require(
            _stakeTONProxyFactory != address(0) && _stakeTONLogic != address(0),
            "StakeTONFactory: zero"
        );
        stakeTONProxyFactory = _stakeTONProxyFactory;
        stakeTONLogic = _stakeTONLogic;
    }

    /// Create a stake contract that can stake TON.
    /// @param _addr the array of [token, paytoken, vault, defiAddr]
    /// @param _registry  the registry address
    /// @param _intdata the array of [saleStartBlock, startBlock, endBlock]
    /// @param owner  owner address
    /// @return contract address
    function create(
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata,
        address owner
    ) external override returns (address) {
        address proxy =
            IStakeTONProxyFactory(stakeTONProxyFactory).deploy(
                stakeTONLogic,
                _addr,
                _registry,
                _intdata,
                owner
            );

        require(proxy != address(0), "StakeTONFactory: proxy zero");

        return proxy;
    }
}
