//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibTokenMining {

    struct LockAmount {
        bool released;
        uint256 releaseTime;
        uint256 amount;
    }

    struct LockTokenAmount {
        address paytoken;
        uint256 amount;
    }

    struct VAULT {
        uint256 total;
        uint256 used;
    }

}
