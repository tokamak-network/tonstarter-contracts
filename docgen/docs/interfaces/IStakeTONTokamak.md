# Functions:

- [`tokamakStaking(address _layer2, uint256 stakeAmount)`](#IStakeTONTokamak-tokamakStaking-address-uint256-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#IStakeTONTokamak-tokamakRequestUnStaking-address-uint256-)

- [`tokamakRequestUnStakingAll(address _layer2)`](#IStakeTONTokamak-tokamakRequestUnStakingAll-address-)

- [`tokamakProcessUnStaking(address _layer2)`](#IStakeTONTokamak-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoTOS(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 sqrtPriceLimitX96, uint256 _kind)`](#IStakeTONTokamak-exchangeWTONtoTOS-uint256-uint256-uint256-uint160-uint256-)

###### IStakeTONTokamak-tokamakStaking-address-uint256-

## Function `tokamakStaking(address _layer2, uint256 stakeAmount)`

 staking the staked TON in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `stakeAmount`: the amount that stake to layer2

###### IStakeTONTokamak-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `wtonAmount`: the amount requested to unstaking

###### IStakeTONTokamak-tokamakRequestUnStakingAll-address-

## Function `tokamakRequestUnStakingAll(address _layer2)`

Requests unstaking the amount of all  in tokamak's layer2

### Parameters:

- `_layer2`: the layer2 address in Tokamak

###### IStakeTONTokamak-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

process unstaking in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### IStakeTONTokamak-exchangeWTONtoTOS-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoTOS(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to TOS using uniswap

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

### Return Values:

- amountOut the amount of exchanged out token
