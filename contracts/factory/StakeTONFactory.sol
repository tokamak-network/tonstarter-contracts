// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;


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

        (bool success, bytes memory returnData) = stakeTONProxyFactory.call(
            abi.encodeWithSignature("deploy(address,address[4],address,uint256[3],address)",
            stakeTONLogic,
            _addr,
            _registry,
            _intdata,
            owner
            ));
        require(success,"stakeTONProxyFactory fail");
        address proxy = abi.decode(returnData, (address));
        require(proxy != address(0), "StakeTONFactory create fail");

        return proxy;
    }
}
