// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import {IFLD} from "../interfaces/IFLD.sol";

// import "hardhat/console";

contract DeveloperVault is AccessControl {
    IFLD public fld;
    uint256 public cap;
    uint256 public rewardPeriod;
    uint256 public startRewardBlock;
    uint256 public claimsNumberMax;

    mapping(address => DeveloperInfo) public developersInfo;
    address[] public developers;

    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    struct DeveloperInfo {
        bool registered;
        uint256 claimAmount;
        uint256 claimsNumber;
    }

    modifier onlyAdmin {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "DeveloperVault: Caller is not an admin"
        );
        _;
    }

    /// @dev Initialize
    function initialize(
        address _fld,
        uint256 _cap,
        uint256 _rewardPeriod,
        uint256 _startRewardBlock,
        uint256 _claimsNumberMax,
        address[] memory _developers,
        uint256[] memory _claimAmounts
    ) external onlyAdmin {
        require(_claimAmounts.length == _developers.length, "DeveloperVault");
        fld = IFLD(_fld);
        cap = _cap;
        rewardPeriod = _rewardPeriod;
        startRewardBlock = _startRewardBlock;
        claimsNumberMax = _claimsNumberMax;
        developers = _developers;

        uint256 totalClaimPossible = 0;
        for (uint256 i = 0; i < developers.length; ++i) {
            totalClaimPossible += claimsNumberMax * _claimAmounts[i];
            developersInfo[developers[i]] = DeveloperInfo({
                registered: true,
                claimAmount: _claimAmounts[i],
                claimsNumber: 0
            });
        }
        require(
            totalClaimPossible <= cap,
            "DeveloperVault: total claim possible greater than cap"
        );
    }

    /// @dev Developers can receive their FLDs
    function claimReward() external {
        DeveloperInfo storage devInfo = developersInfo[msg.sender];
        require(
            devInfo.registered == true,
            "DeveloperVault: developer is not registered"
        );
        require(
            devInfo.claimsNumber < claimsNumberMax,
            "DeveloperVault: number of claims exceeds max"
        );

        uint256 currentBlockRewardNumber =
            startRewardBlock + devInfo.claimsNumber * rewardPeriod;
        require(
            currentBlockRewardNumber <= block.number,
            "Period for reward has not been reached"
        );

        uint256 allPastRewards = 0;
        while (currentBlockRewardNumber <= block.number) {
            allPastRewards += devInfo.claimAmount;
            devInfo.claimsNumber += 1;
            currentBlockRewardNumber =
                startRewardBlock +
                devInfo.claimsNumber *
                rewardPeriod;
        }
        require(
            fld.transfer(msg.sender, allPastRewards),
            "Stake1Vault: FLD transfer fail"
        );
    }

    /// @dev Returns current reward block for sender
    function currentRewardBlock() external view returns (uint256) {
        DeveloperInfo memory devInfo = developersInfo[msg.sender];
        require(
            devInfo.registered == true,
            "DeveloperVault: developer is not registered"
        );
        uint256 currentBlockRewardNumber =
            startRewardBlock + devInfo.claimsNumber * rewardPeriod;
        return currentBlockRewardNumber;
    }
}
