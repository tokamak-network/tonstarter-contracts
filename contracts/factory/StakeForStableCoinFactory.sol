// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {StakeForStableCoin} from "../stake/StakeForStableCoin.sol";

contract StakeForStableCoinFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    function deploy(
        uint256 _pahse,
        address _vault,
        address _token,
        address _paytoken,
        uint256 _period,
        address owner
    ) public returns (address) {
        require(
            _vault != address(0) && _pahse == 1,
            "StakeFactory: deploy init fail"
        );

        IStake1Vault vault = IStake1Vault(_vault);
        uint256 saleStart = vault.saleStartBlock();
        uint256 stakeStart = vault.stakeStartBlock();
        address defiAddr = vault.defiAddr();
        uint256 period = _period;

        require(
            saleStart < stakeStart && stakeStart > 0,
            "StakeFactory: start error"
        );

        // if paytoken is stable coin, stakeContract is YearnV2Staker

        StakeForStableCoin c = new StakeForStableCoin();
        c.initialize(
            _token,
            _paytoken,
            address(vault),
            saleStart,
            stakeStart,
            period
        );
        c.setYearnV2(defiAddr);
        // vault.addSubVaultOfStake(_name, address(c), period);
        c.grantRole(ADMIN_ROLE, owner);
        c.revokeRole(ADMIN_ROLE, address(this));
        return address(c);
    }
}
