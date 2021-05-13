// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IUniswapActor {
    function swapToPrice(
        address tokenA,
        address tokenB,
        uint256 truePriceTokenA,
        uint256 truePriceTokenB,
        uint256 maxSpendTokenA,
        uint256 maxSpendTokenB,
        address to,
        uint256 deadline
    ) external;
}
