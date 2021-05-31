# Functions:

- [`constructor(address _stakeSimpleFactory, address _stakeTONFactory, address _stakeDefiFactory)`](#StakeFactory-constructor-address-address-address-)

- [`transferOwnership(address newOwner)`](#StakeFactory-transferOwnership-address-)

- [`setStakeSimpleFactory(address _stakeSimpleFactory)`](#StakeFactory-setStakeSimpleFactory-address-)

- [`setStakeTONFactory(address _stakeTONFactory)`](#StakeFactory-setStakeTONFactory-address-)

- [`setStakeDefiFactory(address _stakeDefiFactory)`](#StakeFactory-setStakeDefiFactory-address-)

- [`create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`](#StakeFactory-create-uint256-address-4--address-uint256-3--)

## Function `constructor(address _stakeSimpleFactory, address _stakeTONFactory, address _stakeDefiFactory)` {#StakeFactory-constructor-address-address-address-}

No description

## Function `transferOwnership(address newOwner)` {#StakeFactory-transferOwnership-address-}

No description

## Function `setStakeSimpleFactory(address _stakeSimpleFactory)` {#StakeFactory-setStakeSimpleFactory-address-}

No description

## Function `setStakeTONFactory(address _stakeTONFactory)` {#StakeFactory-setStakeTONFactory-address-}

No description

## Function `setStakeDefiFactory(address _stakeDefiFactory)` {#StakeFactory-setStakeDefiFactory-address-}

No description

## Function `create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata) → address` {#StakeFactory-create-uint256-address-4--address-uint256-3--}

No description

### Parameters:

- `stakeType`: if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeDefiFactory

- `_addr`: array of [token, paytoken, vault, _defiAddr]

- `registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, endBlock]

### Return Values:

- contract address
