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

###### StakeVaultProxy-constructor-address-

## Function `constructor(address impl)`

constructor of StakeVaultProxy

### Parameters:

- `impl`: the logic address of StakeVaultProxy

###### StakeVaultProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

No description

### Parameters:

- `_pause`: true:pause or false:resume

###### StakeVaultProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

No description

### Parameters:

- `impl`: New implementation contract address

###### StakeVaultProxy-implementation--

## Function `implementation()`

returns the implementation

###### StakeVaultProxy-receive--

## Function `receive()`

receive ether

###### StakeVaultProxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### StakeVaultProxy-initialize-address-address-uint256-uint256-uint256-address-uint256-address-

## Function `initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`

No description

### Parameters:

- `_cap`:  Maximum amount of rewards issued, allocated reward amount.

- `_saleStartBlock`:  the sale start block

- `_stakeStartBlock`:  the staking start block

- `_stakefactory`: the factory address to create stakeContract

- `_stakeType`:  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 Defi linked staking

- `_defiAddr`: Used when an external address is required. default: address(0)

###### StakeVaultProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
