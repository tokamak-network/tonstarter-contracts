# Functions:

- [`setStore(address _fld, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager)`](#Stake1Logic-setStore-address-address-address-address-address-address-address-address-)

- [`createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr)`](#Stake1Logic-createVault-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-)

- [`createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name)`](#Stake1Logic-createStakeContract-uint256-address-address-address-uint256-string-)

- [`currentBlock()`](#Stake1Logic-currentBlock--)

- [`closeSale(address _vault)`](#Stake1Logic-closeSale-address-)

- [`addVault(uint256 _phase, bytes32 _vaultName, address _vault)`](#Stake1Logic-addVault-uint256-bytes32-address-)

- [`upgradeStakeTo(address _stakeProxy, address _implementation)`](#Stake1Logic-upgradeStakeTo-address-address-)

- [`stakeContractsOfVault(address _vault)`](#Stake1Logic-stakeContractsOfVault-address-)

- [`vaultsOfPhase(uint256 _phaseIndex)`](#Stake1Logic-vaultsOfPhase-uint256-)

- [`tokamakStaking(address _stakeContract, address _layer2)`](#Stake1Logic-tokamakStaking-address-address-)

- [`tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount)`](#Stake1Logic-tokamakRequestUnStaking-address-address-uint256-)

- [`tokamakProcessUnStaking(address _stakeContract, address _layer2)`](#Stake1Logic-tokamakProcessUnStaking-address-address-)

- [`exchangeWTONtoFLD(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type)`](#Stake1Logic-exchangeWTONtoFLD-address-uint256-uint256-uint256-uint160-uint256-)

- [`setFLD(address _fld)`](#Stake1Logic-setFLD-address-)

- [`setStakeRegistry(address _stakeRegistry)`](#Stake1Logic-setStakeRegistry-address-)

- [`setStakeFactory(address _stakeFactory)`](#Stake1Logic-setStakeFactory-address-)

- [`setStakeTONFactory(address _stakeTONFactory)`](#Stake1Logic-setStakeTONFactory-address-)

- [`setStakeSimpleFactory(address _stakeSimpleFactory)`](#Stake1Logic-setStakeSimpleFactory-address-)

- [`setStakeDefiFactory(address _stakeDefiFactory)`](#Stake1Logic-setStakeDefiFactory-address-)

- [`setStakeVaultFactory(address _stakeVaultFactory)`](#Stake1Logic-setStakeVaultFactory-address-)

- [`vaultsOfPahse(uint256 _phase)`](#Stake1Logic-vaultsOfPahse-uint256-)

- [`grantRole(address target, bytes32 role, address account)`](#Stake1Logic-grantRole-address-bytes32-address-)

- [`revokeRole(address target, bytes32 role, address account)`](#Stake1Logic-revokeRole-address-bytes32-address-)

# Events:

- [`CreatedVault(address vault, address paytoken, uint256 cap)`](#Stake1Logic-CreatedVault-address-address-uint256-)

- [`CreatedStakeContract(address vault, address stakeContract, uint256 phase)`](#Stake1Logic-CreatedStakeContract-address-address-uint256-)

- [`SetStakeRegistry(address stakeRegistry)`](#Stake1Logic-SetStakeRegistry-address-)

## Function `setStore(address _fld, address _stakeRegistry, address _stakeFactory, address _stakeVaultFactory, address _ton, address _wton, address _depositManager, address _seigManager)` {#Stake1Logic-setStore-address-address-address-address-address-address-address-address-}

set storage

## Function `createVault(address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, uint256 _phase, bytes32 _vaultName, uint256 _stakeType, address _defiAddr)` {#Stake1Logic-createVault-address-uint256-uint256-uint256-uint256-bytes32-uint256-address-}

create vault

## Function `createStakeContract(uint256 _phase, address _vault, address token, address paytoken, uint256 periodBlock, string _name)` {#Stake1Logic-createStakeContract-uint256-address-address-address-uint256-string-}

create stake contract in vault

## Function `currentBlock() → uint256` {#Stake1Logic-currentBlock--}

No description

## Function `closeSale(address _vault)` {#Stake1Logic-closeSale-address-}

No description

## Function `addVault(uint256 _phase, bytes32 _vaultName, address _vault)` {#Stake1Logic-addVault-uint256-bytes32-address-}

No description

## Function `upgradeStakeTo(address _stakeProxy, address _implementation)` {#Stake1Logic-upgradeStakeTo-address-address-}

No description

## Function `stakeContractsOfVault(address _vault) → address[]` {#Stake1Logic-stakeContractsOfVault-address-}

No description

## Function `vaultsOfPhase(uint256 _phaseIndex) → address[]` {#Stake1Logic-vaultsOfPhase-uint256-}

No description

## Function `tokamakStaking(address _stakeContract, address _layer2)` {#Stake1Logic-tokamakStaking-address-address-}

No description

## Function `tokamakRequestUnStaking(address _stakeContract, address _layer2, uint256 amount)` {#Stake1Logic-tokamakRequestUnStaking-address-address-uint256-}

Requests unstaking all

## Function `tokamakProcessUnStaking(address _stakeContract, address _layer2)` {#Stake1Logic-tokamakProcessUnStaking-address-address-}

Processes unstaking

## Function `exchangeWTONtoFLD(address _stakeContract, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 sqrtPriceLimitX96, uint256 _type) → uint256 amountOut` {#Stake1Logic-exchangeWTONtoFLD-address-uint256-uint256-uint256-uint160-uint256-}

Swap TON to FLD

## Function `setFLD(address _fld)` {#Stake1Logic-setFLD-address-}

Sets FLD address

## Function `setStakeRegistry(address _stakeRegistry)` {#Stake1Logic-setStakeRegistry-address-}

Sets Stake Registry address

## Function `setStakeFactory(address _stakeFactory)` {#Stake1Logic-setStakeFactory-address-}

Sets Stake Factory address

## Function `setStakeTONFactory(address _stakeTONFactory)` {#Stake1Logic-setStakeTONFactory-address-}

No description

## Function `setStakeSimpleFactory(address _stakeSimpleFactory)` {#Stake1Logic-setStakeSimpleFactory-address-}

No description

## Function `setStakeDefiFactory(address _stakeDefiFactory)` {#Stake1Logic-setStakeDefiFactory-address-}

No description

## Function `setStakeVaultFactory(address _stakeVaultFactory)` {#Stake1Logic-setStakeVaultFactory-address-}

No description

## Function `vaultsOfPahse(uint256 _phase) → address[]` {#Stake1Logic-vaultsOfPahse-uint256-}

No description

## Function `grantRole(address target, bytes32 role, address account)` {#Stake1Logic-grantRole-address-bytes32-address-}

No description

## Function `revokeRole(address target, bytes32 role, address account)` {#Stake1Logic-revokeRole-address-bytes32-address-}

No description

## Event `CreatedVault(address vault, address paytoken, uint256 cap)` {#Stake1Logic-CreatedVault-address-address-uint256-}

No description

## Event `CreatedStakeContract(address vault, address stakeContract, uint256 phase)` {#Stake1Logic-CreatedStakeContract-address-address-uint256-}

No description

## Event `SetStakeRegistry(address stakeRegistry)` {#Stake1Logic-SetStakeRegistry-address-}

No description
