//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

interface IFLDVault {
    function setFLD(address _ton) external;
    function approveFLD(address _to, uint256 _amount) external;
    function approveERC20(address _token, address _to, uint256 _amount) external;
    function claimFLD(address _to, uint256 _amount) external returns (bool);
    function claimERC20(address _token, address _to, uint256 _amount) external;
}
