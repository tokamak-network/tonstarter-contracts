# Functions:

- [`factory()`](#IUniswapV2Router01-factory--)

- [`WETH()`](#IUniswapV2Router01-WETH--)

- [`addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline)`](#IUniswapV2Router01-addLiquidity-address-address-uint256-uint256-uint256-uint256-address-uint256-)

- [`addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline)`](#IUniswapV2Router01-addLiquidityETH-address-uint256-uint256-uint256-address-uint256-)

- [`removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline)`](#IUniswapV2Router01-removeLiquidity-address-address-uint256-uint256-uint256-address-uint256-)

- [`removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline)`](#IUniswapV2Router01-removeLiquidityETH-address-uint256-uint256-uint256-address-uint256-)

- [`removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)`](#IUniswapV2Router01-removeLiquidityWithPermit-address-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-)

- [`removeLiquidityETHWith(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s)`](#IUniswapV2Router01-removeLiquidityETHWith-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-)

- [`swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)`](#IUniswapV2Router01-swapExactTokensForTokens-uint256-uint256-address---address-uint256-)

- [`swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)`](#IUniswapV2Router01-swapTokensForExactTokens-uint256-uint256-address---address-uint256-)

- [`swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)`](#IUniswapV2Router01-swapExactETHForTokens-uint256-address---address-uint256-)

- [`swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)`](#IUniswapV2Router01-swapTokensForExactETH-uint256-uint256-address---address-uint256-)

- [`swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)`](#IUniswapV2Router01-swapExactTokensForETH-uint256-uint256-address---address-uint256-)

- [`swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)`](#IUniswapV2Router01-swapETHForExactTokens-uint256-address---address-uint256-)

- [`quote(uint256 amountA, uint256 reserveA, uint256 reserveB)`](#IUniswapV2Router01-quote-uint256-uint256-uint256-)

- [`getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)`](#IUniswapV2Router01-getAmountOut-uint256-uint256-uint256-)

- [`getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut)`](#IUniswapV2Router01-getAmountIn-uint256-uint256-uint256-)

- [`getAmountsOut(uint256 amountIn, address[] path)`](#IUniswapV2Router01-getAmountsOut-uint256-address---)

- [`getAmountsIn(uint256 amountOut, address[] path)`](#IUniswapV2Router01-getAmountsIn-uint256-address---)

# Function `factory() → address` {#IUniswapV2Router01-factory--}

No description

# Function `WETH() → address` {#IUniswapV2Router01-WETH--}

No description

# Function `addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB, uint256 liquidity` {#IUniswapV2Router01-addLiquidity-address-address-uint256-uint256-uint256-uint256-address-uint256-}

No description

# Function `addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH, uint256 liquidity` {#IUniswapV2Router01-addLiquidityETH-address-uint256-uint256-uint256-address-uint256-}

No description

# Function `removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB` {#IUniswapV2Router01-removeLiquidity-address-address-uint256-uint256-uint256-address-uint256-}

No description

# Function `removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH` {#IUniswapV2Router01-removeLiquidityETH-address-uint256-uint256-uint256-address-uint256-}

No description

# Function `removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountA, uint256 amountB` {#IUniswapV2Router01-removeLiquidityWithPermit-address-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-}

No description

# Function `removeLiquidityETHWith(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountToken, uint256 amountETH` {#IUniswapV2Router01-removeLiquidityETHWith-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-}

No description

# Function `swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` {#IUniswapV2Router01-swapExactTokensForTokens-uint256-uint256-address---address-uint256-}

No description

# Function `swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) → uint256[] amounts` {#IUniswapV2Router01-swapTokensForExactTokens-uint256-uint256-address---address-uint256-}

No description

# Function `swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` {#IUniswapV2Router01-swapExactETHForTokens-uint256-address---address-uint256-}

No description

# Function `swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) → uint256[] amounts` {#IUniswapV2Router01-swapTokensForExactETH-uint256-uint256-address---address-uint256-}

No description

# Function `swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` {#IUniswapV2Router01-swapExactTokensForETH-uint256-uint256-address---address-uint256-}

No description

# Function `swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) → uint256[] amounts` {#IUniswapV2Router01-swapETHForExactTokens-uint256-address---address-uint256-}

No description

# Function `quote(uint256 amountA, uint256 reserveA, uint256 reserveB) → uint256 amountB` {#IUniswapV2Router01-quote-uint256-uint256-uint256-}

No description

# Function `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) → uint256 amountOut` {#IUniswapV2Router01-getAmountOut-uint256-uint256-uint256-}

No description

# Function `getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) → uint256 amountIn` {#IUniswapV2Router01-getAmountIn-uint256-uint256-uint256-}

No description

# Function `getAmountsOut(uint256 amountIn, address[] path) → uint256[] amounts` {#IUniswapV2Router01-getAmountsOut-uint256-address---}

No description

# Function `getAmountsIn(uint256 amountOut, address[] path) → uint256[] amounts` {#IUniswapV2Router01-getAmountsIn-uint256-address---}

No description
