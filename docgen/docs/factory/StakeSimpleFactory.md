# Functions:

- [`constructor(address _stakeSimpleLogic)`](#StakeSimpleFactory-constructor-address-)

- [`create(address[3] _addr, uint256[3] _intdata, address owner)`](#StakeSimpleFactory-create-address-3--uint256-3--address-)

### StakeSimpleFactory-constructor-address-

## Function `constructor(address _stakeSimpleLogic)`

constructor of StakeSimpleFactory

### Parameters:

- `_stakeSimpleLogic`: the logic address used in StakeSimpleFactory

### StakeSimpleFactory-create-address-3--uint256-3--address-

## Function `create(address[3] _addr, uint256[3] _intdata, address owner)`

Create a stake contract that can operate the staked amount as a DeFi project.

### Parameters:

- `_addr`: array of [token, paytoken, vault]

- `_intdata`: array of [saleStartBlock, startBlock, endBlock]

- `owner`:  owner address

### Return Values:

- contract address
