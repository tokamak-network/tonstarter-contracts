// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import { IFLD } from "../interfaces/IFLD.sol";


contract DeveloperVault is AccessControl {
  IFLD public fld;
  uint256 public cap;
  uint256 public rewardPeriod;
  uint256 public startRewardBlock;
  uint256 public claimsNumberMax;
  
  modifier onlyAdmin {
    require(
        hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
        "DeveloperVault: Caller is not an admin"
    );
    _;
  }

  constructor (address admin) { 
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
  }

  struct DeveloperInfo {
    bool registered;
    uint256 claimAmount;
    uint256 claimsNumber;
  }

  mapping(address => DeveloperInfo) developers;

  /// @dev Initialize
  function init(
    address _fld,
    uint256 _cap,
    uint256 _rewardPeriod,
    uint256 _startRewardBlock,
    uint256 _claimsNumberMax,
    address[] memory accounts,
    uint256[] memory claimAmounts
  ) external onlyAdmin {
    require(claimAmounts.length == accounts.length);
    fld = IFLD(_fld);
    cap = _cap;
    rewardPeriod = _rewardPeriod;
    startRewardBlock = _startRewardBlock;
    claimsNumberMax = _claimsNumberMax;

    uint256 totalClaimPossible = 0;
    for (uint i = 0; i < accounts.length; ++i) {
      totalClaimPossible += claimsNumberMax * claimAmounts[i];
      developers[accounts[i]] = DeveloperInfo({
        registered: true,
        claimAmount: claimAmounts[i],
        claimsNumber: 0
      });
    }
    require(totalClaimPossible <= cap, "DeveloperVault: total claim possible greater than cap");
  }


  /// @dev Developers can receive their FLDs 
  function claimReward() external {
    DeveloperInfo storage devInfo = developers[msg.sender];
    require(devInfo.registered == true, "DeveloperVault: developer is not registered");

    devInfo.claimsNumber += 1;
    require(devInfo.claimsNumber <= claimsNumberMax, "DeveloperVault: number of claims exceeds max");

    uint256 currentBlockRewardNumber = startRewardBlock + devInfo.claimsNumber * rewardPeriod;
    require(currentBlockRewardNumber < block.number, "Period for reward has not been reached");

    require(fld.transfer(msg.sender, devInfo.claimAmount), "Stake1Vault: FLD transfer fail");
  }
}
