//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import { IStake1Vault } from "../interfaces/IStake1Vault.sol";
//import { IERC20 } from "../interfaces/IERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/LibTokenStake1.sol";
import "./Stake1Storage.sol";
import "../connection/TokamakStaker.sol";
import { ERC165Checker } from "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { OnApprove } from "../tokens/OnApprove.sol";


contract Stake1 is TokamakStaker, OnApprove {
    using SafeERC20 for IERC20;
    /*
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    modifier nonZero(address _addr) {
        require(_addr != address(0), "Stake1Proxy: zero address");
        _;
    }
    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Stake1Proxy: Caller is not an admin");
        _;
    }
    */

    modifier lock() {
        require(_lock == 0, "Stake1Vault: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    event Claimed(address indexed from, uint256 amount, uint256 currentBlcok);
    event Withdrawal(address indexed from, address indexed to, uint256 amount, uint256 currentBlcok);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev Initialize
    function initialize(
        address _token,
        address _paytoken,
        address _vault,
        uint256 _saleStartBlock,
        uint256 _startBlock,
        uint256 _period
    )
        external onlyOwner
    {
        require(_token !=  address(0) && _vault !=  address(0) && _saleStartBlock <= _startBlock);
        token = _token;
        paytoken = _paytoken;
        vault = _vault;
        if(_saleStartBlock == 0) saleStartBlock = block.number;
        else saleStartBlock = _saleStartBlock;
        if(_startBlock == 0) startBlock = block.number;
        else startBlock = _startBlock;
        endBlock = startBlock + _period;
    }

    /// @dev Approves
    function onApprove(
        address owner,
        address spender,
        uint256 tonAmount,
        bytes calldata data
    ) external override returns (bool)
    {
        (address _spender, uint256 _amount) = _decodeStakeData(data);
        require(tonAmount == _amount && spender == _spender, "Stake1: tonAmount != stakingAmount ");
        require(stakeOnApprove(msg.sender, owner, _spender, _amount), "Stake1: stakeOnApprove fails ");
        return true;
    }

    function _decodeStakeData(bytes calldata input)
        internal
        pure
        returns (address spender, uint256 amount)
    {
        (spender, amount) = abi.decode(input, (address, uint256));
    }

    /// @dev 
    function stakeOnApprove(address from, address _owner, address _spender, uint256 _amount) public returns (bool) {
        require((paytoken == from && _amount > 0 && _spender == address(this)), "Stake1: stakeOnApprove init fail");
        require(
            block.number >= saleStartBlock && saleStartBlock < startBlock,
            "Stake1: stakeTON period is unavailable"
        );

        LibTokenStake1.StakedAmount storage staked = userStaked[_owner];
        staked.amount += _amount;
        totalStakedAmount += _amount;
        require(
            IERC20(from).transferFrom(_owner, _spender, _amount),
            "DAOCommittee: failed to transfer ton from creator"
        );
        return true;
    }


    /// @dev Stake amount
    function stake(uint256 _amount) public payable {
        require(
            (paytoken == address(0) && msg.value > 0)
            || (paytoken != address(0) && _amount > 0),
            "Stake1: amount is zero"
        );
        require(block.number >= saleStartBlock && saleStartBlock < startBlock, "Stake1: period is unavailable");

        uint256 amount = _amount;
        if (paytoken == address(0))
            amount = msg.value;

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        staked.amount += amount;
        totalStakedAmount += amount;
        if (paytoken != address(0))
            require(IERC20(paytoken).transferFrom(msg.sender, address(this), amount));
    }

    /// @dev To withdraw
    function withdraw() external {
        require(endBlock > 0 && endBlock < block.number, "Stake1: on staking period");
        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];

        uint256 amount = staked.amount;

        // todo: restaking reward
        require(staked.amount > 0 && staked.releasedAmount <= staked.amount , "Stake1: releasedAmount > stakedAmount");

        staked.releasedAmount = staked.amount ;
        staked.releasedBlock = block.number;
        staked.released = true;

        if (paytoken == address(0)) {
            address payable self = address(uint160(address(this)));
            require(self.balance >= amount);
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Stake1: withdraw eth send failed.");

        } else {
            require(IERC20(paytoken).transfer(msg.sender, amount), "Stake1: withdraw transfer fail");
        }

        emit Withdrawal(address(this), msg.sender, amount, block.number);
    }

    /// @dev Claim for reward
    function claim() external lock {
        require(IStake1Vault(vault).saleClosed() == true, "Stake1: disclose sale.");
        address account = msg.sender;
        uint256 rewardClaim = 0;
        uint256 currentBlock = block.number;

        LibTokenStake1.StakedAmount storage staked = userStaked[account];
        require(staked.claimedBlock < endBlock , "Stake1: claimed");

        rewardClaim = canRewardAmount(account);

        require(rewardClaim > 0, "Stake1: reward is zero");

        uint256 rewardTotal = IStake1Vault(vault).totalRewardAmount(address(this));
        require((rewardClaimedTotal + rewardClaim) <= rewardTotal, "Stake1: total reward exceeds");

        staked.claimedBlock = currentBlock;
        staked.claimedAmount += rewardClaim;
        rewardClaimedTotal += rewardClaim;

        require(IStake1Vault(vault).claim(account, rewardClaim));

        emit Claimed(account, rewardClaim, currentBlock );
    }

    /// @dev Returns the amount that can be rewarded
    function canRewardAmount(address account) public view returns (uint256) {
        uint256 reward = 0;
        if (block.number < startBlock || userStaked[account].amount == 0
            || userStaked[account].claimedBlock > endBlock
            || userStaked[account].claimedBlock > block.number ) {
            reward = 0;
        } else {
            uint256 startR = startBlock;
            uint256 endR = endBlock;
            if(startR < userStaked[account].claimedBlock) startR = userStaked[account].claimedBlock;
            if(block.number < endR) endR = block.number;

            uint256[] memory orderedEndBlocks = IStake1Vault(vault).orderedEndBlocksAll();

            if(orderedEndBlocks.length > 0 ){
                uint256 _end = 0;
                uint256 _total  = 0;
                uint256 blockTotalReward = 0;
                blockTotalReward = IStake1Vault(vault).blockTotalReward();

                for(uint256 i = 0; i < orderedEndBlocks.length ; i++){
                    _end = orderedEndBlocks[i];
                    _total = IStake1Vault(vault).stakeEndBlockTotal(_end);

                    if (endR <= _end) {
                        reward += blockTotalReward * (endR-startR) * userStaked[account].amount  / _total ;
                        break;
                    } else {
                        reward += blockTotalReward * (_end-startR) * userStaked[account].amount  / _total;
                        startR = _end;
                    }
                }

            }
        }
        return reward;
    }

    /// @dev 
    receive() external payable {
      stake(0);
    }
}
