//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTONTokamak {

    function tokamakStaking(address _layer2) external;

    function tokamakRequestUnStakingAll(address _layer2) external;

    function tokamakRequestUnStakingReward(address _layer2) external;

    function tokamakProcessUnStaking(address _layer2, bool receiveTON) external;

}
