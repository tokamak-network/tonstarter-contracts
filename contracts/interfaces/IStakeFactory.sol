//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeFactory {
    function create(
        uint256 stakeType,
        address[4] memory _addr,
        address registry,
        uint256[3] memory _intdata
    ) external returns (address);

    function setStakeTONFactory(address _stakeTONFactory) external;

    function setStakeStableCoinFactory(address _stakeStableCoinFactory)
        external;
}
