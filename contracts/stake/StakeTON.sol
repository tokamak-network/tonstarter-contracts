//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IIERC20} from "../interfaces/IIERC20.sol";
import "../libraries/LibTokenStake1.sol";
import "../libraries/LibUniswap.sol";
import "../connection/TokamakStaker.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";

contract StakeTON is TokamakStaker {
    using SafeERC20 for IIERC20;
    using SafeMath for uint256;

    modifier lock() {
        require(_lock == 0, "LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    //////////////////////////////
    // Events
    //////////////////////////////
    // event Claimed(address indexed from, uint256 amount, uint256 currentBlcok);
    event Staked(address indexed to, uint256 amount);
    event Claimed(address indexed to, uint256 amount, uint256 currentBlcok);
    event Withdrawal(address indexed to, uint256 amount);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    receive() external payable {
        stake(msg.value);
    }

    /// @dev Initialize
    function initialize(
        address _token,
        address _paytoken,
        address _vault,
        uint256 _saleStartBlock,
        uint256 _startBlock,
        uint256 _period
    ) external onlyOwner {
        require(
            _token != address(0) &&
                _vault != address(0) &&
                _saleStartBlock < _startBlock, "zero"
        );
        token = _token;
        paytoken = _paytoken;
        vault = _vault;
        saleStartBlock = _saleStartBlock;
        startBlock = _startBlock;
        endBlock = startBlock + _period;
    }

    /// @dev Stake amount
    function stake(uint256 amount) public payable {
        require(
            (paytoken == address(0) && msg.value == amount) ||
                (paytoken != address(0) && amount > 0),
            "zero"
        );
        require(
            block.number >= saleStartBlock &&
                block.number < startBlock,
            "unavailable"
        );

        require(!IStake1Vault(vault).saleClosed(), "not end");

        if (paytoken == address(0)) amount = msg.value;
        else
            require(
                IIERC20(paytoken).balanceOf(msg.sender) >= amount,
                "lack"
            );

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        staked.amount += amount;
        totalStakedAmount += amount;
        if (paytoken != address(0))
            require(
                IIERC20(paytoken).transferFrom(msg.sender, address(this), amount)
            );

        emit Staked(msg.sender, amount);
    }

    /// @dev To withdraw
    function withdraw() external {
        require(
            endBlock > 0 && endBlock < block.number,
            "not end"
        );

        if (tokamakLayer2 != address(0)) {
            require(
                IISeigManager(seigManager).stakeOf(tokamakLayer2, address(this)) == 0 &&
                IIDepositManager(depositManager).pendingUnstaked(tokamakLayer2, address(this)) == 0,
                "remain amount in tokamak");
        }

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(staked.released == false, "Already withdraw");

        uint256 amount = staked.amount;

        if (paytoken == address(0)) {
            require(staked.releasedAmount <= staked.amount,"Amount wrong");
        } else if (paytoken == ton) {
            amount = ((totalStakedAmount - toTokamak) + (fromTokamak / 10 ** 9)) * staked.amount / totalStakedAmount;
        }
        require( amount > 0 , "Amount wrong" );

        staked.releasedAmount = amount;
        staked.releasedBlock = block.number;
        staked.released = true;

        // check if we send in ethers or in tokens
        if (paytoken == address(0)) {
            address payable self = address(uint160(address(this)));
            require(self.balance >= amount);
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "withdraw failed.");

        } else {
            require(
                IIERC20(paytoken).transfer(msg.sender, amount),
                "transfer fail"
            );
        }

        emit Withdrawal(msg.sender, amount);
    }

    /// @dev Claim for reward
    function claim() external lock {
        require(
            IStake1Vault(vault).saleClosed() == true,
            "not closed"
        );
        uint256 rewardClaim = 0;

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(staked.claimedBlock < endBlock, "claimed");

        rewardClaim = canRewardAmount(msg.sender, block.number);

        require(rewardClaim > 0, "reward is zero");

        uint256 rewardTotal =
            IStake1Vault(vault).totalRewardAmount(address(this));
        require(
            (rewardClaimedTotal + rewardClaim) <= rewardTotal,
            "total reward exceeds"
        );

        staked.claimedBlock = block.number;
        staked.claimedAmount += rewardClaim;
        rewardClaimedTotal += rewardClaim;

        require(IStake1Vault(vault).claim(msg.sender, rewardClaim));

        emit Claimed(msg.sender, rewardClaim, block.number);
    }

    /// @dev Returns the amount that can be rewarded
    //function canRewardAmount(address account) public view returns (uint256) {
    function canRewardAmount(address account, uint256 specilaBlock)
        public view
        returns (uint256)
    {
        uint256 reward = 0;
        if(specilaBlock > endBlock ) specilaBlock = endBlock;

        if (
            specilaBlock < startBlock ||
            userStaked[account].amount == 0 ||
            userStaked[account].claimedBlock > endBlock ||
            userStaked[account].claimedBlock > specilaBlock
        ) {
            reward = 0;
        } else {
            uint256 startR = startBlock;
            uint256 endR = endBlock;
            if (startR < userStaked[account].claimedBlock)
                startR = userStaked[account].claimedBlock;
            if (specilaBlock < endR) endR = specilaBlock;

            uint256[] memory orderedEndBlocks =
                IStake1Vault(vault).orderedEndBlocksAll();

            if (orderedEndBlocks.length > 0) {
                uint256 _end = 0;
                uint256 _start = startR;
                uint256 _total = 0;
                uint256 blockTotalReward = 0;
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
        return reward;
    }
    /*
    function canRewardAmountTest(address account, uint256 specilaBlock)
        public view
        returns (uint256, uint256, uint256, uint256)
    {
        uint256 reward = 0;
        uint256 startR = 0;
        uint256 endR = 0;
        uint256 blockTotalReward = 0;
        if(specilaBlock > endBlock ) specilaBlock = endBlock;

        if (
            specilaBlock < startBlock ||
            userStaked[account].amount == 0 ||
            userStaked[account].claimedBlock > endBlock ||
            userStaked[account].claimedBlock > specilaBlock
        ) {
            reward = 0;
        } else {
            startR = startBlock;
            endR = endBlock;
            if (startR < userStaked[account].claimedBlock)
                startR = userStaked[account].claimedBlock;
            if (specilaBlock < endR) endR = specilaBlock;

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
