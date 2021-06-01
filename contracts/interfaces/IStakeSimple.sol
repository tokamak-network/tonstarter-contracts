//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeSimple {

    /// @dev Initialize
    /// @param _token  the reward token address , It is FLD address.
    /// @param _paytoken  Tokens staked by users, can be used as ERC20 tokens.
    //                     (In case of ETH, input address(0))
    /// @param _vault  the _ault's address
    /// @param _saleStartBlock  the sale start block
    /// @param _startBlock  the staking start block
    /// @param _period the period that user can generate reward amount
    function initialize(
        address _token,
        address _paytoken,
        address _vault,
        uint256 _saleStartBlock,
        uint256 _startBlock,
        uint256 _period
    ) external;

    /// @dev Stake amount
    /// @param amount  the amount of staked
    function stake(uint256 amount) external payable;

    /// @dev withdraw
    function withdraw() external;

    /// @dev Claim for reward
    function claim() external;

    /// @dev Returns the amount that can be rewarded
    /// @param account  the account that claimed reward
    /// @param specificBlock the block that claimed reward
    /// @return reward the reward amount that can be taken
    function canRewardAmount(address account, uint256 specificBlock)
        external
        view
        returns (uint256);
}
