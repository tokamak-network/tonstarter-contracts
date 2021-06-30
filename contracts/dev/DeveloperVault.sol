// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "../interfaces/IDeveloperVault.sol";
import "../utils/math/Math.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title DeveloperVault
contract DeveloperVault is AccessControl, IDeveloperVault {
    address public fld;
    uint256 public cap;
    uint256 public rewardPeriod;
    uint256 public startRewardBlock;
    uint256 public claimsNumberMax;

    mapping(address => DeveloperInfo) public developersInfo;
    address[] public developers;

    /// @dev constructor of DeveloperVault
    /// @param admin the admin address
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

    /// @dev set initial storage
    /// @param _fld the FLD address
    /// @param _cap the allocated FLD amount to devs
    /// @param _rewardPeriod given only once per _rewardPeriod.
    /// @param _startRewardBlock the start block to give .
    /// @param _claimsNumberMax Total number of payments
    /// @param _developers the developer list
    /// @param _claimAmounts How much do you pay at one time?
    function initialize(
        address _fld,
        uint256 _cap,
        uint256 _rewardPeriod,
        uint256 _startRewardBlock,
        uint256 _claimsNumberMax,
        address[] memory _developers,
        uint256[] memory _claimAmounts
    ) external override onlyAdmin {
        require(_fld != address(0), "DeveloperVault: fld is zero");
        require(
            _claimAmounts.length == _developers.length,
            "DeveloperVault: length is different"
        );

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
        fld = _fld;
        cap = _cap;
        rewardPeriod = _rewardPeriod;
        startRewardBlock = _startRewardBlock;
        claimsNumberMax = _claimsNumberMax;
        developers = _developers;
    }

    /// @dev Developers can receive their FLDs
    function claimReward() external override {
        DeveloperInfo storage devInfo = developersInfo[msg.sender];
        require(
            devInfo.registered,
            "DeveloperVault: developer is not registered"
        );
        require(
            devInfo.claimsNumber < claimsNumberMax,
            "DeveloperVault: number of claims exceeds max"
        );

        uint256 claimsNumber = devInfo.claimsNumber;
        uint256 currentRewardBlock_ = startRewardBlock + claimsNumber * rewardPeriod;
        uint256 maxRewardBlock = startRewardBlock + claimsNumberMax * rewardPeriod;

        uint256 diff = Math.min(maxRewardBlock, block.number) - currentRewardBlock_;

        // this replaces the `while` statement.
        uint256 n = diff / rewardPeriod;

        uint256 allPastRewards = devInfo.claimAmount * n;
        devInfo.claimsNumber += n;

        IERC20(fld).transfer(msg.sender, allPastRewards);

    }

    /// @dev Returns current reward block for sender
    function currentRewardBlock() external view override returns (uint256) {
        DeveloperInfo memory devInfo = developersInfo[msg.sender];
        require(
            devInfo.registered,
            "DeveloperVault: developer is not registered"
        );
        uint256 currentBlockRewardNumber =
            startRewardBlock + devInfo.claimsNumber * rewardPeriod;
        return currentBlockRewardNumber;
    }
}
