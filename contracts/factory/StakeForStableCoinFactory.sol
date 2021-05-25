// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IStakeForStableCoin} from "../interfaces/IStakeForStableCoin.sol";

import {StakeForStableCoin} from "../stake/StakeForStableCoin.sol";
import {StakeYearnProxy} from "../stake/StakeYearnProxy.sol";

contract StakeForStableCoinFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    function deploy(
        uint256 _pahse,
        address _vault,
        address _token,
        address _paytoken,
        uint256 _period,
        address owner
    ) external returns (address) {
        require(
            _vault != address(0) && _pahse == 1,
            "StakeForStableCoinFactory: deploy init fail"
        );

        IStake1Vault vault = IStake1Vault(_vault);
        uint256 saleStart = vault.saleStartBlock();
        uint256 stakeStart = vault.stakeStartBlock();
        address defiAddr = vault.defiAddr();
        uint256 period = _period;

        require(
            saleStart < stakeStart && stakeStart > 0,
            "StakeForStableCoinFactory: start error"
        );

        // if paytoken is stable coin, stakeContract is YearnV2Staker
        StakeYearnProxy proxy = new StakeYearnProxy();
        StakeForStableCoin logic = new StakeForStableCoin();
        proxy.upgradeTo(address(logic));

        IStakeForStableCoin(address(proxy)).initialize(
            _token,
            _paytoken,
            address(vault),
            saleStart,
            stakeStart,
            period
        );

        IStakeForStableCoin(address(proxy)).setYearnV2(defiAddr);

        // vault.addSubVaultOfStake(_name, address(proxy), period);
        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));
        return address(proxy);
    }
}
