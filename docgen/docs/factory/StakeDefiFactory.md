# Functions:

- [`constructor(address _stakeDefiLogic)`](#StakeDefiFactory-constructor-address-)

- [`create(address[3] _addr, address _registry, uint256[3] _intdata, address owner)`](#StakeDefiFactory-create-address-3--address-uint256-3--address-)

### StakeDefiFactory-constructor-address-

## Function `constructor(address _stakeDefiLogic)`

constructor of StakeDefiFactory

### Parameters:

- `_stakeDefiLogic`: the logic address used in StakeDefiFactory

### StakeDefiFactory-create-address-3--address-uint256-3--address-

## Function `create(address[3] _addr, address _registry, uint256[3] _intdata, address owner)`

Create a stake contract that can operate the staked amount as a DeFi project.

### Parameters:

- `_addr`: array of [token, paytoken, vault]

- `_registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, endBlock]

- `owner`:  owner address

### Return Values:

- contract address
