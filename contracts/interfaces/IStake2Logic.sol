//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStake2Logic {
    /// @dev event on create vault
    /// @param vault the vault address created
    /// @param paytoken the token used for staking by user
    /// @param cap  allocated reward amount
    event CreatedVault2(address indexed vault, address paytoken, uint256 cap);

    /// @dev event on create stake contract in vault
    /// @param vault the vault address
    /// @param stakeContract the stake contract address created
    /// @param phase the phase of TOS platform
    event CreatedStakeContract2(
        address indexed vault,
        address indexed stakeContract,
        uint256 phase
    );

    /// @dev Set stakeVaultLogic address by _phase
    /// @param _phase the stake type
    /// @param _logic the vault logic address
    function setVaultLogicByPhase(uint256 _phase, address _logic) external;

    /// @dev create vault2
    /// @param _cap  allocated reward amount
    /// @param _rewardPerBlock  the reward per block
    /// @param _phase  phase of TOS platform
    /// @param _vaultName  vault's name's hash
    /// @param _stakeType   it's 2, StakeUniswapV3 staking type
    /// @param _uniswapInfo  npm, pool, token0, token1
    /// @param _name   name
    function createVault2(
        uint256 _cap,
        uint256 _rewardPerBlock,
        uint256 _phase,
        bytes32 _vaultName,
        uint256 _stakeType,
        address[4] memory _uniswapInfo,
        string memory _name
    ) external;

    /// @dev set pool information
    /// @param uniswapInfo [NonfungiblePositionManager,UniswapV3Factory,token0,token1]
    function setPool(address target, address[4] memory uniswapInfo)
        external;

}
