//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "../interfaces/IStakeSimple.sol";
import {IIStake1Vault} from "../interfaces/IIStake1Vault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/LibTokenStake1.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "../common/AccessibleCommon.sol";
import "../stake/Stake1Storage.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

/// @title Simple Stake Contract
/// @notice Stake contracts can interact with the vault to claim tos tokens

contract StakeSimple is Stake1Storage, AccessibleCommon, IStakeSimple {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    modifier lock() {
        require(_lock == 0, "StakeSimple: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    /// @dev event on staking
    /// @param to the sender
    /// @param amount the amount of staking
    event Staked(address indexed to, uint256 amount);

    /// @dev event on claim
    /// @param to the sender
    /// @param amount the amount of claim
    /// @param claimBlock the block of claim
    event Claimed(address indexed to, uint256 amount, uint256 claimBlock);

    /// @dev event on withdrawal
    /// @param to the sender
    /// @param amount the amount of withdrawal
    event Withdrawal(address indexed to, uint256 amount);

    /// @dev constructor of StakeSimple
    constructor() {
    }

    /// @dev receive ether
    /// @dev call stake function with msg.value
    receive() external payable {
        stake(msg.value);
    }

    /// @dev Stake amount
    /// @param amount  the amount of staked
    function stake(uint256 amount) public payable override {
        require(
            (paytoken == address(0) && msg.value == amount) ||
                (paytoken != address(0) && amount > 0),
            "StakeSimple: stake zero"
        );
        require(
            block.number >= saleStartBlock && block.number < startBlock,
            "StakeSimple: period is not allowed"
        );

        require(!IIStake1Vault(vault).saleClosed(), "StakeSimple: not end");

        if (paytoken == address(0)) amount = msg.value;

        else require(IERC20(paytoken).balanceOf(msg.sender) >= amount, "lack");

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        if (staked.amount == 0) totalStakers = totalStakers.add(1);

        staked.amount = staked.amount.add(amount);
        totalStakedAmount = totalStakedAmount.add(amount);

        if (paytoken != address(0))
            IERC20(paytoken).safeTransferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        emit Staked(msg.sender, amount);
    }

    /// @dev withdraw
    function withdraw() external override {
        require(
            endBlock > 0 && endBlock < block.number,
            "StakeSimple: not end"
        );

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(!staked.released, "StakeSimple: Already withdraw");
        require(
            staked.releasedAmount <= staked.amount,
            "StakeSimple: Amount wrong"
        );

        staked.released = true;
        staked.releasedBlock = block.number;

        uint256 amount = staked.amount;
        staked.releasedAmount = amount;

        // check if we send in ethers or in tokens
        if (paytoken == address(0)) {
            address payable self = address(uint160(address(this)));
            require(self.balance >= amount, "StakeSimple: insuffient ETH");
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "StakeSimple: withdraw failed.");
        } else {
            IERC20(paytoken).safeTransfer(msg.sender, amount);
        }

        emit Withdrawal(msg.sender, amount);
    }

    /// @dev Claim for reward
    function claim() external override lock {
        require(
            IIStake1Vault(vault).saleClosed(),
            "StakeSimple: not closed"
        );
        uint256 rewardClaim = 0;

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(staked.claimedBlock < endBlock, "StakeSimple: claimed");

        rewardClaim = canRewardAmount(msg.sender, block.number);

        require(rewardClaim > 0, "StakeSimple: reward is zero");

        uint256 rewardTotal =
            IIStake1Vault(vault).totalRewardAmount(address(this));
        require(
            rewardClaimedTotal.add(rewardClaim) <= rewardTotal,
            "StakeSimple: total reward exceeds"
        );

        staked.claimedBlock = block.number;
        staked.claimedAmount = staked.claimedAmount.add(rewardClaim);
        rewardClaimedTotal = rewardClaimedTotal.add(rewardClaim);

        require(IIStake1Vault(vault).claim(msg.sender, rewardClaim), "StakeSimple: fail claim from vault");

        emit Claimed(msg.sender, rewardClaim, block.number);
    }

    /// @dev Returns the amount that can be rewarded
    /// @param account  the account that claimed reward
    /// @param specificBlock the block that claimed reward
    /// @return reward the reward amount that can be taken
    function canRewardAmount(address account, uint256 specificBlock)
        public
        view
        override
        returns (uint256)
    {
        uint256 reward = 0;
        if (specificBlock > endBlock) specificBlock = endBlock;

        if (
            specificBlock < startBlock ||
            userStaked[account].amount == 0 ||
            userStaked[account].claimedBlock > endBlock ||
            userStaked[account].claimedBlock > specificBlock
        ) {
            reward = 0;
        } else {
            uint256 startR = startBlock;
            uint256 endR = endBlock;
            if (startR < userStaked[account].claimedBlock)
                startR = userStaked[account].claimedBlock;
            if (specificBlock < endR) endR = specificBlock;

            uint256[] memory orderedEndBlocks =
                IIStake1Vault(vault).orderedEndBlocksAll();

            if (orderedEndBlocks.length > 0) {
                uint256 _end = 0;
                uint256 _start = startR;
                uint256 _total = 0;
                uint256 blockTotalReward = 0;
                blockTotalReward = IIStake1Vault(vault).blockTotalReward();

                address user = account;
                uint256 amount = userStaked[user].amount;

                for (uint256 i = 0; i < orderedEndBlocks.length; i++) {
                    _end = orderedEndBlocks[i];
                    _total = IIStake1Vault(vault).stakeEndBlockTotal(_end);

                    if (_start > _end) {} else if (endR <= _end) {
                        if (_total > 0) {
                            uint256 _period1 = endR.sub(startR);
                            reward = reward.add(
                                blockTotalReward.mul(_period1).mul(amount).div(
                                    _total
                                )
                            );
                        }
                        break;
                    } else {
                        if (_total > 0) {
                            uint256 _period2 = _end.sub(startR);
                            reward = reward.add(
                                blockTotalReward.mul(_period2).mul(amount).div(
                                    _total
                                )
                            );
                        }
                        startR = _end;
                    }
                }
            }
        }
        return reward;
    }
    /*
    function canRewardAmountTest(address account, uint256 specificBlock)
        public view
        returns (uint256, uint256, uint256, uint256)
    {
        uint256 reward = 0;
        uint256 startR = 0;
        uint256 endR = 0;
        uint256 blockTotalReward = 0;
        if(specificBlock > endBlock ) specificBlock = endBlock;

        if (
            specificBlock < startBlock ||
            userStaked[account].amount == 0 ||
            userStaked[account].claimedBlock > endBlock ||
            userStaked[account].claimedBlock > specificBlock
        ) {
            reward = 0;
        } else {
            startR = startBlock;
            endR = endBlock;
            if (startR < userStaked[account].claimedBlock)
                startR = userStaked[account].claimedBlock;
            if (specificBlock < endR) endR = specificBlock;

            uint256[] memory orderedEndBlocks =
                IStake1Vault(vault).orderedEndBlocksAll();

            if (orderedEndBlocks.length > 0) {
                uint256 _end = 0;
                uint256 _start = startR;
                uint256 _total = 0;
                //uint256 blockTotalReward = 0;
                blockTotalReward = IStake1Vault(vault).blockTotalReward();

                address user = account;
                uint256 amount = userStaked[user].amount;

                for (uint256 i = 0; i < orderedEndBlocks.length; i++) {
                    _end = orderedEndBlocks[i];
                    _total = IStake1Vault(vault).stakeEndBlockTotal(_end);

                    if (_start > _end) {

                    } else if (endR <= _end) {
                        reward +=
                            (blockTotalReward *
                                (endR - startR) * amount) /
                            _total;
                        break;
                    } else {
                        reward +=
                            (blockTotalReward *
                                (_end - startR) *
                                amount) /
                            _total;
                        startR = _end;
                    }
                }
            }
        }
        return (reward, startR, endR, blockTotalReward);
    }
    */
}
