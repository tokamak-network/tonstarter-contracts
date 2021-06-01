# Functions:

- [`setTokamakLayer2(address _layer2)`](#ITokamakStaker-setTokamakLayer2-address-)

- [`getUniswapInfo()`](#ITokamakStaker-getUniswapInfo--)

- [`approveUniswapRouter(uint256 amount)`](#ITokamakStaker-approveUniswapRouter-uint256-)

- [`tokamakStaking(address _layer2)`](#ITokamakStaker-tokamakStaking-address-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#ITokamakStaker-tokamakRequestUnStaking-address-uint256-)

- [`tokamakProcessUnStaking(address _layer2)`](#ITokamakStaker-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`](#ITokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-)

- [`exchangeWTONtoFLDv2(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint256 _kind)`](#ITokamakStaker-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint256-)

###### ITokamakStaker-setTokamakLayer2-address-

## Function `setTokamakLayer2(address _layer2)`

set the tokamak Layer2 address

### Parameters:

- `_layer2`: new the tokamak Layer2 address

###### ITokamakStaker-getUniswapInfo--

## Function `getUniswapInfo()`

get the addresses yhat used in uniswap interfaces

### Return Values:

- uniswapRouter the address of uniswapRouter

- npm the address of positionManagerAddress

- ext the address of ext

- fee the amount of fee

###### ITokamakStaker-approveUniswapRouter-uint256-

## Function `approveUniswapRouter(uint256 amount)`

Amount approve for use with UniswapRouter

### Parameters:

- `amount`: the amount requested to aprove

###### ITokamakStaker-tokamakStaking-address-

## Function `tokamakStaking(address _layer2)`

 staking the staked TON in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### ITokamakStaker-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `wtonAmount`: the amount requested to unstaking

###### ITokamakStaker-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

process unstaking in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### ITokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to FLD using uniswap-v3

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `_sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

###### ITokamakStaker-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint256-

## Function `exchangeWTONtoFLDv2(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint256 _kind)`

exchange holded WTON to FLD using uniswap-v2

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function
