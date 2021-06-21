// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibUniswapV3Stake {
  struct StakeLiquidity {
    address owner;
    address poolAddress;
    uint256 liquidity;
    int24 tickLower;
    int24 tickUpper;
    uint256 secondsPerLiquidityInsideX128Last;
    uint256 claimedAmount;
    uint256 claimedBlock;
  }
}