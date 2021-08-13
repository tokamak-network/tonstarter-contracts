# Functions:

- [`constructor()`](#Stake2Vault-constructor--)

- [`receive()`](#Stake2Vault-receive--)

- [`setTOS(address _tos)`](#Stake2Vault-setTOS-address-)

- [`changeCap(uint256 _cap)`](#Stake2Vault-changeCap-uint256-)

- [`changeName(string _name)`](#Stake2Vault-changeName-string-)

- [`setStakeAddress(address _stakeAddress)`](#Stake2Vault-setStakeAddress-address-)

- [`setMiningAmountPerSecond(uint256 _miningPerSecond)`](#Stake2Vault-setMiningAmountPerSecond-uint256-)

- [`setMiningStartTime(uint256 _miningStartTime)`](#Stake2Vault-setMiningStartTime-uint256-)

- [`withdraw(address to, uint256 _amount)`](#Stake2Vault-withdraw-address-uint256-)

- [`claimMining(address to, uint256 minableAmount, uint256 miningAmount, uint256 nonMiningAmount)`](#Stake2Vault-claimMining-address-uint256-uint256-uint256-)

- [`claim(address _to, uint256 _amount)`](#Stake2Vault-claim-address-uint256-)

- [`balanceTOSAvailableAmount()`](#Stake2Vault-balanceTOSAvailableAmount--)

- [`infos()`](#Stake2Vault-infos--)

# Events:

- [`ClaimedMining(address to, uint256 minableAmount, uint256 miningAmount, uint256 nonMiningAmount)`](#Stake2Vault-ClaimedMining-address-uint256-uint256-uint256-)

- [`Claimed(address from, address to, uint256 amount)`](#Stake2Vault-Claimed-address-address-uint256-)

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

###### Stake2Vault-setMiningAmountPerSecond-uint256-

## Function `setMiningAmountPerSecond(uint256 _miningPerSecond)`

set mining amount per second

### Parameters:

- `_miningPerSecond`:  a mining amount per second

###### Stake2Vault-setMiningStartTime-uint256-

## Function `setMiningStartTime(uint256 _miningStartTime)`

set mining start time

### Parameters:

- `_miningStartTime`:  mining start time

###### Stake2Vault-withdraw-address-uint256-

## Function `withdraw(address to, uint256 _amount)`

If the vault has more money than the reward to give, the owner can withdraw the remaining amount.

### Parameters:

- `to`: to address

- `_amount`: the amount of withdrawal

###### Stake2Vault-claimMining-address-uint256-uint256-uint256-

## Function `claimMining(address to, uint256 minableAmount, uint256 miningAmount, uint256 nonMiningAmount)`

 a according to request from(staking contract)  the amount of mining is paid to to.

### Parameters:

- `to`: the address that will receive the reward

- `minableAmount`: minable amount

- `miningAmount`: amount mined

- `nonMiningAmount`: Amount not mined

###### Stake2Vault-claim-address-uint256-

## Function `claim(address _to, uint256 _amount)`

No description

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

- return4 miningPerSecond

- return5 name

###### Stake2Vault-ClaimedMining-address-uint256-uint256-uint256-

## Event `ClaimedMining(address to, uint256 minableAmount, uint256 miningAmount, uint256 nonMiningAmount)`

event of according to request from(staking contract)  the amount of mining is paid to to.

### Parameters:

- `to`: the address that will receive the reward

- `minableAmount`: minable amount

- `miningAmount`: amount mined

- `nonMiningAmount`: Amount not mined

###### Stake2Vault-Claimed-address-address-uint256-

## Event `Claimed(address from, address to, uint256 amount)`

No description
