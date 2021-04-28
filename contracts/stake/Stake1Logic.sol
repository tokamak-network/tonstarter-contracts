// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { SafeMath } from "../utils/math/SafeMath.sol";

import "./StakeProxyStorage.sol";
import "../../node_modules/@openzeppelin/contracts/access/AccessControl.sol";
import { IStakeFactory } from "../interfaces/IStakeFactory.sol";
import { IStakeRegistry } from "../interfaces/IStakeRegistry.sol";

contract Stake1Logic is StakeProxyStorage, AccessControl {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant ZERO_HASH = 0x0000000000000000000000000000000000000000000000000000000000000000;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Stake1Proxy: Caller is not an admin");
        _;
    }

    modifier nonZero(address _addr) {
        require(_addr != address(0), "Stake1Proxy: zero address");
        _;
    }
    modifier nonZeroHash(bytes32 _hash) {
        require(_hash != ZERO_HASH, "Stake1Proxy: zero hash");
        _;
    }
    //////////////////////////////////////////////////////////////////////
    // setters
    function setStore(
        address _stakeRegistry,
        address _stakeFactory
    ) external   onlyOwner{
        setStakeRegistry(_stakeRegistry);
        setStakeFactory(_stakeFactory);
    }


    function setStakeRegistry(address _stakeRegistry) public  onlyOwner nonZero(_stakeRegistry) {
        stakeRegistry = IStakeRegistry(_stakeRegistry);
    }

    function setStakeFactory(address _stakeFactory) public   onlyOwner nonZero(_stakeFactory) {
        stakeFactory = IStakeFactory(_stakeFactory);
    }

    //////////////////////////////////////////////////////////////////////
    // Admin Functions
    function addVault(
        uint _pahse,
        bytes32 _vaultName,
        address _vault
    )   external onlyOwner
    {
        stakeRegistry.addVault(_pahse, _vaultName, _vault);
    }

    function createStakeContract(
        uint256 _pahse,
        address _vault,
        address token,
        address paytoken,
        uint256 periodBlock,
        string memory _name
    )   external onlyOwner
    {
        require(stakeRegistry.validVault(_pahse, _vault), "Stake1Proxy: unvalidVault");

        address _contract = stakeFactory.deploy(_pahse, _vault, _name, token, paytoken, periodBlock);
        require(_contract != address(0), "Stake1Proxy: stakeFactory.deploy fail");
        stakeRegistry.addStakeContract(_vault, _contract);
    }


}