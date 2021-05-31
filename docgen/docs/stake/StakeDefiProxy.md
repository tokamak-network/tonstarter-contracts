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

## Function `constructor(address _logic) `

No description

## Function `transferOwnership(address newOwner) `

No description

## Function `setProxyPause(bool _pause) `

No description

### Parameters:

- `_pause`: true:pause or false:resume

## Function `upgradeTo(address impl) `

No description

### Parameters:

- `impl`: New implementation contract address

## Function `implementation() `

returns the implementation

## Function `receive() `

No description

## Function `fallback() `

No description

## Function `setInit(address[3] _addr, address _registry, uint256[3] _intdata) `

No description

## Event `Upgraded(address implementation)` {#StakeDefiProxy-Upgraded-address-}

No description
