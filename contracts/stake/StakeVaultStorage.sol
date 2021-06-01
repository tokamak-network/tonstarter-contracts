//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IStakeVaultStorage.sol";
import {IFLD} from "../interfaces/IFLD.sol";
import "../libraries/LibTokenStake1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakeVaultStorage is AccessControl, IStakeVaultStorage {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    /// @dev reward token : FLD
    IFLD public fld;

    /// @dev paytoken is the token that the user stakes.
    address public override paytoken;

    /// @dev allocated amount of fld
    uint256 public override cap;

    /// @dev the start block for sale.
    uint256 public override saleStartBlock;

    /// @dev the staking start block
    uint256 public override stakeStartBlock;

    /// @dev the staking end block.
    uint256 public override stakeEndBlock;

    uint256 public override realEndBlock;

    /// @dev reward amount per block
    uint256 public override blockTotalReward;

    /// @dev sale closed flag
    bool public override saleClosed;

    /// @dev Operation type of staking amount
    uint256 public override stakeType;

    /// @dev External contract address used when operating the staking amount
    address public override defiAddr;

    /// @dev a list of stakeContracts maintained by the vault
    address[] public stakeAddresses;

    /// @dev the information of the stake contract
    mapping(address => LibTokenStake1.StakeInfo) public stakeInfos;

    /// @dev the end blocks of the stake contracts, which must be in ascending order
    uint256[] public orderedEndBlocks;

    /// @dev the total staked amount stored at orderedEndBlock’s end block time
    mapping(uint256 => uint256) public override stakeEndBlockTotal;

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

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "StakeVaultStorage:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }
}
