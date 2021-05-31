

# Functions:
- [`receive()`](#Stake1Vault-receive--)
- [`initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`](#Stake1Vault-initialize-address-address-uint256-uint256-uint256-address-uint256-address-)
- [`setFLD(address _fld)`](#Stake1Vault-setFLD-address-)
- [`changeCap(uint256 _cap)`](#Stake1Vault-changeCap-uint256-)
- [`changeOrderedEndBlocks(uint256[] _ordered)`](#Stake1Vault-changeOrderedEndBlocks-uint256---)
- [`setDefiAddr(address _defiAddr)`](#Stake1Vault-setDefiAddr-address-)
- [`addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`](#Stake1Vault-addSubVaultOfStake-string-address-uint256-)
- [`closeSale()`](#Stake1Vault-closeSale--)
- [`claim(address _to, uint256 _amount)`](#Stake1Vault-claim-address-uint256-)
- [`canClaim(address _to, uint256 _amount)`](#Stake1Vault-canClaim-address-uint256-)
- [`balanceFLDAvailableAmount()`](#Stake1Vault-balanceFLDAvailableAmount--)
- [`stakeAddressesAll()`](#Stake1Vault-stakeAddressesAll--)
- [`orderedEndBlocksAll()`](#Stake1Vault-orderedEndBlocksAll--)
- [`totalRewardAmount(address _account)`](#Stake1Vault-totalRewardAmount-address-)
- [`infos()`](#Stake1Vault-infos--)

# Events:
- [`ClosedSale(uint256 amount)`](#Stake1Vault-ClosedSale-uint256-)
- [`ClaimedReward(address from, address to, uint256 amount)`](#Stake1Vault-ClaimedReward-address-address-uint256-)

# Function `receive()` {#Stake1Vault-receive--}
No description
# Function `initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)` {#Stake1Vault-initialize-address-address-uint256-uint256-uint256-address-uint256-address-}
No description
## Parameters:
- `_cap`: - Maximum amount of rewards issued

- `_saleStartBlock`: - Sales start block

- `_stakeStartBlock`: - Staking start block

- `_stakefactory`: - factory address to create stakeContract

- `_stakeType`: - if paytokein is stable coin, it is true.
# Function `setFLD(address _fld)` {#Stake1Vault-setFLD-address-}
Sets FLD address
# Function `changeCap(uint256 _cap)` {#Stake1Vault-changeCap-uint256-}
Change cap of the vault
# Function `changeOrderedEndBlocks(uint256[] _ordered)` {#Stake1Vault-changeOrderedEndBlocks-uint256---}
Change orders
# Function `setDefiAddr(address _defiAddr)` {#Stake1Vault-setDefiAddr-address-}
Set Defi Address
# Function `addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)` {#Stake1Vault-addSubVaultOfStake-string-address-uint256-}
Add stake contract
# Function `closeSale()` {#Stake1Vault-closeSale--}
Close sale
# Function `claim(address _to, uint256 _amount) → bool` {#Stake1Vault-claim-address-uint256-}
No description
# Function `canClaim(address _to, uint256 _amount) → uint256` {#Stake1Vault-canClaim-address-uint256-}
How much you can claim
# Function `balanceFLDAvailableAmount() → uint256` {#Stake1Vault-balanceFLDAvailableAmount--}
Returns the FLD balance stored in the vault
# Function `stakeAddressesAll() → address[]` {#Stake1Vault-stakeAddressesAll--}
Returns all addresses
# Function `orderedEndBlocksAll() → uint256[]` {#Stake1Vault-orderedEndBlocksAll--}
Ordered end blocks
# Function `totalRewardAmount(address _account) → uint256` {#Stake1Vault-totalRewardAmount-address-}
Total reward amount of stakeContract
# Function `infos() → address, uint256, uint256, uint256, uint256, uint256, bool` {#Stake1Vault-infos--}
Returns info

# Event `ClosedSale(uint256 amount)` {#Stake1Vault-ClosedSale-uint256-}
No description
# Event `ClaimedReward(address from, address to, uint256 amount)` {#Stake1Vault-ClaimedReward-address-address-uint256-}
No description
