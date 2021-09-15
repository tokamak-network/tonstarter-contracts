# Functions:

- [`createdVaultWithLogicIndex(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr, uint256 _logicIndexInVaultFactory)`](#IStake3Logic-createdVaultWithLogicIndex-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-uint256-)

# Events:

- [`CreatedVault(address vault, address paytoken, uint256 cap)`](#IStake3Logic-CreatedVault-address-address-uint256-)

###### IStake3Logic-createdVaultWithLogicIndex-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-uint256-

## Function `createdVaultWithLogicIndex(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr, uint256 _logicIndexInVaultFactory)`

create vault with particular vault's logic

### Parameters:

- `_paytoken`: the token used for staking by user

- `_cap`:  allocated reward amount

- `_saleStartBlock`:  the start block that can stake by user

- `_stakeStartBlock`: the start block that end staking by user and start that can claim reward by user

- `_phase`:  phase of TOS platform

- `_vaultName`:  vault's name's hash

- `_stakeType`:  stakeContract's type, if 0, StakeTON, else if 1 , StakeSimple , else if 2, StakeDefi

- `_defiAddr`:  extra defi address , default is zero address

- `_logicIndexInVaultFactory`:  vaultFactory's logic index

###### IStake3Logic-CreatedVault-address-address-uint256-

## Event `CreatedVault(address vault, address paytoken, uint256 cap)`

event on create vault

### Parameters:

- `vault`: the vault address created

- `paytoken`: the token used for staking by user

- `cap`:  allocated reward amount
