// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IIERC20} from "../interfaces/IIERC20.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "./StakeTONStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {OnApprove} from "../tokens/OnApprove.sol";

/// @title Proxy for Stake contracts in Phase 1
/// @notice
contract StakeTONProxy is StakeTONStorage, AccessControl, OnApprove {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    address internal _implementation;
    bool public pauseProxy;

    event Upgraded(address indexed implementation);

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "not an admin"
        );
        _;
    }

    constructor(address _logic) {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, address(this));
        _implementation = _logic;
    }

    /// @notice Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external onlyOwner {
        pauseProxy = _pause;
    }

    /// @notice Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external onlyOwner {
        require(impl != address(0), "StakeTONProxy: input is zero");
        require(
            _implementation != impl,
            "StakeTONProxy: The input address is same as the state"
        );
        _implementation = impl;
        emit Upgraded(impl);
    }

    /// @dev returns the implementation
    function implementation() public view returns (address) {
        return _implementation;
    }

    receive() external payable {
        _fallback();
    }

    fallback() external payable {
        _fallback();
    }

    function _fallback() internal {
        address _impl = implementation();
        require(
            _impl != address(0) && !pauseProxy,
            "StakeTONProxy: impl is zero OR proxy is false"
        );

        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
                // delegatecall returns 0 on error.
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }

    /// @dev Approves
    function onApprove(
        address owner,
        address spender,
        uint256 tonAmount,
        bytes calldata data
    ) external override returns (bool) {
        (address _spender, uint256 _amount) = _decodeStakeData(data);
        require(
            tonAmount == _amount && spender == _spender,
            "TokamakStaker: tonAmount != stakingAmount "
        );
        require(
            stakeOnApprove(msg.sender, owner, _spender, _amount),
            "TokamakStaker: stakeOnApprove fails "
        );
        return true;
    }

    function _decodeStakeData(bytes calldata input)
        internal
        pure
        returns (address spender, uint256 amount)
    {
        (spender, amount) = abi.decode(input, (address, uint256));
    }

    /// @dev stake with ton
    function stakeOnApprove(
        address from,
        address _owner,
        address _spender,
        uint256 _amount
    ) public returns (bool) {
        require(
            (paytoken == from && _amount > 0 && _spender == address(this)),
            "stakeOnApprove init fail"
        );
        require(
            block.number >= saleStartBlock && block.number < startBlock,
            "period is unavailable"
        );

        require(!IStake1Vault(vault).saleClosed(), "not end");
        require(
                IIERC20(paytoken).balanceOf(_owner) >= _amount,
                "lack"
            );

        LibTokenStake1.StakedAmount storage staked = userStaked[_owner];
        staked.amount = staked.amount.add(_amount);
        totalStakedAmount = totalStakedAmount.add(_amount);
        require(
            IIERC20(from).transferFrom(_owner, _spender, _amount),
            "transfer fail"
        );
        return true;
    }

    function setInit(
        address[4] memory _addr,
        address _registry,
        uint256[3] memory _intdata
    ) external onlyOwner {
        require(
            _registry != address(0) &&
                _addr[2] != address(0) &&
                _intdata[0] < _intdata[1], "setInit fail"
        );
        token = _addr[0];
        paytoken = _addr[1];
        vault = _addr[2];
        _uniswapRouter = _addr[3];

        stakeRegistry = _registry;

        tokamakLayer2 = address(0);

        saleStartBlock = _intdata[0];
        startBlock = _intdata[1];
        endBlock = startBlock.add(_intdata[2]);
    }

}
