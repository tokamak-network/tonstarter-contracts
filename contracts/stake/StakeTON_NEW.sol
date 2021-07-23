//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IStakeTON_NEW.sol";

import "../common/AccessibleCommon.sol";

import "./StakeTONStorage.sol";

/// @dev Stake StakeTON_NEW for Testing
contract StakeTON_NEW is StakeTONStorage, AccessibleCommon, IStakeTON_NEW {

    /// @dev constructor of StakeTON
    constructor() {}

    /// @dev This contract cannot stake Ether.
    receive() external payable {
        revert("cannot stake Ether");
    }

    function version() external pure override returns (string memory){
        return "new.1.0";
    }

    function getVaultAddress() external view override returns (address){
        return vault;
    }

}
