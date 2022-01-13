// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IPublicSaleProxyFactory.sol";
import {PublicSaleProxy} from "../sale/PublicSaleProxy.sol";
import "../common/AccessRoleCommon.sol";

/// @title A factory that creates a PublicSaleProxy
contract PublicSaleProxyFactory is AccessRoleCommon, IPublicSaleProxyFactory {

    event CreatedPublicSaleProxy(address contractAddress, string name);

    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "PublicSaleProxyFactory: zero");
        _;
    }
    struct ContractInfo {
        address contractAddress;
        string name;
    }

    /// @dev Total number of contracts created
    uint256 public totalCreatedContracts ;

    /// @dev Contract information by index
    mapping(uint256 => ContractInfo) public createdContracts;

    /// @dev constructor of PublicSaleProxyFactory
    constructor() {
        totalCreatedContracts = 0;
    }

    /// @inheritdoc IPublicSaleProxyFactory
    function create(
        string calldata name,
        address _logic,
        address _owner,
        address[5] calldata saleAddresses
    )
        external override
        nonZeroAddress(_logic)
        nonZeroAddress(_owner)
        nonZeroAddress(saleAddresses[0])
        nonZeroAddress(saleAddresses[1])
        nonZeroAddress(saleAddresses[2])
        nonZeroAddress(saleAddresses[3])
        nonZeroAddress(saleAddresses[4])
        returns (address)
    {
        require(bytes(name).length > 0,"name is empty");

        PublicSaleProxy proxy = new PublicSaleProxy(_logic);

        require(
            address(proxy) != address(0),
            "proxy zero"
        );

        proxy.initialize(
            saleAddresses[0],
            saleAddresses[1],
            saleAddresses[2],
            saleAddresses[3],
            saleAddresses[4]
            );


        proxy.grantRole(ADMIN_ROLE, _owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        createdContracts[totalCreatedContracts] = ContractInfo(address(proxy), name);
        totalCreatedContracts++;

        emit CreatedPublicSaleProxy(address(proxy), name);

        return address(proxy);
    }

    /// @inheritdoc IPublicSaleProxyFactory
    function lastestCreated() external view override returns (address contractAddress, string memory name){
        if(totalCreatedContracts > 0){
            return (createdContracts[totalCreatedContracts-1].contractAddress, createdContracts[totalCreatedContracts-1].name );
        }else {
            return (address(0), '');
        }
    }

    /// @inheritdoc IPublicSaleProxyFactory
    function getContracts(uint256 _index) external view override returns (address contractAddress, string memory name){
        if(_index < totalCreatedContracts){
            return (createdContracts[_index].contractAddress, createdContracts[_index].name);
        }else {
            return (address(0), '');
        }
    }

}
