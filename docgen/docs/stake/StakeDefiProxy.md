# Functions:

- [`constructor(address _logic)`](#StakeDefiProxy-constructor-address-)

- [`setProxyPause(bool _pause)`](#StakeDefiProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeDefiProxy-upgradeTo-address-)

- [`implementation()`](#StakeDefiProxy-implementation--)

- [`receive()`](#StakeDefiProxy-receive--)

- [`fallback()`](#StakeDefiProxy-fallback--)

- [`setInit(address[4] _addr, address _registry, uint256[3] _intdata)`](#StakeDefiProxy-setInit-address-4--address-uint256-3--)

# Events:

- [`Upgraded(address implementation)`](#StakeDefiProxy-Upgraded-address-)

###### StakeDefiProxy-constructor-address-

## Function `constructor(address _logic)`

constructor of StakeDefiProxy

### Parameters:

- `_logic`: the logic address that used in proxy

###### StakeDefiProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### StakeDefiProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

###### StakeDefiProxy-implementation--

## Function `implementation()`

returns the implementation

###### StakeDefiProxy-receive--

## Function `receive()`

receive ether

###### StakeDefiProxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### StakeDefiProxy-setInit-address-4--address-uint256-3--

## Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)`

set initial storage

### Parameters:

- `_addr`: the array addresses of token, paytoken, vault, defiAddr

- `_registry`: teh registry address

- `_intdata`: the array valued of saleStartBlock, stakeStartBlock, periodBlocks

###### StakeDefiProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
