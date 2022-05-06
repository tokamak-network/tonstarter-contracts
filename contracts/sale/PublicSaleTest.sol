// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "./PublicSale.sol";

contract PublicSaleTest is
    PublicSale
{
    function resetAllData() external onlyOwner {
        startAddWhiteTime = 0;
        totalExSaleAmount = 0;
        totalExPurchasedAmount = 0;
        totalDepositAmount = 0;
        totalUsers = 0;
        totalRound1Users = 0;
        totalRound2Users = 0;
        totalRound2UsersClaim = 0;

        for (uint256 i = 0; i < whitelists.length; i++) {
            LibPublicSale.UserInfoEx storage userEx = usersEx[whitelists[i]];
            userEx.join = false;
            userEx.payAmount = 0;
            userEx.saleAmount = 0;
            LibPublicSale.UserClaim storage userClaim = usersClaim[whitelists[i]];
            userClaim.claimAmount = 0;
            userClaim.refundAmount = 0;
            userClaim.exec = false;
        }
        for (uint256 j = 0; j < depositors.length; j++) {
            LibPublicSale.UserInfoOpen storage userOpen = usersOpen[depositors[j]];
            userOpen.depositAmount = 0;
            userOpen.join = false;
            userOpen.payAmount = 0;
            LibPublicSale.UserClaim storage userClaim = usersClaim[depositors[j]];
            userClaim.claimAmount = 0;
            userClaim.refundAmount = 0;
            userClaim.exec = false;
        }
        for (uint256 k = 1; k < 5; k++) {
            tiersAccount[k] = 0;
            tiersExAccount[k] = 0;
        }
        delete whitelists;
    }
}