//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibProject {
    struct TokenSale {
        address project;
        uint256 index;
        uint256 startTime;
        uint256 endTime;
        uint256 softCap;
        uint256 hardCap;
        uint256 price;
        bool closed;
    }

    struct ProjectInfo {
        bool deployed;
        uint256 startBlock;
        uint256 endBlock;
        address token;
        address pair;
        string name;
        string symbol;
    }

    struct TokenDistribution {
        uint256 airdrop;
        uint256 dev;
        uint256 rewardGeneral;
        uint256 rewardLP;
        uint256 sale;
        uint256 airdropAmount;
        uint256 devAmount;
        uint256 rewardGeneralAmount;
        uint256 rewardLPAmount;
    }

    struct SaleIncomeDistribution {
        uint256 dev;
        uint256 defi;
        uint256 remain;
    }
}
