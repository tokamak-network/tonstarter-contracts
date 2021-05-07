//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "../interfaces/IFLD.sol";
import "../interfaces/ISFLD.sol";
import "../interfaces/IERC20.sol";
import "../libraries/LibTokenStake1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakeForSFLD is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    IFLD public fld;
    ISFLD public sfld;

    // amount of claimed SFLD in wei unit,
    uint256 public claimedSFLDTotal;
    uint256 public totalStakedAmount;

    uint256 public startBlock;
    mapping(uint256 => uint256)  public rewardRatio; // periodBlock - rewardRatio

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

    function initialize
    (
        address _fld,
        address _sfld,
        uint256 _startBlock
    ) external onlyOwner {
        require(
            _fld != address(0) && _sfld != address(0) && _startBlock > 0
            && started == false,
            "StakeForSFLD: input is zero"
        );

        fld = IFLD(_fld);
        sfld = ISFLD(_sfld);
        startBlock = _startBlock;
        started = true;
    }

    /**
     * external
     */
    function setStarted
    (
        bool _started
    )
        external onlyOwner
    {
        require(started != _started, "StakeForSFLD: same status");
        started = _started;
    }

    function addRewardRatio
    (
        uint period,
        uint256 ratio
    )
        external onlyOwner
    {
        require(started == true, "StakeForSFLD: not started");
        rewardRatio[period] = ratio;
    }

    /// dev. If you staking before, but if you staking additionally,
    /// it will be reset to the most recent value.
    function stake(
        uint256 amount,
        uint256 _periodBlock,
        uint256 deadline,
        bytes memory signature
    ) external {
        require(amount > 0 && started == true && deadline > 0, "StakeForSFLD: amount is zero");
        //Rewards for the period have not been registered.
        require(rewardRatio[_periodBlock] > 0, "StakeForSFLD: unegistered period");

        require(
            fld.balanceOf(msg.sender) >= amount,
            "StakeForSFLD: FLD.balanceOf is lack."
        );

        LibTokenStake1.StakedAmountForSFLD storage staked = userStaked[msg.sender];
        require(staked.startBlock < block.number, "StakeForSFLD: not started");

        staked.amount += amount;
        staked.startBlock = block.number;
        staked.periodBlock = _periodBlock;
        totalStakedAmount += amount;

        fld.permit(msg.sender, address(this), amount, deadline, signature);
        fld.transferFrom(msg.sender, address(this), amount);
    }

    /// dev. SFLD is minted according to the ratio of the specified period.
    function claim() external {
        LibTokenStake1.StakedAmountForSFLD storage staked = userStaked[msg.sender];
        require(started == true && staked.startBlock < block.number, "StakeForSFLD: not started");
        require( staked.amount > 0,
            "StakeForSFLD: amount > 0"
        );

        if (staked.rewardPerBlock == 0) {
            staked.rewardPerBlock = (staked.amount * rewardRatio[staked.periodBlock]) / staked.periodBlock;
        }

        require(
            staked.claimedAmount < staked.amount * rewardRatio[staked.periodBlock],
            "StakeForSFLD: Already claimed all"
        );

        uint256 rewardClaim = 0;
        if ( staked.startBlock + staked.periodBlock < block.number) {
            rewardClaim =  (staked.amount * rewardRatio[staked.periodBlock]) - staked.claimedAmount;
        } else {
            // Amount you can be rewarded currently
            uint256 pastBlocks =  block.number - staked.startBlock;
            if(staked.claimedBlock > 0 && staked.claimedBlock < block.number) pastBlocks = block.number - staked.claimedBlock;
            rewardClaim = pastBlocks * staked.rewardPerBlock;
        }

        require(rewardClaim > 0, "Stake1: reward is zero");
        staked.claimedBlock = block.number;
        staked.claimedAmount += rewardClaim;
        claimedSFLDTotal += rewardClaim;

        sfld.mint(msg.sender, rewardClaim);
    }

    /// dev. You can change to FLD as much as you have SFLD. exchage SFLD to FLD.
    /// check again later.
    function withdraw
    (
        uint256 amount,
        uint256 deadline,
        bytes memory signature
    )
        external
    {
        LibTokenStake1.StakedAmountForSFLD storage staked = userStaked[msg.sender];
        require(started == true && staked.releasedBlock == 0, "StakeForSFLD: not started");
        require(
            staked.amount > 0 && block.number > staked.startBlock + staked.periodBlock,
            "StakeForSFLD: staking period is not end"
        );

        uint256 sfldBalance = sfld.balanceOf(msg.sender);
        require(sfldBalance > 0 && amount == sfldBalance, "StakeForSFLD: balanceOf SFLD is zero");

        staked.releasedAmount += sfldBalance;
        staked.releasedBlock = block.number;

        uint256 fldBalance = fld.balanceOf(address(this));
        if(sfldBalance > fldBalance) fld.mint(address(this), sfldBalance - fldBalance);

        sfld.permit(msg.sender, address(this), sfldBalance, deadline, signature);

        require(
            sfld.burn(msg.sender, sfldBalance),
            "StakeForSFLD: withdraw sfld.burn fail"
        );

        require(
            fld.transfer(msg.sender, sfldBalance),
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
