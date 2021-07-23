// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibUniswapV3Stake {
    // withdraw 시에 delete => 웹페이지에서 withdraw
    struct StakeLiquidity {
        address owner;
        uint256 idIndex;
        address poolAddress;
        uint128 liquidity;
        int24 tickLower;
        int24 tickUpper;
        uint256 startTime;
        uint256 endTime;
        uint256 claimedTime;
        uint160 secondsPerLiquidityInsideX128Initial;
        uint160 secondsPerLiquidityInsideX128Last;
        uint160 secondsInsideDeposit;
        uint160 secondsInsideLast;
    }

    struct StakedTokenAmount {
        uint256 amount;
        uint256 startBlock;
        uint256 claimedBlock;
        uint256 claimedAmount;
        uint256 rewardNonLiquidityClaimAmount;
    }

    struct StakedTotalTokenAmount {
        bool staked;
        uint256 totalDepositAmount;
        uint256 totalClaimedAmount;
        uint256 totalUnableClaimAmount;
    }
}
