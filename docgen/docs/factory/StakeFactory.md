# Functions:

- [`constructor(address _stakeSimpleFactory, address _stakeTONFactory, address _stakeDefiFactory)`](#StakeFactory-constructor-address-address-address-)

- [`transferOwnership(address newOwner)`](#StakeFactory-transferOwnership-address-)

- [`setStakeSimpleFactory(address _stakeSimpleFactory)`](#StakeFactory-setStakeSimpleFactory-address-)

- [`setStakeTONFactory(address _stakeTONFactory)`](#StakeFactory-setStakeTONFactory-address-)

- [`setStakeDefiFactory(address _stakeDefiFactory)`](#StakeFactory-setStakeDefiFactory-address-)

- [`create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`](#StakeFactory-create-uint256-address-4--address-uint256-3--)

###### StakeFactory-constructor-address-address-address-

## Function `constructor(address _stakeSimpleFactory, address _stakeTONFactory, address _stakeDefiFactory)`

constructor of StakeFactory

### Parameters:

- `_stakeSimpleFactory`: the logic address used in StakeSimpleFactory

- `_stakeTONFactory`: the logic address used in StakeTONFactory

- `_stakeTONFactory`: the logic address used in StakeTONFactory

###### StakeFactory-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

###### StakeFactory-setStakeSimpleFactory-address-

## Function `setStakeSimpleFactory(address _stakeSimpleFactory)`

Set StakeSimpleFactory address

### Parameters:

- `_stakeSimpleFactory`: new StakeSimpleFactory address

###### StakeFactory-setStakeTONFactory-address-

## Function `setStakeTONFactory(address _stakeTONFactory)`

Set StakeTONFactory address

### Parameters:

- `_stakeTONFactory`: new StakeTONFactory address

###### StakeFactory-setStakeDefiFactory-address-

## Function `setStakeDefiFactory(address _stakeDefiFactory)`

Set StakeDefiFactory address

### Parameters:

- `_stakeDefiFactory`: new StakeDefiFactory address

###### StakeFactory-create-uint256-address-4--address-uint256-3--

## Function `create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`

Create a stake contract that calls the desired stake factory according to stakeType

### Parameters:

- `stakeType`: if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeDefiFactory

- `_addr`: array of [token, paytoken, vault, _defiAddr]

- `registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, periodBlocks]

### Return Values:

- contract address
