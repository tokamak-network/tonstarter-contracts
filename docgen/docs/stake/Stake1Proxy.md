# Functions:

- [`constructor(address _logic)`](#Stake1Proxy-constructor-address-)

- [`transferOwnership(address newOwner)`](#Stake1Proxy-transferOwnership-address-)

- [`setProxyPause(bool _pause)`](#Stake1Proxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#Stake1Proxy-upgradeTo-address-)

- [`implementation()`](#Stake1Proxy-implementation--)

- [`receive()`](#Stake1Proxy-receive--)

- [`fallback()`](#Stake1Proxy-fallback--)

# Events:

- [`Upgraded(address implementation)`](#Stake1Proxy-Upgraded-address-)

###### Stake1Proxy-constructor-address-

## Function `constructor(address _logic)`

constructor of Stake1Proxy

###### Stake1Proxy-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: the new owner address

###### Stake1Proxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### Stake1Proxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

###### Stake1Proxy-implementation--

## Function `implementation()`

view implementation address

### Return Values:

- the logic address

###### Stake1Proxy-receive--

## Function `receive()`

receive ether

###### Stake1Proxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### Stake1Proxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
