// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IStakeTONProxyFactory {
    function deploy
    (
        address _logic,
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address);
}

contract StakeTONFactory {

    address public stakeTONProxyFactory;
    address public stakeTONLogic;

    constructor(address _stakeTONProxyFactory, address _stakeTONLogic) {
        require(
            _stakeTONProxyFactory != address(0) &&
            _stakeTONLogic != address(0),
            "stakeTONProxyFactory zero"
        );
        stakeTONProxyFactory = _stakeTONProxyFactory;
        stakeTONLogic = _stakeTONLogic;
    }

    function create
    (
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata,
        address owner
    ) external returns (address) {

        address proxy = IStakeTONProxyFactory(stakeTONProxyFactory).deploy(
            stakeTONLogic,
            _addr,
            _registry,
            _intdata,
            owner
        );

        require(proxy != address(0), "StakeTONFactory: create fail");

        return proxy;
    }
}
