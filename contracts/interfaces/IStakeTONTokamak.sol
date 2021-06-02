//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTONTokamak {

    /// @dev  staking the staked TON in layer2 in tokamak
    /// @param _layer2 the layer2 address in tokamak
    /// @param stakeAmount the amount that stake to layer2
    /// @param isTON TON is true, WTON is false
    function tokamakStaking(
        address _layer2,
        uint256 stakeAmount,
        bool isTON
    ) external;

    /// @dev  request unstaking the wtonAmount in layer2 in tokamak
    /// @param _layer2 the layer2 address in tokamak
    /// @param wtonAmount the amount requested to unstaking
    function tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)
        external;

    /// @dev process unstaking in layer2 in tokamak
    /// @param _layer2 the layer2 address in tokamak
    function tokamakProcessUnStaking(address _layer2) external;

    /// @dev exchange holded WTON to FLD using uniswap
    /// @param _amountIn the input amount
    /// @param _amountOutMinimum the minimun output amount
    /// @param _deadline deadline
    /// @param sqrtPriceLimitX96 sqrtPriceLimitX96
    /// @param _kind the function type, if 0, use exactInputSingle function, else if, use exactInput function
    /// @return amountOut the amount of exchanged out token
    function exchangeWTONtoFLD(
        uint256 _amountIn,
        uint256 _amountOutMinimum,
        uint256 _deadline,
        uint160 sqrtPriceLimitX96,
        uint256 _kind
    ) external returns (uint256 amountOut);

    function exchangeWTONtoFLDv2(
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline,
        uint160 _sqrtPriceLimitX96,
        uint256 _type
    ) external returns (uint256 amountOut);
}
