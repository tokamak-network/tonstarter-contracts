# Functions:

- [`setVaultLogicByPhase(uint256 _phase, address _logic)`](#Stake2Logic-setVaultLogicByPhase-uint256-address-)

- [`createVault2(uint256 _cap, uint256 _miningPerSecond, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address[4] _uniswapInfo, string _name)`](#Stake2Logic-createVault2-uint256-uint256-uint256-bytes32-uint256-address-4--string-)

- [`setPool(address target, address[4] uniswapInfo)`](#Stake2Logic-setPool-address-address-4--)

- [`setMiningIntervalSeconds(address target, uint256 miningIntervalSeconds)`](#Stake2Logic-setMiningIntervalSeconds-address-uint256-)

- [`resetCoinageTime(address target)`](#Stake2Logic-resetCoinageTime-address-)

- [`setStartTimeOfVault2(address vault, uint256 startTime)`](#Stake2Logic-setStartTimeOfVault2-address-uint256-)

###### Stake2Logic-setVaultLogicByPhase-uint256-address-

## Function `setVaultLogicByPhase(uint256 _phase, address _logic)`

Set stakeVaultLogic address by _phase

### Parameters:

- `_phase`: the stake type

- `_logic`: the vault logic address

###### Stake2Logic-createVault2-uint256-uint256-uint256-bytes32-uint256-address-4--string-

## Function `createVault2(uint256 _cap, uint256 _miningPerSecond, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address[4] _uniswapInfo, string _name)`

create vault2

### Parameters:

- `_cap`:  allocated reward amount

- `_miningPerSecond`:  the mining per second

- `_phase`:  phase of TOS platform

- `_vaultName`:  vault's name's hash

- `_stakeType`:  it's 2, StakeUniswapV3 staking type

- `_uniswapInfo`:  npm, poolFactory, token0, token1

- `_name`:   name

###### Stake2Logic-setPool-address-address-4--

## Function `setPool(address target, address[4] uniswapInfo)`

set pool information

### Parameters:

- `uniswapInfo`: [NonfungiblePositionManager,UniswapV3Factory,token0,token1]

###### Stake2Logic-setMiningIntervalSeconds-address-uint256-

## Function `setMiningIntervalSeconds(address target, uint256 miningIntervalSeconds)`

No description

###### Stake2Logic-resetCoinageTime-address-

## Function `resetCoinageTime(address target)`

No description

###### Stake2Logic-setStartTimeOfVault2-address-uint256-

## Function `setStartTimeOfVault2(address vault, uint256 startTime)`

No description
