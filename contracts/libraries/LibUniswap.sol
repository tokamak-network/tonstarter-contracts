//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
import {IUniswapV2Router01} from "../interfaces/IUniswapV2Router01.sol";

library LibUniswap {
    function swapTokensForExactTokens(
        address router,
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        return
            IUniswapV2Router01(router).swapTokensForExactTokens(
                amountOut,
                amountInMax,
                path,
                to,
                deadline
            );
    }
}
