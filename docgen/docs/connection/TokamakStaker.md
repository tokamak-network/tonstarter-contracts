# Functions:

- [`transferOwnership(address newOwner)`](#TokamakStaker-transferOwnership-address-)

- [`setRegistry(address _registry)`](#TokamakStaker-setRegistry-address-)

- [`setTokamakLayer2(address _layer2)`](#TokamakStaker-setTokamakLayer2-address-)

- [`getUniswapInfo()`](#TokamakStaker-getUniswapInfo--)

- [`approveUniswapRouter(uint256 amount)`](#TokamakStaker-approveUniswapRouter-uint256-)

- [`tokamakStaking(address _layer2)`](#TokamakStaker-tokamakStaking-address-)

- [`tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`](#TokamakStaker-tokamakRequestUnStaking-address-uint256-)

- [`tokamakProcessUnStaking(address _layer2)`](#TokamakStaker-tokamakProcessUnStaking-address-)

- [`exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 sqrtPriceLimitX96, uint256 _kind)`](#TokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-)

- [`ExactInputSingleParams(address[2] addrs, address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)`](#TokamakStaker-ExactInputSingleParams-address-2--address-address-uint24-address-uint256-uint256-uint256-uint160-)

- [`exchangeWTONtoFLDexactInput(address uniswapRouter, address wton, address weth, uint256 fee, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline)`](#TokamakStaker-exchangeWTONtoFLDexactInput-address-address-address-uint256-uint256-uint256-uint256-)

# Events:

- [`SetRegistry(address registry)`](#TokamakStaker-SetRegistry-address-)

- [`SetTokamakLayer2(address layer2)`](#TokamakStaker-SetTokamakLayer2-address-)

- [`tokamakStaked(address layer2, uint256 amount)`](#TokamakStaker-tokamakStaked-address-uint256-)

- [`tokamakRequestedUnStaking(address layer2, uint256 amount)`](#TokamakStaker-tokamakRequestedUnStaking-address-uint256-)

- [`tokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`](#TokamakStaker-tokamakProcessedUnStaking-address-uint256-bool-)

- [`exchangedWTONtoFLD(address caller, uint256 amountIn, uint256 amountOut)`](#TokamakStaker-exchangedWTONtoFLD-address-uint256-uint256-)

### TokamakStaker-transferOwnership-address-

## Function `transferOwnership(address newOwner)`

transfer Ownership

### Parameters:

- `newOwner`: new owner address

### TokamakStaker-setRegistry-address-

## Function `setRegistry(address _registry)`

No description

### TokamakStaker-setTokamakLayer2-address-

## Function `setTokamakLayer2(address _layer2)`

No description

### TokamakStaker-getUniswapInfo--

## Function `getUniswapInfo()`

No description

### TokamakStaker-approveUniswapRouter-uint256-

## Function `approveUniswapRouter(uint256 amount)`

No description

### TokamakStaker-tokamakStaking-address-

## Function `tokamakStaking(address _layer2)`

No description

### TokamakStaker-tokamakRequestUnStaking-address-uint256-

## Function `tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)`

No description

### TokamakStaker-tokamakProcessUnStaking-address-

## Function `tokamakProcessUnStaking(address _layer2)`

No description

### TokamakStaker-exchangeWTONtoFLD-uint256-uint256-uint256-uint160-uint256-

## Function `exchangeWTONtoFLD(uint256 _amountIn, uint256 _amountOutMinimum, uint256 _deadline, uint160 sqrtPriceLimitX96, uint256 _kind)`

No description

### TokamakStaker-ExactInputSingleParams-address-2--address-address-uint24-address-uint256-uint256-uint256-uint160-

## Function `ExactInputSingleParams(address[2] addrs, address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)`

No description

### TokamakStaker-exchangeWTONtoFLDexactInput-address-address-address-uint256-uint256-uint256-uint256-

## Function `exchangeWTONtoFLDexactInput(address uniswapRouter, address wton, address weth, uint256 fee, uint256 amountIn, uint256 amountOutMinimum, uint256 deadline)`

No description

### TokamakStaker-SetRegistry-address-

## Event `SetRegistry(address registry)`

No description

### TokamakStaker-SetTokamakLayer2-address-

## Event `SetTokamakLayer2(address layer2)`

No description

### TokamakStaker-tokamakStaked-address-uint256-

## Event `tokamakStaked(address layer2, uint256 amount)`

No description

### TokamakStaker-tokamakRequestedUnStaking-address-uint256-

## Event `tokamakRequestedUnStaking(address layer2, uint256 amount)`

No description

### TokamakStaker-tokamakProcessedUnStaking-address-uint256-bool-

## Event `tokamakProcessedUnStaking(address layer2, uint256 rn, bool receiveTON)`

No description

### TokamakStaker-exchangedWTONtoFLD-address-uint256-uint256-

## Event `exchangedWTONtoFLD(address caller, uint256 amountIn, uint256 amountOut)`

No description
