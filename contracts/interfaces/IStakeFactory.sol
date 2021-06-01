//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeFactory {
    function create(
        uint256 stakeType,
        address[4] calldata _addr,
        address registry,
        uint256[3] calldata _intdata
    ) external returns (address);

    function setStakeTONFactory(address _stakeTONFactory) external;

    function setStakeDefiFactory(address _stakeDefiFactory) external;

    function setStakeSimpleFactory(address _stakeSimpleFactory) external;
}
