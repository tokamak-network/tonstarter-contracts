// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../interfaces/IStake2Logic.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IStake2Vault} from "../interfaces/IStake2Vault.sol";
import "../common/AccessibleCommon.sol";
import "./StakeProxyStorage.sol";

// import "hardhat/console.sol";

interface IIStakeUniswapV3 {
    function setPool(address[4] memory uniswapInfo) external;
}

/// @title The logic of TOS Plaform
/// @notice Admin can createVault, createStakeContract.
/// User can excute the tokamak staking function of each contract through this logic.

contract Stake2Logic is StakeProxyStorage, AccessibleCommon, IStake2Logic {
    // modifier nonZero(address _addr) {
    //     require(_addr != address(0), "Stake1Logic:zero address");
    //     _;
    // }
    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "Stake2Logic: zero address");
        _;
    }

    constructor() {}

    function balanceOf(address token, address target)
        external
        view
        returns (uint256)
    {
        return IERC20(token).balanceOf(target);
    }

    function balanceOfTOS(address target) external view returns (uint256) {
        return IERC20(tos).balanceOf(target);
    }

    /// @dev Set stakeVaultLogic address by _phase
    /// @param _phase the stake type
    /// @param _logic the vault logic address
    function setVaultLogicByPhase(uint256 _phase, address _logic)
        external
        override
        onlyOwner
        nonZeroAddress(address(stakeVaultFactory))
        nonZeroAddress(_logic)
    {
        stakeVaultFactory.setVaultLogicByPhase(_phase, _logic);
    }

    /// @dev create vault2
    /// @param _cap  allocated reward amount
    /// @param _miningPerSecond  the mining per second
    /// @param _phase  phase of TOS platform
    /// @param _vaultName  vault's name's hash
    /// @param _stakeType  it's 2, StakeUniswapV3 staking type
    /// @param _uniswapInfo  npm, poolFactory, token0, token1
    /// @param _name   name
    function createVault2(
        uint256 _cap,
        uint256 _miningPerSecond,
        uint256 _phase,
        bytes32 _vaultName,
        uint256 _stakeType,
        address[4] memory _uniswapInfo,
        string memory _name
    )
        external
        override
        onlyOwner
        nonZeroAddress(address(stakeVaultFactory))
    // nonZeroAddress(_uniswapInfo[0])
    // nonZeroAddress(_uniswapInfo[1])
    // nonZeroAddress(_uniswapInfo[2])
    // nonZeroAddress(_uniswapInfo[3])
    {
        require(_phase == 2, "Stake1Logic: unsupported phase in vault2");

        uint256 stakeType = _stakeType;
        uint256 cap = _cap;
        uint256 miningPerSecond = _miningPerSecond;

        // console.log("tos %s", tos );
        // console.log("stakeFactory %s", address(stakeFactory) );
        // console.log("miningPerSecond %d , cap %d, stakeType %d ", miningPerSecond, cap , stakeType);
        // console.log("tos %s", tos );

        address vault =
            stakeVaultFactory.create2(
                _phase,
                [tos, address(stakeFactory)],
                [stakeType, cap, miningPerSecond],
                _name,
                address(this)
            );

        require(vault != address(0), "Stake1Logic: vault2 is zero");

        uint256 phase = _phase;
        bytes32 vaultName = _vaultName;

        stakeRegistry.addVault(vault, phase, vaultName);
        emit CreatedVault2(vault, _uniswapInfo[0], cap);

        address[4] memory _addr = [tos, address(0), vault, address(0)];
        address _contract =
            stakeFactory.create(
                stakeType,
                _addr,
                address(stakeRegistry),
                [cap, miningPerSecond, 0]
            );
        require(_contract != address(0), "Stake1Logic: vault2 deploy fail");

        address[4] memory uniswapInfo = _uniswapInfo;
        IIStakeUniswapV3(_contract).setPool(uniswapInfo);
        IStake2Vault(vault).setStakeAddress(_contract);
        stakeRegistry.addStakeContract(vault, _contract);

        emit CreatedStakeContract2(vault, _contract, phase);
    }

    /// @dev set pool information
    /// @param uniswapInfo [NonfungiblePositionManager,UniswapV3Factory,token0,token1]
    function setPool(address target, address[4] memory uniswapInfo)
        external
        override
        onlyOwner
        nonZeroAddress(target)
    {
        IIStakeUniswapV3(target).setPool(uniswapInfo);
    }
}
