# Functions:

- [`initialize(address _token, address _paytoken, address _vault, uint256 _saleStartBlock, uint256 _startBlock, uint256 _period)`](#IStakeSimple-initialize-address-address-address-uint256-uint256-uint256-)

- [`stake(uint256 amount)`](#IStakeSimple-stake-uint256-)

- [`withdraw()`](#IStakeSimple-withdraw--)

- [`claim()`](#IStakeSimple-claim--)

- [`canRewardAmount(address account, uint256 specificBlock)`](#IStakeSimple-canRewardAmount-address-uint256-)

###### IStakeSimple-initialize-address-address-address-uint256-uint256-uint256-

## Function `initialize(address _token, address _paytoken, address _vault, uint256 _saleStartBlock, uint256 _startBlock, uint256 _period)`

No description

### Parameters:

- `_vault`:  the _ault's address

- `_saleStartBlock`:  the sale start block

- `_startBlock`:  the staking start block

- `_period`: the period that user can generate reward amount

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
