# Functions:

- [`balanceOf(address token, address target)`](#Stake2Logic-balanceOf-address-address-)

- [`balanceOfTOS(address target)`](#Stake2Logic-balanceOfTOS-address-)

- [`setVaultLogicByPhase(uint256 _phase, address _logic)`](#Stake2Logic-setVaultLogicByPhase-uint256-address-)

- [`createVault2(uint256 _cap, uint256 _rewardPerBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address[4] _uniswapInfo, string _name)`](#Stake2Logic-createVault2-uint256-uint256-uint256-bytes32-uint256-address-4--string-)

###### Stake2Logic-balanceOf-address-address-

## Function `balanceOf(address token, address target)`

No description

###### Stake2Logic-balanceOfTOS-address-

## Function `balanceOfTOS(address target)`

No description

###### Stake2Logic-setVaultLogicByPhase-uint256-address-

## Function `setVaultLogicByPhase(uint256 _phase, address _logic)`

Set stakeVaultLogic address by _phase

### Parameters:

- `_phase`: the stake type

- `_logic`: the vault logic address

###### Stake2Logic-createVault2-uint256-uint256-uint256-bytes32-uint256-address-4--string-

## Function `createVault2(uint256 _cap, uint256 _rewardPerBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address[4] _uniswapInfo, string _name)`

create vault2

### Parameters:

- `_cap`:  allocated reward amount

- `_rewardPerBlock`:  the reward per block

- `_phase`:  phase of TOS platform

- `_vaultName`:  vault's name's hash

- `_stakeType`:  it's 2, StakeUniswapV3 staking type

- `_uniswapInfo`:  npm, poolFactory, token0, token1

- `_name`:   name
