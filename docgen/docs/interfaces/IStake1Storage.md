# Functions:

- [`token()`](#IStake1Storage-token--)

- [`stakeRegistry()`](#IStake1Storage-stakeRegistry--)

- [`paytoken()`](#IStake1Storage-paytoken--)

- [`vault()`](#IStake1Storage-vault--)

- [`saleStartBlock()`](#IStake1Storage-saleStartBlock--)

- [`startBlock()`](#IStake1Storage-startBlock--)

- [`endBlock()`](#IStake1Storage-endBlock--)

- [`rewardClaimedTotal()`](#IStake1Storage-rewardClaimedTotal--)

- [`totalStakedAmount()`](#IStake1Storage-totalStakedAmount--)

- [`totalStakers()`](#IStake1Storage-totalStakers--)

- [`getUserStaked(address user)`](#IStake1Storage-getUserStaked-address-)

###### IStake1Storage-token--

## Function `token()`

reward token : FLD

###### IStake1Storage-stakeRegistry--

## Function `stakeRegistry()`

registry

###### IStake1Storage-paytoken--

## Function `paytoken()`

paytoken is the token that the user stakes. ( if paytoken is ether, paytoken is address(0) )

###### IStake1Storage-vault--

## Function `vault()`

A vault that holds fld rewards.

###### IStake1Storage-saleStartBlock--

## Function `saleStartBlock()`

the start block for sale.

###### IStake1Storage-startBlock--

## Function `startBlock()`

the staking start block, once staking starts, users can no longer apply for staking.

###### IStake1Storage-endBlock--

## Function `endBlock()`

the staking end block.

###### IStake1Storage-rewardClaimedTotal--

## Function `rewardClaimedTotal()`

No description

###### IStake1Storage-totalStakedAmount--

## Function `totalStakedAmount()`

the total staked amount

###### IStake1Storage-totalStakers--

## Function `totalStakers()`

total stakers

###### IStake1Storage-getUserStaked-address-

## Function `getUserStaked(address user)`

user's staked information
