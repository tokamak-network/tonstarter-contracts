//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeProxyStorage {
    /// @dev FLD address
    function fld() external view returns (address);

    /// @dev TON address in Tokamak
    function ton() external view returns (address);

    /// @dev WTON address in Tokamak
    function wton() external view returns (address);

    /// @dev Depositmanager address in Tokamak
    function depositManager() external view returns (address);

    /// @dev SeigManager address in Tokamak
    function seigManager() external view returns (address);
}
