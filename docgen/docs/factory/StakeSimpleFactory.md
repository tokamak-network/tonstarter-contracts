# Functions:

- [`constructor(address _stakeSimpleLogic)`](#StakeSimpleFactory-constructor-address-)

- [`create(address[4] _addr, address _registry, uint256[3] _intdata, address owner)`](#StakeSimpleFactory-create-address-4--address-uint256-3--address-)

###### StakeSimpleFactory-constructor-address-

## Function `constructor(address _stakeSimpleLogic)`

constructor of StakeSimpleFactory

### Parameters:

- `_stakeSimpleLogic`: the logic address used in StakeSimpleFactory

###### StakeSimpleFactory-create-address-4--address-uint256-3--address-

## Function `create(address[4] _addr, address _registry, uint256[3] _intdata, address owner)`

Create a stake contract that can operate the staked amount as a DeFi project.

### Parameters:

- `_addr`: array of [token, paytoken, vault, defiAddr]

- `_intdata`: array of [saleStartBlock, startBlock, periodBlocks]

- `owner`:  owner address

### Return Values:

- contract address
