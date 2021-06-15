# Functions:

- [`setStore(address _tos, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager)`](#IStake1Logic-setStore-address-address-address-address-address-address-address-address-)

- [`createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr)`](#IStake1Logic-createVault-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-)

- [`createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name)`](#IStake1Logic-createStakeContract-uint256-address-address-address-uint256-string-)

- [`addVault(uint256 _phase, bytes32 _vaultName, address _vault)`](#IStake1Logic-addVault-uint256-bytes32-address-)

- [`closeSale(address _vault)`](#IStake1Logic-closeSale-address-)

- [`stakeContractsOfVault(address _vault)`](#IStake1Logic-stakeContractsOfVault-address-)

- [`vaultsOfPhase(uint256 _phaseIndex)`](#IStake1Logic-vaultsOfPhase-uint256-)

- [`tokamakStaking(address _stakeContract, address _layer2, uint256 stakeAmount)`](#IStake1Logic-tokamakStaking-address-address-uint256-)

- [`tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount)`](#IStake1Logic-tokamakRequestUnStaking-address-address-uint256-)

- [`tokamakRequestUnStakingAll(address _stakeContract, address _layer2)`](#IStake1Logic-tokamakRequestUnStakingAll-address-address-)

- [`tokamakProcessUnStaking(address _stakeContract, address _layer2)`](#IStake1Logic-tokamakProcessUnStaking-address-address-)

- [`exchangeWTONtoTOS(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`](#IStake1Logic-exchangeWTONtoTOS-address-uint256-uint256-uint256-uint160-uint256-)

- [`vaultsOfPahse(uint256 _phase)`](#IStake1Logic-vaultsOfPahse-uint256-)

###### IStake1Logic-setStore-address-address-address-address-address-address-address-address-

## Function `setStore(address _tos, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager)`

No description

### Parameters:

- `_tos`:  TOS token address

- `_stakeRegistry`: the registry address

- `_stakeFactory`: the StakeFactory address

- `_stakeVaultFactory`: the StakeVaultFactory address

- `_ton`:  TON address in Tokamak

- `_wton`: WTON address in Tokamak

- `_depositManager`: DepositManager address in Tokamak

- `_seigManager`: SeigManager address in Tokamak

###### IStake1Logic-createVault-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-

## Function `createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr)`

create vault

### Parameters:

- `_paytoken`: the token used for staking by user

- `_cap`:  allocated reward amount

- `_saleStartBlock`:  the start block that can stake by user

- `_stakeStartBlock`: the start block that end staking by user and start that can claim reward by user

- `_phase`:  phase of TOS platform

- `_vaultName`:  vault's name's hash

- `_stakeType`:  stakeContract's type, if 0, StakeTON, else if 1 , StakeSimple , else if 2, StakeDefi

- `_defiAddr`:  extra defi address , default is zero address

###### IStake1Logic-createStakeContract-uint256-address-address-address-uint256-string-

## Function `createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name)`

create stake contract in vault

### Parameters:

- `_phase`: the phase of TOS platform

- `_vault`:  vault's address

- `token`:  the reward token's address

- `paytoken`:  the token used for staking by user

- `periodBlock`:  the period that generate reward

- `_name`:  the stake contract's name

###### IStake1Logic-addVault-uint256-bytes32-address-

## Function `addVault(uint256 _phase, bytes32 _vaultName, address _vault)`

create stake contract in vault

### Parameters:

- `_phase`: phase of TOS platform

- `_vaultName`: vault's name's hash

- `_vault`: vault's address

###### IStake1Logic-closeSale-address-

## Function `closeSale(address _vault)`

end to staking by user

### Parameters:

- `_vault`: vault's address

###### IStake1Logic-stakeContractsOfVault-address-

## Function `stakeContractsOfVault(address _vault)`

list of stakeContracts in vault

### Parameters:

- `_vault`: vault's address

###### IStake1Logic-vaultsOfPhase-uint256-

## Function `vaultsOfPhase(uint256 _phaseIndex)`

list of vaults in _phaseIndex phase

### Parameters:

- `_phaseIndex`: the phase number

###### IStake1Logic-tokamakStaking-address-address-uint256-

## Function `tokamakStaking(address _stakeContract, address _layer2, uint256 stakeAmount)`

stake in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

- `stakeAmount`: the amount that stake to layer2

###### IStake1Logic-tokamakRequestUnStaking-address-address-uint256-

## Function `tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount)`

Requests unstaking in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

- `amount`: the amount of unstaking

###### IStake1Logic-tokamakRequestUnStakingAll-address-address-

## Function `tokamakRequestUnStakingAll(address _stakeContract, address _layer2)`

Requests unstaking the amount of all  in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

###### IStake1Logic-tokamakProcessUnStaking-address-address-

## Function `tokamakProcessUnStaking(address _stakeContract, address _layer2)`

Processes unstaking the requested unstaking amount in tokamak's layer2

### Parameters:

- `_stakeContract`: the stakeContract's address

- `_layer2`: the layer2 address in Tokamak

###### IStake1Logic-exchangeWTONtoTOS-address-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoTOS(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`

Swap TON to TOS using uniswap v3

this function used in StakeTON ( stakeType=0 )

### Parameters:

- `_stakeContract`: the stakeContract's address

- `amountIn`: the input amount

- `amountOutMinimum`: the minimun output amount

- `deadline`: deadline

- `sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_type`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

###### IStake1Logic-vaultsOfPahse-uint256-

## Function `vaultsOfPahse(uint256 _phase)`

Get addresses of vaults of index phase

### Parameters:

- `_phase`: the pahse number
