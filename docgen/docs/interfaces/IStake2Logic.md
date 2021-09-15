# Functions:

- [`setVaultLogicByPhase(uint256 _phase, address _logic)`](#IStake2Logic-setVaultLogicByPhase-uint256-address-)

- [`createVault2(uint256 _cap, uint256 _rewardPerBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address[4] _uniswapInfo, string _name)`](#IStake2Logic-createVault2-uint256-uint256-uint256-bytes32-uint256-address-4--string-)

- [`setPool(address target, address[4] uniswapInfo)`](#IStake2Logic-setPool-address-address-4--)

- [`setMiningIntervalSeconds(address target, uint256 miningIntervalSeconds)`](#IStake2Logic-setMiningIntervalSeconds-address-uint256-)

- [`resetCoinageTime(address target)`](#IStake2Logic-resetCoinageTime-address-)

- [`setStartTimeOfVault2(address vault, uint256 startTime)`](#IStake2Logic-setStartTimeOfVault2-address-uint256-)

# Events:

- [`CreatedVault2(address vault, address paytoken, uint256 cap)`](#IStake2Logic-CreatedVault2-address-address-uint256-)

- [`CreatedStakeContract2(address vault, address stakeContract, uint256 phase)`](#IStake2Logic-CreatedStakeContract2-address-address-uint256-)

###### IStake2Logic-setVaultLogicByPhase-uint256-address-

## Function `setVaultLogicByPhase(uint256 _phase, address _logic)`

Set stakeVaultLogic address by _phase

### Parameters:

- `_phase`: the stake type

- `_logic`: the vault logic address

###### IStake2Logic-createVault2-uint256-uint256-uint256-bytes32-uint256-address-4--string-

## Function `createVault2(uint256 _cap, uint256 _rewardPerBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address[4] _uniswapInfo, string _name)`

create vault2

### Parameters:

- `_cap`:  allocated reward amount

- `_rewardPerBlock`:  the reward per block

- `_phase`:  phase of TOS platform

- `_vaultName`:  vault's name's hash

- `_stakeType`:   it's 2, StakeUniswapV3 staking type

- `_uniswapInfo`:  npm, pool, token0, token1

- `_name`:   name

###### IStake2Logic-setPool-address-address-4--

## Function `setPool(address target, address[4] uniswapInfo)`

set pool information

### Parameters:

- `uniswapInfo`: [NonfungiblePositionManager,UniswapV3Factory,token0,token1]

###### IStake2Logic-setMiningIntervalSeconds-address-uint256-

## Function `setMiningIntervalSeconds(address target, uint256 miningIntervalSeconds)`

No description

###### IStake2Logic-resetCoinageTime-address-

## Function `resetCoinageTime(address target)`

No description

###### IStake2Logic-setStartTimeOfVault2-address-uint256-

## Function `setStartTimeOfVault2(address vault, uint256 startTime)`

No description

###### IStake2Logic-CreatedVault2-address-address-uint256-

## Event `CreatedVault2(address vault, address paytoken, uint256 cap)`

event on create vault

### Parameters:

- `vault`: the vault address created

- `paytoken`: the token used for staking by user

- `cap`:  allocated reward amount

###### IStake2Logic-CreatedStakeContract2-address-address-uint256-

## Event `CreatedStakeContract2(address vault, address stakeContract, uint256 phase)`

event on create stake contract in vault

### Parameters:

- `vault`: the vault address

- `stakeContract`: the stake contract address created

- `phase`: the phase of TOS platform
