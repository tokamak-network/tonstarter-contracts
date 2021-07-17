# Functions:

- [`constructor(address impl)`](#Stake2VaultProxy-constructor-address-)

- [`setProxyPause(bool _pause)`](#Stake2VaultProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#Stake2VaultProxy-upgradeTo-address-)

- [`implementation()`](#Stake2VaultProxy-implementation--)

- [`receive()`](#Stake2VaultProxy-receive--)

- [`fallback()`](#Stake2VaultProxy-fallback--)

- [`initialize(address _tos, address _stakefactory, uint256 _stakeType, uint256 _cap, uint256 _rewardPerBlock, string _name)`](#Stake2VaultProxy-initialize-address-address-uint256-uint256-uint256-string-)

# Events:

- [`Upgraded(address implementation)`](#Stake2VaultProxy-Upgraded-address-)

###### Stake2VaultProxy-constructor-address-

## Function `constructor(address impl)`

constructor of StakeVaultProxy

### Parameters:

- `impl`: the logic address of StakeVaultProxy

###### Stake2VaultProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

No description

### Parameters:

- `_pause`: true:pause or false:resume

###### Stake2VaultProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

No description

### Parameters:

- `impl`: New implementation contract address

###### Stake2VaultProxy-implementation--

## Function `implementation()`

returns the implementation

###### Stake2VaultProxy-receive--

## Function `receive()`

receive ether

###### Stake2VaultProxy-fallback--

## Function `fallback()`

fallback function , execute on undefined function call

###### Stake2VaultProxy-initialize-address-address-uint256-uint256-uint256-string-

## Function `initialize(address _tos, address _stakefactory, uint256 _stakeType, uint256 _cap, uint256 _rewardPerBlock, string _name)`

set initial storage

### Parameters:

- `_tos`:  TOS token address

- `_stakefactory`: the factory address to create stakeContract

- `_stakeType`:  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 UniswapV3  staking

- `_cap`:  Maximum amount of rewards issued, allocated reward amount.

- `_rewardPerBlock`:  the reward per block

###### Stake2VaultProxy-Upgraded-address-

## Event `Upgraded(address implementation)`

No description
