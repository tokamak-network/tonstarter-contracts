# Functions:

- [`tokamakStaking(address _layer2)`](#IStakeTONTokamak-tokamakStaking-address-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#IStakeTONTokamak-tokamakRequestUnStaking-address-uint256-)

- [`tokamakProcessUnStaking(address _layer2)`](#IStakeTONTokamak-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 sqrtPriceLimitX96, uint256 _kind)`](#IStakeTONTokamak-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-)

- [`exchangeWTONtoFLDv2(uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 _sqrtPriceLimitX96, uint256 _type)`](#IStakeTONTokamak-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint160-uint256-)

###### IStakeTONTokamak-tokamakStaking-address-

## Function `tokamakStaking(address _layer2)`

 staking the staked TON in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### IStakeTONTokamak-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `wtonAmount`: the amount requested to unstaking

###### IStakeTONTokamak-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

process unstaking in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### IStakeTONTokamak-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to FLD using uniswap

### Parameters:

- `_amountIn`: the input amount

- `_amountOutMinimum`: the minimun output amount

- `_deadline`: deadline

- `sqrtPriceLimitX96`: sqrtPriceLimitX96

- `_kind`: the function type, if 0, use exactInputSingle function, else if, use exactInput function

### Return Values:

- amountOut the amount of exchanged out token

###### IStakeTONTokamak-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLDv2(uint256 amountIn, uint256 amountOutMinimum, uint256 deadline, uint160 _sqrtPriceLimitX96, uint256 _type)`

No description
