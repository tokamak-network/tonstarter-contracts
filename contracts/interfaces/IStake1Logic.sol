//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStake1Logic {

    function setStore(
        address _fld,
        address _stakeRegistry,
        address _stakeFactory,
        address _stakeVaultFactory,
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager
    ) external;

    function createVault(
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        uint256 _phase,
        bytes32 _vaultName,
        uint256 _stakeType,
        address _defiAddr
    ) external;

    function createStakeContract(
        uint256 _pahse,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name
    ) external;

    function addVault(
        uint256 _phase,
        bytes32 _vaultName,
        address _vault
    ) external;

    function closeSale(address _vault) external;

    function stakeContractsOfVault(address _vault)
        external
        view
        returns (address[] memory);

    function vaultsOfPhase(uint256 _phaseIndex)
        external
        view
        returns (address[] memory);

    function tokamakStaking(address _stakeContract, address _layer2) external;

    function tokamakRequestUnStaking(
        address _stakeContract,
        address _layer2,
        uint256 amount
    ) external ;

    function tokamakProcessUnStaking(address _stakeContract, address _layer2)
        external;

    function exchangeWTONtoFLD(
        address _stakeContract,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline,
        uint160 sqrtPriceLimitX96,
        uint256 _type
    ) external returns (uint256 amountOut);

    function vaultsOfPahse(uint256 _phase)
        external
        view
        returns (address[] memory);

}
