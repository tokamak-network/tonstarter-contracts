//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPrivateSaleProxyFactory {

    /// @dev Create a PrivateSaleProxy
    /// @param name name
    /// @param _logic the logic contract address used in proxy
    /// @param owner  owner address
    /// @param wton  wton address
    /// @return contract address
    function create(
        string calldata name,
        address _logic,
        address owner,
        address wton
    ) external returns (address) ;

    /// @dev Last generated contract information
    function lastestCreated() external view returns (address contractAddress, string memory name);

    /// @dev Contract information stored in the index
    function getContracts(uint256 _index) external view returns (address contractAddress, string memory name);


}
