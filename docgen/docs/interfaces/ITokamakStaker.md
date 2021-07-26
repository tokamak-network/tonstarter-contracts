# Functions:

- [`setTokamakLayer2(address _layer2)`](#ITokamakStaker-setTokamakLayer2-address-)

- [`getUniswapInfo()`](#ITokamakStaker-getUniswapInfo--)

- [`swapTONtoWTON(uint256 amount, bool toWTON)`](#ITokamakStaker-swapTONtoWTON-uint256-bool-)

- [`tokamakStaking(address _layer2, uint256 stakeAmount)`](#ITokamakStaker-tokamakStaking-address-uint256-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#ITokamakStaker-tokamakRequestUnStaking-address-uint256-)

- [`tokamakRequestUnStakingAll(address _layer2)`](#ITokamakStaker-tokamakRequestUnStakingAll-address-)

- [`tokamakProcessUnStaking(address _layer2)`](#ITokamakStaker-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoTOS(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`](#ITokamakStaker-exchangeWTONtoTOS-uint256-uint256-uint256-uint160-uint256-)

###### ITokamakStaker-setTokamakLayer2-address-

## Function `setTokamakLayer2(address _layer2)`

set the tokamak Layer2 address

### Parameters:

- `_layer2`: new the tokamak Layer2 address

###### ITokamakStaker-getUniswapInfo--

## Function `getUniswapInfo()`

get the addresses yhat used in uniswap interfaces

### Return Values:

- uniswapRouter the address of uniswapV3 Router

- npm the address of positionManagerAddress

- ext the address of ext

- fee the amount of fee

- uniswapV2Router uniswapV2 router address

###### ITokamakStaker-swapTONtoWTON-uint256-bool-

## Function `swapTONtoWTON(uint256 amount, bool toWTON)`

Change the TON holded in contract have to WTON, or change WTON to TON.

### Parameters:

- `amount`: the amount to be changed

- `toWTON`: if it's true, TON->WTON , else WTON->TON

###### ITokamakStaker-tokamakStaking-address-uint256-

## Function `tokamakStaking(address _layer2, uint256 stakeAmount)`

 staking the staked TON in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `stakeAmount`: the amount that stake to layer2

###### ITokamakStaker-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `wtonAmount`: the amount requested to unstaking

###### ITokamakStaker-tokamakRequestUnStakingAll-address-

## Function `tokamakRequestUnStakingAll(address _layer2)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### ITokamakStaker-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

process unstaking in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### ITokamakStaker-exchangeWTONtoTOS-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoTOS(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to TOS using uniswap-v3

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `_sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function
