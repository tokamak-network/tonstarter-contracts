//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenSale.sol";

interface ICrowdsale{

    event TokenPurchase(address indexed purchaser, uint256 value, uint256 duration, uint256 amount);
    event TokenRePurchase(address indexed purchaser, uint256 value, uint256 duration, uint256 amount);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {TokenPurchase} event.
     */
    function buyTokens(uint256 duration) external ;
    function buyTokens(address paytoken, uint256 amount, uint256 duration) external;
    function withdraw() external returns (bool);
    function rebuyToken(uint256 duration) external;

    function validPurchase(uint256 amount, uint256 duration) external view returns (bool);
    function canWithdrawAmount(address user) external view returns (uint256 validAmount);
    function getAllUserLocks(address user) external view returns (LibTokenSale.LockAmount[] memory);
    function lengthAllUserLocks(address user) external view returns (uint256 counts);
    function getUserLocks(address user, uint256 index) external view returns (LibTokenSale.LockAmount memory);

    function hasEnded() external view returns (bool);
    function getRatio(uint256 duration) external view returns (uint256 ratio);
    function calculateAmountByRatio(uint256 amount, uint256 duration) external view returns (uint256 ratio);

}
