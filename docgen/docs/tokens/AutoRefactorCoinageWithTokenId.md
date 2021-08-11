Implementation of coin age token based on ERC20 of openzeppelin-solidity

AutoRefactorCoinageWithTokenId stores `_totalSupply` and `_balances` as RAY BASED value,

`_allowances` as RAY FACTORED value.

This takes public function (including _approve) parameters as RAY FACTORED value

and internal function (including approve) parameters as RAY BASED value, and emits event in RAY FACTORED value.

`RAY BASED` = `RAY FACTORED`  / factor

 factor increases exponentially for each block mined.

# Functions:

- [`constructor(uint256 initfactor)`](#AutoRefactorCoinageWithTokenId-constructor-uint256-)

- [`factor()`](#AutoRefactorCoinageWithTokenId-factor--)

- [`totalSupply()`](#AutoRefactorCoinageWithTokenId-totalSupply--)

- [`balanceOf(uint256 tokenId)`](#AutoRefactorCoinageWithTokenId-balanceOf-uint256-)

- [`setFactor(uint256 infactor)`](#AutoRefactorCoinageWithTokenId-setFactor-uint256-)

- [`mint(address tokenOwner, uint256 tokenId, uint256 amount)`](#AutoRefactorCoinageWithTokenId-mint-address-uint256-uint256-)

- [`burn(address tokenOwner, uint256 tokenId, uint256 amount)`](#AutoRefactorCoinageWithTokenId-burn-address-uint256-uint256-)

- [`burnTokenId(address tokenOwner, uint256 tokenId)`](#AutoRefactorCoinageWithTokenId-burnTokenId-address-uint256-)

# Events:

- [`FactorSet(uint256 previous, uint256 current, uint256 shiftCount)`](#AutoRefactorCoinageWithTokenId-FactorSet-uint256-uint256-uint256-)

- [`Mined(address tokenOwner, uint256 tokenId, uint256 amount)`](#AutoRefactorCoinageWithTokenId-Mined-address-uint256-uint256-)

- [`Burned(address tokenOwner, uint256 tokenId, uint256 amount)`](#AutoRefactorCoinageWithTokenId-Burned-address-uint256-uint256-)

###### AutoRefactorCoinageWithTokenId-constructor-uint256-

## Function `constructor(uint256 initfactor)`

No description

###### AutoRefactorCoinageWithTokenId-factor--

## Function `factor()`

No description

###### AutoRefactorCoinageWithTokenId-totalSupply--

## Function `totalSupply()`

See {IERC20-totalSupply}.

###### AutoRefactorCoinageWithTokenId-balanceOf-uint256-

## Function `balanceOf(uint256 tokenId)`

See {IERC20-balanceOf}.

###### AutoRefactorCoinageWithTokenId-setFactor-uint256-

## Function `setFactor(uint256 infactor)`

No description

###### AutoRefactorCoinageWithTokenId-mint-address-uint256-uint256-

## Function `mint(address tokenOwner, uint256 tokenId, uint256 amount)`

See {ERC20-_mint}.

Requirements:

- the caller must have the {MinterRole}.

###### AutoRefactorCoinageWithTokenId-burn-address-uint256-uint256-

## Function `burn(address tokenOwner, uint256 tokenId, uint256 amount)`

Destroys `amount` tokens from the caller.

See {ERC20-_burn}.

###### AutoRefactorCoinageWithTokenId-burnTokenId-address-uint256-

## Function `burnTokenId(address tokenOwner, uint256 tokenId)`

No description

###### AutoRefactorCoinageWithTokenId-FactorSet-uint256-uint256-uint256-

## Event `FactorSet(uint256 previous, uint256 current, uint256 shiftCount)`

No description

###### AutoRefactorCoinageWithTokenId-Mined-address-uint256-uint256-

## Event `Mined(address tokenOwner, uint256 tokenId, uint256 amount)`

event on mining

### Parameters:

- `tokenOwner`: owner of tokenId

- `tokenId`: mining tokenId

- `amount`:  mined amount

###### AutoRefactorCoinageWithTokenId-Burned-address-uint256-uint256-

## Event `Burned(address tokenOwner, uint256 tokenId, uint256 amount)`

event on burn

### Parameters:

- `tokenOwner`: owner of tokenId

- `tokenId`: mining tokenId

- `amount`:  mined amount
