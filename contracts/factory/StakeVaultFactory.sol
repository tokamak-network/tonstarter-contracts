// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

//import {Stake1Vault} from "../stake/Stake1Vault.sol";
import {StakeVaultProxy} from "../stake/StakeVaultProxy.sol";

contract StakeVaultFactory {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    address public stakeVaultLogic;

    constructor(address _stakeVaultLogic) {
        require(_stakeVaultLogic != address(0), "StakeVaultFactory zero");
        stakeVaultLogic = _stakeVaultLogic;
    }

    function create(
        address[4] memory _addr,
        uint256[4] memory _intInfo,
        address owner
    ) external returns (address) {
        address _fld = _addr[0];
        address _paytoken = _addr[1];
        address _stakefactory = _addr[2];
        address _defiAddr = _addr[3];
        uint256 _stakeType = _intInfo[0];
        uint256 _cap = _intInfo[1];
        uint256 _saleStartBlock = _intInfo[2];
        uint256 _stakeStartBlock = _intInfo[3];

        // Stake1Vault vault = new Stake1Vault();
        // require(address(vault) != address(0), "vault logic zero");

        StakeVaultProxy proxy = new StakeVaultProxy(stakeVaultLogic);

        proxy.initialize(
            _fld,
            _paytoken,
            _cap,
            _saleStartBlock,
            _stakeStartBlock,
            _stakefactory,
            _stakeType,
            _defiAddr
        );

        proxy.grantRole(ADMIN_ROLE, owner);
        proxy.revokeRole(ADMIN_ROLE, address(this));

        return address(proxy);
    }
}
