# Functions:

- [`constructor(address _fld)`](#StakeRegistry-constructor-address-)

- [`transferOwnership(address newOwner)`](#StakeRegistry-transferOwnership-address-)

- [`setTokamak(address _ton, address _wton, address _depositManager, address _seigManager)`](#StakeRegistry-setTokamak-address-address-address-address-)

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

- [`SetTokamak(address ton, address wton, address depositManager, address seigManager)`](#StakeRegistry-SetTokamak-address-address-address-address-)

- [`AddedDefiInfo(bytes32 nameHash, string name, address router, address ex1, address ex2, uint256 fee, address routerV2)`](#StakeRegistry-AddedDefiInfo-bytes32-string-address-address-address-uint256-address-)

###### StakeRegistry-constructor-address-

## Function `constructor(address _fld)`

constructor of StakeRegistry

### Parameters:

- `_fld`: FLD address

###### StakeRegistry-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

###### StakeRegistry-setTokamak-address-address-address-address-

## Function `setTokamak(address _ton, address _wton, address _depositManager, address _seigManager)`

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

No description

###### StakeRegistry-AddedStakeContract-address-address-

## Event `AddedStakeContract(address vault, address stakeContract)`

No description

###### StakeRegistry-SetTokamak-address-address-address-address-

## Event `SetTokamak(address ton, address wton, address depositManager, address seigManager)`

No description

###### StakeRegistry-AddedDefiInfo-bytes32-string-address-address-address-uint256-address-

## Event `AddedDefiInfo(bytes32 nameHash, string name, address router, address ex1, address ex2, uint256 fee, address routerV2)`

No description