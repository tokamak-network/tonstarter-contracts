# Functions:

- [`constructor(address _logic)`](#StakeSimpleProxy-constructor-address-)

- [`transferOwnership(address newOwner)`](#StakeSimpleProxy-transferOwnership-address-)

- [`setProxyPause(bool _pause)`](#StakeSimpleProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeSimpleProxy-upgradeTo-address-)

- [`implementation()`](#StakeSimpleProxy-implementation--)

- [`receive()`](#StakeSimpleProxy-receive--)

- [`fallback()`](#StakeSimpleProxy-fallback--)

- [`setInit(address[3] _addr, uint256[3] _intdata)`](#StakeSimpleProxy-setInit-address-3--uint256-3--)

# Events:

- [`Upgraded(address implementation)`](#StakeSimpleProxy-Upgraded-address-)

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

## Function `setInit(address[3] _addr, uint256[3] _intdata) `

No description

## Event `Upgraded(address implementation)` {#StakeSimpleProxy-Upgraded-address-}

No description
