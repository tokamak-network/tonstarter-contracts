# Functions:

- [`constructor(address _stakeTONProxyFactory, address _stakeTONLogic)`](#StakeTONFactory-constructor-address-address-)

- [`create(address[4] _addr, address _registry, uint256[3] _intdata, address owner)`](#StakeTONFactory-create-address-4--address-uint256-3--address-)

###### StakeTONFactory-constructor-address-address-

## Function `constructor(address _stakeTONProxyFactory, address _stakeTONLogic)`

constructor of StakeTONFactory

### Parameters:

- `_stakeTONProxyFactory`: the StakeTONProxyFactory address used in StakeTONFactory

- `_stakeTONLogic`: the StakeTONLogic address used in StakeTONFactory

###### StakeTONFactory-create-address-4--address-uint256-3--address-

## Function `create(address[4] _addr, address _registry, uint256[3] _intdata, address owner)`

Create a stake contract that can stake TON.

### Parameters:

- `_addr`: the array of [token, paytoken, vault, defiAddr]

- `_registry`:  the registry address

- `_intdata`: the array of [saleStartBlock, startBlock, periodBlocks]

- `owner`:  owner address

### Return Values:

- contract address
