# Functions:

- [`constructor()`](#StakeTON-constructor--)

- [`receive()`](#StakeTON-receive--)

- [`stake(uint256 amount)`](#StakeTON-stake-uint256-)

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

###### StakeTON-stake-uint256-

## Function `stake(uint256 amount)`

Stake amount

### Parameters:

- `amount`:  the amount of staked

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

No description

###### StakeTON-Claimed-address-uint256-uint256-

## Event `Claimed(address to, uint256 amount, uint256 currentBlcok)`

No description

###### StakeTON-Withdrawal-address-uint256-uint256-

## Event `Withdrawal(address to, uint256 tonAmount, uint256 fldAmount)`

No description