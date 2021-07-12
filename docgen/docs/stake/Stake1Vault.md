# Functions:

- [`constructor()`](#Stake1Vault-constructor--)

- [`receive()`](#Stake1Vault-receive--)

- [`setTOS(address _tos)`](#Stake1Vault-setTOS-address-)

- [`changeCap(uint256 _cap)`](#Stake1Vault-changeCap-uint256-)

- [`setDefiAddr(address _defiAddr)`](#Stake1Vault-setDefiAddr-address-)

- [`withdrawReward(uint256 _amount)`](#Stake1Vault-withdrawReward-uint256-)

- [`addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`](#Stake1Vault-addSubVaultOfStake-string-address-uint256-)

- [`closeSale()`](#Stake1Vault-closeSale--)

- [`claim(address _to, uint256 _amount)`](#Stake1Vault-claim-address-uint256-)

- [`canClaim(address _to, uint256 _amount)`](#Stake1Vault-canClaim-address-uint256-)

- [`balanceTOSAvailableAmount()`](#Stake1Vault-balanceTOSAvailableAmount--)

- [`stakeAddressesAll()`](#Stake1Vault-stakeAddressesAll--)

- [`orderedEndBlocksAll()`](#Stake1Vault-orderedEndBlocksAll--)

- [`totalRewardAmount(address _account)`](#Stake1Vault-totalRewardAmount-address-)

- [`infos()`](#Stake1Vault-infos--)

# Events:

- [`ClosedSale()`](#Stake1Vault-ClosedSale--)

- [`ClaimedReward(address from, address to, uint256 amount)`](#Stake1Vault-ClaimedReward-address-address-uint256-)

###### Stake1Vault-constructor--

## Function `constructor()`

constructor of Stake1Vault

###### Stake1Vault-receive--

## Function `receive()`

receive function

###### Stake1Vault-setTOS-address-

## Function `setTOS(address _tos)`

Sets TOS address

### Parameters:

- `_tos`:  TOS address

###### Stake1Vault-changeCap-uint256-

## Function `changeCap(uint256 _cap)`

Change cap of the vault

### Parameters:

- `_cap`:  allocated reward amount

###### Stake1Vault-setDefiAddr-address-

## Function `setDefiAddr(address _defiAddr)`

Set Defi Address

### Parameters:

- `_defiAddr`: DeFi related address

###### Stake1Vault-withdrawReward-uint256-

## Function `withdrawReward(uint256 _amount)`

If the vault has more money than the reward to give, the owner can withdraw the remaining amount.

### Parameters:

- `_amount`: the amount of withdrawal

###### Stake1Vault-addSubVaultOfStake-string-address-uint256-

## Function `addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`

 Add stake contract

### Parameters:

- `_name`: stakeContract's name

- `stakeContract`: stakeContract's address

- `periodBlocks`: the period that give rewards of stakeContract

###### Stake1Vault-closeSale--

## Function `closeSale()`

 Close the sale that can stake by user

###### Stake1Vault-claim-address-uint256-

## Function `claim(address _to, uint256 _amount)`

claim function.

sender is a staking contract.

A function that pays the amount(_amount) to _to by the staking contract.

A function that _to claim the amount(_amount) from the staking contract and gets the tos in the vault.

### Parameters:

- `_to`: a user that received reward

- `_amount`: the receiving amount

###### Stake1Vault-canClaim-address-uint256-

## Function `canClaim(address _to, uint256 _amount)`

 Whether user(to) can receive a reward amount(_amount)

### Parameters:

- `_to`:  a staking contract.

- `_amount`: the total reward amount of stakeContract

###### Stake1Vault-balanceTOSAvailableAmount--

## Function `balanceTOSAvailableAmount()`

Returns Give the TOS balance stored in the vault

### Return Values:

- the balance of TOS in this vault.

###### Stake1Vault-stakeAddressesAll--

## Function `stakeAddressesAll()`

Give all stakeContracts's addresses in this vault

### Return Values:

- all stakeContracts's addresses

###### Stake1Vault-orderedEndBlocksAll--

## Function `orderedEndBlocksAll()`

Give the ordered end blocks of stakeContracts in this vault

### Return Values:

- the ordered end blocks

###### Stake1Vault-totalRewardAmount-address-

## Function `totalRewardAmount(address _account)`

Give Total reward amount of stakeContract(_account)

### Return Values:

- Total reward amount of stakeContract(_account)

###### Stake1Vault-infos--

## Function `infos()`

Give the infomation of this vault

###### Stake1Vault-ClosedSale--

## Event `ClosedSale()`

event on sale-closed

###### Stake1Vault-ClaimedReward-address-address-uint256-

## Event `ClaimedReward(address from, address to, uint256 amount)`

event of according to request from(staking contract)  the amount of compensation is paid to to.

### Parameters:

- `from`: the stakeContract address that call claim

- `to`: the address that will receive the reward

- `amount`: the amount of reward
