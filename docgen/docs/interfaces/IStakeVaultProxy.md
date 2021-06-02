# Functions:

- [`setProxyPause(bool _pause)`](#IStakeVaultProxy-setProxyPause-bool-)

- [`upgradeTo(address impl)`](#IStakeVaultProxy-upgradeTo-address-)

- [`implementation()`](#IStakeVaultProxy-implementation--)

- [`initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`](#IStakeVaultProxy-initialize-address-address-uint256-uint256-uint256-address-uint256-address-)

###### IStakeVaultProxy-setProxyPause-bool-

## Function `setProxyPause(bool _pause)`

Set pause state

### Parameters:

- `_pause`: true:pause or false:resume

###### IStakeVaultProxy-upgradeTo-address-

## Function `upgradeTo(address impl)`

Set implementation contract

### Parameters:

- `impl`: New implementation contract address

###### IStakeVaultProxy-implementation--

## Function `implementation()`

view implementation address

### Return Values:

- the logic address

###### IStakeVaultProxy-initialize-address-address-uint256-uint256-uint256-address-uint256-address-

## Function `initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`

No description

### Parameters:

- `_cap`:  Maximum amount of rewards issued, allocated reward amount.

- `_saleStartBlock`:  the sale start block

- `_stakeStartBlock`:  the staking start block

- `_stakefactory`: the factory address to create stakeContract

- `_stakeType`:  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 Defi linked staking

- `_defiAddr`: Used when an external address is required. default: address(0)
