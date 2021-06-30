// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeFactory.sol";
import {IStakeSimpleFactory} from "../interfaces/IStakeSimpleFactory.sol";
import {IStakeTONFactory} from "../interfaces/IStakeTONFactory.sol";
import {IStakeDefiFactory} from "../interfaces/IStakeDefiFactory.sol";
import "../common/AccessibleCommon.sol";

/// @title A factory that calls the desired stake factory according to stakeType
contract StakeFactory is IStakeFactory, AccessibleCommon {

    address public stakeSimpleFactory;
    address public stakeTONFactory;
    address public stakeDefiFactory;

    modifier nonZero(address _addr) {
        require(_addr != address(0), "StakeFactory: zero");
        _;
    }

    /// @dev constructor of StakeFactory
    /// @param _stakeSimpleFactory the logic address used in StakeSimpleFactory
    /// @param _stakeTONFactory the logic address used in StakeTONFactory
    /// @param _stakeDefiFactory the logic address used in StakeDefiFactory
    constructor(
        address _stakeSimpleFactory,
        address _stakeTONFactory,
        address _stakeDefiFactory
    ) {
        require(
            _stakeSimpleFactory != address(0) && _stakeTONFactory != address(0),
            "StakeFactory: init fail"
        );
        stakeSimpleFactory = _stakeSimpleFactory;
        stakeTONFactory = _stakeTONFactory;
        stakeDefiFactory = _stakeDefiFactory;
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }


    /// @dev Set StakeSimpleFactory address
    /// @param _stakeSimpleFactory new StakeSimpleFactory address
    function setStakeSimpleFactory(address _stakeSimpleFactory)
        external
        override
        onlyOwner
        nonZero(_stakeSimpleFactory)
    {
        stakeSimpleFactory = _stakeSimpleFactory;
    }

    /// @dev Set StakeTONFactory address
    /// @param _stakeTONFactory new StakeTONFactory address
    function setStakeTONFactory(address _stakeTONFactory)
        external
        override
        onlyOwner
        nonZero(_stakeTONFactory)
    {
        stakeTONFactory = _stakeTONFactory;
    }

    /// @dev Set StakeDefiFactory address
    /// @param _stakeDefiFactory new StakeDefiFactory address
    function setStakeDefiFactory(address _stakeDefiFactory)
        external
        override
        onlyOwner
        nonZero(_stakeDefiFactory)
    {
        stakeDefiFactory = _stakeDefiFactory;
    }

    /// @dev Create a stake contract that calls the desired stake factory according to stakeType
    /// @param stakeType if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeDefiFactory
    /// @param _addr array of [token, paytoken, vault, _defiAddr]
    /// @param registry  registry address
    /// @param _intdata array of [saleStartBlock, startBlock, periodBlocks]
    /// @return contract address
    function create(
        uint256 stakeType,
        address[4] calldata _addr,
        address registry,
        uint256[3] calldata _intdata
    ) external override onlyOwner returns (address) {
        require(_addr[2] != address(0), "StakeFactory: vault zero");

        if (stakeType == 0) {
            // TON Staking
            require(
                stakeTONFactory != address(0),
                "StakeFactory: stakeTONFactory zero"
            );

            address proxy =
                IStakeTONFactory(stakeTONFactory).create(
                    _addr,
                    registry,
                    _intdata,
                    msg.sender
                );

            return proxy;
        } else if (stakeType == 1) {
            // ERC20 Simple Staking
            require(
                stakeSimpleFactory != address(0),
                "StakeFactory: stakeSimpleFactory zero"
            );

            address proxy =
                IStakeSimpleFactory(stakeSimpleFactory).create(
                    [_addr[0], _addr[1], _addr[2]],
                    _intdata,
                    msg.sender
                );

            return proxy;
        } else if (stakeType == 2) {
            require(
                stakeDefiFactory != address(0),
                "StakeFactory: stakeDefiFactory zero"
            );

            address proxy =
                IStakeDefiFactory(stakeDefiFactory).create(
                    [_addr[0], _addr[1], _addr[2]],
                    registry,
                    _intdata,
                    msg.sender
                );

            return proxy;
        }

        return address(0);
    }
}
