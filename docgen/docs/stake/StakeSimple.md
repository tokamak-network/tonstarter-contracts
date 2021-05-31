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

## Function `receive()` {#StakeSimple-receive--}

No description

## Function `transferOwnership(address newOwner)` {#StakeSimple-transferOwnership-address-}

No description

## Function `initialize(address _token, address _paytoken, address _vault, uint256 _saleStartBlock, uint256 _startBlock, uint256 _period)` {#StakeSimple-initialize-address-address-address-uint256-uint256-uint256-}

Initialize

## Function `stake(uint256 amount)` {#StakeSimple-stake-uint256-}

Stake amount

## Function `withdraw()` {#StakeSimple-withdraw--}

To withdraw

## Function `claim()` {#StakeSimple-claim--}

Claim for reward

## Function `canRewardAmount(address account, uint256 specilaBlock) → uint256` {#StakeSimple-canRewardAmount-address-uint256-}

Returns the amount that can be rewarded

## Event `Staked(address to, uint256 amount)` {#StakeSimple-Staked-address-uint256-}

No description

## Event `Claimed(address to, uint256 amount, uint256 currentBlcok)` {#StakeSimple-Claimed-address-uint256-uint256-}

No description

## Event `Withdrawal(address to, uint256 amount)` {#StakeSimple-Withdrawal-address-uint256-}

No description
