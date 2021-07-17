# Functions:

- [`constructor(address _logic, address _coinageFactory)`](#StakeUniswapV3Proxy-constructor-address-address-)

- [`setProxyPause(bool _pause)`](#StakeUniswapV3Proxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeUniswapV3Proxy-upgradeTo-address-)

- [`implementation()`](#StakeUniswapV3Proxy-implementation--)

- [`setCoinageFactory(address _newCoinageFactory)`](#StakeUniswapV3Proxy-setCoinageFactory-address-)

- [`receive()`](#StakeUniswapV3Proxy-receive--)

- [`fallback()`](#StakeUniswapV3Proxy-fallback--)

- [`setInit(address[4] _addr, address _registry, uint256[3] _intdata)`](#StakeUniswapV3Proxy-setInit-address-4--address-uint256-3--)

- [`deployCoinage()`](#StakeUniswapV3Proxy-deployCoinage--)

- [`setPool(address[4] uniswapInfo)`](#StakeUniswapV3Proxy-setPool-address-4--)

# Events:

- [`Upgraded(address implementation)`](#StakeUniswapV3Proxy-Upgraded-address-)

- [`SetCoinageFactory(address coinageFactory)`](#StakeUniswapV3Proxy-SetCoinageFactory-address-)

###### StakeUniswapV3Proxy-constructor-address-address-

## Function `constructor(address _logic, address _coinageFactory)`

constructor of Stake1Proxy

### Parameters:

- `_logic`: the logic address that used in proxy

###### StakeUniswapV3Proxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### StakeUniswapV3Proxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

###### StakeUniswapV3Proxy-implementation--

## Function `implementation()`

returns the implementation

###### StakeUniswapV3Proxy-setCoinageFactory-address-

## Function `setCoinageFactory(address _newCoinageFactory)`

No description

###### StakeUniswapV3Proxy-receive--

## Function `receive()`

receive ether

###### StakeUniswapV3Proxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### StakeUniswapV3Proxy-setInit-address-4--address-uint256-3--

## Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)`

set initial storage

### Parameters:

- `_addr`:  [tos, 0, vault,  ,   ]

- `_registry`: teh registry address

- `_intdata`: [cap, rewardPerBlock, 0]

###### StakeUniswapV3Proxy-deployCoinage--

## Function `deployCoinage()`

No description

###### StakeUniswapV3Proxy-setPool-address-4--

## Function `setPool(address[4] uniswapInfo)`

No description

###### StakeUniswapV3Proxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description

###### StakeUniswapV3Proxy-SetCoinageFactory-address-

## Event `SetCoinageFactory(address coinageFactory)`

No description
