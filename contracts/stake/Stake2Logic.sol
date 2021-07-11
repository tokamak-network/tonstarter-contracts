// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../common/AccessibleCommon.sol";
import "./StakeProxyStorage.sol";

/// @title The logic of TOS Plaform
/// @notice Admin can createVault, createStakeContract.
/// User can excute the tokamak staking function of each contract through this logic.
contract Stake2Logic is StakeProxyStorage, AccessibleCommon {

    modifier nonZero(address _addr) {
        require(_addr != address(0), "Stake1Logic:zero address");
        _;
    }

    constructor() {
    }

    function balanceOf(address token, address target) external view returns(uint256) {
        return IERC20(token).balanceOf(target);
    }

    function balanceOfTOS(address target) external view returns(uint256) {
        return IERC20(tos).balanceOf(target);
    }

}
