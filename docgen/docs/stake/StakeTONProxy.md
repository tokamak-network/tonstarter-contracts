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

- [`Staked(address to, uint256 amount)`](#StakeTONProxy-Staked-address-uint256-)

###### StakeTONProxy-constructor-address-

## Function `constructor(address _logic)`

the constructor of StakeTONProxy

### Parameters:

- `_logic`: the logic address of StakeTONProxy

###### StakeTONProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

No description

### Parameters:

- `_pause`: true:pause or false:resume

###### StakeTONProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

No description

### Parameters:

- `impl`: New implementation contract address

###### StakeTONProxy-implementation--

## Function `implementation()`

returns the implementation

###### StakeTONProxy-receive--

## Function `receive()`

receive ether

###### StakeTONProxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### StakeTONProxy-onApprove-address-address-uint256-bytes-

## Function `onApprove(address owner, address spender, uint256 tonAmount, bytes data)`

Approves function

call by WTON

### Parameters:

- `owner`:  who actually calls

- `spender`:  Who gives permission to use

- `tonAmount`:  how much will be available

- `data`:  Amount data to use with users

###### StakeTONProxy-stakeOnApprove-address-address-address-uint256-

## Function `stakeOnApprove(address from, address _owner, address _spender, uint256 _amount)`

stake with WTON

### Parameters:

- `from`:  WTON

- `_owner`:  who actually calls

- `_spender`:  Who gives permission to use

- `_amount`:  how much will be available

###### StakeTONProxy-setInit-address-4--address-uint256-3--

## Function `setInit(address[4] _addr, address _registry, uint256[3] _intdata)`

set initial storage

### Parameters:

- `_addr`: the array addresses of token, paytoken, vault, defiAddress

- `_registry`: the registry address

- `_intdata`: the array valued of saleStartBlock, stakeStartBlock, periodBlocks

###### StakeTONProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description

###### StakeTONProxy-Staked-address-uint256-

## Event `Staked(address to, uint256 amount)`

event on staking TON

### Parameters:

- `to`: the sender

- `amount`: the amount of staking
