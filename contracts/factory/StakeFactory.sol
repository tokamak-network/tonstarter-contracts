// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IStakeTONFactory} from "../interfaces/IStakeTONFactory.sol";
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

    function deploy(
        uint256 _pahse,
        address _vault,
        address _token,
        address _paytoken,
        uint256 _period,
        address[4] memory tokamakAddr
    ) public returns (address) {
        require(_vault != address(0), "StakeFactory: deploy init fail");

        IStake1Vault vault = IStake1Vault(_vault);
        uint256 saleStart = vault.saleStartBlock();
        uint256 stakeStart = vault.stakeStartBlock();
        uint256 stakeType = vault.stakeType();

        require(
            saleStart < stakeStart && stakeStart > 0,
            "StakeFactory: start error"
        );

        if (stakeType <= 1) {
            require(
                stakeTONFactory != address(0),
                "StakeFactory: stakeTONFactory zero"
            );

            return
                IStakeTONFactory(stakeTONFactory).deploy(
                    _pahse,
                    _vault,
                    _token,
                    _paytoken,
                    _period,
                    tokamakAddr,
                    msg.sender
                );
        } else if (stakeType == 2) {
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

        return address(0);
    }
}
