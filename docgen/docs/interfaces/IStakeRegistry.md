# Functions:

- [`setTokamak(address _ton, address _wton, address _depositManager, address _seigManager, address _swapProxy)`](#IStakeRegistry-setTokamak-address-address-address-address-address-)

- [`addDefiInfo(string _name, address _router, address _ex1, address _ex2, uint256 _fee, address _routerV2)`](#IStakeRegistry-addDefiInfo-string-address-address-address-uint256-address-)

- [`addVault(address _vault, uint256 _phase, bytes32 _vaultName)`](#IStakeRegistry-addVault-address-uint256-bytes32-)

- [`addStakeContract(address _vault, address _stakeContract)`](#IStakeRegistry-addStakeContract-address-address-)

- [`getTokamak()`](#IStakeRegistry-getTokamak--)

- [`getUniswap()`](#IStakeRegistry-getUniswap--)

- [`validVault(uint256 _phase, address _vault)`](#IStakeRegistry-validVault-uint256-address-)

- [`phasesAll(uint256 _index)`](#IStakeRegistry-phasesAll-uint256-)

- [`stakeContractsOfVaultAll(address _vault)`](#IStakeRegistry-stakeContractsOfVaultAll-address-)

- [`defiInfo(bytes32 _name)`](#IStakeRegistry-defiInfo-bytes32-)

###### IStakeRegistry-setTokamak-address-address-address-address-address-

## Function `setTokamak(address _ton, address _wton, address _depositManager, address _seigManager, address _swapProxy)`

Set addresses for Tokamak integration

### Parameters:

- `_ton`: TON address

- `_wton`: WTON address

- `_depositManager`: DepositManager address

- `_seigManager`: SeigManager address

- `_swapProxy`: Proxy address that can swap TON and WTON

###### IStakeRegistry-addDefiInfo-string-address-address-address-uint256-address-

## Function `addDefiInfo(string _name, address _router, address _ex1, address _ex2, uint256 _fee, address _routerV2)`

Add information related to Defi

### Parameters:

- `_name`: name . ex) UNISWAP_V3

- `_router`: entry point of defi

- `_ex1`:  additional variable . ex) positionManagerAddress in Uniswap V3

- `_ex2`:  additional variable . ex) WETH Address in Uniswap V3

- `_fee`:  fee

- `_routerV2`: In case of uniswap, router address of uniswapV2

###### IStakeRegistry-addVault-address-uint256-bytes32-

## Function `addVault(address _vault, uint256 _phase, bytes32 _vaultName)`

Add Vault

It is excuted by proxy

### Parameters:

- `_vault`: vault address

- `_phase`: phase ex) 1,2,3

- `_vaultName`:  hash of vault's name

###### IStakeRegistry-addStakeContract-address-address-

## Function `addStakeContract(address _vault, address _stakeContract)`

Add StakeContract in vault

It is excuted by proxy

### Parameters:

- `_vault`: vault address

- `_stakeContract`:  StakeContract address

###### IStakeRegistry-getTokamak--

## Function `getTokamak()`

Get addresses for Tokamak interface

###### IStakeRegistry-getUniswap--

## Function `getUniswap()`

Get indos for UNISWAP_V3 interface

###### IStakeRegistry-validVault-uint256-address-

## Function `validVault(uint256 _phase, address _vault)`

Checks if a vault is withing the given phase

### Parameters:

- `_phase`: the phase number

- `_vault`: the vault's address

### Return Values:

- valid true or false

###### IStakeRegistry-phasesAll-uint256-

## Function `phasesAll(uint256 _index)`

No description

###### IStakeRegistry-stakeContractsOfVaultAll-address-

## Function `stakeContractsOfVaultAll(address _vault)`

No description

###### IStakeRegistry-defiInfo-bytes32-

## Function `defiInfo(bytes32 _name)`

view defi info

### Parameters:

- `_name`:  hash name : keccak256(abi.encodePacked(_name));

### Return Values:

- name  _name ex) UNISWAP_V3, UNISWAP_V3_token0_token1

- router entry point of defi

- ext1  additional variable . ex) positionManagerAddress in Uniswap V3

- ext2  additional variable . ex) WETH Address in Uniswap V3

- fee  fee

- routerV2 In case of uniswap, router address of uniswapV2
