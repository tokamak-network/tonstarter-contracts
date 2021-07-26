# Functions:

- [`create(uint256 _phase, address[4] _addr, uint256[4] _intInfo, address owner)`](#IStakeVaultFactory-create-uint256-address-4--uint256-4--address-)

- [`create2(uint256 _phase, address[2] _addr, uint256[3] _intInfo, string _name, address owner)`](#IStakeVaultFactory-create2-uint256-address-2--uint256-3--string-address-)

- [`setVaultLogicByPhase(uint256 _phase, address _logic)`](#IStakeVaultFactory-setVaultLogicByPhase-uint256-address-)

###### IStakeVaultFactory-create-uint256-address-4--uint256-4--address-

## Function `create(uint256 _phase, address[4] _addr, uint256[4] _intInfo, address owner)`

Create a vault that hold reward, _cap is allocated reward amount.

### Parameters:

- `_phase`: phase number

- `_addr`: the array of [token, paytoken, vault, defiAddr]

- `_intInfo`: array of [_stakeType, _cap, _saleStartBlock, _stakeStartBlock]

- `owner`: the owner adderess

### Return Values:

- a vault address

###### IStakeVaultFactory-create2-uint256-address-2--uint256-3--string-address-

## Function `create2(uint256 _phase, address[2] _addr, uint256[3] _intInfo, string _name, address owner)`

Create a vault that hold reward, _cap is allocated reward amount.

### Parameters:

- `_phase`: phase number

- `_addr`: the array of [tos, _stakefactory]

- `_intInfo`: array of [_stakeType, _cap, _rewardPerBlock ]

- `_name`: the name of stake contract

- `owner`: the owner adderess

### Return Values:

- a vault address

###### IStakeVaultFactory-setVaultLogicByPhase-uint256-address-

## Function `setVaultLogicByPhase(uint256 _phase, address _logic)`

Set stakeVaultLogic address by _phase

### Parameters:

- `_phase`: the stake type

- `_logic`: the vault logic address
