# Functions:

- [`create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`](#IStakeFactory-create-uint256-address-4--address-uint256-3--)

- [`setStakeTONFactory(address _stakeTONFactory)`](#IStakeFactory-setStakeTONFactory-address-)

- [`setStakeDefiFactory(address _stakeDefiFactory)`](#IStakeFactory-setStakeDefiFactory-address-)

- [`setStakeSimpleFactory(address _stakeSimpleFactory)`](#IStakeFactory-setStakeSimpleFactory-address-)

###### IStakeFactory-create-uint256-address-4--address-uint256-3--

## Function `create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`

Create a stake contract that calls the desired stake factory according to stakeType

### Parameters:

- `stakeType`: if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeDefiFactory

- `_addr`: array of [token, paytoken, vault, _defiAddr]

- `registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, endBlock]

### Return Values:

- contract address

###### IStakeFactory-setStakeTONFactory-address-

## Function `setStakeTONFactory(address _stakeTONFactory)`

Set StakeTONFactory address

### Parameters:

- `_stakeTONFactory`: new StakeTONFactory address

###### IStakeFactory-setStakeDefiFactory-address-

## Function `setStakeDefiFactory(address _stakeDefiFactory)`

Set StakeDefiFactory address

### Parameters:

- `_stakeDefiFactory`: new StakeDefiFactory address

###### IStakeFactory-setStakeSimpleFactory-address-

## Function `setStakeSimpleFactory(address _stakeSimpleFactory)`

Set StakeSimpleFactory address

### Parameters:

- `_stakeSimpleFactory`: new StakeSimpleFactory address
