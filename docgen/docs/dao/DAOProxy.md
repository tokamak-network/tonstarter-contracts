# Functions:

- [`constructor(address _sfldAddress)`](#DAOProxy-constructor-address-)

- [`transferOwnership(address newOwner)`](#DAOProxy-transferOwnership-address-)

- [`setProxyPause(bool _pause)`](#DAOProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#DAOProxy-upgradeTo-address-)

- [`implementation()`](#DAOProxy-implementation--)

- [`receive()`](#DAOProxy-receive--)

- [`fallback()`](#DAOProxy-fallback--)

# Events:

- [`Upgraded(address implementation)`](#DAOProxy-Upgraded-address-)

### DAOProxy-constructor-address-

## Function `constructor(address _sfldAddress)`

No description

### DAOProxy-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

### DAOProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

No description

### Parameters:

- `_pause`: true:pause or false:resume

### DAOProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

No description

### Parameters:

- `impl`: New implementation contract address

### DAOProxy-implementation--

## Function `implementation()`

returns the implementation

### DAOProxy-receive--

## Function `receive()`

No description

### DAOProxy-fallback--

## Function `fallback()`

No description

### DAOProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
