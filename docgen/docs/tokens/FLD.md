# Functions:

- [`constructor()`](#FLD-constructor--)

- [`transferOwnership(address newOwner)`](#FLD-transferOwnership-address-)

- [`mint(address to, uint256 amount)`](#FLD-mint-address-uint256-)

- [`burn(address from, uint256 amount)`](#FLD-burn-address-uint256-)

- [`permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)`](#FLD-permit-address-address-uint256-uint256-bytes-)

- [`permitVerify(address _signer, address _to, uint256 _amount, uint256 _period, uint256 _nonce, bytes signature)`](#FLD-permitVerify-address-address-uint256-uint256-uint256-bytes-)

###### FLD-constructor--

## Function `constructor()`

constructor of FLD, ERC20 Token

###### FLD-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

###### FLD-mint-address-uint256-

## Function `mint(address to, uint256 amount)`

Issue a token.

### Parameters:

- `to`:  who takes the issue

- `amount`: the amount to issue

###### FLD-burn-address-uint256-

## Function `burn(address from, uint256 amount)`

burn a token.

### Parameters:

- `from`: Whose tokens are burned

- `amount`: the amount to burn

###### FLD-permit-address-address-uint256-uint256-bytes-

## Function `permit(address owner, address spender, uint256 value, uint256 deadline, bytes signature)`

Authorizes the owner's token to be used by the spender as much as the value.

The signature must have the owner's signature.

### Parameters:

- `owner`: the token's owner

- `spender`: the account that spend owner's token

- `value`: the amount to be approve to spend

- `deadline`: the deadline that vaild the owner's signature

- `signature`: the owner's signature

###### FLD-permitVerify-address-address-uint256-uint256-uint256-bytes-

## Function `permitVerify(address _signer, address _to, uint256 _amount, uint256 _period, uint256 _nonce, bytes signature)`

Check sure the signature is correct.

### Parameters:

- `_signer`: the token's owner

- `_to`: the account that spend owner's token

- `_amount`: the amount to be approve to spend

- `_period`: the deadline that vaild the owner's signature

- `_nonce`: the account's nonce

- `signature`: the owner's signature
