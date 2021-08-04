// SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface ILockTOSDividend {
    function distribute(address _token, uint256 _amount) external;
    function redistribute(address _token, uint256 _weeklyEpoch) external;
    function getWeeklyEpoch(uint256 _timestamp) external view returns (uint256);
    function getCurrentWeeklyEpoch() external view returns (uint256);
}