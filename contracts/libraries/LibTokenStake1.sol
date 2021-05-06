//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;


library LibTokenStake1 {
    struct StakeInfo {
        string name;
        uint256 startBlcok;
        uint256 endBlock;
        uint256 balance;
        uint256 totalRewardAmount;
        uint256 claimRewardAmount;
    }

    struct StakedAmount {
        uint256 amount;
        uint256 claimedBlock;
        uint256 claimedAmount;
        uint256 releasedBlock;
        uint256 releasedAmount;
        bool released;
    }
}
