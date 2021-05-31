# Functions:

- [`constructor(address _fld)`](#StakeRegistry-constructor-address-)

- [`setTokamak(address _ton, address _wton, address _depositManager, address _seigManager)`](#StakeRegistry-setTokamak-address-address-address-address-)

- [`addDefiInfo(string _name, address _router, address _ex1, address _ex2, uint256 _fee)`](#StakeRegistry-addDefiInfo-string-address-address-address-uint256-)

- [`addVault(address _vault, uint256 _phase, bytes32 _vaultName)`](#StakeRegistry-addVault-address-uint256-bytes32-)

- [`addStakeContract(address _vault, address _stakeContract)`](#StakeRegistry-addStakeContract-address-address-)

- [`getTokamak()`](#StakeRegistry-getTokamak--)

- [`getUniswap()`](#StakeRegistry-getUniswap--)

- [`phasesAll(uint256 _index)`](#StakeRegistry-phasesAll-uint256-)

- [`stakeContractsOfVaultAll(address _vault)`](#StakeRegistry-stakeContractsOfVaultAll-address-)

- [`validVault(uint256 _phase, address _vault)`](#StakeRegistry-validVault-uint256-address-)

# Events:

- [`AddedVault(address vault, uint256 phase)`](#StakeRegistry-AddedVault-address-uint256-)

- [`AddedStakeContract(address vault, address stakeContract)`](#StakeRegistry-AddedStakeContract-address-address-)

- [`SetTokamak(address ton, address wton, address depositManager, address seigManager)`](#StakeRegistry-SetTokamak-address-address-address-address-)

- [`AddedDefiInfo(bytes32 nameHash, string name, address router, address ex1, address ex2, uint256 fee)`](#StakeRegistry-AddedDefiInfo-bytes32-string-address-address-address-uint256-)

# Function `constructor(address _fld)` {#StakeRegistry-constructor-address-}

No description

# Function `setTokamak(address _ton, address _wton, address _depositManager, address _seigManager)` {#StakeRegistry-setTokamak-address-address-address-address-}

No description

## Parameters:

- `_ton`: TON address

- `_wton`: WTON address

- `_depositManager`: DepositManager address

- `_seigManager`: SeigManager address

# Function `addDefiInfo(string _name, address _router, address _ex1, address _ex2, uint256 _fee)` {#StakeRegistry-addDefiInfo-string-address-address-address-uint256-}

No description

## Parameters:

- `_name`: name . ex) UNISWAP_V3

- `_router`: entry point of defi

- `_ex1`:  additional variable . ex) positionManagerAddress in Uniswap V3

- `_ex2`:  additional variable . ex) WETH Address in Uniswap V3

- `_fee`:  fee

# Function `addVault(address _vault, uint256 _phase, bytes32 _vaultName)` {#StakeRegistry-addVault-address-uint256-bytes32-}

No description

## Parameters:

- `_vault`: vault address

- `_phase`: phase ex) 1,2,3

- `_vaultName`:  hash of vault's name

# Function `addStakeContract(address _vault, address _stakeContract)` {#StakeRegistry-addStakeContract-address-address-}

No description

## Parameters:

- `_vault`: vault address

- `_stakeContract`:  StakeContract address

# Function `getTokamak() → address, address, address, address` {#StakeRegistry-getTokamak--}

No description

# Function `getUniswap() → address, address, address, uint256` {#StakeRegistry-getUniswap--}

No description

# Function `phasesAll(uint256 _index) → address[]` {#StakeRegistry-phasesAll-uint256-}

No description

# Function `stakeContractsOfVaultAll(address _vault) → address[]` {#StakeRegistry-stakeContractsOfVaultAll-address-}

No description

# Function `validVault(uint256 _phase, address _vault) → bool valid` {#StakeRegistry-validVault-uint256-address-}

No description

# Event `AddedVault(address vault, uint256 phase)` {#StakeRegistry-AddedVault-address-uint256-}

No description

# Event `AddedStakeContract(address vault, address stakeContract)` {#StakeRegistry-AddedStakeContract-address-address-}

No description

# Event `SetTokamak(address ton, address wton, address depositManager, address seigManager)` {#StakeRegistry-SetTokamak-address-address-address-address-}

No description

# Event `AddedDefiInfo(bytes32 nameHash, string name, address router, address ex1, address ex2, uint256 fee)` {#StakeRegistry-AddedDefiInfo-bytes32-string-address-address-address-uint256-}

No description
