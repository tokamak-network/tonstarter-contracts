// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeUniswapV3Factory.sol";

import { IStakeUniswapV3ProxyFactory } from "../interfaces/IStakeUniswapV3ProxyFactory.sol";
import { StakeUniswapV3Proxy } from "../stake/StakeUniswapV3Proxy.sol";
import "hardhat/console.sol";

/// @title A factory that creates a stake contract
contract StakeUniswapV3Factory is IStakeUniswapV3Factory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeUniswapV3Logic;
    address public stakeUniswapV3ProxyFactory;

    /// @dev constructor of StakeSimpleFactory
    /// @param _stakeUniswapV3Logic the logic address used in StakeSimpleFactory
    constructor(address _stakeUniswapV3ProxyFactory, address _stakeUniswapV3Logic) {
        require(
            _stakeUniswapV3Logic != address(0)
            && _stakeUniswapV3Logic != address(0),
            "StakeUniswapV3Factory: logic zero"
        );
        stakeUniswapV3Logic = _stakeUniswapV3Logic;
        stakeUniswapV3ProxyFactory = _stakeUniswapV3ProxyFactory;
    }

    /// @dev Create a stake contract that can stake TON.
    /// @param _addr the array of [token, paytoken, vault, defiAddr]
    /// @param _registry  the registry address
    /// @param _intdata the array of [saleStartBlock, startBlock, periodBlocks]
    /// @param owner  owner address
    /// @return contract address
    function create(
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata,
        address owner
    ) external override returns (address) {
        address proxy =
            IStakeUniswapV3ProxyFactory(stakeUniswapV3ProxyFactory).deploy(
                stakeUniswapV3Logic,
                _addr,
                _registry,
                _intdata,
                owner
            );
        console.log("Smart: I am here");

        require(proxy != address(0), "StakeTONFactory: proxy zero");

        return proxy;
    }
}
