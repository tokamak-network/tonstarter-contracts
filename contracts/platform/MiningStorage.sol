//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../libraries/LibTokenMining.sol";
//import '../tokens/FLD.sol';

contract MiningStorage is AccessControl{

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
  bytes32 public constant PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");

  // The token being sold
  address public token;

  // vault address
  address public vault;

  // The name(hash) of the vault to use.
  bytes32 public vaultHashName;

  // The paytoken payed ( if paytoken is ether, paytoken is address(0) )
  address public paytoken;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  /**
  * When calculating the mining rate with the mining period,
  * this value is used as the unit period
  * if the method of calculating the ratio over time is used.
  */
  uint256 public uintMiningPeriods;

  /**
  * When only Ether is sent, the mining period is set to this value.
  * When creating a contract, this value is set as the end time-start time.
  */
  uint256 public defaultDuration;

  //uint256 public cap;
  // how many token units a buyer gets per wei
  //uint256 public rate;

  // amount of raised money in wei , reward fld
  uint256 public weiRaised;

  // max ratio to gain when stake whole period
  uint256 public maxRatio;

  // 0:  linearly ratio by time, 1:step fixed ratio
  uint public ratioType;

  //
  mapping(address => LibTokenMining.LockAmount[]) public userLockStakedToken;

  function _initialize()
    internal {
    _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
    _setupRole(ADMIN_ROLE, msg.sender);
  }

}
