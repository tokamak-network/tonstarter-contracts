# Functions:

- [`constructor()`](#StakeSimple-constructor--)

- [`receive()`](#StakeSimple-receive--)

- [`stake(uint256 amount)`](#StakeSimple-stake-uint256-)

- [`withdraw()`](#StakeSimple-withdraw--)

- [`claim()`](#StakeSimple-claim--)

- [`canRewardAmount(address account, uint256 specificBlock)`](#StakeSimple-canRewardAmount-address-uint256-)

# Events:

- [`Staked(address to, uint256 amount)`](#StakeSimple-Staked-address-uint256-)

- [`Claimed(address to, uint256 amount, uint256 claimBlock)`](#StakeSimple-Claimed-address-uint256-uint256-)

- [`Withdrawal(address to, uint256 amount)`](#StakeSimple-Withdrawal-address-uint256-)

###### StakeSimple-constructor--

## Function `constructor()`

constructor of StakeSimple

###### StakeSimple-receive--

## Function `receive()`

receive ether

call stake function with msg.value

###### StakeSimple-stake-uint256-

## Function `stake(uint256 amount)`

Stake amount

### Parameters:

- `amount`:  the amount of staked

###### StakeSimple-withdraw--

## Function `withdraw()`

withdraw

###### StakeSimple-claim--

## Function `claim()`

Claim for reward

###### StakeSimple-canRewardAmount-address-uint256-

## Function `canRewardAmount(address account, uint256 specificBlock)`

Returns the amount that can be rewarded

### Parameters:

- `account`:  the account that claimed reward

- `specificBlock`: the block that claimed reward

### Return Values:

- reward the reward amount that can be taken

###### StakeSimple-Staked-address-uint256-

## Event `Staked(address to, uint256 amount)`

event on staking

### Parameters:

- `to`: the sender

- `amount`: the amount of staking

###### StakeSimple-Claimed-address-uint256-uint256-

## Event `Claimed(address to, uint256 amount, uint256 claimBlock)`

event on claim

### Parameters:

- `to`: the sender

- `amount`: the amount of claim

- `claimBlock`: the block of claim

###### StakeSimple-Withdrawal-address-uint256-

## Event `Withdrawal(address to, uint256 amount)`

event on withdrawal

### Parameters:

- `to`: the sender

- `amount`: the amount of withdrawal
