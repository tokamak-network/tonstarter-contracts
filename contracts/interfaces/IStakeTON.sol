//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenStake1.sol";

interface IStakeTON {
    function token() external view returns (address);

    function paytoken() external view returns (address);

    function vault() external view returns (address);

    function saleStartBlock() external view returns (uint256);

    function startBlock() external view returns (uint256);

    function endBlock() external view returns (uint256);

    function rewardClaimedTotal() external view returns (uint256);

    function totalStakedAmount() external view returns (uint256);

    function totalStakers() external view returns (uint256);

    function userStaked(address account)
        external
        returns (LibTokenStake1.StakedAmount memory);

    function initialize(
        address _token,
        address _paytoken,
        address _vault,
        uint256 _saleStartBlock,
        uint256 _startBlock,
        uint256 _period
    ) external;

    function stake(uint256 amount) external payable;

    function claim() external;

    function withdraw() external;

    function canRewardAmount(address account, uint256 claimBlock)
        external
        view
        returns (uint256);

    function onApprove(
        address owner,
        address spender,
        uint256 tonAmount,
        bytes calldata data
    ) external returns (bool);

    function stakeOnApprove(
        address _owner,
        address _spender,
        uint256 _amount
    ) external;

    function tokamakStaking(address _layer2) external;

    function tokamakRequestUnStaking(address _layer2, uint256 amount) external;

    function tokamakProcessUnStaking(address _layer2) external;

    function exchangeWTONtoFLD(
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline
    ) external returns (uint256 amountOut);
}
