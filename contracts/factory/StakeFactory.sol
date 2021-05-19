// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IStakeTONFactory1} from "../interfaces/IStakeTONFactory1.sol";
import {IStakeProxy} from "../interfaces/IStakeProxy.sol";
import {IStakeTON} from "../interfaces/IStakeTON.sol";

import {
    IStakeForStableCoinFactory
} from "../interfaces/IStakeForStableCoinFactory.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract StakeFactory is AccessControl{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeTONFactory;
    address public stakeStableCoinFactory;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "not an admin"
        );
        _;
    }
    modifier nonZero(address _addr) {
        require(_addr != address(0), "zero");
        _;
    }

    constructor(address _stakeTONFactory, address _stableFactory) {
        require(
            _stakeTONFactory != address(0) && _stableFactory != address(0),
            "StakeFactory: init fail"
        );
        stakeTONFactory = _stakeTONFactory;
        stakeStableCoinFactory = _stableFactory;
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function setStakeTONFactory(address _stakeTONFactory)
        public
        onlyOwner
        nonZero(_stakeTONFactory)
    {
        stakeTONFactory = _stakeTONFactory;
    }

    function setStakeStableCoinFactory(address _stakeStableCoinFactory)
        public
        onlyOwner
        nonZero(_stakeStableCoinFactory)
    {
        stakeStableCoinFactory = _stakeStableCoinFactory;
    }

    function create(
        uint256 _pahse,
        uint256 stakeType,
        address[4] memory _addr,
        address[4] memory tokamakAddr,
        uint256[3] memory _intdata
    )
        public onlyOwner
        returns (address)
    {
        require(_addr[2] != address(0), "StakeFactory: deploy init fail");
        /**
        token = _addr[0];
        paytoken = _addr[1];
        vault = _addr[2];
        _uniswapRouter = _addr[3];

        ton = _tokamak[0];
        wton = _tokamak[1];
        depositManager = _tokamak[2];
        seigManager = _tokamak[3];

        saleStartBlock = _intdata[0];
        startBlock = _intdata[1];
        endBlock = startBlock + _intdata[2];
         */
        if (stakeType <= 1) {
            require(
                stakeTONFactory != address(0),
                "StakeFactory: stakeTONFactory zero"
            );

            address proxy = IStakeTONFactory1(stakeTONFactory).create(
                 _addr, tokamakAddr, _intdata, msg.sender);

            return proxy;

        }/*  else if (stakeType == 2) {

            require(
                stakeStableCoinFactory != address(0),
                "StakeFactory: stakeStableCoinFactory zero"
            );

            return
                IStakeForStableCoinFactory(stakeStableCoinFactory).deploy(
                    _pahse,
                    _vault,
                    _token,
                    _paytoken,
                    _period,
                    msg.sender
                );
        }
        */
        return address(0);
    }
}
