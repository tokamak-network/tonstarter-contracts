//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStake1Logic {

    function setStore(
        address _fld,
        address _stakeRegistry,
        address _stakeFactory,
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager
        // address _uniswapRouter,
        // address _yearnV2Vault
    ) external ;
    function setFactory(address _stakeFactory) external;

    function createVault(
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlcok,
        uint256 _stakeStartBlcok,
        uint256 _pahse,
        bytes32 _vaultName,
        uint256 _stakeType,
        address _defiAddr
    ) external ;

    function createStakeContract(
        uint256 _pahse,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name
    ) external ;

    function closeSale(address _vault) external;

    function addVault(
        uint256 _pahse,
        bytes32 _vaultName,
        address _vault
    ) external;

    function stakeContractsOfVault(address _vault)
        external
        view
        returns (address[] memory);

    function vaultsOfPhase(uint256 _phaseIndex)
        external
        view
        returns (address[] memory);

    function tokamakStaking(
        address _stakeContract,
        address _layer2,
        uint256 _amount
    ) external ;

    function tokamakRequestUnStakingAll(address _stakeContract, address _layer2)
        external;

    function tokamakRequestUnStaking(
        address _stakeContract,
        address _layer2,
        uint256 _amount
    ) external;

    function tokamakProcessUnStaking(
        address _stakeContract,
        address _layer2,
        bool receiveTON
    ) external ;


    function setFLD(address _fld) external;

    function setStakeRegistry(address _stakeRegistry)
        external;


    function setStakeFactory(address _stakeFactory)
        external;


}
