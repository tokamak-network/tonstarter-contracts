Implementation of coin age token based on ERC20 of openzeppelin-solidity

AutoRefactorCoinage stores `_totalSupply` and `_balances` as RAY BASED value,

`_allowances` as RAY FACTORED value.

This takes public function (including _approve) parameters as RAY FACTORED value

and internal function (including approve) parameters as RAY BASED value, and emits event in RAY FACTORED value.

`RAY BASED` = `RAY FACTORED`  / factor

 factor increases exponentially for each block mined.

# Functions:

- [`constructor(string name, string symbol, uint256 initfactor)`](#AutoRefactorCoinage-constructor-string-string-uint256-)

- [`factor()`](#AutoRefactorCoinage-factor--)

- [`totalSupply()`](#AutoRefactorCoinage-totalSupply--)

- [`balanceOf(address account)`](#AutoRefactorCoinage-balanceOf-address-)

- [`setFactor(uint256 infactor)`](#AutoRefactorCoinage-setFactor-uint256-)

- [`transfer(address recipient, uint256 amount)`](#AutoRefactorCoinage-transfer-address-uint256-)

- [`allowance(address owner, address spender)`](#AutoRefactorCoinage-allowance-address-address-)

- [`approve(address spender, uint256 amount)`](#AutoRefactorCoinage-approve-address-uint256-)

- [`transferFrom(address sender, address recipient, uint256 amount)`](#AutoRefactorCoinage-transferFrom-address-address-uint256-)

- [`mint(address account, uint256 amount)`](#AutoRefactorCoinage-mint-address-uint256-)

- [`addMinter(address account)`](#AutoRefactorCoinage-addMinter-address-)

- [`renounceMinter()`](#AutoRefactorCoinage-renounceMinter--)

- [`transferOwnership(address newOwner)`](#AutoRefactorCoinage-transferOwnership-address-)

- [`burn(uint256 amount)`](#AutoRefactorCoinage-burn-uint256-)

- [`burnFrom(address account, uint256 amount)`](#AutoRefactorCoinage-burnFrom-address-uint256-)

# Events:

- [`FactorSet(uint256 previous, uint256 current, uint256 shiftCount)`](#AutoRefactorCoinage-FactorSet-uint256-uint256-uint256-)

###### AutoRefactorCoinage-constructor-string-string-uint256-

## Function `constructor(string name, string symbol, uint256 initfactor)`

No description

###### AutoRefactorCoinage-factor--

## Function `factor()`

No description

###### AutoRefactorCoinage-totalSupply--

## Function `totalSupply()`

See {IERC20-totalSupply}.

###### AutoRefactorCoinage-balanceOf-address-

## Function `balanceOf(address account)`

See {IERC20-balanceOf}.

###### AutoRefactorCoinage-setFactor-uint256-

## Function `setFactor(uint256 infactor)`

No description

###### AutoRefactorCoinage-transfer-address-uint256-

## Function `transfer(address recipient, uint256 amount)`

No description

###### AutoRefactorCoinage-allowance-address-address-

## Function `allowance(address owner, address spender)`

No description

###### AutoRefactorCoinage-approve-address-uint256-

## Function `approve(address spender, uint256 amount)`

No description

###### AutoRefactorCoinage-transferFrom-address-address-uint256-

## Function `transferFrom(address sender, address recipient, uint256 amount)`

No description

###### AutoRefactorCoinage-mint-address-uint256-

## Function `mint(address account, uint256 amount)`

See {ERC20-_mint}.

Requirements:

- the caller must have the {MinterRole}.

###### AutoRefactorCoinage-addMinter-address-

## Function `addMinter(address account)`

No description

###### AutoRefactorCoinage-renounceMinter--

## Function `renounceMinter()`

No description

###### AutoRefactorCoinage-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

No description

###### AutoRefactorCoinage-burn-uint256-

## Function `burn(uint256 amount)`

Destroys `amount` tokens from the caller.

See {ERC20-_burn}.

###### AutoRefactorCoinage-burnFrom-address-uint256-

## Function `burnFrom(address account, uint256 amount)`

See {ERC20-_burnFrom}.

###### AutoRefactorCoinage-FactorSet-uint256-uint256-uint256-

## Event `FactorSet(uint256 previous, uint256 current, uint256 shiftCount)`

No description
