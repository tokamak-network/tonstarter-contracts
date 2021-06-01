# Functions:

- [`receive()`](#StakeSimple-receive--)

- [`transferOwnership(address newOwner)`](#StakeSimple-transferOwnership-address-)

- [`initialize(address _token, address _paytoken, address _vault, uint256 _saleStartBlock, uint256 _startBlock, uint256 _period)`](#StakeSimple-initialize-address-address-address-uint256-uint256-uint256-)

- [`stake(uint256 amount)`](#StakeSimple-stake-uint256-)

- [`withdraw()`](#StakeSimple-withdraw--)

- [`claim()`](#StakeSimple-claim--)

- [`canRewardAmount(address account, uint256 specilaBlock)`](#StakeSimple-canRewardAmount-address-uint256-)

# Events:

- [`Staked(address to, uint256 amount)`](#StakeSimple-Staked-address-uint256-)

- [`Claimed(address to, uint256 amount, uint256 currentBlcok)`](#StakeSimple-Claimed-address-uint256-uint256-)

- [`Withdrawal(address to, uint256 amount)`](#StakeSimple-Withdrawal-address-uint256-)

### StakeSimple-receive--

## Function `receive()`

No description

### StakeSimple-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

### StakeSimple-initialize-address-address-address-uint256-uint256-uint256-

## Function `initialize(address _token, address _paytoken, address _vault, uint256 _saleStartBlock, uint256 _startBlock, uint256 _period)`

Initialize

### StakeSimple-stake-uint256-

## Function `stake(uint256 amount)`

Stake amount

### StakeSimple-withdraw--

## Function `withdraw()`

To withdraw

### StakeSimple-claim--

## Function `claim()`

Claim for reward

### StakeSimple-canRewardAmount-address-uint256-

## Function `canRewardAmount(address account, uint256 specilaBlock)`

Returns the amount that can be rewarded

### StakeSimple-Staked-address-uint256-

## Event `Staked(address to, uint256 amount)`

No description

### StakeSimple-Claimed-address-uint256-uint256-

## Event `Claimed(address to, uint256 amount, uint256 currentBlcok)`

No description

### StakeSimple-Withdrawal-address-uint256-

## Event `Withdrawal(address to, uint256 amount)`

No description
