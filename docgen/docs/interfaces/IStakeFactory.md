# Functions:

- [`create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`](#IStakeFactory-create-uint256-address-4--address-uint256-3--)

- [`setFactoryByStakeType(uint256 _stakeType, address _factory)`](#IStakeFactory-setFactoryByStakeType-uint256-address-)

###### IStakeFactory-create-uint256-address-4--address-uint256-3--

## Function `create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`

Create a stake contract that calls the desired stake factory according to stakeType

### Parameters:

- `stakeType`: if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeUniswapV3Factory

- `_addr`: array of [token, paytoken, vault, _defiAddr]

- `registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, periodBlocks]

### Return Values:

- contract address

###### IStakeFactory-setFactoryByStakeType-uint256-address-

## Function `setFactoryByStakeType(uint256 _stakeType, address _factory)`

Set factory address by StakeType

### Parameters:

- `_stakeType`: the stake type , 0:TON, 1: Simple, 2: UniswapV3LP

- `_factory`: the factory address
