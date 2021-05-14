//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenStake1.sol";

interface IStakeForStableCoin {
    function token() external view returns (address);

    function paytoken() external view returns (address);

    function vault() external view returns (address);

    function saleStartBlock() external view returns (uint256);

    function startBlock() external view returns (uint256);

    function endBlock() external view returns (uint256);

    function rewardRaised() external view returns (uint256);

    function totalStakedAmount() external view returns (uint256);

    function userStaked(address account)
        external
        returns (LibTokenStake1.StakedAmount memory);

    function yearnV2Vault() external view returns (address);

    function initialize(
        address _token,
        address _paytoken,
        address _vault,
        uint256 _saleStartBlock,
        uint256 _startBlock,
        uint256 _period
    ) external ;

    function setYearnV2(address _vault) external;

    function approveYearnV2Vault(uint256 amount) external;

    function yearnV2_calcTotalValue()
        external
        returns (uint256 underlyingAmount);

    function yearnV2_deposit(uint256 amount)
        external;

    function yearnV2_withdraw(uint256 amount)
        external;

    function yearnV2_unclaimedProfit(address user)
        external;

    function yearnV2_claim() external ;

    function stake(uint256 amount) external;


}
