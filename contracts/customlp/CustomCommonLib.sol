//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/ICustomCommonLib.sol";

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

// import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
//import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract CustomCommonLib is ICustomCommonLib {
    function checkCurrentPosition(
        address poolAddress,
        int24 tickLower,
        int24 tickUpper
    ) external view override returns (bool) {
        (, int24 tick, , , , , bool unlocked) =
            IUniswapV3Pool(poolAddress).slot0();
        if (unlocked && tickLower < tick && tick < tickUpper) return true;
        else return false;
    }
}
