# Functions:

- [`constructor(address _logic)`](#StakeTONProxy-constructor-address-)

- [`transferOwnership(address newOwner)`](#StakeTONProxy-transferOwnership-address-)

- [`setProxyPause(bool _pause)`](#StakeTONProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeTONProxy-upgradeTo-address-)

- [`implementation()`](#StakeTONProxy-implementation--)

- [`receive()`](#StakeTONProxy-receive--)

- [`fallback()`](#StakeTONProxy-fallback--)

- [`onApprove(address owner, address spender, uint256 tonAmount, bytes data)`](#StakeTONProxy-onApprove-address-address-uint256-bytes-)

- [`stakeOnApprove(address from, address _owner, address _spender, uint256 _amount)`](#StakeTONProxy-stakeOnApprove-address-address-address-uint256-)

- [`setInit(address[4] _addr, address _registry, uint256[3] _intdata)`](#StakeTONProxy-setInit-address-4--address-uint256-3--)

# Events:

- [`Upgraded(address implementation)`](#StakeTONProxy-Upgraded-address-)

### StakeTONProxy-constructor-address-

## Function `constructor(address _logic)`

No description

### StakeTONProxy-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

### StakeTONProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

No description

### Parameters:

- `_pause`: true:pause or false:resume

### StakeTONProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

No description

### Parameters:

- `impl`: New implementation contract address

### StakeTONProxy-implementation--

## Function `implementation()`

returns the implementation

### StakeTONProxy-receive--

## Function `receive()`

No description

### StakeTONProxy-fallback--

## Function `fallback()`

No description

### StakeTONProxy-onApprove-address-address-uint256-bytes-

## Function `onApprove(address owner, address spender, uint256 tonAmount, bytes data)`

Approves

### StakeTONProxy-stakeOnApprove-address-address-address-uint256-

## Function `stakeOnApprove(address from, address _owner, address _spender, uint256 _amount)`

stake with ton

### StakeTONProxy-setInit-address-4--address-uint256-3--

## Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)`

No description

### StakeTONProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
