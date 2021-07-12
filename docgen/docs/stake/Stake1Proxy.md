# Functions:

- [`constructor(address _logic)`](#Stake1Proxy-constructor-address-)

- [`setProxyPause(bool _pause)`](#Stake1Proxy-setProxyPause-bool-)

- [`upgradeTo(address impl, uint256 _index)`](#Stake1Proxy-upgradeTo-address-uint256-)

- [`implementation(uint256 _index)`](#Stake1Proxy-implementation-uint256-)

- [`setImplementation(address newImplementation, uint256 _index, bool _alive)`](#Stake1Proxy-setImplementation-address-uint256-bool-)

- [`setAliveImplementation(address newImplementation, bool _alive)`](#Stake1Proxy-setAliveImplementation-address-bool-)

- [`setSelectorImplementations(bytes4[] _selectors, address _imp)`](#Stake1Proxy-setSelectorImplementations-bytes4---address-)

- [`getSelectorImplementation(bytes4 _selector)`](#Stake1Proxy-getSelectorImplementation-bytes4-)

- [`receive()`](#Stake1Proxy-receive--)

- [`fallback()`](#Stake1Proxy-fallback--)

# Events:

- [`Upgraded(address implementation, uint256 _index)`](#Stake1Proxy-Upgraded-address-uint256-)

###### Stake1Proxy-constructor-address-

## Function `constructor(address _logic)`

constructor of Stake1Proxy

###### Stake1Proxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### Stake1Proxy-upgradeTo-address-uint256-

## Function `upgradeTo(address impl, uint256 _index)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

- `_index`: index of proxy

###### Stake1Proxy-implementation-uint256-

## Function `implementation(uint256 _index)`

view implementation address of the proxy[index]

### Parameters:

- `_index`: index of proxy

### Return Values:

- address of the implementation

###### Stake1Proxy-setImplementation-address-uint256-bool-

## Function `setImplementation(address newImplementation, uint256 _index, bool _alive)`

set the implementation address and status of the proxy[index]

### Parameters:

- `newImplementation`: Address of the new implementation.

- `_index`: index of proxy

- `_alive`: alive status

###### Stake1Proxy-setAliveImplementation-address-bool-

## Function `setAliveImplementation(address newImplementation, bool _alive)`

set alive status of implementation

### Parameters:

- `newImplementation`: Address of the new implementation.

- `_alive`: alive status

###### Stake1Proxy-setSelectorImplementations-bytes4---address-

## Function `setSelectorImplementations(bytes4[] _selectors, address _imp)`

set selectors of Implementation

### Parameters:

- `_selectors`: being added selectors

- `_imp`: implementation address

###### Stake1Proxy-getSelectorImplementation-bytes4-

## Function `getSelectorImplementation(bytes4 _selector)`

view implementation address of selector of function

### Parameters:

- `_selector`: selector of function

### Return Values:

- impl address of the implementation

###### Stake1Proxy-receive--

## Function `receive()`

receive ether

###### Stake1Proxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### Stake1Proxy-Upgraded-address-uint256-

## Event `Upgraded(address implementation, uint256 _index)`

No description
