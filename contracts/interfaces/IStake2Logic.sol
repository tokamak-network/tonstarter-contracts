//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStake2Logic {

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
}
