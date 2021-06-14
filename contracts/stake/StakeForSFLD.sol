//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "../interfaces/IFLD.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/LibTokenStake1.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakeForSFLD is AccessControl {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    // reward token : FLD
    address public fld;
    // governance token : SFLD
    address public sfld;

    // amount of claimed SFLD in wei unit,
    uint256 public claimedSFLDTotal;

    // amount of total staked ,
    uint256 public totalStakedAmount;

    uint256 public startBlock;
    // periodBlock - rewardRatio
    mapping(uint256 => uint256) public rewardRatio;

    bool public started;
    mapping(address => LibTokenStake1.StakedAmountForSFLD) public userStaked;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "StakeForSFLD: Caller is not an admin"
        );
        _;
    }

    //////////////////////////////
    // Events
    //////////////////////////////

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function initialize(
        address _fld,
        address _sfld,
        uint256 _startBlock
    ) external onlyOwner {
        require(
            _fld != address(0) &&
                _sfld != address(0) &&
                _startBlock > 0 &&
                started == false,
            "StakeForSFLD: input is zero"
        );

        fld = _fld;
        sfld = _sfld;
        startBlock = _startBlock;
        started = true;
    }

    /**
     * external
     */
    function setStarted(bool _started) external onlyOwner {
        require(started != _started, "StakeForSFLD: same status");
        started = _started;
    }

    function addRewardRatio(uint256 period, uint256 ratio) external onlyOwner {
        require(started == true, "StakeForSFLD: not started");
        rewardRatio[period] = ratio;
    }

    /// dev. If you staking before, but if you staking additionally,
    /// it will be reset to the most recent value.
    function stake(
        uint256 amount,
        uint256 _periodBlock,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(
            amount > 0 && started == true && deadline > 0,
            "StakeForSFLD: amount is zero"
        );
        //Rewards for the period have not been registered.
        require(
            rewardRatio[_periodBlock] > 0,
            "StakeForSFLD: unegistered period"
        );

        require(
            IERC20(fld).balanceOf(msg.sender) >= amount,
            "StakeForSFLD: FLD.balanceOf is lack."
        );

        LibTokenStake1.StakedAmountForSFLD storage staked =
            userStaked[msg.sender];
        require(staked.startBlock < block.number, "StakeForSFLD: not started");

        staked.amount = staked.amount.add(amount);
        staked.startBlock = block.number;
        staked.periodBlock = _periodBlock;
        totalStakedAmount = totalStakedAmount.add(amount);

        IFLD(fld).permit(msg.sender, address(this), amount, deadline, v, r, s);
        IERC20(fld).transferFrom(msg.sender, address(this), amount);
    }

    /// dev. SFLD is minted according to the ratio of the specified period.
    function claim() external {
        LibTokenStake1.StakedAmountForSFLD storage staked =
            userStaked[msg.sender];
        require(
            started == true && staked.startBlock < block.number,
            "StakeForSFLD: not started"
        );
        require(staked.amount > 0, "StakeForSFLD: amount > 0");

        if (staked.rewardPerBlock == 0) {
            staked.rewardPerBlock = staked
                .amount
                .mul(rewardRatio[staked.periodBlock])
                .div(staked.periodBlock);
        }

        require(
            staked.claimedAmount <
                staked.amount.mul(rewardRatio[staked.periodBlock]),
            "StakeForSFLD: Already claimed all"
        );

        uint256 rewardClaim = 0;
        if (staked.startBlock.add(staked.periodBlock) < block.number) {
            rewardClaim = staked
                .amount
                .mul(rewardRatio[staked.periodBlock])
                .sub(staked.claimedAmount);
        } else {
            // Amount you can be rewarded currently
            uint256 pastBlocks = block.number.sub(staked.startBlock);
            if (staked.claimedBlock > 0 && staked.claimedBlock < block.number)
                pastBlocks = block.number.sub(staked.claimedBlock);
            rewardClaim = pastBlocks.mul(staked.rewardPerBlock);
        }

        require(rewardClaim > 0, "Stake1: reward is zero");
        staked.claimedBlock = block.number;
        staked.claimedAmount = staked.claimedAmount.add(rewardClaim);
        claimedSFLDTotal = claimedSFLDTotal.add(rewardClaim);

        IFLD(sfld).mint(msg.sender, rewardClaim);
    }

    /// dev. You can change to FLD as much as you have SFLD. exchage SFLD to FLD.
    /// check again later.
    function withdraw(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        LibTokenStake1.StakedAmountForSFLD storage staked =
            userStaked[msg.sender];
        require(
            started == true && staked.releasedBlock == 0,
            "StakeForSFLD: not started"
        );
        require(
            staked.amount > 0 &&
                block.number > staked.startBlock.add(staked.periodBlock),
            "StakeForSFLD: staking period is not end"
        );

        uint256 sfldBalance = IERC20(sfld).balanceOf(msg.sender);
        require(
            sfldBalance > 0 && amount == sfldBalance,
            "StakeForSFLD: balanceOf SFLD is zero"
        );

        staked.releasedAmount = staked.releasedAmount.add(sfldBalance);
        staked.releasedBlock = block.number;

        uint256 fldBalance = IERC20(fld).balanceOf(address(this));
        if (sfldBalance > fldBalance)
            IFLD(fld).mint(address(this), sfldBalance.sub(fldBalance));

        IFLD(sfld).permit(
            msg.sender,
            address(this),
            sfldBalance,
            deadline,
            v, r, s
        );

        require(
            IFLD(sfld).burn(msg.sender, sfldBalance),
            "StakeForSFLD: withdraw sfld.burn fail"
        );

        require(
            IERC20(fld).transfer(msg.sender, sfldBalance),
            "StakeForSFLD: withdraw fld.transfer fail"
        );
    }

    /**
     * public
     */

    /**
     * internal
     */

    /**
     * private
     */
}
