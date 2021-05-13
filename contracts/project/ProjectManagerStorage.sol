//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;


contract ProjectManagerStorage {

    address public projectRegistry;
    address public projectFactory;
    address public projectTokenFactory;
    address public projectStakeVaultFactory;
    address public projectDevVaultFactory;

    address public fld;
    address public fldRewardVault;
    address public airdropVault;

    uint256 public defaultStakingPeriod;
    uint256 public defaultAirdrop;

    uint256[] public projectId;

    modifier validProjectRegistry() {
        require(
            projectRegistry != address(0),
            "ProjectManagerStorage: projectRegistry is zero"
        );
        _;
    }

    modifier validProjectFactory() {
        require(
            projectFactory != address(0),
            "ProjectManagerStorage: invalid projectFactory"
        );
        _;
    }



}
