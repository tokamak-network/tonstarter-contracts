//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import {IIDepositManager} from "../interfaces/IIDepositManager.sol";
import {IISeigManager} from "../interfaces/IISeigManager.sol";

library LibTokamak {
    function tokamakRequestUnStakingAll
    (
        address depositManager,
        address _layer2
    )
        public
    {
        IIDepositManager(depositManager).requestWithdrawalAll(_layer2);
    }

    function tokamakRequestUnStaking
    (
        address depositManager,
        address _layer2,
        uint256 _amount
    )
        public
    {
        require(_amount > 0,"zero");

        IIDepositManager(depositManager).requestWithdrawal(_layer2, _amount);
    }
}
