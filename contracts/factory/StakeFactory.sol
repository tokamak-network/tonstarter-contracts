// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IStakeSimpleFactory} from "../interfaces/IStakeSimpleFactory.sol";
import {IStakeTONFactory1} from "../interfaces/IStakeTONFactory1.sol";
import {IStakeDefiFactory} from "../interfaces/IStakeDefiFactory.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakeFactory is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeSimpleFactory;
    address public stakeTONFactory;
    address public stakeDefiFactory;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "not an admin");
        _;
    }
    modifier nonZero(address _addr) {
        require(_addr != address(0), "zero");
        _;
    }

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

    function setStakeSimpleFactory(address _stakeSimpleFactory)
        external
        onlyOwner
        nonZero(_stakeSimpleFactory)
    {
        stakeSimpleFactory = _stakeSimpleFactory;
    }

    function setStakeTONFactory(address _stakeTONFactory)
        external
        onlyOwner
        nonZero(_stakeTONFactory)
    {
        stakeTONFactory = _stakeTONFactory;
    }

    function setStakeDefiFactory(address _stakeDefiFactory)
        external
        onlyOwner
        nonZero(_stakeDefiFactory)
    {
        stakeDefiFactory = _stakeDefiFactory;
    }

    function create(
        uint256 stakeType,
        address[4] calldata _addr,
        address registry,
        uint256[3] calldata _intdata
    ) external onlyOwner returns (address) {
        require(_addr[2] != address(0), "vault zero");
        /**
        token = _addr[0];
        paytoken = _addr[1];
        vault = _addr[2];
        _defiAddr = _addr[3];

        ton = _tokamak[0];
        wton = _tokamak[1];
        depositManager = _tokamak[2];
        seigManager = _tokamak[3];

        saleStartBlock = _intdata[0];
        startBlock = _intdata[1];
        endBlock = startBlock + _intdata[2];
         */
        if (stakeType == 0) {
            // TON Staking
            require(stakeTONFactory != address(0), "stakeTONFactory zero");

            address proxy =
                IStakeTONFactory1(stakeTONFactory).create(
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
                "stakeSimpleFactory zero"
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
                    _addr,
                    registry,
                    _intdata,
                    msg.sender
                );

            return proxy;
        }

        return address(0);
    }
}
