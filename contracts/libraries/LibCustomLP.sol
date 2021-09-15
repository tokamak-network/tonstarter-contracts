// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibCustomLP {
    struct RewardToken {
        bool allocated;
        address token;
        address donator;
        uint256 allocatedAmount;
        uint256 start;
        uint256 end;
        uint256 rewardPerSecond;
        uint256 tokenPerShare;
        uint256 lastRewardTime;
    }

    struct ClaimInfoLP {
        bool staked;
        uint256 amount;
        uint256 debt;
        uint256 claimedAmount;
        uint256 lastClaimedTime;
    }

    struct ClaimInfoToken {
        uint256 claimedAmount;
        uint256 nonLiquidityAmount;
    }

    struct StakeLiquidity {
        address owner;
        uint128 liquidity;
        int24 tickLower;
        int24 tickUpper;
        uint32 startTime;
        uint32 claimedTime;
        uint160 secondsInsideInitial;
        uint160 secondsInsideLast;
        bool lock;
    }
}
