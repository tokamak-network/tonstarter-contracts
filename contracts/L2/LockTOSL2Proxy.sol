pragma solidity ^0.7.6;

import "../interfaces/ILockTOSL2Proxy.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import "./LockTOSStorage.sol";
import "./BaseProxy.sol";

/// @title The proxy of TOS Plaform
/// @notice Admin can createVault, createStakeContract.
/// User can excute the tokamak staking function of each contract through this logic.
contract LockTOSL2Proxy is
    LockTOSStorage,
    BaseProxy,
    ILockTOSL2Proxy
{
    /// @dev Initialize
    function initialize(
        address _tos,
        uint256 _epochUnit,
        uint256 _maxTime
    ) external override onlyOwner {
        require(tos == address(0), "Already initialized");
        lockIdCounter = 0;
        cumulativeEpochUnit = 0;
        cumulativeTOSAmount = 0;

        tos = _tos;
        epochUnit = _epochUnit;
        maxTime = _maxTime;
    }
}
