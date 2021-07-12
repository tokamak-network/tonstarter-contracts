# Functions:

- [`setTOS(address _tos)`](#IStake1Vault-setTOS-address-)

- [`changeCap(uint256 _cap)`](#IStake1Vault-changeCap-uint256-)

- [`setDefiAddr(address _defiAddr)`](#IStake1Vault-setDefiAddr-address-)

- [`withdrawReward(uint256 _amount)`](#IStake1Vault-withdrawReward-uint256-)

- [`addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`](#IStake1Vault-addSubVaultOfStake-string-address-uint256-)

- [`closeSale()`](#IStake1Vault-closeSale--)

- [`claim(address _to, uint256 _amount)`](#IStake1Vault-claim-address-uint256-)

- [`canClaim(address _to, uint256 _amount)`](#IStake1Vault-canClaim-address-uint256-)

- [`infos()`](#IStake1Vault-infos--)

- [`balanceTOSAvailableAmount()`](#IStake1Vault-balanceTOSAvailableAmount--)

- [`totalRewardAmount(address _account)`](#IStake1Vault-totalRewardAmount-address-)

- [`stakeAddressesAll()`](#IStake1Vault-stakeAddressesAll--)

- [`orderedEndBlocksAll()`](#IStake1Vault-orderedEndBlocksAll--)

###### IStake1Vault-setTOS-address-

## Function `setTOS(address _tos)`

Sets TOS address

### Parameters:

- `_tos`:  TOS address

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

###### IStake1Vault-withdrawReward-uint256-

## Function `withdrawReward(uint256 _amount)`

If the vault has more money than the reward to give, the owner can withdraw the remaining amount.

### Parameters:

- `_amount`: the amount of withdrawal

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

A function that _to claim the amount(_amount) from the staking contract and gets the TOS in the vault.

### Parameters:

- `_to`: a user that received reward

- `_amount`: the receiving amount

###### IStake1Vault-canClaim-address-uint256-

## Function `canClaim(address _to, uint256 _amount)`

Whether user(to) can receive a reward amount(_amount)

### Parameters:

- `_to`:  a staking contract.

- `_amount`: the total reward amount of stakeContract

###### IStake1Vault-infos--

## Function `infos()`

Give the infomation of this vault

###### IStake1Vault-balanceTOSAvailableAmount--

## Function `balanceTOSAvailableAmount()`

Returns Give the TOS balance stored in the vault

### Return Values:

- the balance of TOS in this vault.

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
