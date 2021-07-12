# Functions:

- [`constructor(address _logic)`](#StakeSimpleProxy-constructor-address-)

- [`setProxyPause(bool _pause)`](#StakeSimpleProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeSimpleProxy-upgradeTo-address-)

- [`implementation()`](#StakeSimpleProxy-implementation--)

- [`receive()`](#StakeSimpleProxy-receive--)

- [`fallback()`](#StakeSimpleProxy-fallback--)

- [`setInit(address[4] _addr, address _registry, uint256[3] _intdata)`](#StakeSimpleProxy-setInit-address-4--address-uint256-3--)

# Events:

- [`Upgraded(address implementation)`](#StakeSimpleProxy-Upgraded-address-)

###### StakeSimpleProxy-constructor-address-

## Function `constructor(address _logic)`

No description

###### StakeSimpleProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

No description

### Parameters:

- `_pause`: true:pause or false:resume

###### StakeSimpleProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

No description

### Parameters:

- `impl`: New implementation contract address

###### StakeSimpleProxy-implementation--

## Function `implementation()`

returns the implementation

###### StakeSimpleProxy-receive--

## Function `receive()`

No description

###### StakeSimpleProxy-fallback--

## Function `fallback()`

No description

###### StakeSimpleProxy-setInit-address-4--address-uint256-3--

## Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)`

set initial storage

### Parameters:

- `_addr`: the array addresses of token, paytoken, vault, defiAddr

- `_intdata`: the array valued of saleStartBlock, stakeStartBlock, periodBlocks

###### StakeSimpleProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
