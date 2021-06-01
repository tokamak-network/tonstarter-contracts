# Functions:

- [`transferOwnership(address newOwner)`](#TokamakStaker-transferOwnership-address-)

- [`setRegistry(address _registry)`](#TokamakStaker-setRegistry-address-)

- [`setTokamakLayer2(address _layer2)`](#TokamakStaker-setTokamakLayer2-address-)

- [`getUniswapInfo()`](#TokamakStaker-getUniswapInfo--)

- [`approveUniswapRouter(uint256 amount)`](#TokamakStaker-approveUniswapRouter-uint256-)

- [`tokamakStaking(address _layer2)`](#TokamakStaker-tokamakStaking-address-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#TokamakStaker-tokamakRequestUnStaking-address-uint256-)

- [`tokamakProcessUnStaking(address _layer2)`](#TokamakStaker-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`](#TokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-)

- [`exchangeWTONtoFLDv2(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint256 _kind)`](#TokamakStaker-exchangeWTONtoFLDv2-uint256-uint256-uint256-uint256-)

# Events:

- [`SetRegistry(address registry)`](#TokamakStaker-SetRegistry-address-)

- [`SetTokamakLayer2(address layer2)`](#TokamakStaker-SetTokamakLayer2-address-)

- [`tokamakStaked(address layer2, uint256 amount)`](#TokamakStaker-tokamakStaked-address-uint256-)

- [`tokamakRequestedUnStaking(address layer2, uint256 amount)`](#TokamakStaker-tokamakRequestedUnStaking-address-uint256-)

- [`tokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`](#TokamakStaker-tokamakProcessedUnStaking-address-uint256-bool-)

- [`exchangedWTONtoFLD(address caller, uint256 amountIn, uint256 amountOut)`](#TokamakStaker-exchangedWTONtoFLD-address-uint256-uint256-)

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

###### TokamakStaker-approveUniswapRouter-uint256-

## Function `approveUniswapRouter(uint256 amount)`

No description

###### TokamakStaker-tokamakStaking-address-

## Function `tokamakStaking(address _layer2)`

 staking the staked TON in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### TokamakStaker-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

 request unstaking the wtonAmount in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

- `wtonAmount`: the amount requested to unstaking

###### TokamakStaker-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

process unstaking in layer2 in tokamak

### Parameters:

- `_layer2`: the layer2 address in tokamak

###### TokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 _sqrtPriceLimitX96, uint256 _kind)`

exchange holded WTON to FLD using uniswap

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

No description

###### TokamakStaker-SetTokamakLayer2-address-

## Event `SetTokamakLayer2(address layer2)`

No description

###### TokamakStaker-tokamakStaked-address-uint256-

## Event `tokamakStaked(address layer2, uint256 amount)`

No description

###### TokamakStaker-tokamakRequestedUnStaking-address-uint256-

## Event `tokamakRequestedUnStaking(address layer2, uint256 amount)`

No description

###### TokamakStaker-tokamakProcessedUnStaking-address-uint256-bool-

## Event `tokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`

No description

###### TokamakStaker-exchangedWTONtoFLD-address-uint256-uint256-

## Event `exchangedWTONtoFLD(address caller, uint256 amountIn, uint256 amountOut)`

No description
