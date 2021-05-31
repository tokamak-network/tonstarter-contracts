# Functions:

- [`upgradeStakeTo(address _stakeProxy, address _implementation)`](#Stake1Logic-upgradeStakeTo-address-address-)

- [`transferOwnership(address newOwner)`](#Stake1Logic-transferOwnership-address-)

- [`grantRole(address target, bytes32 role, address account)`](#Stake1Logic-grantRole-address-bytes32-address-)

- [`revokeRole(address target, bytes32 role, address account)`](#Stake1Logic-revokeRole-address-bytes32-address-)

- [`setFLD(address _fld)`](#Stake1Logic-setFLD-address-)

- [`setStakeRegistry(address _stakeRegistry)`](#Stake1Logic-setStakeRegistry-address-)

- [`setStakeFactory(address _stakeFactory)`](#Stake1Logic-setStakeFactory-address-)

- [`setStakeTONFactory(address _stakeTONFactory)`](#Stake1Logic-setStakeTONFactory-address-)

- [`setStakeSimpleFactory(address _stakeSimpleFactory)`](#Stake1Logic-setStakeSimpleFactory-address-)

- [`setStakeDefiFactory(address _stakeDefiFactory)`](#Stake1Logic-setStakeDefiFactory-address-)

- [`setStakeVaultFactory(address _stakeVaultFactory)`](#Stake1Logic-setStakeVaultFactory-address-)

- [`setStore(address _fld, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager)`](#Stake1Logic-setStore-address-address-address-address-address-address-address-address-)

- [`createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr)`](#Stake1Logic-createVault-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-)

- [`createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name)`](#Stake1Logic-createStakeContract-uint256-address-address-address-uint256-string-)

- [`addVault(uint256 _phase, bytes32 _vaultName, address _vault)`](#Stake1Logic-addVault-uint256-bytes32-address-)

- [`closeSale(address _vault)`](#Stake1Logic-closeSale-address-)

- [`stakeContractsOfVault(address _vault)`](#Stake1Logic-stakeContractsOfVault-address-)

- [`vaultsOfPhase(uint256 _phaseIndex)`](#Stake1Logic-vaultsOfPhase-uint256-)

- [`tokamakStaking(address _stakeContract, address _layer2)`](#Stake1Logic-tokamakStaking-address-address-)

- [`tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount)`](#Stake1Logic-tokamakRequestUnStaking-address-address-uint256-)

- [`tokamakProcessUnStaking(address _stakeContract, address _layer2)`](#Stake1Logic-tokamakProcessUnStaking-address-address-)

- [`exchangeWTONtoFLD(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`](#Stake1Logic-exchangeWTONtoFLD-address-uint256-uint256-uint256-uint160-uint256-)

- [`vaultsOfPahse(uint256 _phase)`](#Stake1Logic-vaultsOfPahse-uint256-)

# Events:

- [`CreatedVault(address vault, address paytoken, uint256 cap)`](#Stake1Logic-CreatedVault-address-address-uint256-)

- [`CreatedStakeContract(address vault, address stakeContract, uint256 phase)`](#Stake1Logic-CreatedStakeContract-address-address-uint256-)

- [`ClosedSale(address vault)`](#Stake1Logic-ClosedSale-address-)

- [`SetStakeRegistry(address stakeRegistry)`](#Stake1Logic-SetStakeRegistry-address-)

## Function `upgradeStakeTo(address _stakeProxy, address _implementation) `

No description

## Function `transferOwnership(address newOwner) `

No description

## Function `grantRole(address target, bytes32 role, address account) `

No description

## Function `revokeRole(address target, bytes32 role, address account) `

No description

## Function `setFLD(address _fld) `

Sets FLD address

## Function `setStakeRegistry(address _stakeRegistry) `

Sets Stake Registry address

## Function `setStakeFactory(address _stakeFactory) `

Sets Stake Factory address

## Function `setStakeTONFactory(address _stakeTONFactory) `

No description

## Function `setStakeSimpleFactory(address _stakeSimpleFactory) `

No description

## Function `setStakeDefiFactory(address _stakeDefiFactory) `

No description

## Function `setStakeVaultFactory(address _stakeVaultFactory) `

No description

## Function `setStore(address _fld, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager) `

No description

### Parameters:

- `_fld`:  FLD token address

- `_stakeRegistry`: the registry address

- `_stakeFactory`: the StakeFactory address

- `_stakeVaultFactory`: the StakeVaultFactory address

- `_ton`:  TON address in Tokamak

- `_wton`: WTON address in Tokamak

- `_depositManager`: DepositManager address in Tokamak

- `_seigManager`: SeigManager address in Tokamak

## Function `createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr) `

create vault

## Function `createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name) `

create stake contract in vault

## Function `addVault(uint256 _phase, bytes32 _vaultName, address _vault) `

No description

## Function `closeSale(address _vault) `

No description

## Function `stakeContractsOfVault(address _vault) `

No description

## Function `vaultsOfPhase(uint256 _phaseIndex) `

No description

## Function `tokamakStaking(address _stakeContract, address _layer2) `

No description

## Function `tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount) `

Requests unstaking all

## Function `tokamakProcessUnStaking(address _stakeContract, address _layer2) `

Processes unstaking

## Function `exchangeWTONtoFLD(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type) `

Swap TON to FLD

## Function `vaultsOfPahse(uint256 _phase) `

No description

## Event `CreatedVault(address vault, address paytoken, uint256 cap)` {#Stake1Logic-CreatedVault-address-address-uint256-}

No description

## Event `CreatedStakeContract(address vault, address stakeContract, uint256 phase)` {#Stake1Logic-CreatedStakeContract-address-address-uint256-}

No description

## Event `ClosedSale(address vault)` {#Stake1Logic-ClosedSale-address-}

No description

## Event `SetStakeRegistry(address stakeRegistry)` {#Stake1Logic-SetStakeRegistry-address-}

No description
