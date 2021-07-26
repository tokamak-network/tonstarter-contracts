//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../libraries/LibUniswapV3Stake.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

/// @title The base storage of stakeContract
contract StakeUniswapV3Storage {
    /// @dev reward token : TOS
    address public token;

    /// @dev registry
    address public stakeRegistry;

    /// @dev A vault that holds tos rewards.
    address public vault;

    /// @dev the total amount claimed
    uint256 public rewardClaimedTotal;

    /// @dev the total staked amount
    uint256 public totalStakedAmount;

    /// @dev stakes for user's tokenId
    mapping(address => uint256[]) public userStakedTokenIds;

    // 토큰아이디의 기본정보
    mapping(uint256 => LibUniswapV3Stake.StakeLiquidity) public depositTokens;

    //각 토큰아이디별로 디파짓정보
    mapping(uint256 => LibUniswapV3Stake.StakedTokenAmount)
        public stakedCoinageTokens;

    // 유저의 모든 디파짓 토큰의 총 정보
    mapping(address => LibUniswapV3Stake.StakedTotalTokenAmount)
        public userTotalStaked;

    /// @dev total stakers
    uint256 public totalStakers;

    /// @dev lock
    uint256 internal _lock;

    /// @dev flag for pause proxy
    bool public pauseProxy;

    /// @dev pools's token
    address public poolToken0;
    address public poolToken1;

    /// @dev Rewards per second liquidity inside
    //uint256 internal REWARDS_PER_SECOND = 10000000000000000;

    /// @dev UniswapV3 Nonfungible position manager
    INonfungiblePositionManager public nonfungiblePositionManager;

    /// @dev UniswapV3 pool factory
    address public uniswapV3FactoryAddress;

    /// @dev coinage for reward 리워드 계산을 위한 코인에이지
    address public coinage;

    uint256 public coinageMintBlock;

    /// @dev 리워드는 할당되었는데, 유동성을 없어져서, 지불되지 못한 리워드양 .
    uint256 public rewardNonLiquidityClaimTotal;

    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "StakeUniswapV3Storage: zero address");
        _;
    }
}
