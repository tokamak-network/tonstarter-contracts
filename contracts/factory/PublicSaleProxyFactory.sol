// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IPublicSaleProxyFactory.sol";
import {PublicSaleProxy} from "../sale/PublicSaleProxy.sol";
import "../common/AccessibleCommon.sol";
import "../interfaces/IVaultFactory.sol";
import "hardhat/console.sol";


/// @title A factory that creates a PublicSaleProxy
contract PublicSaleProxyFactory is AccessibleCommon, IPublicSaleProxyFactory {

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

    uint256 public minTOS;
    uint256 public maxTOS;

    address public tonAddress;
    address public wtonAddress;
    address public sTOSAddress;
    address public tosAddress;
    address public uniRouterAddress;

    address public vaultFactory;    
    address public upgradeAdmin;

    /// @dev Contract information by index
    mapping(uint256 => ContractInfo) public createdContracts;

    /// @dev constructor of PublicSaleProxyFactory
    constructor() {
        totalCreatedContracts = 0;

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        upgradeAdmin = msg.sender;
    }

    /// @inheritdoc IPublicSaleProxyFactory
    /// @notice _logic = PublicSale, _owner = ontherProxyManagerMasterAddress
    /// saleAddress[0] = _saleTokenAddress, saleAddress[1] = getTokenOwner, saleAddress[2] = liquidityVaultAddress
    function create(
        string calldata name,
        address _logic,
        address _owner,
        address[3] calldata saleAddresses,
        uint256 _index
    )
        external override
        nonZeroAddress(_logic)
        nonZeroAddress(saleAddresses[0])
        nonZeroAddress(saleAddresses[1])
        nonZeroAddress(saleAddresses[2])
        returns (address)
    {
        require(bytes(name).length > 0,"name is empty");

        PublicSaleProxy proxy = new PublicSaleProxy();

        require(
            address(proxy) != address(0),
            "proxy zero"
        );

        console.log("contract");
        (address initialVault, ) = IVaultFactory(vaultFactory).getContracts(_index);
        console.log("initialVault : %s",initialVault);
        require(initialVault == saleAddresses[2], "another liquidityVault");

        proxy.addProxyAdmin(upgradeAdmin);
        proxy.addAdmin(upgradeAdmin);
        proxy.addAdmin(_owner);
        proxy.setImplementation(_logic);

        proxy.initialize(
            saleAddresses[0],
            saleAddresses[1],
            saleAddresses[2]
        );

        proxy.changeBasicSet(
            tonAddress,
            sTOSAddress,
            wtonAddress,
            uniRouterAddress,
            tosAddress
        );

        proxy.setMaxMinPercent(
            minTOS,
            maxTOS
        );

        proxy.removeAdmin();

        createdContracts[totalCreatedContracts] = ContractInfo(address(proxy), name);
        totalCreatedContracts++;

        emit CreatedPublicSaleProxy(address(proxy), name);

        return address(proxy);
    }

    /// @inheritdoc IPublicSaleProxyFactory
    function basicSet(
        address _tonAddress,
        address _wtonAddress,
        address _sTOSAddress,
        address _tosAddress,
        address _uniRAddress
    )
        external 
        override
        onlyOwner
    {
        tonAddress = _tonAddress;
        wtonAddress = _wtonAddress;
        sTOSAddress = _sTOSAddress;
        tosAddress = _tosAddress;
        uniRouterAddress = _uniRAddress;
    }

    function setUpgradeAdmin(
        address addr
    )   
        external 
        onlyOwner
        nonZeroAddress(addr)
    {
        require(addr != upgradeAdmin, "same addrs");
        upgradeAdmin = addr;
    }

    function setMaxMin(
        uint256 _min,
        uint256 _max
    )
        external
        onlyOwner
    {
        require(_min < _max, "need min < max");
        minTOS = _min;
        maxTOS = _max;
    }

    function setVault(
        address _vaultFactory
    )
        external
        onlyOwner
    {
        require(vaultFactory != _vaultFactory, "same addrs");
        vaultFactory = _vaultFactory;
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
