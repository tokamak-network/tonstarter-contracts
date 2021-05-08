// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IYearnV2Vault} from "../interfaces/IYearnV2Vault.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
//import { ERC165 } from "@openzeppelin/contracts/introspection/ERC165.sol";
import "../stake/Stake1Storage.sol";

/// @title The connector that integrates zkopru and tokamak
contract YearnV2Staker is Stake1Storage, AccessControl {
    address public yearnV2Vault;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier nonZero(address _addr) {
        require(_addr != address(0), "YearnV2Staker: zero address");
        _;
    }

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "YearnV2Staker: Caller is not an admin"
        );
        _;
    }

    function setYearnV2(
        address _vault
    ) external onlyOwner {
        require(
            _vault != address(0),
            "YearnV2Staker: zero address"
        );
        yearnV2Vault = _vault;
    }

    function yearnV2_calcTotalValue() external onlyOwner nonZero(yearnV2Vault) returns (uint underlyingAmount) {
        return IYearnV2Vault(yearnV2Vault).calcTotalValue();
    }

    function yearnV2_deposit(uint amount) external onlyOwner nonZero(yearnV2Vault) {
        IYearnV2Vault(yearnV2Vault).deposit(amount);
    }

    function yearnV2_withdraw(uint amount) external onlyOwner nonZero(yearnV2Vault) {
        IYearnV2Vault(yearnV2Vault).withdraw(amount);
    }

    function yearnV2_underlyingYield() external onlyOwner nonZero(yearnV2Vault) returns (uint) {
        return IYearnV2Vault(yearnV2Vault).underlyingYield();
    }

    function yearnV2_unclaimedProfit(address user) external view onlyOwner nonZero(yearnV2Vault) returns (uint256) {
        return IYearnV2Vault(yearnV2Vault).unclaimedProfit(user);
    }

    function yearnV2_claim() external onlyOwner nonZero(yearnV2Vault) {
        IYearnV2Vault(yearnV2Vault).claim();
    }

}
