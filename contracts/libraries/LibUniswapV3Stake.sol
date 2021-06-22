// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibUniswapV3Stake {
  struct StakeLiquidity {
    address owner;
    address poolAddress;
    uint128 liquidity;
    int24 tickLower;
    int24 tickUpper;
    uint256 secondsPerLiquidityInsideX128Last;
    uint256 claimedAmount;
    uint256 claimedBlock;
  }

  struct ModifyPositionParams {
    uint256 tokenId;
    uint24 newFee;
    int24 newTickLower;
    int24 newTickUpper;
  }
}