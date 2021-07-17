# Functions:

- [`setProxyPause(bool _pause)`](#IStakeUniswapV3Proxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#IStakeUniswapV3Proxy-upgradeTo-address-)

- [`implementation()`](#IStakeUniswapV3Proxy-implementation--)

- [`setInit(address[4] _addr, address _registry, uint256[3] _intdata)`](#IStakeUniswapV3Proxy-setInit-address-4--address-uint256-3--)

- [`deployCoinage()`](#IStakeUniswapV3Proxy-deployCoinage--)

- [`setPool(address[4] uniswapInfo)`](#IStakeUniswapV3Proxy-setPool-address-4--)

###### IStakeUniswapV3Proxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### IStakeUniswapV3Proxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

###### IStakeUniswapV3Proxy-implementation--

## Function `implementation()`

view implementation address

### Return Values:

- the logic address

###### IStakeUniswapV3Proxy-setInit-address-4--address-uint256-3--

## Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)`

set initial storage

### Parameters:

- `_addr`:  [tos, vault,  ,   ]

- `_registry`: teh registry address

- `_intdata`: [cap, rewardPerBlock, 0]

###### IStakeUniswapV3Proxy-deployCoinage--

## Function `deployCoinage()`

No description

###### IStakeUniswapV3Proxy-setPool-address-4--

## Function `setPool(address[4] uniswapInfo)`

No description
