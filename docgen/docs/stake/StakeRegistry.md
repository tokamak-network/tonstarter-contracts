# Functions:

- [`constructor(address _tos)`](#StakeRegistry-constructor-address-)

- [`setTokamak(address _ton, address _wton, address _depositManager, address _seigManager, address _swapProxy)`](#StakeRegistry-setTokamak-address-address-address-address-address-)

- [`addDefiInfo(string _name, address _router, address _ex1, address _ex2, uint256 _fee, address _routerV2)`](#StakeRegistry-addDefiInfo-string-address-address-address-uint256-address-)

- [`addVault(address _vault, uint256 _phase, bytes32 _vaultName)`](#StakeRegistry-addVault-address-uint256-bytes32-)

- [`addStakeContract(address _vault, address _stakeContract)`](#StakeRegistry-addStakeContract-address-address-)

- [`getTokamak()`](#StakeRegistry-getTokamak--)

- [`getUniswap()`](#StakeRegistry-getUniswap--)

- [`phasesAll(uint256 _index)`](#StakeRegistry-phasesAll-uint256-)

- [`stakeContractsOfVaultAll(address _vault)`](#StakeRegistry-stakeContractsOfVaultAll-address-)

- [`validVault(uint256 _phase, address _vault)`](#StakeRegistry-validVault-uint256-address-)

# Events:

- [`AddedVault(address vault, uint256 phase)`](#StakeRegistry-AddedVault-address-uint256-)

- [`AddedStakeContract(address vault, address stakeContract)`](#StakeRegistry-AddedStakeContract-address-address-)

- [`SetTokamak(address ton, address wton, address depositManager, address seigManager, address swapProxy)`](#StakeRegistry-SetTokamak-address-address-address-address-address-)

- [`AddedDefiInfo(bytes32 nameHash, string name, address router, address ex1, address ex2, uint256 fee, address routerV2)`](#StakeRegistry-AddedDefiInfo-bytes32-string-address-address-address-uint256-address-)

###### StakeRegistry-constructor-address-

## Function `constructor(address _tos)`

constructor of StakeRegistry

### Parameters:

- `_tos`: TOS address

###### StakeRegistry-setTokamak-address-address-address-address-address-

## Function `setTokamak(address _ton, address _wton, address _depositManager, address _seigManager, address _swapProxy)`

Set addresses for Tokamak integration

### Parameters:

- `_ton`: TON address

- `_wton`: WTON address

- `_depositManager`: DepositManager address

- `_seigManager`: SeigManager address

###### StakeRegistry-addDefiInfo-string-address-address-address-uint256-address-

## Function `addDefiInfo(string _name, address _router, address _ex1, address _ex2, uint256 _fee, address _routerV2)`

Add information related to Defi

### Parameters:

- `_name`: name . ex) UNISWAP_V3

- `_router`: entry point of defi

- `_ex1`:  additional variable . ex) positionManagerAddress in Uniswap V3

- `_ex2`:  additional variable . ex) WETH Address in Uniswap V3

- `_fee`:  fee

- `_routerV2`: In case of uniswap, router address of uniswapV2

###### StakeRegistry-addVault-address-uint256-bytes32-

## Function `addVault(address _vault, uint256 _phase, bytes32 _vaultName)`

Add Vault

It is excuted by proxy

### Parameters:

- `_vault`: vault address

- `_phase`: phase ex) 1,2,3

- `_vaultName`:  hash of vault's name

###### StakeRegistry-addStakeContract-address-address-

## Function `addStakeContract(address _vault, address _stakeContract)`

Add StakeContract in vault

It is excuted by proxy

### Parameters:

- `_vault`: vault address

- `_stakeContract`:  StakeContract address

###### StakeRegistry-getTokamak--

## Function `getTokamak()`

Get addresses for Tokamak interface

###### StakeRegistry-getUniswap--

## Function `getUniswap()`

Get indos for UNISWAP_V3 interface

###### StakeRegistry-phasesAll-uint256-

## Function `phasesAll(uint256 _index)`

Get addresses of vaults of index phase

### Parameters:

- `_index`: the phase number

### Return Values:

- the list of vaults of phase[_index]

###### StakeRegistry-stakeContractsOfVaultAll-address-

## Function `stakeContractsOfVaultAll(address _vault)`

Get addresses of staker of _vault

### Parameters:

- `_vault`: the vault's address

### Return Values:

- the list of stakeContracts of vault

###### StakeRegistry-validVault-uint256-address-

## Function `validVault(uint256 _phase, address _vault)`

Checks if a vault is withing the given phase

### Parameters:

- `_phase`: the phase number

- `_vault`: the vault's address

### Return Values:

- valid true or false

###### StakeRegistry-AddedVault-address-uint256-

## Event `AddedVault(address vault, uint256 phase)`

event on add the vault

### Parameters:

- `vault`: the vault address

- `phase`: the phase of TOS platform

###### StakeRegistry-AddedStakeContract-address-address-

## Event `AddedStakeContract(address vault, address stakeContract)`

event on add the stake contract in vault

### Parameters:

- `vault`: the vault address

- `stakeContract`: the stake contract address created

###### StakeRegistry-SetTokamak-address-address-address-address-address-

## Event `SetTokamak(address ton, address wton, address depositManager, address seigManager, address swapProxy)`

event on set the addresses related to tokamak

### Parameters:

- `ton`: the TON address

- `wton`: the WTON address

- `depositManager`: the DepositManager address

- `seigManager`: the SeigManager address

- `swapProxy`: the SwapProxy address

###### StakeRegistry-AddedDefiInfo-bytes32-string-address-address-address-uint256-address-

## Event `AddedDefiInfo(bytes32 nameHash, string name, address router, address ex1, address ex2, uint256 fee, address routerV2)`

event on add the information related to defi.

### Parameters:

- `nameHash`: the name hash

- `name`: the name of defi identify

- `router`: the entry address

- `ex1`: the extra 1 addres

- `ex2`: the extra 2 addres

- `fee`: fee

- `routerV2`: the uniswap2 router address
