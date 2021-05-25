// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract StakeTONFactory {

    address public stakeTONProxyFactory;
    address public stakeTONLogicFactory;

    constructor(address _stakeTONProxyFactory, address _stakeTONLogicFactory) {
        require(
<<<<<<< Updated upstream
            _stakeTONProxyFactory != address(0) &&
            _stakeTONLogicFactory != address(0),
            "stakeTONProxyFactory zero"
=======
            saleStart < stakeStart && stakeStart > 0,
            "StakeTONFactory: start error"
        );

        StakeTONProxy proxy = new StakeTONProxy();
        StakeTON logic = new StakeTON();
        proxy.upgradeTo(address(logic));


        IStakeTON(address(proxy)).initialize(
            _token,
            _paytoken,
            address(vault),
            saleStart,
            stakeStart,
            period
        );
        IStakeTON(address(proxy)).setTokamak(
            tokamakAddr[0],
            tokamakAddr[1],
            tokamakAddr[2],
            tokamakAddr[3],
            defiAddr,
            defiAddr
>>>>>>> Stashed changes
        );
        stakeTONProxyFactory = _stakeTONProxyFactory;
        stakeTONLogicFactory = _stakeTONLogicFactory;
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
        (bool success1, bytes memory returnData1) = stakeTONLogicFactory.call(abi.encodeWithSignature("deploy()"));
        require(success1,"stakeTONLogicFactory fail");
        address logic = abi.decode(returnData1, (address)) ;

        // gas limit 1,733,511
        // used gas 1,693,642 {gas: gasleft()}
        (bool success, bytes memory returnData) = stakeTONProxyFactory.call(
            abi.encodeWithSignature("deploy(address,address[4],address,uint256[3],address)",
            logic,
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
