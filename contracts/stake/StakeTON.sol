//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;
pragma abicoder v2;

import "../interfaces/IStakeTON.sol";
import {IIStake1Vault} from "../interfaces/IIStake1Vault.sol";
import {IIERC20} from "../interfaces/IIERC20.sol";
import {IWTON} from "../interfaces/IWTON.sol";

import "../libraries/LibTokenStake1.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "../connection/TokamakStaker.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

/// @title Stake Contract
/// @notice It can be staked in Tokamak. Can be swapped using Uniswap.
/// Stake contracts can interact with the vault to claim fld tokens
contract StakeTON is TokamakStaker, IStakeTON {
    using SafeMath for uint256;

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
    /// @param tonAmount the amount of TON withdrawal
    /// @param fldAmount the amount of FLD withdrawal
    event Withdrawal(address indexed to, uint256 tonAmount, uint256 fldAmount);

    /// @dev constructor of StakeTON
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev receive ether
    /// @dev call stake function with msg.value
    receive() external payable {
        // stake(msg.value);
    }

    /// @dev Initialize
    // function initialize(
    //     address _token,
    //     address _paytoken,
    //     address _vault,
    //     uint256 _saleStartBlock,
    //     uint256 _startBlock,
    //     uint256 _period
    // ) external onlyOwner {
    //     require(
    //         _token != address(0) &&
    //             _vault != address(0) &&
    //             _saleStartBlock < _startBlock, "zero"
    //     );
    //     token = _token;
    //     paytoken = _paytoken;
    //     vault = _vault;
    //     saleStartBlock = _saleStartBlock;
    //     startBlock = _startBlock;
    //     endBlock = startBlock.add(_period);
    // }

    /// @dev Stake amount
    /// @param amount  the amount of staked
    /* function stake(uint256 amount) public payable override {
        require(
            (paytoken == address(0) && msg.value == amount) ||
                (paytoken != address(0) && amount > 0),
            "StakeTON: zero"
        );
        require(
            block.number >= saleStartBlock && block.number < startBlock,
            "StakeTON: unavailable"
        );

        require(!IIStake1Vault(vault).saleClosed(), "StakeTON: not end");

        if (paytoken == address(0)) amount = msg.value;
        else
            require(
                IIERC20(paytoken).balanceOf(msg.sender) >= amount,
                "StakeTON: insuffient"
            );

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        if (staked.amount == 0)  totalStakers = totalStakers.add(1);

        staked.amount = staked.amount.add(amount);
        totalStakedAmount = totalStakedAmount.add(amount);
        if (paytoken != address(0))
            require(
                IIERC20(paytoken).transferFrom(
                    msg.sender,
                    address(this),
                    amount
                )
            );

        emit Staked(msg.sender, amount);
    }
    */

    /// @dev withdraw
    function withdraw() external override {
        require(endBlock > 0 && endBlock < block.number, "StakeTON: not end");
        (
            address ton,
            address wton,
            address depositManager,
            address seigManager,

        ) = ITokamakRegistry(stakeRegistry).getTokamak();
        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "StakeTON: ITokamakRegistry zero"
        );
        if (tokamakLayer2 != address(0)) {
            require(
                IISeigManager(seigManager).stakeOf(
                    tokamakLayer2,
                    address(this)
                ) ==
                    0 &&
                    IIDepositManager(depositManager).pendingUnstaked(
                        tokamakLayer2,
                        address(this)
                    ) ==
                    0,
                "StakeTON: remain amount in tokamak"
            );
        }
        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(!staked.released, "StakeTON: Already withdraw");

        if (!withdrawFlag) {
            withdrawFlag = true;
            if (paytoken == ton) {
                swappedAmountFLD = IIERC20(token).balanceOf(address(this));
                finalBalanceWTON = IIERC20(wton).balanceOf(address(this));
                finalBalanceTON = IIERC20(ton).balanceOf(address(this));
                require(
                    finalBalanceWTON.div(10**9).add(finalBalanceTON) >=
                        totalStakedAmount,
                    "StakeTON: finalBalance is lack"
                );
            }
        }

        uint256 amount = staked.amount;
        require(amount > 0, "StakeTON: Amount wrong");
        staked.releasedBlock = block.number;
        staked.released = true;

        if (paytoken == ton) {
            uint256 tonAmount = 0;
            uint256 wtonAmount = 0;
            uint256 fldAmount = 0;
            if (finalBalanceTON > 0)
                tonAmount = finalBalanceTON.mul(amount).div(totalStakedAmount);
            if (finalBalanceWTON > 0)
                wtonAmount = finalBalanceWTON.mul(amount).div(
                    totalStakedAmount
                );
            if (swappedAmountFLD > 0)
                fldAmount = swappedAmountFLD.mul(amount).div(totalStakedAmount);

            staked.releasedFLDAmount = fldAmount;
            if (wtonAmount > 0)
                staked.releasedAmount = wtonAmount.div(10**9).add(tonAmount);
            else staked.releasedAmount = tonAmount;

            tonWithdraw(ton, wton, tonAmount, wtonAmount, fldAmount);
        } else if (paytoken == address(0)) {
            require(
                staked.releasedAmount <= staked.amount,
                "StakeTON: Amount wrong"
            );
            staked.releasedAmount = amount;
            address payable self = address(uint160(address(this)));
            require(self.balance >= amount,  "StakeTON: insuffient ETH");
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "StakeTON: withdraw failed.");
        } else {
            require(
                staked.releasedAmount <= staked.amount,
                "StakeTON: Amount wrong"
            );
            staked.releasedAmount = amount;
            require(
                IIERC20(paytoken).transfer(msg.sender, amount),
                "StakeTON: transfer fail"
            );
        }

        emit Withdrawal(
            msg.sender,
            staked.releasedAmount,
            staked.releasedFLDAmount
        );
    }

    /// @dev withdraw TON
    /// @param ton  TON address
    /// @param wton  WTON address
    /// @param tonAmount  the amount of TON to be withdrawn to msg.sender
    /// @param wtonAmount  the amount of WTON to be withdrawn to msg.sender
    /// @param fldAmount  the amount of FLD to be withdrawn to msg.sender
    function tonWithdraw(
        address ton,
        address wton,
        uint256 tonAmount,
        uint256 wtonAmount,
        uint256 fldAmount
    ) internal {
        if (tonAmount > 0) {
            require(
                IIERC20(ton).balanceOf(address(this)) >= tonAmount,
                "StakeTON: ton balance is lack"
            );

            require(
                IIERC20(ton).transfer(msg.sender, tonAmount),
                "StakeTON: transfer ton fail"
            );
        }
        if (wtonAmount > 0) {
            require(
                IIERC20(wton).balanceOf(address(this)) >= wtonAmount,
                "StakeTON: wton balance is lack"
            );
            require(
                IWTON(wton).swapToTONAndTransfer(msg.sender, wtonAmount),
                "StakeTON: transfer wton fail"
            );
        }
        if (fldAmount > 0) {
            require(
                IIERC20(token).balanceOf(address(this)) >= fldAmount,
                "StakeTON: fld balance is lack"
            );
            require(
                IIERC20(token).transfer(msg.sender, fldAmount),
                "StakeTON: transfer fld fail"
            );
        }
    }

    /// @dev Claim for reward
    function claim() external override lock {
        require(
            IIStake1Vault(vault).saleClosed(),
            "StakeTON: not closed"
        );
        uint256 rewardClaim = 0;

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(staked.claimedBlock < endBlock, "StakeTON: claimed");

        rewardClaim = canRewardAmount(msg.sender, block.number);

        require(rewardClaim > 0, "StakeTON: reward is zero");

        uint256 rewardTotal =
            IIStake1Vault(vault).totalRewardAmount(address(this));
        require(
            rewardClaimedTotal.add(rewardClaim) <= rewardTotal,
            "StakeTON: total reward exceeds"
        );

        staked.claimedBlock = block.number;
        staked.claimedAmount = staked.claimedAmount.add(rewardClaim);
        rewardClaimedTotal = rewardClaimedTotal.add(rewardClaim);

        require(IIStake1Vault(vault).claim(msg.sender, rewardClaim), "StakeTON: fail claim from vault");

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
                IIStake1Vault(vault).orderedEndBlocksAll();

            if (orderedEndBlocks.length > 0) {
                uint256 _end = 0;
                uint256 _start = startR;
                uint256 _total = 0;
                //uint256 blockTotalReward = 0;
                blockTotalReward = IIStake1Vault(vault).blockTotalReward();

                address user = account;
                uint256 amount = userStaked[user].amount;

                for (uint256 i = 0; i < orderedEndBlocks.length; i++) {
                    _end = orderedEndBlocks[i];
                    _total = IIStake1Vault(vault).stakeEndBlockTotal(_end);

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
