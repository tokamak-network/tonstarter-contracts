// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStakeFactory.sol";
import {IStakeSimpleFactory} from "../interfaces/IStakeSimpleFactory.sol";
import {IStakeTONFactory} from "../interfaces/IStakeTONFactory.sol";
import {IStakeUniswapV3Factory} from "../interfaces/IStakeUniswapV3Factory.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title A factory that calls the desired stake factory according to stakeType
contract StakeFactory is IStakeFactory, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    /// StakeType - Factory address
    mapping(uint256 => address) public factory;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "StakeFactory: not an admin");
        _;
    }
    modifier nonZero(address _addr) {
        require(_addr != address(0), "StakeFactory: zero");
        _;
    }

    /// @dev constructor of StakeFactory
    /// @param _stakeSimpleFactory the factory address for StakeSimple
    /// @param _stakeTONFactory the factory address for StakeTON
    /// @param _stakeUniswapV3Factory the factory address for StakeUniswapV3
    constructor(
        address _stakeSimpleFactory,
        address _stakeTONFactory,
        address _stakeUniswapV3Factory
    ) {
        require(
            _stakeSimpleFactory != address(0) && _stakeTONFactory != address(0),
            "StakeFactory: init fail"
        );

        factory[0] = _stakeTONFactory;
        factory[1] = _stakeSimpleFactory;
        factory[2] = _stakeUniswapV3Factory;

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "StakeFactory:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }


    /// @dev Set factory address by StakeType
    /// @param _stakeType the stake type , 0:TON, 1: Simple, 2: UniswapV3
    /// @param _factory the factory address
    function setFactoryByStakeType(uint256 _stakeType, address _factory)
        external
        override
        onlyOwner
        nonZero(_factory)
    {
        factory[_stakeType] = _factory;
    }

    /// @dev Create a stake contract that calls the desired stake factory according to stakeType
    /// @param stakeType if 0, stakeTONFactory, else if 1 , stakeSimpleFactory , else if 2, stakeUniswapV3Factory
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
        require(factory[stakeType] != address(0), "StakeFactory: factory zero");
        require(_addr[2] != address(0), "StakeFactory: vault zero");


        if (stakeType == 0) {
            address proxy =
                IStakeTONFactory(factory[stakeType]).create(
                    _addr,
                    registry,
                    _intdata,
                    msg.sender
                );
            require(proxy != address(0), "StakeFactory: proxy zero");
            return proxy;

        } else if (stakeType == 1) {
            address proxy =
                IStakeSimpleFactory(factory[stakeType]).create(
                    [_addr[0], _addr[1], _addr[2]],
                    _intdata,
                    msg.sender
                );
            require(proxy != address(0), "StakeFactory: proxy zero");
            return proxy;

        } else if (stakeType == 2) {
            address proxy =
                IStakeTONFactory(factory[stakeType]).create(
                    _addr,
                    registry,
                    _intdata,
                    msg.sender
                );
            require(proxy != address(0), "StakeFactory: proxy zero");
            return proxy;            
        }
    }
}
