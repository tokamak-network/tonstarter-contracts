//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPublicSaleProxyFactory {

    /// @dev Create a PublicSaleProxyFactory
    /// @param name name
    /// @param _logic the logic contract address used in proxy
    /// @param _owner proxyOwner address
    /// @param saleAddresses  [_saleTokenAddress,_getTokenAddress,_getTokenOwner,sTOS,wton]
    /// @param basicAddresses basic[0] = TON, basic[1] = sTOS, basic[2] = wton, basic[3] = uniswapRouter, basic[4] = TOS
    /// @return proxy contract address
    function create(
        string calldata name,
        address _logic,
        address _owner,
        address[3] calldata saleAddresses,
        address[5] calldata basicAddresses
    )
        external
        returns (address);

    /// @dev Last generated contract information
    function lastestCreated() external view returns (address contractAddress, string memory name);

    /// @dev Contract information stored in the index
    function getContracts(uint256 _index) external view returns (address contractAddress, string memory name);


}
