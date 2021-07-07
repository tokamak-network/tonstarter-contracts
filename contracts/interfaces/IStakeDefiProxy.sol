//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeDefiProxy {
    /// @dev Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external;

    /// @dev Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external;

    /// @dev view implementation address
    /// @return the logic address
    function implementation() external view returns (address);

    /// @dev set initial storage
    /// @param _addr the array addresses of token, paytoken, vault, defiAddress
    /// @param _registry teh registry address
    /// @param _intdata the array valued of saleStartBlock, stakeStartBlock, periodBlocks
    function setInit(
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata
    ) external;
}
