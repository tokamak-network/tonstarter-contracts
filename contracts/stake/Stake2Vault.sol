//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../interfaces/IStake2Vault.sol";
import {ITOS} from "../interfaces/ITOS.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Stake2VaultStorage.sol";

/// @title TOS Token's Vault - stores the TOS for the period of time
/// @notice A vault is associated with the set of stake contracts.
/// Stake contracts can interact with the vault to claim TOS tokens
contract Stake2Vault is Stake2VaultStorage, IStake2Vault {
    using SafeMath for uint256;

    /// @dev event of according to request from(staking contract)  the amount of compensation is paid to to.
    /// @param from the stakeContract address that call claim
    /// @param to the address that will receive the reward
    /// @param amount the amount of reward
    event ClaimedReward(address indexed from, address to, uint256 amount);

    /// @dev constructor of Stake1Vault
    constructor() {}

    /// @dev receive function
    receive() external payable {}

    /// @dev Sets TOS address
    /// @param _tos  TOS address
    function setTOS(address _tos) external override onlyOwner nonZeroAddress(_tos) {
        tos = _tos;
    }

    /// @dev Change cap of the vault
    /// @param _cap  allocated reward amount
    function changeCap(uint256 _cap) external override onlyOwner {
        require(_cap > 0 && cap != _cap, "Stake2Vault: changeCap fails");
        cap = _cap;
    }

    /// @dev change name
    /// @param _name   name
    function changeName(string memory _name) external override onlyOwner {
        require(keccak256(abi.encodePacked(name)) != keccak256(abi.encodePacked(_name)), "Stake2Vault: changeName fails");
        name = _name;
    }

    /// @dev set stake address
    /// @param _stakeAddress  stake address
    function setStakeAddress(address _stakeAddress) external override nonZeroAddress(_stakeAddress) onlyOwner {
        require(stakeAddress != _stakeAddress, "Stake2Vault: setStakeAddress fails");
        stakeAddress = _stakeAddress;
    }


    /// @dev set reward per block
    /// @param _rewardPerBlock  allocated reward amount
    function setRewardPerBlock(uint256 _rewardPerBlock) external override onlyOwner {
        require(_rewardPerBlock > 0 && rewardPerBlock != _rewardPerBlock, "Stake2Vault: setRewardPerBlock fails");
        rewardPerBlock = _rewardPerBlock;
    }

    /// @dev If the vault has more money than the reward to give, the owner can withdraw the remaining amount.
    /// @param to to address
    /// @param _amount the amount of withdrawal
    function withdraw(address to, uint256 _amount) external override onlyOwner {

        uint256 balanceOf = IERC20(tos).balanceOf(address(this));
        require(balanceOf >= _amount, "Stake2Vault: insuffient");
        require(
            IERC20(tos).transfer(to, _amount),
            "Stake2Vault: fail withdraw"
        );
    }

    /// @dev claim function.
    /// @dev sender is a staking contract.
    /// @dev A function that pays the amount(_amount) to _to by the staking contract.
    /// @dev A function that _to claim the amount(_amount) from the staking contract and gets the tos in the vault.
    /// @param _to a user that received reward
    /// @param _amount the receiving amount
    /// @return true
    function claim(address _to, uint256 _amount)
        external
        override
        nonZero(_amount)
        returns (bool)
    {
        uint256 tosBalance = IERC20(tos).balanceOf(address(this));
        require(tosBalance >= _amount, "Stake1Vault: not enough balance");
        require(stakeAddress == msg.sender || isAdmin(msg.sender), "Stake1Vault: not admin or stake contract");
        require(
            IERC20(tos).transfer(_to, _amount),
            "Stake1Vault: TOS transfer fail"
        );

        emit ClaimedReward(msg.sender, _to, _amount);
        return true;
    }

    /// @dev Returns Give the TOS balance stored in the vault
    /// @return the balance of TOS in this vault.
    function balanceTOSAvailableAmount()
        external
        view
        override
        returns (uint256)
    {
        return IERC20(tos).balanceOf(address(this));
    }

    /// @dev Give the infomation of this vault
    /// @return return1 [tos, stakeAddress]
    /// @return return2 cap
    /// @return return3 stakeType
    /// @return return4 rewardPerBlock
    /// @return return5 name
    function infos()
        external
        view
        override
        returns (
            address[2] memory,
            uint256,
            uint256,
            uint256,
            string memory
        )
    {
        return ([tos, stakeAddress], cap, stakeType, rewardPerBlock, name);
    }

}
