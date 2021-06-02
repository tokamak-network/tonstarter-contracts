# Functions:

- [`initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`](#IStake1Vault-initialize-address-address-uint256-uint256-uint256-address-uint256-address-)

- [`setFLD(address _fld)`](#IStake1Vault-setFLD-address-)

- [`changeCap(uint256 _cap)`](#IStake1Vault-changeCap-uint256-)

- [`setDefiAddr(address _defiAddr)`](#IStake1Vault-setDefiAddr-address-)

- [`addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`](#IStake1Vault-addSubVaultOfStake-string-address-uint256-)

- [`closeSale()`](#IStake1Vault-closeSale--)

- [`claim(address _to, uint256 _amount)`](#IStake1Vault-claim-address-uint256-)

- [`canClaim(address _to, uint256 _amount)`](#IStake1Vault-canClaim-address-uint256-)

- [`infos()`](#IStake1Vault-infos--)

- [`balanceFLDAvailableAmount()`](#IStake1Vault-balanceFLDAvailableAmount--)

- [`totalRewardAmount(address _account)`](#IStake1Vault-totalRewardAmount-address-)

- [`stakeAddressesAll()`](#IStake1Vault-stakeAddressesAll--)

- [`orderedEndBlocksAll()`](#IStake1Vault-orderedEndBlocksAll--)

###### IStake1Vault-initialize-address-address-uint256-uint256-uint256-address-uint256-address-

## Function `initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`

No description

### Parameters:

- `_cap`:  Maximum amount of rewards issued, allocated reward amount.

- `_saleStartBlock`:  the sale start block

- `_stakeStartBlock`:  the staking start block

- `_stakefactory`: the factory address to create stakeContract

- `_stakeType`:  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 Defi linked staking

- `_defiAddr`: Used when an external address is required. default: address(0)

###### IStake1Vault-setFLD-address-

## Function `setFLD(address _fld)`

Sets FLD address

### Parameters:

- `_fld`:  FLD address

###### IStake1Vault-changeCap-uint256-

## Function `changeCap(uint256 _cap)`

Change cap of the vault

### Parameters:

- `_cap`:  allocated reward amount

###### IStake1Vault-setDefiAddr-address-

## Function `setDefiAddr(address _defiAddr)`

Set Defi Address

### Parameters:

- `_defiAddr`: DeFi related address

###### IStake1Vault-addSubVaultOfStake-string-address-uint256-

## Function `addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`

 Add stake contract

### Parameters:

- `_name`: stakeContract's name

- `stakeContract`: stakeContract's address

- `periodBlocks`: the period that give rewards of stakeContract

###### IStake1Vault-closeSale--

## Function `closeSale()`

 Close the sale that can stake by user

###### IStake1Vault-claim-address-uint256-

## Function `claim(address _to, uint256 _amount)`

claim function.

sender is a staking contract.

A function that pays the amount(_amount) to _to by the staking contract.

A function that _to claim the amount(_amount) from the staking contract and gets the FLD in the vault.

### Parameters:

- `_to`: a user that received reward

- `_amount`: the receiving amount

###### IStake1Vault-canClaim-address-uint256-

## Function `canClaim(address _to, uint256 _amount)`

whether it is available to claim amount, if it is available , return the total reward amount

### Parameters:

- `_to`:  a staking contract.

- `_amount`: the total reward amount of stakeContract

###### IStake1Vault-infos--

## Function `infos()`

Give the infomation of this vault

###### IStake1Vault-balanceFLDAvailableAmount--

## Function `balanceFLDAvailableAmount()`

Returns Give the FLD balance stored in the vault

### Return Values:

- the balance of FLD in this vault.

###### IStake1Vault-totalRewardAmount-address-

## Function `totalRewardAmount(address _account)`

Give Total reward amount of stakeContract(_account)

### Return Values:

- Total reward amount of stakeContract(_account)

###### IStake1Vault-stakeAddressesAll--

## Function `stakeAddressesAll()`

Give all stakeContracts's addresses in this vault

### Return Values:

- all stakeContracts's addresses

###### IStake1Vault-orderedEndBlocksAll--

## Function `orderedEndBlocksAll()`

Give the ordered end blocks of stakeContracts in this vault

### Return Values:

- the ordered end blocks
