// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeUniswapV3Factory.sol";
import { StakeUniswapV3Proxy } from "../stake/StakeUniswapV3Proxy.sol";

/// @title A factory that creates a stake contract
contract StakeUniswapV3Factory is IStakeUniswapV3Factory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeUniswapV3Logic;

    /// @dev constructor of StakeSimpleFactory
    /// @param _stakeUniswapV3Logic the logic address used in StakeSimpleFactory
    constructor(address _stakeUniswapV3Logic) {
        require(
            _stakeUniswapV3Logic != address(0),
            "StakeSimpleFactory: logic zero"
        );
        stakeUniswapV3Logic = _stakeUniswapV3Logic;
    }

    /// @dev Create a stake contract that can operate the staked amount as a DeFi project.
    /// @param _addr array of [token, paytoken, vault]
    /// @param _intdata array of [saleStartBlock, startBlock, periodBlocks]
    /// @param owner  owner address
    /// @return contract address
    function create(
        address[3] calldata _addr,
        uint256[3] calldata _intdata,
        address owner
    ) external override returns (address) {
        StakeUniswapV3Proxy proxy = new StakeUniswapV3Proxy(stakeUniswapV3Logic);
        require(address(proxy) != address(0), "StakeUniswapV3Factory: proxy zero");

        proxy.setInit(_addr, _intdata);
        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
