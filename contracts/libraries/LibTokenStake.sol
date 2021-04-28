//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibTokenStake {

    struct StakedSnapshot {
        uint256 blockNumber;
        uint256 totalStaked;
        uint256 balanceOfToken;
        uint256 index;
    }

    struct userStake {
        uint256 startBlock;
        uint256 endBlock;
        uint256 stakeAmount;
        uint256 claimBlock;
        uint256 takenReward;
    }
    struct unStakedInfo {
        uint256 outBlock;
        uint256 amount;
        uint256 index;
        uint256 beforeBlock;
        uint256 nextBlock;
    }
}
