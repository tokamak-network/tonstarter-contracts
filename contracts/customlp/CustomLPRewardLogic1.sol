// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../libraries/LibCustomLP.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ICustomCommonLib.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "../common/AccessibleCommon.sol";
import "./CustomLPRewardStorage.sol";

import "hardhat/console.sol";

contract CustomLPRewardLogic1 is CustomLPRewardStorage, AccessibleCommon {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "CustomLPRewardLogic1: zero address");
        _;
    }
    modifier nonZero(uint256 _val) {
        require(_val > 0, "CustomLPRewardLogic1: zero value");
        _;
    }

    modifier noReentrancy() {
        require(_lock == 0, "CustomLPRewardLogic1: noReentrancy");
        _lock = 1;
        _;
        _lock = 0;
    }

    event DonatedReward(
        uint256 rewardIndex,
        address donator,
        address token,
        uint256 amount,
        uint256 periodSeconds
    );

    event Claimed(
        address indexed from,
        uint256 tokenId,
        address token,
        uint256 rewards,
        uint256 claimedReward
    );

    constructor() {
        rewardCount = 0;
    }

    function poolCheck(address token0, address token1) public view {
        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "CustomLPRewardLogic1: different token"
        );
    }
    /*
    function canClaimableWhenFullLiquidity(uint256 _tokenId, uint256 timestamp_)
        public
        view
        returns (
            bool canFlag,
            uint256[] memory claimableList,
            address[] memory tokenList,
            address[] memory donatorList,
            uint256[] memory tokenIndexList
        )
    {
        if (rewardCount > 0) {
            bool can = false;

            uint256[] memory canClaimed = new uint256[](rewardCount);
            address[] memory tokens = new address[](rewardCount);
            address[] memory donators = new address[](rewardCount);
            uint256[] memory tokenIndex = new uint256[](rewardCount);
            uint256 tokenId = _tokenId;
            uint256 _timestamp = timestamp_;
            for (uint256 i = 1; i <= rewardCount; i++) {
                LibCustomLP.ClaimInfoLP storage _claimsByTokenIds =
                    claimsByTokenIds[tokenId][i];
                tokenIndex[i - 1] = i;

                if (_claimsByTokenIds.lastClaimedTime >= _timestamp){
                    canClaimed[i] = 0;

                    console.log("  _claimsByTokenIds.lastClaimedTime %s, >= _timestamp %s ", _claimsByTokenIds.lastClaimedTime, _timestamp);
                } else {
                    LibCustomLP.RewardToken storage _rewardToken =
                        rewardTokens[i];
                    LibCustomLP.StakeLiquidity storage _depositToken = depositTokens[tokenId];

                    if (
                        _timestamp <= _rewardToken.lastRewardTime &&
                        _timestamp >= _rewardToken.start
                    ) {
                        uint256 reward = _claimsByTokenIds.amount;
                        reward = reward.mul(_rewardToken.tokenPerShare).div(
                            divFlag
                        );
                        if (reward <= _claimsByTokenIds.debt) canClaimed[i] = 0;
                        else {
                            reward = reward.sub(_claimsByTokenIds.debt);
                            canClaimed[i - 1] = reward;
                            tokens[i - 1] = _rewardToken.token;
                            donators[i - 1] = _rewardToken.donator;
                            if (!can && reward > 0) can = true;
                        }
                    } else {
                        uint256 end = Math.min(_timestamp, _rewardToken.end);

                        uint256 intervals = end.sub(_rewardToken.lastRewardTime);
                        console.log(" _rewardToken.lastRewardTime %s ,intervals to %s", _rewardToken.lastRewardTime, intervals);
                        console.log(" _rewardToken.rewardPerSecond %s ",_rewardToken.rewardPerSecond);

                        uint256 reward1 = intervals.mul( _rewardToken.rewardPerSecond );
                        console.log(" end %s ,reward1 to %s", end, reward1);
                        uint256 addShare = reward1.mul(divFlag).div(totalStakedAmount);
                        console.log(" addShare %s ,totalStakedAmount to %s", addShare, totalStakedAmount);
                        uint256 tokenShare =
                            _rewardToken.tokenPerShare.add(addShare);

                        uint256 reward = uint256(_depositToken.liquidity).mul(tokenShare)
                                .div(divFlag)
                                .sub(_claimsByTokenIds.debt);

                        console.log("liquidity %s,  tokenShare %s ,reward to %s",_depositToken.liquidity, tokenShare, reward);
                        canClaimed[i - 1] = reward;
                        tokens[i - 1] = _rewardToken.token;
                        donators[i - 1] = _rewardToken.donator;
                        if (!can && reward > 0) can = true;
                    }
                }
            }
            return (can, canClaimed, tokens, donators, tokenIndex);
        } else {
            uint256[] memory data = new uint256[](1);
            address[] memory addr = new address[](1);
            return (false, data, addr, addr, data);
        }
    }
    */

    function canClaimable(uint256 _tokenId, uint256 timestamp_)
        public
        view
        returns (
            bool canFlag,
            uint256[] memory claimableList,
            uint256[] memory tokenIndexList
        )
    {
        if (rewardCount > 0) {
            bool can = false;

            uint256[] memory canClaimed = new uint256[](rewardCount);
            uint256[] memory tokenIndex = new uint256[](rewardCount);

            uint256 tokenId = _tokenId;
            uint256 _timestamp = timestamp_;
            for (uint256 i = 1; i <= rewardCount; i++) {
                LibCustomLP.ClaimInfoLP storage _claimsByTokenIds =
                    claimsByTokenIds[tokenId][i];
                tokenIndex[i - 1] = i;

                if (_claimsByTokenIds.lastClaimedTime >= _timestamp){
                    canClaimed[i-1] = 0;

                    //console.log("  _claimsByTokenIds.lastClaimedTime %s, >= _timestamp %s ", _claimsByTokenIds.lastClaimedTime, _timestamp);
                } else {
                    LibCustomLP.RewardToken storage _rewardToken =
                        rewardTokens[i];
                    LibCustomLP.StakeLiquidity storage _depositToken = depositTokens[tokenId];

                    if (
                        _timestamp <= _rewardToken.lastRewardTime &&
                        _timestamp > _rewardToken.start &&
                        _rewardToken.lastRewardTime < _rewardToken.end
                    ) {
                        uint256 debt = 0;
                        uint256 reward = 0;

                        // console.log("_rewardToken.tokenPerShare %s", _rewardToken.tokenPerShare);
                        // console.log("_depositToken.liquidity %s", _depositToken.liquidity);
                        reward = uint256(_depositToken.liquidity).mul(_rewardToken.tokenPerShare).div(
                            divFlag
                        );
                        // console.log("_claimsByTokenIds.debt %s", _claimsByTokenIds.debt);

                        if (reward == 0 ||  reward <= _claimsByTokenIds.debt ) canClaimed[i-1] = 0;
                        else {
                            reward = reward.sub(_claimsByTokenIds.debt);
                            canClaimed[i - 1] = reward;

                            if (!can && reward > 0) can = true;
                        }
                        // console.log("reward %s, canClaimed[i - 1] ", reward, canClaimed[i - 1]);

                    } else {
                        uint256 end = Math.min(_timestamp, _rewardToken.end);

                        uint256 intervals = end.sub(_rewardToken.lastRewardTime);
                        // console.log(" _rewardToken.lastRewardTime %s ,intervals to %s", _rewardToken.lastRewardTime, intervals);
                        // console.log(" _rewardToken.rewardPerSecond %s ",_rewardToken.rewardPerSecond);

                        uint256 reward1 = intervals.mul(_rewardToken.rewardPerSecond);
                        // console.log(" end %s ,reward1 to %s", end, reward1);

                        uint256 addShare = reward1.mul(divFlag).div(totalStakedAmount);
                        //console.log(" addShare %s ,totalStakedAmount to %s", addShare, totalStakedAmount);
                        uint256 tokenShare = _rewardToken.tokenPerShare.add(addShare);

                        uint256 reward = uint256(_depositToken.liquidity).mul(tokenShare)
                                .div(divFlag)
                                .sub(_claimsByTokenIds.debt);


                        // console.log("liquidity %s,  tokenShare %s ,reward to %s",_depositToken.liquidity, tokenShare, reward);
                        // console.log("_claimsByTokenIds.debt %s, liquidity %s ",_claimsByTokenIds.debt, uint256(_depositToken.liquidity));

                        canClaimed[i - 1] = reward;

                        if (!can && reward > 0) can = true;
                    }
                }
            }
            return (can, canClaimed, tokenIndex );
        } else {
            uint256[] memory data = new uint256[](1);
            // address[] memory addr = new address[](1);
            return (false, data , data);
        }
    }


    function currentliquidityTokenId(
        uint256 tokenId,
        uint256 expectBlocktimestamp
    )
        public
        view
        nonZeroAddress(poolAddress)
        returns (
            uint256 secondsAbsolute,
            uint256 secondsInsideDiff256,
            uint160 secondsInside,
            uint256 expectTime
        )
    {
        secondsAbsolute = 0;
        secondsInsideDiff256 = 0;
        expectTime = 0;
        secondsInside = 0;

        expectTime = expectBlocktimestamp;

        LibCustomLP.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];
        (, , secondsInside) = IUniswapV3Pool(poolAddress)
            .snapshotCumulativesInside(
            _depositTokens.tickLower,
            _depositTokens.tickUpper
        );

        if (
            expectTime > _depositTokens.claimedTime &&
            expectTime > _depositTokens.startTime
        ) {
            if (_depositTokens.claimedTime > 0) {
                secondsAbsolute = expectTime.sub(
                    (uint256)(_depositTokens.claimedTime)
                );
            } else {
                secondsAbsolute = expectTime.sub(
                    (uint256)(_depositTokens.startTime)
                );
            }

            if (secondsAbsolute > 0) {
                if (_depositTokens.secondsInsideLast > 0) {
                    secondsInsideDiff256 = uint256(secondsInside).sub(
                        uint256(_depositTokens.secondsInsideLast)
                    );
                } else {
                    secondsInsideDiff256 = uint256(secondsInside).sub(
                        uint256(_depositTokens.secondsInsideInitial)
                    );
                }
            }
        }
    }

    /// @dev stake tokenId of UniswapV3
    /// @param tokenId  tokenId
    function stake(uint256 tokenId)
        external
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3Factory)
        nonZeroAddress(poolAddress)
        nonZeroAddress(poolToken0)
        nonZeroAddress(poolToken1)
        nonZeroAddress(commonLib)
    {
        require(
            nonfungiblePositionManager.ownerOf(tokenId) == msg.sender,
            "CustomLPRewardLogic1: not owner"
        );

        LibCustomLP.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];

        require(
            _depositTokens.owner == address(0),
            "CustomLPRewardLogic1: Already staked"
        );

        uint256 _tokenId = tokenId;
        (
            ,
            ,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            ,
            ,
            ,

        ) = nonfungiblePositionManager.positions(_tokenId);

        poolCheck(token0, token1);
        require(liquidity > 0, "CustomLPRewardLogic1: zero liquidity");

        require(
            ICustomCommonLib(commonLib).checkCurrentPosition(
                poolAddress,
                tickLower,
                tickUpper
            ),
            "CustomLPRewardLogic1: locked or out of range"
        );
        (, , uint32 secondsInside) =
            IUniswapV3Pool(poolAddress).snapshotCumulativesInside(
                tickLower,
                tickUpper
            );

        uint256 tokenId_ = _tokenId;

        _depositTokens.owner = msg.sender;
        _depositTokens.liquidity = liquidity;
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;
        _depositTokens.startTime = uint32(block.timestamp);
        _depositTokens.claimedTime = 0;
        _depositTokens.secondsInsideInitial = secondsInside;
        _depositTokens.secondsInsideLast = 0;

        // save debt
        for (uint256 i = 1; i <= rewardCount; i++) {
            LibCustomLP.RewardToken storage _rewardToken = rewardTokens[i];
            if (_rewardToken.token != address(0) &&  _rewardToken.lastRewardTime < _rewardToken.end) {
                LibCustomLP.ClaimInfoLP storage _lp = claimsByTokenIds[tokenId_][i];
                _lp.debt = (uint256(liquidity)).mul(_rewardToken.tokenPerShare).div(divFlag);
            }
        }
        //---

        nonfungiblePositionManager.transferFrom(
            msg.sender,
            address(this),
            tokenId_
        );

        userStakedTokenIds[msg.sender].push(tokenId_);

        totalStakedAmount = totalStakedAmount.add(uint256(liquidity));
        totalTokens = totalTokens.add(1);

        // emit Staked(msg.sender, poolAddress, tokenId_, liquidity);
    }

    function claim(uint256 tokenId) public returns (bool) {
        require(rewardCount > 0, "CustomLPRewardLogic1: no reward");

        LibCustomLP.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];
        require(
            _depositTokens.owner == msg.sender,
            "CustomLPRewardLogic1: not staker"
        );

        updateReward();

        (
            bool can,
            uint256[] memory rewards,
            uint256[] memory tokenIndex
        ) = canClaimable(tokenId, block.timestamp);

        require(can, "CustomLPRewardLogic1: no claimable amount");
        // require(
        //     rewards.length == tokens.length,
        //     "CustomLPRewardLogic1: diff rewards,tokens length"
        // );
        // require(
        //     rewards.length == donators.length,
        //     "CustomLPRewardLogic1: diff rewards,donators length"
        // );
        require(
            rewards.length == tokenIndex.length,
            "CustomLPRewardLogic1: diff rewards,tokenIndex length"
        );
        console.log('rewards',rewards[0]);

        uint256 secondsAbsolute = 0;
        uint256 secondsInsideDiff256 = 0;
        uint160 secondsInside = 0;

        (
            secondsAbsolute,
            secondsInsideDiff256,
            secondsInside,

        ) = currentliquidityTokenId(tokenId, block.timestamp);

        require(
            secondsAbsolute > 0 && secondsInsideDiff256 > 0,
            "no liquidity"
        );

        require(_depositTokens.lock == false, "CustomLPRewardLogic1: claiming");
        _depositTokens.lock = true;

        _depositTokens.claimedTime = uint32(block.timestamp);
        _depositTokens.secondsInsideLast = secondsInside;

        // give rewards
        for (uint256 i = 0; i < rewards.length; i++) {
            LibCustomLP.RewardToken storage _rewardToken = rewardTokens[tokenIndex[i]];
            if (rewards[i] > 0 && _rewardToken.token != address(0)) {
                LibCustomLP.ClaimInfoLP storage _lp =
                    claimsByTokenIds[tokenId][tokenIndex[i]];

                uint256 claimRewardAmount = 0;
                if (secondsAbsolute > secondsInsideDiff256) {
                    claimRewardAmount = rewards[i]
                        .mul(secondsInsideDiff256)
                        .div(secondsAbsolute);
                } else {
                    claimRewardAmount = rewards[i];
                }

                _lp.claimedAmount = _lp.claimedAmount.add(claimRewardAmount);
                _lp.lastClaimedTime = block.timestamp;
                _lp.debt = _lp.debt.add(rewards[i]);

                require(
                    IERC20(_rewardToken.token).balanceOf(address(this)) >= rewards[i],
                    "CustomLPRewardLogic1: insufficeient"
                );
                IERC20(_rewardToken.token).safeTransfer(msg.sender, claimRewardAmount);
                if (rewards[i] > claimRewardAmount) {
                    IERC20(_rewardToken.token).safeTransfer(
                        _rewardToken.donator,
                        rewards[i].sub(claimRewardAmount)
                    );
                }
                emit Claimed(msg.sender, tokenId, _rewardToken.token, rewards[i], claimRewardAmount);
            }
        }
        //---
        _depositTokens.lock = false;
        return true;
    }

    function updateReward() public {
        require(rewardCount > 0, "CustomLPRewardLogic1: no reward");
        if (totalStakedAmount == 0) {
            return;
        }
        for (uint256 i = 1; i <= rewardCount; i++) {
            LibCustomLP.RewardToken storage _rewardToken = rewardTokens[i];
            uint256 curTime = block.timestamp;
            if (curTime <= _rewardToken.start) curTime = 0;
            if (curTime > _rewardToken.end) curTime = _rewardToken.end;
            if (curTime > 0 && curTime > _rewardToken.lastRewardTime) {
                uint256 reward =
                    curTime.sub(_rewardToken.lastRewardTime).mul(
                        _rewardToken.rewardPerSecond
                    );
                _rewardToken.tokenPerShare = _rewardToken.tokenPerShare.add(
                    reward.mul(divFlag).div(totalStakedAmount)
                );
                _rewardToken.lastRewardTime = curTime;
                console.log('updateReward _rewardToken.tokenPerShare %s _rewardToken.lastRewardTime %s', _rewardToken.tokenPerShare, _rewardToken.lastRewardTime);
            }
        }
    }

    function donateReward(
        address token,
        uint256 amount,
        uint256 periodSeconds
    )
        external
        nonZeroAddress(token)
        // nonZeroAddress(stakeRegistry)
        // nonZeroAddress(address(nonfungiblePositionManager))
        // nonZeroAddress(uniswapV3Factory)
        // nonZeroAddress(poolAddress)
        // nonZeroAddress(poolToken0)
        // nonZeroAddress(poolToken1)
        // nonZeroAddress(commonLib)
        nonZero(amount)
        nonZero(periodSeconds)
        noReentrancy
    {
        require(
            amount >= minimumDonation,
            "CustomLPRewardLogic1: less than minimum donation"
        );
        require(
            token != address(0) &&
                amount <= IERC20(token).balanceOf(msg.sender),
            "CustomLPRewardLogic1: donate insufficeient"
        );
        rewardCount = rewardCount.add(1);
        LibCustomLP.RewardToken storage _reward = rewardTokens[rewardCount];
        require(!_reward.allocated, "CustomLPRewardLogic1: alreay allocated");

        _reward.allocated = true;
        _reward.token = token;
        _reward.donator = msg.sender;
        _reward.allocatedAmount = amount;
        _reward.start = block.timestamp;
        _reward.end = block.timestamp.add(periodSeconds);
        _reward.rewardPerSecond = amount.div(periodSeconds);
        _reward.tokenPerShare = 0;
        _reward.lastRewardTime = block.timestamp;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit DonatedReward(
            rewardCount,
            msg.sender,
            token,
            amount,
            periodSeconds
        );
    }
}
