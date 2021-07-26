# Functions:

- [`setProxyPause(bool _pause)`](#IStake2VaultProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#IStake2VaultProxy-upgradeTo-address-)

- [`implementation()`](#IStake2VaultProxy-implementation--)

- [`initialize(address _tos, address _stakefactory, uint256 _stakeType, uint256 _cap, uint256 _rewardPerBlock, string _name)`](#IStake2VaultProxy-initialize-address-address-uint256-uint256-uint256-string-)

###### IStake2VaultProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### IStake2VaultProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

###### IStake2VaultProxy-implementation--

## Function `implementation()`

view implementation address

### Return Values:

- the logic address

###### IStake2VaultProxy-initialize-address-address-uint256-uint256-uint256-string-

## Function `initialize(address _tos, address _stakefactory, uint256 _stakeType, uint256 _cap, uint256 _rewardPerBlock, string _name)`

set initial storage

### Parameters:

- `_tos`:  TOS token address

- `_stakefactory`: the factory address to create stakeContract

- `_stakeType`:  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 UniswapV3  staking

- `_cap`:  Maximum amount of rewards issued, allocated reward amount.

- `_rewardPerBlock`:  the reward per block

- `_name`:  the name of stake contratc
