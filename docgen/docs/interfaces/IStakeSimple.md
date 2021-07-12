# Functions:

- [`stake(uint256 amount)`](#IStakeSimple-stake-uint256-)

- [`withdraw()`](#IStakeSimple-withdraw--)

- [`claim()`](#IStakeSimple-claim--)

- [`canRewardAmount(address account, uint256 specificBlock)`](#IStakeSimple-canRewardAmount-address-uint256-)

###### IStakeSimple-stake-uint256-

## Function `stake(uint256 amount)`

Stake amount

### Parameters:

- `amount`:  the amount of staked

###### IStakeSimple-withdraw--

## Function `withdraw()`

withdraw

###### IStakeSimple-claim--

## Function `claim()`

Claim for reward

###### IStakeSimple-canRewardAmount-address-uint256-

## Function `canRewardAmount(address account, uint256 specificBlock)`

Returns the amount that can be rewarded

### Parameters:

- `account`:  the account that claimed reward

- `specificBlock`: the block that claimed reward

### Return Values:

- reward the reward amount that can be taken
