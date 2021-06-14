# Functions:

- [`transferOwnership(address newOwner)`](#TokamakStaker-transferOwnership-address-)

- [`setRegistry(address _registry)`](#TokamakStaker-setRegistry-address-)

- [`setTokamakLayer2(address _layer2)`](#TokamakStaker-setTokamakLayer2-address-)

- [`getUniswapInfo()`](#TokamakStaker-getUniswapInfo--)

- [`swapTONtoWTON(uint256 amount, bool toWTON)`](#TokamakStaker-swapTONtoWTON-uint256-bool-)

- [`checkTokamak()`](#TokamakStaker-checkTokamak--)

- [`tokamakStaking(address _layer2, uint256 stakeAmount)`](#TokamakStaker-tokamakStaking-address-uint256-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#TokamakStaker-tokamakRequestUnStaking-address-uint256-)

- [`tokamakRequestUnStakingAll(address _layer2)`](#TokamakStaker-tokamakRequestUnStakingAll-address-)

- [`tokamakProcessUnStaking(address _layer2)`](#TokamakStaker-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`](#TokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-)

- [`exchangeWTONtoFLDv2(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint256 _kind)`](#TokamakStaker-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint256-)

# Events:

- [`SetRegistry(address registry)`](#TokamakStaker-SetRegistry-address-)

- [`SetTokamakLayer2(address layer2)`](#TokamakStaker-SetTokamakLayer2-address-)

- [`tokamakStaked(address layer2, uint256 amount)`](#TokamakStaker-tokamakStaked-address-uint256-)

- [`tokamakRequestedUnStaking(address layer2, uint256 amount)`](#TokamakStaker-tokamakRequestedUnStaking-address-uint256-)

- [`tokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`](#TokamakStaker-tokamakProcessedUnStaking-address-uint256-bool-)

- [`tokamakRequestedUnStakingAll(address layer2)`](#TokamakStaker-tokamakRequestedUnStakingAll-address-)

- [`exchangedWTONtoFLD(address caller, uint256 amountIn, uint256 amountOut)`](#TokamakStaker-exchangedWTONtoFLD-address-uint256-uint256-)

- [`exchangedWTONtoFLD2(address caller, uint256 amountIn, uint256 amountOut)`](#TokamakStaker-exchangedWTONtoFLD2-address-uint256-uint256-)

###### TokamakStaker-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

###### TokamakStaker-setRegistry-address-

## Function `setRegistry(address _registry)`

set registry address

### Parameters:

- `_registry`: new registry address

###### TokamakStaker-setTokamakLayer2-address-

## Function `setTokamakLayer2(address _layer2)`

set the tokamak Layer2 address

### Parameters:

- `_layer2`: new the tokamak Layer2 address

###### TokamakStaker-getUniswapInfo--

## Function `getUniswapInfo()`

get the addresses that used in uniswap interfaces

### Return Values:

- uniswapRouter the address of uniswapRouter

- npm the address of positionManagerAddress

- ext the address of ext

- fee the amount of fee

###### TokamakStaker-swapTONtoWTON-uint256-bool-

## Function `swapTONtoWTON(uint256 amount, bool toWTON)`

Change the TON holded in contract have to WTON, or change WTON to TON.

### Parameters:

- `amount`: the amount to be changed

- `toWTON`: if it's true, TON->WTON , else WTON->TON

###### TokamakStaker-checkTokamak--

## Function `checkTokamak()`

If the tokamak addresses is not set, set the addresses.

###### TokamakStaker-tokamakStaking-address-uint256-

## Function `tokamakStaking(address _layer2, uint256 stakeAmount)`

 staking the staked TON in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `stakeAmount`: the amount that stake to layer2

###### TokamakStaker-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `wtonAmount`: the amount requested to unstaking

###### TokamakStaker-tokamakRequestUnStakingAll-address-

## Function `tokamakRequestUnStakingAll(address _layer2)`

 request unstaking the amount of all in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### TokamakStaker-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

process unstaking in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### TokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to FLD using uniswap

@notice

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `_sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

### Return Values:

- amountOut the amount of exchanged out token

###### TokamakStaker-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint256-

## Function `exchangeWTONtoFLDv2(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint256 _kind)`

exchange holded WTON to FLD using uniswap-v2

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

###### TokamakStaker-SetRegistry-address-

## Event `SetRegistry(address registry)`

event on set the registry address

### Parameters:

- `registry`: the registry address

###### TokamakStaker-SetTokamakLayer2-address-

## Event `SetTokamakLayer2(address layer2)`

event on set the tokamak Layer2 address

### Parameters:

- `layer2`: the tokamak Layer2 address

###### TokamakStaker-tokamakStaked-address-uint256-

## Event `tokamakStaked(address layer2, uint256 amount)`

event on staking the staked TON in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

- `amount`: the amount that stake to layer2

###### TokamakStaker-tokamakRequestedUnStaking-address-uint256-

## Event `tokamakRequestedUnStaking(address layer2, uint256 amount)`

event on request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

- `amount`: the amount requested to unstaking

###### TokamakStaker-tokamakProcessedUnStaking-address-uint256-bool-

## Event `tokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`

event on process unstaking in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

- `rn`: the number of requested unstaking

- `receiveTON`: if is true ,TON , else is WTON

###### TokamakStaker-tokamakRequestedUnStakingAll-address-

## Event `tokamakRequestedUnStakingAll(address layer2)`

event on request unstaking the amount of all in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

###### TokamakStaker-exchangedWTONtoFLD-address-uint256-uint256-

## Event `exchangedWTONtoFLD(address caller, uint256 amountIn, uint256 amountOut)`

exchange WTON to FLD using uniswap v3

### Parameters:

- `caller`: the sender

- `amountIn`: the input amount

###### TokamakStaker-exchangedWTONtoFLD2-address-uint256-uint256-

## Event `exchangedWTONtoFLD2(address caller, uint256 amountIn, uint256 amountOut)`

exchange WTON to FLD using uniswap v2

### Parameters:

- `caller`: the sender

- `amountIn`: the input amount
