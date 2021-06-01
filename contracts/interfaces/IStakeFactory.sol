//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeFactory {
    /// @dev Create a stake contract that calls the desired stake factory according to stakeType
    /// @param stakeType if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeDefiFactory
    /// @param _addr array of [token, paytoken, vault, _defiAddr]
    /// @param registry  registry address
    /// @param _intdata array of [saleStartBlock, startBlock, endBlock]
    /// @return contract address
    function create(
        uint256 stakeType,
        address[4] calldata _addr,
        address registry,
        uint256[3] calldata _intdata
    ) external returns (address);

    /// @dev Set StakeTONFactory address
    /// @param _stakeTONFactory new StakeTONFactory address
    function setStakeTONFactory(address _stakeTONFactory) external;

    /// @dev Set StakeDefiFactory address
    /// @param _stakeDefiFactory new StakeDefiFactory address
    function setStakeDefiFactory(address _stakeDefiFactory) external;

    /// @dev Set StakeSimpleFactory address
    /// @param _stakeSimpleFactory new StakeSimpleFactory address
    function setStakeSimpleFactory(address _stakeSimpleFactory) external;
}
