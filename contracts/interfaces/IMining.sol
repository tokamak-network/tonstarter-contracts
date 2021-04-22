//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenSale.sol";

interface IMining{

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
    function buyTokens(address _paytoken, uint256 amount, uint256 duration) external;
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

    /**
    * When the FLD is mined by sending the erc20 token amount for a period of time,
    * it returns true if the FLD can be obtained(mined).
    */
    function validPurchase(uint256 amount, uint256 duration) external view returns (bool);

    /**
    * When the FLD is mined by sending the ether amount for a period of time,
    * it returns true if the FLD can be obtained(mined).
    */
    function validPurchaseETH(uint256 amount, uint256 duration) external view returns (bool);

    /**
    * Returns true if it is a miningable period.
    */
    function validPeriod(uint256 duration) external view returns (bool);

    /**
    * Calculate the mining rate when locked during the period.
    * Depending on the type of mining, it is calculated at a linear rate over time,
    * or at a fixed rate for each specific period unit.
    */
    function getRatio(uint256 duration) external view returns (uint256 ratio);

    /**
    * When the amount is locked for a period, the amount of mining is calculated.
    * Depending on the type of mining, it is calculated at a linear rate over time,
    * or at a fixed rate for each specific period unit.
    */
    function calculateAmountByRatio(uint256 amount, uint256 duration) external view returns (uint256 ratio);

    /**
     * @dev You can view the current lock storage of your account.
     *
     */
    function getAllUserLocks(address user) external view returns (LibTokenSale.LockAmount[] memory);

    /**
     * the current lock storage length of your account.
     */
    function lengthAllUserLocks(address user) external view returns (uint256 counts);

    /**
     * You can view the lock storage of array index of your account.
     */
    function getUserLocks(address user, uint256 index) external view returns (LibTokenSale.LockAmount memory);

    // The token being sold
    function token() external view returns (address);

    // vault address
    function vault() external view returns (address);

    // The name(hash) of the vault to use.
    function vaultHashName() external view returns (bytes32);

    // The paytoken payed ( if paytoken is ether, paytoken is address(0) )
    function paytoken() external view returns (address);

    // Mining period
    function startTime() external view returns (uint256);
    function endTime() external view returns (uint256);

    /**
    * When calculating the mining rate with the mining period,
    * this value is used as the unit period
    * if the method of calculating the ratio over time is used.
    */
    function uintMiningPeriods() external view returns (uint256);

    /**
     * When only Ether is sent, the mining period is set to this value.
     * When creating a contract, this value is set as the end time-start time.
     */
    function defaultDuration() external view returns (uint256);

    // amount of raised FLD in wei unit, (reward/mining FLD )
    function weiRaised() external view returns (uint256);

    // max ratio to gain when stake whole period
    function maxRatio() external view returns (uint256);

    // 0:  linearly ratio by time, 1:step fixed ratio
    function ratioType() external view returns (uint);

}
