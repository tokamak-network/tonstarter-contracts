//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../libraries/LibCustomLP.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

contract CustomLPRewardStorage {

    address public stakeRegistry;
    INonfungiblePositionManager public nonfungiblePositionManager;
    address public uniswapV3Factory;
    address public poolAddress;
    address public poolToken0;
    address public poolToken1;
    uint256 public poolFee;
    address public commonLib;

    uint256 public totalStakers;
    uint256 public totalStakedAmount;
    uint256 public totalTokens;

    uint256[] public rewardIndexs;
    mapping(uint256 => LibCustomLP.RewardToken) public rewardTokens;
    mapping(address => uint256[]) public userStakedTokenIds;

    mapping(uint256 => LibCustomLP.ClaimInfoToken) public totalClaimByRewardIndexs;
    mapping(uint256 => LibCustomLP.StakeLiquidity) public depositTokens;
    mapping(uint256 => mapping(uint256 => LibCustomLP.ClaimInfoLP)) public claimsByTokenIds;

    uint256 internal _lock;
    bool public pauseProxy;
    bool public migratedL2;

    mapping(uint256 => address) public proxyImplementation;
    mapping(address => bool) public aliveImplementation;
    mapping(bytes4 => address) public selectorImplementation;

}
