# Functions:

- [`setRegistry(address _registry)`](#TokamakStaker-setRegistry-address-)

- [`setTokamakLayer2(address _layer2)`](#TokamakStaker-setTokamakLayer2-address-)

- [`getUniswapInfo()`](#TokamakStaker-getUniswapInfo--)

- [`swapTONtoWTON(uint256 amount, bool toWTON)`](#TokamakStaker-swapTONtoWTON-uint256-bool-)

- [`checkTokamak()`](#TokamakStaker-checkTokamak--)

- [`tokamakStaking(address _layer2, uint256 stakeAmount)`](#TokamakStaker-tokamakStaking-address-uint256-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#TokamakStaker-tokamakRequestUnStaking-address-uint256-)

- [`tokamakRequestUnStakingAll(address _layer2)`](#TokamakStaker-tokamakRequestUnStakingAll-address-)

- [`tokamakProcessUnStaking(address _layer2)`](#TokamakStaker-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoTOS(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`](#TokamakStaker-exchangeWTONtoTOS-uint256-uint256-uint256-uint160-uint256-)

# Events:

- [`SetRegistry(address registry)`](#TokamakStaker-SetRegistry-address-)

- [`SetTokamakLayer2(address layer2)`](#TokamakStaker-SetTokamakLayer2-address-)

- [`TokamakStaked(address layer2, uint256 amount)`](#TokamakStaker-TokamakStaked-address-uint256-)

- [`TokamakRequestedUnStaking(address layer2, uint256 amount)`](#TokamakStaker-TokamakRequestedUnStaking-address-uint256-)

- [`TokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`](#TokamakStaker-TokamakProcessedUnStaking-address-uint256-bool-)

- [`TokamakRequestedUnStakingAll(address layer2)`](#TokamakStaker-TokamakRequestedUnStakingAll-address-)

- [`ExchangedWTONtoTOS(address caller, uint256 amountIn, uint256 amountOut)`](#TokamakStaker-ExchangedWTONtoTOS-address-uint256-uint256-)

- [`ExchangedWTONtoTOS2(address caller, uint256 amountIn, uint256 amountOut)`](#TokamakStaker-ExchangedWTONtoTOS2-address-uint256-uint256-)

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

###### TokamakStaker-exchangeWTONtoTOS-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoTOS(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to TOS using uniswap

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `_sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

### Return Values:

- amountOut the amount of exchanged out token

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

###### TokamakStaker-TokamakStaked-address-uint256-

## Event `TokamakStaked(address layer2, uint256 amount)`

event on staking the staked TON in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

- `amount`: the amount that stake to layer2

###### TokamakStaker-TokamakRequestedUnStaking-address-uint256-

## Event `TokamakRequestedUnStaking(address layer2, uint256 amount)`

event on request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

- `amount`: the amount requested to unstaking

###### TokamakStaker-TokamakProcessedUnStaking-address-uint256-bool-

## Event `TokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`

event on process unstaking in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

- `rn`: the number of requested unstaking

- `receiveTON`: if is true ,TON , else is WTON

###### TokamakStaker-TokamakRequestedUnStakingAll-address-

## Event `TokamakRequestedUnStakingAll(address layer2)`

event on request unstaking the amount of all in layer2 in tokamak

### Parameters:

- `layer2`: the layer2 address in tokamak

###### TokamakStaker-ExchangedWTONtoTOS-address-uint256-uint256-

## Event `ExchangedWTONtoTOS(address caller, uint256 amountIn, uint256 amountOut)`

exchange WTON to TOS using uniswap v3

### Parameters:

- `caller`: the sender

- `amountIn`: the input amount

###### TokamakStaker-ExchangedWTONtoTOS2-address-uint256-uint256-

## Event `ExchangedWTONtoTOS2(address caller, uint256 amountIn, uint256 amountOut)`

exchange WTON to TOS using uniswap v2

### Parameters:

- `caller`: the sender

- `amountIn`: the input amount
