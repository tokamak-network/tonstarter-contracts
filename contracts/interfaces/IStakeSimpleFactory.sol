//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeSimpleFactory {
    /// @dev Create a stake contract that can operate the staked amount as a DeFi project.
    /// @param _addr array of [token, paytoken, vault]
    /// @param _intdata array of [saleStartBlock, startBlock, periodBlocks]
    /// @param owner  owner address
    /// @return contract address
    function create(
        address[3] calldata _addr,
        uint256[3] calldata _intdata,
        address owner
    ) external returns (address);
}
