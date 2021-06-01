# Functions:

- [`receive()`](##Stake1Vault-receive--)

- [`initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)`](##Stake1Vault-initialize-address-address-uint256-uint256-uint256-address-uint256-address-)

- [`setFLD(address _fld)`](##Stake1Vault-setFLD-address-)

- [`changeCap(uint256 _cap)`](##Stake1Vault-changeCap-uint256-)

- [`setDefiAddr(address _defiAddr)`](##Stake1Vault-setDefiAddr-address-)

- [`addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)`](##Stake1Vault-addSubVaultOfStake-string-address-uint256-)

- [`closeSale()`](##Stake1Vault-closeSale--)

- [`claim(address _to, uint256 _amount)`](##Stake1Vault-claim-address-uint256-)

- [`canClaim(address _to, uint256 _amount)`](##Stake1Vault-canClaim-address-uint256-)

- [`balanceFLDAvailableAmount()`](##Stake1Vault-balanceFLDAvailableAmount--)

- [`stakeAddressesAll()`](##Stake1Vault-stakeAddressesAll--)

- [`orderedEndBlocksAll()`](##Stake1Vault-orderedEndBlocksAll--)

- [`totalRewardAmount(address _account)`](##Stake1Vault-totalRewardAmount-address-)

- [`infos()`](##Stake1Vault-infos--)

# Events:

- [`ClosedSale(uint256 amount)`](##Stake1Vault-ClosedSale-uint256-)

- [`ClaimedReward(address from, address to, uint256 amount)`](##Stake1Vault-ClaimedReward-address-address-uint256-)

## Function `receive()` (##Stake1Vault-receive--)

receive function

## Function `initialize(address _fld, address _paytoken, uint256 _cap, uint256 _saleStartBlock, uint256 _stakeStartBlock, address _stakefactory, uint256 _stakeType, address _defiAddr)` (##Stake1Vault-initialize-address-address-uint256-uint256-uint256-address-uint256-address-)

No description

### Parameters:

- `_cap`:  Maximum amount of rewards issued, allocated reward amount.

- `_saleStartBlock`:  the sale start block

- `_stakeStartBlock`:  the staking start block

- `_stakefactory`: the factory address to create stakeContract

- `_stakeType`:  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 Defi linked staking

- `_defiAddr`: Used when an external address is required. default: address(0)

## Function `setFLD(address _fld)` (##Stake1Vault-setFLD-address-)

Sets FLD address

### Parameters:

- `_fld`:  FLD address

## Function `changeCap(uint256 _cap)` (##Stake1Vault-changeCap-uint256-)

Change cap of the vault

### Parameters:

- `_cap`:  allocated reward amount

## Function `setDefiAddr(address _defiAddr)` (##Stake1Vault-setDefiAddr-address-)

Set Defi Address

### Parameters:

- `_defiAddr`: DeFi related address

## Function `addSubVaultOfStake(string _name, address stakeContract, uint256 periodBlocks)` (##Stake1Vault-addSubVaultOfStake-string-address-uint256-)

 Add stake contract

### Parameters:

- `_name`: stakeContract's name

- `stakeContract`: stakeContract's address

- `periodBlocks`: the period that give rewards of stakeContract

## Function `closeSale()` (##Stake1Vault-closeSale--)

 Close the sale that can stake by user

## Function `claim(address _to, uint256 _amount)` (##Stake1Vault-claim-address-uint256-)

claim function.

sender is a staking contract.

A function that pays the amount(_amount) to _to by the staking contract.

A function that _to claim the amount(_amount) from the staking contract and gets the FLD in the vault.

### Parameters:

- `_to`: a user that received reward

- `_amount`: the receiving amount

## Function `canClaim(address _to, uint256 _amount)` (##Stake1Vault-canClaim-address-uint256-)

whether it is available to claim amount, if it is available , return the total reward amount

### Parameters:

- `_to`:  a staking contract.

- `_amount`: the total reward amount of stakeContract

## Function `balanceFLDAvailableAmount()` (##Stake1Vault-balanceFLDAvailableAmount--)

Returns Give the FLD balance stored in the vault

### Return Values:

- the balance of FLD in this vault.

## Function `stakeAddressesAll()` (##Stake1Vault-stakeAddressesAll--)

Give all stakeContracts's addresses in this vault

### Return Values:

- all stakeContracts's addresses

## Function `orderedEndBlocksAll()` (##Stake1Vault-orderedEndBlocksAll--)

Give the ordered end blocks of stakeContracts in this vault

### Return Values:

- the ordered end blocks

## Function `totalRewardAmount(address _account)` (##Stake1Vault-totalRewardAmount-address-)

Give Total reward amount of stakeContract(_account)

### Return Values:

- Total reward amount of stakeContract(_account)

## Function `infos()` (##Stake1Vault-infos--)

Give the infomation of this vault

## Event `ClosedSale(uint256 amount)` {##Stake1Vault-ClosedSale-uint256- }

No description

## Event `ClaimedReward(address from, address to, uint256 amount)` {##Stake1Vault-ClaimedReward-address-address-uint256- }

No description
