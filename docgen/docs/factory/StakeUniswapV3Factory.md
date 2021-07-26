# Functions:

- [`constructor(address _stakeUniswapV3Logic, address _coinageFactory)`](#StakeUniswapV3Factory-constructor-address-address-)

- [`create(address[4] _addr, address _registry, uint256[3] _intdata, address owner)`](#StakeUniswapV3Factory-create-address-4--address-uint256-3--address-)

###### StakeUniswapV3Factory-constructor-address-address-

## Function `constructor(address _stakeUniswapV3Logic, address _coinageFactory)`

constructor of StakeCoinageFactory

### Parameters:

- `_stakeUniswapV3Logic`: the logic address used in stakeUniswapV3

- `_coinageFactory`: the _coinage factory address

###### StakeUniswapV3Factory-create-address-4--address-uint256-3--address-

## Function `create(address[4] _addr, address _registry, uint256[3] _intdata, address owner)`

Create a stake contract that can operate the staked amount as a DeFi project.

### Parameters:

- `_addr`: array of [tos, 0, vault, 0 ]

- `_registry`:  registry address

- `_intdata`: array of [cap, rewardPerBlock, 0]

- `owner`:  owner address

### Return Values:

- contract address
