//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IProject {
    function setToken(address _token) external;

    function setPair(address _pair) external;

    function setTokenDistribution(
        uint256 airdrop,
        uint256 dev,
        uint256 rewardGeneral,
        uint256 rewardLP
    ) external;

    function createDevVault() external;

    function createStakeVault(bool boolPair) external;

    function execTokenDistribution() external;

    function createTokenSale(
        uint256 startTime,
        uint256 endTime,
        uint256 softCap,
        uint256 hardCap,
        uint256 price
    ) external;
}
