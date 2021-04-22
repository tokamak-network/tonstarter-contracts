//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../libraries/LibTokenSale.sol";
//import '../tokens/FLD.sol';

contract PreMiningStorage is AccessControl{

  bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

  // The token being sold
  address public token;

  // The paytoken payed ( if paytoken is ether, paytoken is address(0) )
  address public paytoken;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;
  uint256 public defaultDuration;

  uint256 public cap;
  // how many token units a buyer gets per wei
  //uint256 public rate;

  // amount of raised money in wei , reward fld
  uint256 public weiRaised;

  // max ratio to gain when stake whole period
  uint256 public maxRatio;

  // 0: linear by time, 1:step fixed ratio
  uint public ratioType;

  //
  mapping(address => LibTokenSale.LockAmount[]) public userLockStakedToken;

  function _initialize()
    internal {
    _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
    _setupRole(ADMIN_ROLE, msg.sender);
  }

}
