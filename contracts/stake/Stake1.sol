//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import {IUniswapV2Router01} from "../interfaces/IUniswapV2Router01.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/LibTokenStake1.sol";
import "../connection/TokamakStaker.sol";
import {
    ERC165Checker
} from "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract Stake1 is TokamakStaker {
    using SafeERC20 for IERC20;

    modifier lock() {
        require(_lock == 0, "Stake1Vault: LOCKED");
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
                _saleStartBlock <= _startBlock
        );
        token = _token;
        paytoken = _paytoken;
        vault = _vault;
        if (_saleStartBlock == 0) saleStartBlock = block.number;
        else saleStartBlock = _saleStartBlock;
        if (_startBlock == 0) startBlock = block.number;
        else startBlock = _startBlock;
        endBlock = startBlock + _period;
    }

    /// @dev Stake amount
    function stake(uint256 _amount) public payable {
        require(
            (paytoken == address(0) && msg.value == _amount) ||
                (paytoken != address(0) && _amount > 0),
            "Stake1: amount is zero"
        );
        require(
            block.number >= saleStartBlock &&
                saleStartBlock < startBlock &&
                block.number < startBlock,
            "Stake1: period is unavailable"
        );

        uint256 amount = _amount;
        if (paytoken == address(0)) amount = msg.value;
        else
            require(
                IERC20(paytoken).balanceOf(msg.sender) >= amount,
                "Stake1: balance is lack"
            );

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        staked.amount += amount;
        totalStakedAmount += amount;
        if (paytoken != address(0))
            require(
                IERC20(paytoken).transferFrom(msg.sender, address(this), amount)
            );

        emit Staked(msg.sender, amount);
    }

    /// @dev To withdraw
    function withdraw() external {
        require(
            endBlock > 0 && endBlock < block.number,
            "Stake1: on staking period"
        );
        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];

        uint256 amount = staked.amount;

        // TODO: restaking reward
        require(
            staked.amount > 0 && staked.releasedAmount <= staked.amount,
            "Stake1: releasedAmount > stakedAmount"
        );

        staked.releasedAmount = staked.amount;
        staked.releasedBlock = block.number;
        staked.released = true;

        // check if we send in ethers or in tokens
        if (paytoken == address(0)) {
            address payable self = address(uint160(address(this)));
            require(self.balance >= amount);
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Stake1: withdraw eth send failed.");
        } else {
            require(
                IERC20(paytoken).transfer(msg.sender, amount),
                "Stake1: withdraw transfer fail"
            );
        }

        emit Withdrawal(msg.sender, amount);
    }

    /// @dev Claim for reward
    function claim() external lock {
        require(
            IStake1Vault(vault).saleClosed() == true,
            "Stake1: The sale is not closed"
        );
        address account = msg.sender;
        uint256 rewardClaim = 0;
        uint256 currentBlock = block.number;

        LibTokenStake1.StakedAmount storage staked = userStaked[account];
        require(staked.claimedBlock < endBlock, "Stake1: claimed");

        rewardClaim = canRewardAmount(account);

        require(rewardClaim > 0, "Stake1: reward is zero");

        uint256 rewardTotal =
            IStake1Vault(vault).totalRewardAmount(address(this));
        require(
            (rewardClaimedTotal + rewardClaim) <= rewardTotal,
            "Stake1: total reward exceeds"
        );

        staked.claimedBlock = currentBlock;
        staked.claimedAmount += rewardClaim;
        rewardClaimedTotal += rewardClaim;

        require(IStake1Vault(vault).claim(account, rewardClaim));

        emit Claimed(account, rewardClaim, block.number);
    }

    /// @dev Returns the amount that can be rewarded
    //function canRewardAmount(address account) public view returns (uint256) {
    function canRewardAmount(address account)
        public view
        returns (uint256)
        //returns (uint256 reward, uint256 startR, uint256 endR, uint256 blockTotalReward)
    {
        uint256 reward = 0;
        /*
        reward = 0;
        startR = startBlock;
        endR = endBlock;
        blockTotalReward = 0;
        */
        if (
            block.number < startBlock ||
            userStaked[account].amount == 0 ||
            userStaked[account].claimedBlock > endBlock ||
            userStaked[account].claimedBlock > block.number
        ) {
            reward = 0;
        } else {
            uint256 startR = startBlock;
            uint256 endR = endBlock;
            if (startR < userStaked[account].claimedBlock)
                startR = userStaked[account].claimedBlock;
            if (block.number < endR) endR = block.number;

            uint256[] memory orderedEndBlocks =
                IStake1Vault(vault).orderedEndBlocksAll();

            if (orderedEndBlocks.length > 0) {
                uint256 _end = 0;
                uint256 _total = 0;
                uint256 blockTotalReward = 0;
                blockTotalReward = IStake1Vault(vault).blockTotalReward();

                for (uint256 i = 0; i < orderedEndBlocks.length; i++) {
                    _end = orderedEndBlocks[i];
                    _total = IStake1Vault(vault).stakeEndBlockTotal(_end);

                    if (endR <= _end) {
                        reward +=
                            (blockTotalReward *
                                (endR - startR) *
                                userStaked[account].amount) /
                            _total;
                        break;
                    } else {
                        reward +=
                            (blockTotalReward *
                                (_end - startR) *
                                userStaked[account].amount) /
                            _total;
                        startR = _end;
                    }
                }
            }
        }
        return reward;
    }

    function canRewardAmountForTest(address account)
        public view
        //returns (uint256)
        returns (uint256 reward, uint256 startR, uint256 endR, uint256 blockTotalReward)
    {
        //uint256 reward = 0;

        reward = 0;
        startR = startBlock;
        endR = endBlock;
        blockTotalReward = 0;

        if (
            block.number < startBlock ||
            userStaked[account].amount == 0 ||
            userStaked[account].claimedBlock > endBlock ||
            userStaked[account].claimedBlock > block.number
        ) {
            reward = 0;
        } else {
            //uint256 startR = startBlock;
            //uint256 endR = endBlock;
            if (startR < userStaked[account].claimedBlock)
                startR = userStaked[account].claimedBlock;
            if (block.number < endR) endR = block.number;

            uint256[] memory orderedEndBlocks =
                IStake1Vault(vault).orderedEndBlocksAll();

            if (orderedEndBlocks.length > 0) {
                uint256 _end = 0;
                uint256 _total = 0;
                //uint256 blockTotalReward = 0;
                blockTotalReward = IStake1Vault(vault).blockTotalReward();

                for (uint256 i = 0; i < orderedEndBlocks.length; i++) {
                    _end = orderedEndBlocks[i];
                    _total = IStake1Vault(vault).stakeEndBlockTotal(_end);

                    if (endR <= _end) {
                        reward +=
                            (blockTotalReward *
                                (endR - startR) *
                                userStaked[account].amount) /
                            _total;
                        break;
                    } else {
                        reward +=
                            (blockTotalReward *
                                (_end - startR) *
                                userStaked[account].amount) /
                            _total;
                        startR = _end;
                    }
                }
            }
        }
        //return reward;
    }


    ///
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        onlyOwner
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        // (bool success, bytes memory data) = _uniswapRouter.call(
        //     abi.encodeWithSignature("addLiquidity(address,address,uint,uint,uint,uint,address,uint)")
        // );
        // require(success, "addLiquidity fail");
        // (amountA, amountB, liquidity) = abi.decode(data, (uint, uint, uint));
        return
            IUniswapV2Router01(_uniswapRouter).addLiquidity(
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to,
                deadline
            );
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external onlyOwner returns (uint256 amountA, uint256 amountB) {
        return
            IUniswapV2Router01(_uniswapRouter).removeLiquidity(
                tokenA,
                tokenB,
                liquidity,
                amountAMin,
                amountBMin,
                to,
                deadline
            );
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external onlyOwner returns (uint256[] memory amounts) {
        return
            IUniswapV2Router01(_uniswapRouter).swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            );
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external onlyOwner returns (uint256[] memory amounts) {
        return
            IUniswapV2Router01(_uniswapRouter).swapTokensForExactTokens(
                amountOut,
                amountInMax,
                path,
                to,
                deadline
            );
    }
}
