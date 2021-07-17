# Functions:

- [`constructor()`](#Stake2Vault-constructor--)

- [`receive()`](#Stake2Vault-receive--)

- [`setTOS(address _tos)`](#Stake2Vault-setTOS-address-)

- [`changeCap(uint256 _cap)`](#Stake2Vault-changeCap-uint256-)

- [`changeName(string _name)`](#Stake2Vault-changeName-string-)

- [`setStakeAddress(address _stakeAddress)`](#Stake2Vault-setStakeAddress-address-)

- [`setRewardPerBlock(uint256 _rewardPerBlock)`](#Stake2Vault-setRewardPerBlock-uint256-)

- [`withdraw(address to, uint256 _amount)`](#Stake2Vault-withdraw-address-uint256-)

- [`claim(address _to, uint256 _amount)`](#Stake2Vault-claim-address-uint256-)

- [`balanceTOSAvailableAmount()`](#Stake2Vault-balanceTOSAvailableAmount--)

- [`infos()`](#Stake2Vault-infos--)

# Events:

- [`ClaimedReward(address from, address to, uint256 amount)`](#Stake2Vault-ClaimedReward-address-address-uint256-)

###### Stake2Vault-constructor--

## Function `constructor()`

constructor of Stake1Vault

###### Stake2Vault-receive--

## Function `receive()`

receive function

###### Stake2Vault-setTOS-address-

## Function `setTOS(address _tos)`

Sets TOS address

### Parameters:

- `_tos`:  TOS address

###### Stake2Vault-changeCap-uint256-

## Function `changeCap(uint256 _cap)`

Change cap of the vault

### Parameters:

- `_cap`:  allocated reward amount

###### Stake2Vault-changeName-string-

## Function `changeName(string _name)`

change name

### Parameters:

- `_name`:   name

###### Stake2Vault-setStakeAddress-address-

## Function `setStakeAddress(address _stakeAddress)`

set stake address

### Parameters:

- `_stakeAddress`:  stake address

###### Stake2Vault-setRewardPerBlock-uint256-

## Function `setRewardPerBlock(uint256 _rewardPerBlock)`

set reward per block

### Parameters:

- `_rewardPerBlock`:  allocated reward amount

###### Stake2Vault-withdraw-address-uint256-

## Function `withdraw(address to, uint256 _amount)`

If the vault has more money than the reward to give, the owner can withdraw the remaining amount.

### Parameters:

- `to`: to address

- `_amount`: the amount of withdrawal

###### Stake2Vault-claim-address-uint256-

## Function `claim(address _to, uint256 _amount)`

claim function.

sender is a staking contract.

A function that pays the amount(_amount) to _to by the staking contract.

A function that _to claim the amount(_amount) from the staking contract and gets the tos in the vault.

### Parameters:

- `_to`: a user that received reward

- `_amount`: the receiving amount

###### Stake2Vault-balanceTOSAvailableAmount--

## Function `balanceTOSAvailableAmount()`

Returns Give the TOS balance stored in the vault

### Return Values:

- the balance of TOS in this vault.

###### Stake2Vault-infos--

## Function `infos()`

Give the infomation of this vault

### Return Values:

- return1 [tos, stakeAddress]

- return2 cap

- return3 stakeType

- return4 rewardPerBlock

- return5 name

###### Stake2Vault-ClaimedReward-address-address-uint256-

## Event `ClaimedReward(address from, address to, uint256 amount)`

event of according to request from(staking contract)  the amount of compensation is paid to to.

### Parameters:

- `from`: the stakeContract address that call claim

- `to`: the address that will receive the reward

- `amount`: the amount of reward
