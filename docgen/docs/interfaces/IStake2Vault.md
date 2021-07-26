# Functions:

- [`setTOS(address _tos)`](#IStake2Vault-setTOS-address-)

- [`changeCap(uint256 _cap)`](#IStake2Vault-changeCap-uint256-)

- [`changeName(string _name)`](#IStake2Vault-changeName-string-)

- [`setStakeAddress(address _stakeAddress)`](#IStake2Vault-setStakeAddress-address-)

- [`setRewardPerBlock(uint256 _rewardPerBlock)`](#IStake2Vault-setRewardPerBlock-uint256-)

- [`withdraw(address to, uint256 _amount)`](#IStake2Vault-withdraw-address-uint256-)

- [`claim(address _to, uint256 _amount)`](#IStake2Vault-claim-address-uint256-)

- [`infos()`](#IStake2Vault-infos--)

- [`balanceTOSAvailableAmount()`](#IStake2Vault-balanceTOSAvailableAmount--)

###### IStake2Vault-setTOS-address-

## Function `setTOS(address _tos)`

Sets TOS address

### Parameters:

- `_tos`:  TOS address

###### IStake2Vault-changeCap-uint256-

## Function `changeCap(uint256 _cap)`

Change cap of the vault

### Parameters:

- `_cap`:  allocated reward amount

###### IStake2Vault-changeName-string-

## Function `changeName(string _name)`

change name

### Parameters:

- `_name`:   name

###### IStake2Vault-setStakeAddress-address-

## Function `setStakeAddress(address _stakeAddress)`

set stake address

### Parameters:

- `_stakeAddress`:  stake address

###### IStake2Vault-setRewardPerBlock-uint256-

## Function `setRewardPerBlock(uint256 _rewardPerBlock)`

set reward per block

### Parameters:

- `_rewardPerBlock`:  allocated reward amount

###### IStake2Vault-withdraw-address-uint256-

## Function `withdraw(address to, uint256 _amount)`

If the vault has more money than the reward to give, the owner can withdraw the remaining amount.

### Parameters:

- `to`: to address

- `_amount`: the amount of withdrawal

###### IStake2Vault-claim-address-uint256-

## Function `claim(address _to, uint256 _amount)`

claim function.

sender is a staking contract.

A function that pays the amount(_amount) to _to by the staking contract.

A function that _to claim the amount(_amount) from the staking contract and gets the TOS in the vault.

### Parameters:

- `_to`: a user that received reward

- `_amount`: the receiving amount

###### IStake2Vault-infos--

## Function `infos()`

Give the infomation of this vault

### Return Values:

- return1 [tos, stakeAddress]

- return2 cap

- return3 stakeType

- return4 rewardPerBlock

- return5 name

###### IStake2Vault-balanceTOSAvailableAmount--

## Function `balanceTOSAvailableAmount()`

Returns Give the TOS balance stored in the vault

### Return Values:

- the balance of TOS in this vault.
