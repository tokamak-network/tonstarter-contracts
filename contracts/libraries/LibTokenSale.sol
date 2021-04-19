//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

library LibTokenSale {

    struct LockAmount {
        bool released;
        uint256 releaseTime;
        uint256 amount;
    }

}
