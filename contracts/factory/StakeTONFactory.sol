// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {StakeTON} from "../stake/StakeTON.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";

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
            "Stake1Factory: deploy init fail"
        );

        IStake1Vault vault = IStake1Vault(_vault);
        uint256 saleStart = vault.saleStartBlock();
        uint256 stakeStart = vault.stakeStartBlock();
        address defiAddr = vault.defiAddr();
        uint256 period = _period;

        require(
            saleStart < stakeStart && stakeStart > 0,
            "Stake1Factory: start error"
        );

        StakeTON c = new StakeTON();
        c.initialize(
            _token,
            _paytoken,
            address(vault),
            saleStart,
            stakeStart,
            period
        );
        c.setTokamak(
            tokamakAddr[0],
            tokamakAddr[1],
            tokamakAddr[2],
            tokamakAddr[3],
            defiAddr
        );

        //vault.addSubVaultOfStake(_name, address(c), period);
        c.grantRole(ADMIN_ROLE, owner);
        c.revokeRole(ADMIN_ROLE, address(this));
        return address(c);
    }
}
