# Functions:

- [`create(address[4] _addr, uint256[4] _intInfo, address owner)`](#IStakeVaultFactory-create-address-4--uint256-4--address-)

###### IStakeVaultFactory-create-address-4--uint256-4--address-

## Function `create(address[4] _addr, uint256[4] _intInfo, address owner)`

Create a vault that hold reward, _cap is allocated reward amount.

### Parameters:

- `_addr`: the array of [token, paytoken, vault, defiAddr]

- `_intInfo`: array of [_stakeType, _cap, _saleStartBlock, _stakeStartBlock]

- `owner`: the owner adderess

### Return Values:

- a vault address
