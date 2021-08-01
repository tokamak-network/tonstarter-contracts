//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

//pragma abicoder v2;
//import "../libraries/LibTokenStake1.sol";

interface IIStake2Vault {
    /// @dev  of according to request from(staking contract)  the amount of mining is paid to to.
    /// @param to the address that will receive the reward
    /// @param minableAmount minable amount
    /// @param miningAmount amount mined
    /// @param nonMiningAmount Amount not mined
    function claimMining(
        address to,
        uint256 minableAmount,
        uint256 miningAmount,
        uint256 nonMiningAmount
    ) external returns (bool);

    function miningPerSecond() external returns (uint256);

    function miningStartTime() external returns (uint256);
}
