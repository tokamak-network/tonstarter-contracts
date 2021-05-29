//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTONTokamak {
    function tokamakStaking(address _layer2) external;

    function tokamakRequestUnStaking(address _layer2, uint256 amount) external;

    function tokamakProcessUnStaking(address _layer2) external;

    function exchangeWTONtoFLD(
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline,
        uint160 sqrtPriceLimitX96,
        uint _type
    ) external returns (uint256 amountOut);
}
