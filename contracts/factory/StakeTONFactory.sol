// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;


contract StakeTONFactory {

    address public stakeTONProxyFactory;
    //address public stakeTONLogicFactory;
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

        // used gas limit 2,672,614
        // used gas 2,631,878   1000000
        // (bool success1, bytes memory returnData1) = stakeTONLogicFactory.call(abi.encodeWithSignature("deploy()"));
        // require(success1,"stakeTONLogicFactory fail");
        // address logic = abi.decode(returnData1, (address)) ;

        // gas limit 1,733,511
        // used gas 1,693,642 {gas: gasleft()}
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
