# Functions:

- [`constructor()`](#StakeTON-constructor--)

- [`receive()`](#StakeTON-receive--)

- [`withdraw()`](#StakeTON-withdraw--)

- [`claim()`](#StakeTON-claim--)

- [`canRewardAmount(address account, uint256 specificBlock)`](#StakeTON-canRewardAmount-address-uint256-)

# Events:

- [`Staked(address to, uint256 amount)`](#StakeTON-Staked-address-uint256-)

- [`Claimed(address to, uint256 amount, uint256 currentBlcok)`](#StakeTON-Claimed-address-uint256-uint256-)

- [`Withdrawal(address to, uint256 tonAmount, uint256 fldAmount)`](#StakeTON-Withdrawal-address-uint256-uint256-)

###### StakeTON-constructor--

## Function `constructor()`

constructor of StakeTON

###### StakeTON-receive--

## Function `receive()`

receive ether

call stake function with msg.value

###### StakeTON-withdraw--

## Function `withdraw()`

withdraw

###### StakeTON-claim--

## Function `claim()`

Claim for reward

###### StakeTON-canRewardAmount-address-uint256-

## Function `canRewardAmount(address account, uint256 specificBlock)`

Returns the amount that can be rewarded

### Parameters:

- `account`:  the account that claimed reward

- `specificBlock`: the block that claimed reward

### Return Values:

- reward the reward amount that can be taken

###### StakeTON-Staked-address-uint256-

## Event `Staked(address to, uint256 amount)`

event on staking

### Parameters:

- `to`: the sender

- `amount`: the amount of staking

###### StakeTON-Claimed-address-uint256-uint256-

## Event `Claimed(address to, uint256 amount, uint256 currentBlcok)`

event on claim

### Parameters:

- `to`: the sender

- `amount`: the amount of claim

- `currentBlcok`: the block of claim

###### StakeTON-Withdrawal-address-uint256-uint256-

## Event `Withdrawal(address to, uint256 tonAmount, uint256 fldAmount)`

event on withdrawal

### Parameters:

- `to`: the sender

- `tonAmount`: the amount of TON withdrawal

- `fldAmount`: the amount of FLD withdrawal
