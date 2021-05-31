# Functions:

- [`constructor(address impl)`](#StakeVaultProxy-constructor-address-)

- [`setProxyPause(bool _pause)`](#StakeVaultProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#StakeVaultProxy-upgradeTo-address-)

- [`implementation()`](#StakeVaultProxy-implementation--)

- [`receive()`](#StakeVaultProxy-receive--)

- [`fallback()`](#StakeVaultProxy-fallback--)

- [`initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`](#StakeVaultProxy-initialize-address-address-uint256-uint256-uint256-address-uint256-address-)

# Events:

- [`Upgraded(address implementation)`](#StakeVaultProxy-Upgraded-address-)

## Function `constructor(address impl) `

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

## Function `initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr) `

No description

## Event `Upgraded(address implementation)` {#StakeVaultProxy-Upgraded-address-}

No description
