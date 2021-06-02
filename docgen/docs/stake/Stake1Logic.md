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

- [`exchangeWTONtoFLDv2(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`](#Stake1Logic-exchangeWTONtoFLDv2-address-uint256-uint256-uint256-uint160-uint256-)

- [`vaultsOfPahse(uint256 _phase)`](#Stake1Logic-vaultsOfPahse-uint256-)

# Events:

- [`CreatedVault(address vault, address paytoken, uint256 cap)`](#Stake1Logic-CreatedVault-address-address-uint256-)

- [`CreatedStakeContract(address vault, address stakeContract, uint256 phase)`](#Stake1Logic-CreatedStakeContract-address-address-uint256-)

- [`ClosedSale(address vault)`](#Stake1Logic-ClosedSale-address-)

- [`SetStakeRegistry(address stakeRegistry)`](#Stake1Logic-SetStakeRegistry-address-)

###### Stake1Logic-upgradeStakeTo-address-address-

## Function `upgradeStakeTo(address _stakeProxy, address _implementation)`

upgrade to the logic of _stakeProxy

### Parameters:

- `_stakeProxy`: the StakeProxy address

- `_implementation`: new logic address

###### Stake1Logic-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

###### Stake1Logic-grantRole-address-bytes32-address-

## Function `grantRole(address target, bytes32 role, address account)`

grant the role to account in target

### Parameters:

- `target`: target address

- `role`:  byte32 of role

- `account`: account address

###### Stake1Logic-revokeRole-address-bytes32-address-

## Function `revokeRole(address target, bytes32 role, address account)`

revoke the role to account in target

### Parameters:

- `target`: target address

- `role`:  byte32 of role

- `account`: account address

###### Stake1Logic-setFLD-address-

## Function `setFLD(address _fld)`

Sets FLD address

### Parameters:

- `_fld`: new FLD address

###### Stake1Logic-setStakeRegistry-address-

## Function `setStakeRegistry(address _stakeRegistry)`

Sets Stake Registry address

### Parameters:

- `_stakeRegistry`: new StakeRegistry address

###### Stake1Logic-setStakeFactory-address-

## Function `setStakeFactory(address _stakeFactory)`

Sets StakeFactory address

### Parameters:

- `_stakeFactory`: new StakeFactory address

###### Stake1Logic-setStakeTONFactory-address-

## Function `setStakeTONFactory(address _stakeTONFactory)`

Sets StakeTONFactory address

### Parameters:

- `_stakeTONFactory`: new StakeTONFactory address

###### Stake1Logic-setStakeSimpleFactory-address-

## Function `setStakeSimpleFactory(address _stakeSimpleFactory)`

Sets StakeSimpleFactory address

### Parameters:

- `_stakeSimpleFactory`: new StakeSimpleFactory address

###### Stake1Logic-setStakeDefiFactory-address-

## Function `setStakeDefiFactory(address _stakeDefiFactory)`

Sets StakeDefiFactory address

### Parameters:

- `_stakeDefiFactory`: new StakeDefiFactory address

###### Stake1Logic-setStakeVaultFactory-address-

## Function `setStakeVaultFactory(address _stakeVaultFactory)`

Sets StakeVaultFactory address

### Parameters:

- `_stakeVaultFactory`: new StakeVaultFactory address

###### Stake1Logic-setStore-address-address-address-address-address-address-address-address-

## Function `setStore(address _fld, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager)`

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

###### Stake1Logic-createVault-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-

## Function `createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr)`

create vault

### Parameters:

- `_paytoken`: the token used for staking by user

- `_cap`:  allocated reward amount

- `_saleStartBlock`:  the start block that can stake by user

- `_stakeStartBlock`: the start block that end staking by user and start that can claim reward by user

- `_phase`:  phase of FLD platform

- `_vaultName`:  vault's name's hash

- `_stakeType`:  stakeContract's type, if 0, StakeTON, else if 1 , StakeSimple , else if 2, StakeDefi

- `_defiAddr`:  extra defi address , default is zero address

###### Stake1Logic-createStakeContract-uint256-address-address-address-uint256-string-

## Function `createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name)`

create stake contract in vault

### Parameters:

- `_phase`: the phase of FLD platform

- `_vault`:  vault's address

- `token`:  the reward token's address

- `paytoken`:  the token used for staking by user

- `periodBlock`:  the period that generate reward

- `_name`:  the stake contract's name

###### Stake1Logic-addVault-uint256-bytes32-address-

## Function `addVault(uint256 _phase, bytes32 _vaultName, address _vault)`

create stake contract in vault

### Parameters:

- `_phase`: phase of FLD platform

- `_vaultName`: vault's name's hash

- `_vault`: vault's address

###### Stake1Logic-closeSale-address-

## Function `closeSale(address _vault)`

end to staking by user

### Parameters:

- `_vault`: vault's address

###### Stake1Logic-stakeContractsOfVault-address-

## Function `stakeContractsOfVault(address _vault)`

list of stakeContracts in vault

### Parameters:

- `_vault`: vault's address

###### Stake1Logic-vaultsOfPhase-uint256-

## Function `vaultsOfPhase(uint256 _phaseIndex)`

list of vaults in _phaseIndex phase

### Parameters:

- `_phaseIndex`: the phase number

###### Stake1Logic-tokamakStaking-address-address-

## Function `tokamakStaking(address _stakeContract, address _layer2)`

stake in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

###### Stake1Logic-tokamakRequestUnStaking-address-address-uint256-

## Function `tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount)`

Requests unstaking in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

- `amount`: the amount of unstaking

###### Stake1Logic-tokamakProcessUnStaking-address-address-

## Function `tokamakProcessUnStaking(address _stakeContract, address _layer2)`

Processes unstaking the requested unstaking amount in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

###### Stake1Logic-exchangeWTONtoFLD-address-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLD(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`

Swap TON to FLD using uniswap v3

this function used in StakeTON ( stakeType=0 )

### Parameters:

- `_stakeContract`: the stakeContract's address

- `amountIn`: the input amount

- `amountOutMinimum`: the minimun output amount

- `deadline`: deadline

- `sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_type`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

###### Stake1Logic-exchangeWTONtoFLDv2-address-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLDv2(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`

Swap TON to FLD

###### Stake1Logic-vaultsOfPahse-uint256-

## Function `vaultsOfPahse(uint256 _phase)`

Get addresses of vaults of index phase

### Parameters:

- `_phase`: the pahse number

###### Stake1Logic-CreatedVault-address-address-uint256-

## Event `CreatedVault(address vault, address paytoken, uint256 cap)`

No description

###### Stake1Logic-CreatedStakeContract-address-address-uint256-

## Event `CreatedStakeContract(address vault, address stakeContract, uint256 phase)`

No description

###### Stake1Logic-ClosedSale-address-

## Event `ClosedSale(address vault)`

No description

###### Stake1Logic-SetStakeRegistry-address-

## Event `SetStakeRegistry(address stakeRegistry)`

No description
