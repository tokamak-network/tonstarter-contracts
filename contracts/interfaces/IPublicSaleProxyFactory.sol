//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPublicSaleProxyFactory {

    /// @dev Create a PublicSaleProxyFactory
    /// @param name name
    /// @param _logic the logic contract address used in proxy
    /// @param _owner proxyOwner address
    /// @param saleAddresses  [_saleTokenAddress,_getTokenAddress,_getTokenOwner,sTOS,wton]
    /// @return proxy contract address
    function create(
        string calldata name,
        address _logic,
        address _owner,
        address[3] calldata saleAddresses
    )
        external
        returns (address);

    /// @dev setting the basicAddress
    function basicSet(
        address _tonAddress,
        address _wtonAddress,
        address _sTOSAddress,
        address _tosAddress,
        address _uniRAddress
    )
        external;

    /// @dev Last generated contract information
    function lastestCreated() external view returns (address contractAddress, string memory name);

    /// @dev Contract information stored in the index
    function getContracts(uint256 _index) external view returns (address contractAddress, string memory name);


}
