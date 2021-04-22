//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenSale.sol";

interface IPreMining{

    event TokenPurchase(address indexed purchaser, uint256 value, uint256 duration, uint256 amount);
    event TokenRePurchase(address indexed purchaser, uint256 value, uint256 duration, uint256 amount);
    event Withdraw(address indexed from, address token, uint256 value);

    /**
     * @dev By sending Ether and staking the Ether sent for a duration (seconds), you can receive tokens.
     *
     * Emits a {TokenPurchase} event.
     */
    function buyToken(uint256 duration) external ;
    /**
     * @dev By sending the amount of paytoken and staking the Ether sent during the duration (seconds), you can receive the token.
     *
     * Emits a {TokenPurchase} event.
     */
    function buyTokens(address paytoken, uint256 amount, uint256 duration) external;
    /**
     * @dev You can withdraw the staked ether or paytoken.
     *
     * Emits a {Withdraw} event.
     */
    function withdraw() external returns (bool);
    /**
     * @dev You can receive tokens by staking again for a period (seconds) without withdrawal.
     *
     * Emits a {TokenRePurchase} event.
     */
    function rebuyToken(uint256 duration) external;

    /**
     * @dev You can see the amount the user can withdraw.
     *
     */
    function canWithdrawAmount(address user) external view returns (uint256 validAmount);
    function validPurchase(uint256 amount, uint256 duration) external view returns (bool);

    /**
     * @dev You can view the current lock storage of your account.
     *
     */
    function getAllUserLocks(address user) external view returns (LibTokenSale.LockAmount[] memory);
    function lengthAllUserLocks(address user) external view returns (uint256 counts);
    function getUserLocks(address user, uint256 index) external view returns (LibTokenSale.LockAmount memory);

    function hasEnded() external view returns (bool);
    function getRatio(uint256 duration) external view returns (uint256 ratio);
    function calculateAmountByRatio(uint256 amount, uint256 duration) external view returns (uint256 ratio);

}
