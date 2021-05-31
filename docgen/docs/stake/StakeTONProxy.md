# Functions:

- [`constructor(address _logic)`](#StakeTONProxy-constructor-address-)

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

# Function `constructor(address _logic)` {#StakeTONProxy-constructor-address-}

No description

# Function `setProxyPause(bool _pause)` {#StakeTONProxy-setProxyPause-bool-}

No description

## Parameters:

- `_pause`: true:pause or false:resume

# Function `upgradeTo(address impl)` {#StakeTONProxy-upgradeTo-address-}

No description

## Parameters:

- `impl`: New implementation contract address

# Function `implementation() → address` {#StakeTONProxy-implementation--}

returns the implementation

# Function `receive()` {#StakeTONProxy-receive--}

No description

# Function `fallback()` {#StakeTONProxy-fallback--}

No description

# Function `onApprove(address owner, address spender, uint256 tonAmount, bytes data) → bool` {#StakeTONProxy-onApprove-address-address-uint256-bytes-}

Approves

# Function `stakeOnApprove(address from, address _owner, address _spender, uint256 _amount) → bool` {#StakeTONProxy-stakeOnApprove-address-address-address-uint256-}

stake with ton

# Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)` {#StakeTONProxy-setInit-address-4--address-uint256-3--}

No description

# Event `Upgraded(address implementation)` {#StakeTONProxy-Upgraded-address-}

No description
