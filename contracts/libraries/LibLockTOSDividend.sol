// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;


library LibLockTOSDividend {
    struct Distribution {
        uint256 totalDistribution;
        mapping (uint256 => uint256) tokensPerWeek;
        mapping (uint256 => uint256) claimStartWeeklyEpoch;
    } 
}