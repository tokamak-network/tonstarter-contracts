//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import {IFLD} from "../interfaces/IFLD.sol";
import "../libraries/LibTokenStake1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakeVaultStorage is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    // reward token : FLD
    IFLD public fld;
    // paytoken is the token that the user stakes.
    address public paytoken;
    // allocated amount of fld
    uint256 public cap;
    // the start block for sale.
    uint256 public saleStartBlock;
    // the staking start block
    uint256 public stakeStartBlock;
    // the staking end block.
    uint256 public stakeEndBlock;
    uint256 public realEndBlock;
    // reward amount per block
    uint256 public blockTotalReward;
    // sale closed flag
    bool public saleClosed;
    // Operation type of staking amount
    uint256 public stakeType;
    // External contract address used when operating the staking amount
    address public defiAddr;

    // a list of stakeContracts maintained by the vault
    address[] public stakeAddresses;
    // the information of the stake contract
    mapping(address => LibTokenStake1.StakeInfo) public stakeInfos;

    // the end blocks of the stake contracts, which must be in ascending order
    uint256[] public orderedEndBlocks;
    // the total staked amount stored at orderedEndBlock’s end block time
    mapping(uint256 => uint256) public stakeEndBlockTotal;

    uint256 private _lock;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Stake1Vault: Caller is not an admin"
        );
        _;
    }

    modifier lock() {
        require(_lock == 0, "Stake1Vault: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "StakeVaultStorage:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender );
    }
}
