# Functions:

- [`constructor(address _stakeSimpleFactory, address _stakeTONFactory, address _stakeUniswapV3Factory)`](#StakeFactory-constructor-address-address-address-)

- [`setFactoryByStakeType(uint256 _stakeType, address _factory)`](#StakeFactory-setFactoryByStakeType-uint256-address-)

- [`create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`](#StakeFactory-create-uint256-address-4--address-uint256-3--)

###### StakeFactory-constructor-address-address-address-

## Function `constructor(address _stakeSimpleFactory, address _stakeTONFactory, address _stakeUniswapV3Factory)`

constructor of StakeFactory

### Parameters:

- `_stakeSimpleFactory`: the logic address used in StakeSimpleFactory

- `_stakeTONFactory`: the logic address used in StakeTONFactory

- `_stakeUniswapV3Factory`: the logic address used in StakeUniswapV3Factory

###### StakeFactory-setFactoryByStakeType-uint256-address-

## Function `setFactoryByStakeType(uint256 _stakeType, address _factory)`

Set factory address by StakeType

### Parameters:

- `_stakeType`: the stake type , 0:TON, 1: Simple, 2: UniswapV3LP, may continue to be added.

- `_factory`: the factory address

###### StakeFactory-create-uint256-address-4--address-uint256-3--

## Function `create(uint256 stakeType, address[4] _addr, address registry, uint256[3] _intdata)`

Create a stake contract that calls the desired stake factory according to stakeType

### Parameters:

- `stakeType`: if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeUniswapV3Factory

- `_addr`: array of [token, paytoken, vault, _defiAddr]

        or when stakeTyoe ==2 , [tos,0 , vault, 0 ]

- `registry`:  registry address

- `_intdata`: array of [saleStartBlock, startBlock, periodBlocks]

        or when stakeTyoe ==2 , [cap, rewardPerBlock, 0]

### Return Values:

- contract address
