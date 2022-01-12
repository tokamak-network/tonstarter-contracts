// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IPrivateSaleProxyFactory.sol";
import {PrivateSaleProxy} from "../sale/PrivateSaleProxy.sol";
import "../common/AccessRoleCommon.sol";

/// @title A factory that creates a PrivateSaleProxy
contract PrivateSaleProxyFactory is AccessRoleCommon, IPrivateSaleProxyFactory {

    event CreatedPrivateSaleProxy(address contractAddress, string name);

    struct ContractInfo {
        address contractAddress;
        string name;
    }

    /// @dev Total number of contracts created
    uint256 public totalCreatedContracts ;

    /// @dev Contract information by index
    mapping(uint256 => ContractInfo) public createdContracts;

    /// @dev constructor of PrivateSaleProxyFactory
    constructor() {
        totalCreatedContracts = 0;
    }

    /// @inheritdoc IPrivateSaleProxyFactory
    function create(
        string calldata name,
        address _logic,
        address owner,
        address wton
    ) external override returns (address) {
        require(_logic != address(0),"_logic is zero");
        require(owner != address(0),"owner is zero");
        require(wton != address(0),"wton is zero");
        require(bytes(name).length > 0,"name is empty");

        PrivateSaleProxy proxy = new PrivateSaleProxy(_logic);

        require(
            address(proxy) != address(0),
            "proxy zero"
        );

        proxy.initialize(wton);


        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        createdContracts[totalCreatedContracts] = ContractInfo(address(proxy), name);
        totalCreatedContracts++;

        emit CreatedPrivateSaleProxy(address(proxy), name);

        return address(proxy);
    }

    /// @inheritdoc IPrivateSaleProxyFactory
    function lastestCreated() external view override returns (address contractAddress, string memory name){
        if(totalCreatedContracts > 0){
            return (createdContracts[totalCreatedContracts-1].contractAddress, createdContracts[totalCreatedContracts-1].name );
        }else {
            return (address(0), '');
        }
    }

    /// @inheritdoc IPrivateSaleProxyFactory
    function getContracts(uint256 _index) external view override returns (address contractAddress, string memory name){
        if(_index < totalCreatedContracts){
            return (createdContracts[_index].contractAddress, createdContracts[_index].name);
        }else {
            return (address(0), '');
        }
    }

}
