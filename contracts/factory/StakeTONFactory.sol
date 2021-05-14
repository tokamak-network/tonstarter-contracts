// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IStakeTON} from "../interfaces/IStakeTON.sol";

import {StakeTON} from "../stake/StakeTON.sol";
import {StakeTONProxy} from "../stake/StakeTONProxy.sol";

contract StakeTONFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    function deploy(
        uint256 _pahse,
        address _vault,
        address _token,
        address _paytoken,
        uint256 _period,
        address[4] memory tokamakAddr,
        address owner
    ) public returns (address) {
        require(
            _vault != address(0) && _pahse == 1,
            "StakeTONFactory: deploy init fail"
        );

        IStake1Vault vault = IStake1Vault(_vault);
        uint256 saleStart = vault.saleStartBlock();
        uint256 stakeStart = vault.stakeStartBlock();
        address defiAddr = vault.defiAddr();
        uint256 period = _period;

        require(
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
            defiAddr
        );

        // vault.addSubVaultOfStake(_name, address(proxy), period);
        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));
        return address(proxy);
    }
}
