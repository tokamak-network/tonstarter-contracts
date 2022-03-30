//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPublicSaleProxyFactory {

    /// @dev Create a PublicSaleProxyFactory
    /// @param name name
    /// @param _owner proxyOwner address
    /// @param saleAddresses  [saleTokenAddress,getTokenOwner,liquidityVaultAddress]
    /// @param _index liquidityVault index
    /// @return proxy contract address
    function create(
        string calldata name,
        address _owner,
        address[3] calldata saleAddresses,
        uint256 _index
    )
        external
        returns (address);

    /// @dev setting the basicAddress
    /// @param _basicAddress [tonAddress, wtonAddress, sTOSAddress, tosAddres, uniRouterAddress, publicLogic]
    function basicSet(
        address[6] calldata _basicAddress
    )
        external;

    /// @dev setting the admin
    /// @param addr ontherProxyManagerMasterAddress
    function setUpgradeAdmin(
        address addr
    )   
        external;

    /// @dev setting the min, max
    /// @param _min ton -> tos min percents
    /// @param _max ton -> tos max percents
    function setMaxMin(
        uint256 _min,
        uint256 _max
    )
        external;

    /// @dev setting the initialLiquidityFactoryAddress
    /// @param _vaultFactory factoryAddress
    function setVault(
        address _vaultFactory
    )
        external;

    /// @dev setting the eventLog
    /// @param _addr logContract addr
    function setEventLog(
        address _addr
    )
        external;

    /// @dev Last generated contract information
    function lastestCreated() external view returns (address contractAddress, string memory name);

    /// @dev Contract information stored in the index
    function getContracts(uint256 _index) external view returns (address contractAddress, string memory name);


}
