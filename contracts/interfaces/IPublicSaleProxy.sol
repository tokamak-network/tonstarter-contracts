//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPublicSaleProxy {
    /// @dev set the logic
    /// @param _impl publicSaleContract Address;
    function setImplementation(address _impl) external;
    /// @dev Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external;

    /// @dev Set implementation contract
    /// @param _impl New implementation contract address
    function upgradeTo(address _impl) external;

    /// @dev view implementation address
    /// @return the logic address
    function implementation() external view returns (address);

    /// @dev initialize
    function initialize(
        address _saleTokenAddress,
        address _getTokenOwner,
        address _vaultAddress
    ) external;

    /// @dev changeBasicSet
    function changeBasicSet(
        address _getTokenAddress,
        address _sTOS,
        address _wton
    ) external;
}
