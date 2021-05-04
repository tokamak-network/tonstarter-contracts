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

    // amount of raised FLD in wei unit, (reward/mining FLD )
    uint256 public raisedSFLDTotal;
    uint256 public totalStakedAmount;
    mapping(address => LibTokenStake1.StakedAmount) public userStaked;

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

    function initialize(address _fld, address _sfld) external {
        require(
            _fld != address(0) && _sfld != address(0),
            "StakeForSFLD: input is zero"
        );

        fld = IFLD(_fld);
        sfld = ISFLD(_sfld);
    }

    /**
     * external
     */
    function stake(
        uint256 amount,
        uint256 deadline,
        bytes memory signature
    ) external {
        require(amount > 0, "StakeForSFLD: amount is zero");
        require(
            fld.balanceOf(msg.sender) >= amount,
            "StakeForSFLD: FLD.balanceOf is lack."
        );

        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        staked.amount += amount;
        totalStakedAmount += amount;

        fld.permit(msg.sender, address(this), amount, deadline, signature);
        fld.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw() external {
        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];

        require(
            staked.amount > 0 && staked.releasedAmount <= staked.amount,
            "StakeForSFLD: releasedAmount > stakedAmount"
        );

        staked.releasedAmount = staked.amount;
        staked.releasedBlock = block.number;
        staked.released = true;

        require(
            fld.transfer(msg.sender, staked.amount),
            "StakeForSFLD: withdraw transfer fail"
        );
    }

    function claim() external {
        LibTokenStake1.StakedAmount storage staked = userStaked[msg.sender];
        require(
            staked.amount > 0 && staked.releasedAmount <= staked.amount,
            "StakeForSFLD: releasedAmount > stakedAmount"
        );

        // todo: How many sFld is minted? determined later.
        //rewardClaim = canRewardAmount(account);
        uint256 rewardClaim = staked.amount - staked.claimedAmount;
        require(rewardClaim > 0, "Stake1: reward is zero");

        staked.claimedBlock = block.number;
        staked.claimedAmount += rewardClaim;
        raisedSFLDTotal += rewardClaim;

        sfld.mint(msg.sender, rewardClaim);
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
