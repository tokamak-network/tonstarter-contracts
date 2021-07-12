# Functions:

- [`constructor(string name_, string symbol_, string version_)`](#TOS-constructor-string-string-string-)

- [`mint(address to, uint256 amount)`](#TOS-mint-address-uint256-)

- [`burn(address from, uint256 amount)`](#TOS-burn-address-uint256-)

- [`permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`](#TOS-permit-address-address-uint256-uint256-uint8-bytes32-bytes32-)

- [`verify(address owner, address spender, uint256 value, uint256 deadline, uint256 _nounce, bytes32 sigR, bytes32 sigS, uint8 sigV)`](#TOS-verify-address-address-uint256-uint256-uint256-bytes32-bytes32-uint8-)

- [`hashPermit(address owner, address spender, uint256 value, uint256 deadline, uint256 _nounce)`](#TOS-hashPermit-address-address-uint256-uint256-uint256-)

###### TOS-constructor-string-string-string-

## Function `constructor(string name_, string symbol_, string version_)`

constructor of TOS, ERC20 Token

###### TOS-mint-address-uint256-

## Function `mint(address to, uint256 amount)`

Issue a token.

### Parameters:

- `to`:  who takes the issue

- `amount`: the amount to issue

###### TOS-burn-address-uint256-

## Function `burn(address from, uint256 amount)`

burn a token.

### Parameters:

- `from`: Whose tokens are burned

- `amount`: the amount to burn

###### TOS-permit-address-address-uint256-uint256-uint8-bytes32-bytes32-

## Function `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

Authorizes the owner's token to be used by the spender as much as the value.

The signature must have the owner's signature.

### Parameters:

- `owner`: the token's owner

- `spender`: the account that spend owner's token

- `value`: the amount to be approve to spend

- `deadline`: the deadline that valid the owner's signature

- `v`: the owner's signature - v

- `r`: the owner's signature - r

- `s`: the owner's signature - s

###### TOS-verify-address-address-uint256-uint256-uint256-bytes32-bytes32-uint8-

## Function `verify(address owner, address spender, uint256 value, uint256 deadline, uint256 _nounce, bytes32 sigR, bytes32 sigS, uint8 sigV)`

verify the signature

### Parameters:

- `owner`: the token's owner

- `spender`: the account that spend owner's token

- `value`: the amount to be approve to spend

- `deadline`: the deadline that valid the owner's signature

- `_nounce`: the _nounce

- `sigR`: the owner's signature - r

- `sigS`: the owner's signature - s

- `sigV`: the owner's signature - v

###### TOS-hashPermit-address-address-uint256-uint256-uint256-

## Function `hashPermit(address owner, address spender, uint256 value, uint256 deadline, uint256 _nounce)`

the hash of Permit

### Parameters:

- `owner`: the token's owner

- `spender`: the account that spend owner's token

- `value`: the amount to be approve to spend

- `deadline`: the deadline that valid the owner's signature

- `_nounce`: the _nounce
