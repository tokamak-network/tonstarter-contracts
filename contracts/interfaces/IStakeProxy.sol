//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeProxy {
    /// @dev Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external;

    /// @dev Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl, uint256 _index) external;

    /// @dev view implementation address
    /// @return the logic address
    function implementation(uint256 _index) external view returns (address);

    function setImplementation(address newImplementation, uint256 _index, bool _alive) external ;

    function setAliveImplementation(address newImplementation, bool _alive) external ;

    function setSelectorImplementations(bytes4[] calldata _selectors, address _imp) external ;

    function getSelectorImplementation(bytes4 _selector) external view returns (address impl) ;

}
