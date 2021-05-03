// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import { Stake1 } from "../stake/Stake1.sol";
import { IStake1Vault } from "../interfaces/IStake1Vault.sol";

contract StakeFactory  {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    function deploy(
        uint256 _pahse,
        address _vault,
        string memory _name,
        address _token,
        address _paytoken,
        uint256 _period,
        address[4] memory tokamakAddr
    )
        public
        returns (address)
    {
        require(_vault!=address(0) && _pahse == 1, "StakeFactory: deploy init fail");

        if (_pahse == 1) {
            Stake1 c = new Stake1();
            IStake1Vault vault = IStake1Vault(_vault);

            uint256 saleStart = vault.saleStartBlock();
            uint256 stakeStart = vault.stakeStartBlock();
            require( saleStart < stakeStart && stakeStart > 0 );
            c.initialize(_token, _paytoken, _vault, saleStart, stakeStart, _period );
            c.setTokamak(tokamakAddr[0], tokamakAddr[1], tokamakAddr[2], tokamakAddr[3]);
            vault.addSubVaultOfStake(_name, address(c), _period);
            c.grantRole(ADMIN_ROLE, msg.sender);
            c.revokeRole(ADMIN_ROLE, address(this));

            return address(c);
        }
        return address(0);
    }
}
