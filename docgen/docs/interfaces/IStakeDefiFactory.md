# Functions:

- [`create(address[3] _addr, address _registry, uint256[3] _intdata, address owner)`](#IStakeDefiFactory-create-address-3--address-uint256-3--address-)

###### IStakeDefiFactory-create-address-3--address-uint256-3--address-

## Function `create(address[3] _addr, address _registry, uint256[3] _intdata, address owner)`

Create a stake contract that can operate the staked amount as a DeFi project.

### Parameters:

- `_addr`: array of [token, paytoken, vault]

- `_registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, periodBlocks]

- `owner`:  owner address

### Return Values:

- contract address
