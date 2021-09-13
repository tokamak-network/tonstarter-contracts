// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../libraries/LibCustomLP.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Math} from "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ICustomCommonLib.sol";
import "../common/AccessibleCommon.sol";
import "./CustomLPRewardStorage.sol";

contract CustomLPRewardLogic2 is CustomLPRewardStorage, AccessibleCommon {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "CustomLPRewardLogic1: zero address");
        _;
    }
    modifier nonZero(uint256 _val) {
        require(_val > 0, "CustomLPRewardLogic1: zero value");
        _;
    }
    constructor() {

    }

    function initInfo
    (
        address _registry,
        address _nonfungiblePositionManager,
        address _uniswapV3Factory,
        address _commonLib
    )
        external onlyOwner
        nonZeroAddress(_registry)
        nonZeroAddress(_nonfungiblePositionManager)
        nonZeroAddress(_uniswapV3Factory)
        nonZeroAddress(_commonLib)
    {
        require(uniswapV3Factory == address(0), "CustomLPRewardLogic2: already initialize");
        stakeRegistry = _registry;
        nonfungiblePositionManager = INonfungiblePositionManager(_nonfungiblePositionManager);
        uniswapV3Factory = _uniswapV3Factory;
        commonLib = _commonLib;
    }

    function setPool
    (
        uint256 tokenId
    )
        external
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3Factory)
        nonZeroAddress(commonLib)
    {
        require(poolAddress == address(0), "CustomLPRewardLogic2: already setPool");
        (, , address token0, address token1, uint24 fee, , , , , , , ) =
            nonfungiblePositionManager.positions(tokenId);

        poolToken0 = token0;
        poolToken1 = token1;
        poolFee = fee;
        poolAddress = PoolAddress.computeAddress(
            uniswapV3Factory,
            PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
        );
    }

    function setCommonLib
    (
        address _lib
    )
        external
        nonZeroAddress(_lib)
    {
        commonLib = _lib;
    }
}
