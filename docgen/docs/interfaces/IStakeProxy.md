# Functions:

- [`setProxyPause(bool _pause)`](#IStakeProxy-setProxyPause-bool-)

- [`upgradeTo(address impl, uint256 _index)`](#IStakeProxy-upgradeTo-address-uint256-)

- [`implementation(uint256 _index)`](#IStakeProxy-implementation-uint256-)

- [`setImplementation(address newImplementation, uint256 _index, bool _alive)`](#IStakeProxy-setImplementation-address-uint256-bool-)

- [`setAliveImplementation(address newImplementation, bool _alive)`](#IStakeProxy-setAliveImplementation-address-bool-)

- [`setSelectorImplementations(bytes4[] _selectors, address _imp)`](#IStakeProxy-setSelectorImplementations-bytes4---address-)

- [`getSelectorImplementation(bytes4 _selector)`](#IStakeProxy-getSelectorImplementation-bytes4-)

###### IStakeProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### IStakeProxy-upgradeTo-address-uint256-

## Function `upgradeTo(address impl, uint256 _index)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

- `_index`: index of proxy

###### IStakeProxy-implementation-uint256-

## Function `implementation(uint256 _index)`

view implementation address of the proxy[index]

### Parameters:

- `_index`: index of proxy

### Return Values:

- address of the implementation

###### IStakeProxy-setImplementation-address-uint256-bool-

## Function `setImplementation(address newImplementation, uint256 _index, bool _alive)`

set the implementation address and status of the proxy[index]

### Parameters:

- `newImplementation`: Address of the new implementation.

- `_index`: index of proxy

- `_alive`: alive status

###### IStakeProxy-setAliveImplementation-address-bool-

## Function `setAliveImplementation(address newImplementation, bool _alive)`

set alive status of implementation

### Parameters:

- `newImplementation`: Address of the new implementation.

- `_alive`: alive status

###### IStakeProxy-setSelectorImplementations-bytes4---address-

## Function `setSelectorImplementations(bytes4[] _selectors, address _imp)`

set selectors of Implementation

### Parameters:

- `_selectors`: being added selectors

- `_imp`: implementation address

###### IStakeProxy-getSelectorImplementation-bytes4-

## Function `getSelectorImplementation(bytes4 _selector)`

set the implementation address and status of the proxy[index]

### Parameters:

- `_selector`: the selector of function
