//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IDeveloperVault {

    /// @dev set initial storage
    /// @param _fld the FLD address
    /// @param _cap the allocated FLD amount to devs
    /// @param _rewardPeriod given only once per _rewardPeriod.
    /// @param _startRewardBlock the start block to give .
    /// @param _claimsNumberMax Total number of payments
    /// @param _developers the developer list
    /// @param _claimAmounts How much do you pay at one time?
    function initialize(
        address _fld,
        uint256 _cap,
        uint256 _rewardPeriod,
        uint256 _startRewardBlock,
        uint256 _claimsNumberMax,
        address[] memory _developers,
        uint256[] memory _claimAmounts
    ) external ;

    /// @dev Developers can receive their FLDs
    function claimReward() external ;

    /// @dev Returns current reward block for sender
    function currentRewardBlock() external view returns (uint256);

}
