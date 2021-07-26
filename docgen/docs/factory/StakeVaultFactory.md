# Functions:

- [`constructor(address _stakeVaultLogic)`](#StakeVaultFactory-constructor-address-)

- [`setVaultLogicByPhase(uint256 _phase, address _logic)`](#StakeVaultFactory-setVaultLogicByPhase-uint256-address-)

- [`create(uint256 _phase, address[4] _addr, uint256[4] _intInfo, address owner)`](#StakeVaultFactory-create-uint256-address-4--uint256-4--address-)

- [`create2(uint256 _phase, address[2] _addr, uint256[3] _intInfo, string _name, address owner)`](#StakeVaultFactory-create2-uint256-address-2--uint256-3--string-address-)

###### StakeVaultFactory-constructor-address-

## Function `constructor(address _stakeVaultLogic)`

constructor of StakeVaultFactory

### Parameters:

- `_stakeVaultLogic`: the logic address used in StakeVault

###### StakeVaultFactory-setVaultLogicByPhase-uint256-address-

## Function `setVaultLogicByPhase(uint256 _phase, address _logic)`

Set stakeVaultLogic address by _phase

### Parameters:

- `_phase`: the stake type

- `_logic`: the vault logic address

###### StakeVaultFactory-create-uint256-address-4--uint256-4--address-

## Function `create(uint256 _phase, address[4] _addr, uint256[4] _intInfo, address owner)`

Create a vault that hold reward, _cap is allocated reward amount.

### Parameters:

- `_phase`: phase number

- `_addr`: the array of [token, paytoken, _stakefactory, defiAddr]

- `_intInfo`: array of [_stakeType, _cap, _saleStartBlock, _stakeStartBlock]

- `owner`: the owner adderess

### Return Values:

- a vault address

###### StakeVaultFactory-create2-uint256-address-2--uint256-3--string-address-

## Function `create2(uint256 _phase, address[2] _addr, uint256[3] _intInfo, string _name, address owner)`

Create a vault that hold reward, _cap is allocated reward amount.

### Parameters:

- `_phase`: phase number

- `_addr`: the array of [tos, _stakefactory]

- `_intInfo`: array of [_stakeType, _cap, _rewardPerBlock ]

- `owner`: the owner adderess

### Return Values:

- a vault address
