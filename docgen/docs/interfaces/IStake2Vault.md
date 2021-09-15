# Functions:

- [`setTOS(address _tos)`](#IStake2Vault-setTOS-address-)

- [`changeCap(uint256 _cap)`](#IStake2Vault-changeCap-uint256-)

- [`changeName(string _name)`](#IStake2Vault-changeName-string-)

- [`setStakeAddress(address _stakeAddress)`](#IStake2Vault-setStakeAddress-address-)

- [`setMiningStartTime(uint256 _miningStartTime)`](#IStake2Vault-setMiningStartTime-uint256-)

- [`setMiningAmountPerSecond(uint256 _miningPerSecond)`](#IStake2Vault-setMiningAmountPerSecond-uint256-)

- [`withdraw(address to, uint256 _amount)`](#IStake2Vault-withdraw-address-uint256-)

- [`claim(address _to, uint256 _amount)`](#IStake2Vault-claim-address-uint256-)

- [`claimMining(address to, uint256 minableAmount, uint256 miningAmount, uint256 nonMiningAmount)`](#IStake2Vault-claimMining-address-uint256-uint256-uint256-)

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

###### IStake2Vault-setMiningStartTime-uint256-

## Function `setMiningStartTime(uint256 _miningStartTime)`

set mining start time

### Parameters:

- `_miningStartTime`:  mining start time

###### IStake2Vault-setMiningAmountPerSecond-uint256-

## Function `setMiningAmountPerSecond(uint256 _miningPerSecond)`

set mining amount per second

### Parameters:

- `_miningPerSecond`:  a mining amount per second

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

###### IStake2Vault-claimMining-address-uint256-uint256-uint256-

## Function `claimMining(address to, uint256 minableAmount, uint256 miningAmount, uint256 nonMiningAmount)`

 a according to request from(staking contract)  the amount of mining is paid to to.

### Parameters:

- `to`: the address that will receive the reward

- `minableAmount`: minable amount

- `miningAmount`: amount mined

- `nonMiningAmount`: Amount not mined

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
