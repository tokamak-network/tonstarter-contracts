# Functions:

- [`constructor(address _logic)`](#StakeDefiProxy-constructor-address-)

- [`transferOwnership(address newOwner)`](#StakeDefiProxy-transferOwnership-address-)

- [`setProxyPause(bool _pause)`](#StakeDefiProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeDefiProxy-upgradeTo-address-)

- [`implementation()`](#StakeDefiProxy-implementation--)

- [`receive()`](#StakeDefiProxy-receive--)

- [`fallback()`](#StakeDefiProxy-fallback--)

- [`setInit(address[3] _addr, address _registry, uint256[3] _intdata)`](#StakeDefiProxy-setInit-address-3--address-uint256-3--)

# Events:

- [`Upgraded(address implementation)`](#StakeDefiProxy-Upgraded-address-)

## Function `constructor(address _logic)` {#StakeDefiProxy-constructor-address-}

No description

## Function `transferOwnership(address newOwner)` {#StakeDefiProxy-transferOwnership-address-}

No description

## Function `setProxyPause(bool _pause)` {#StakeDefiProxy-setProxyPause-bool-}

No description

### Parameters:

- `_pause`: true:pause or false:resume

## Function `upgradeTo(address impl)` {#StakeDefiProxy-upgradeTo-address-}

No description

### Parameters:

- `impl`: New implementation contract address

## Function `implementation() → address` {#StakeDefiProxy-implementation--}

returns the implementation

## Function `receive()` {#StakeDefiProxy-receive--}

No description

## Function `fallback()` {#StakeDefiProxy-fallback--}

No description

## Function `setInit(address[3] _addr, address _registry, uint256[3] _intdata)` {#StakeDefiProxy-setInit-address-3--address-uint256-3--}

No description

## Event `Upgraded(address implementation)` {#StakeDefiProxy-Upgraded-address-}

No description
