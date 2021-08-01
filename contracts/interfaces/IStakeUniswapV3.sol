//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeUniswapV3 {

    function stake(uint256 tokenId)
        external;

    function getMiningTokenId(uint256 tokenId)
        external
        returns (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint256 minableAmount,
            uint160 secondsInside,
            uint160 secondsInsideDiff,
            uint256 liquidity,
            uint256 balanceOfTokenIdRay,
            uint256 minableAmountRay,
            uint160 secondsAbsolute160,
            uint256 secondsInsideDiff256,
            uint256 secondsAbsolute256
        );

    /// @dev withdraw
    function withdraw(uint256 tokenId) external;

    /// @dev Claim for reward
    function claim(uint256 tokenId) external;

    // function setPool(
    //     address token0,
    //     address token1,
    //     string calldata defiInfoName
    // ) external;

    /// @dev
    function getUserStakedTokenIds(address user)
        external
        view
        returns (uint256[] memory ids);

    /// @dev tokenId's deposited information
    /// @param tokenId   tokenId
    /// @return poolAddress   poolAddress
    /// @return tick tick,
    /// @return liquidity liquidity,
    /// @return args liquidity,  startTime, claimedTime, startBlock, claimedBlock, claimedAmount
    /// @return secondsPL secondsPerLiquidityInsideInitialX128, secondsPerLiquidityInsideX128Las
    function getDepositToken(uint256 tokenId)
        external
        view
        returns (
            address poolAddress,
            int24[2] memory tick,
            uint128 liquidity,
            uint256[5] memory args,
            uint160[2] memory secondsPL
        );

    function getUserStakedTotal(address user)
        external
        view
        returns (
            uint256 totalDepositAmount,
            uint256 totalClaimedAmount,
            uint256 totalUnableClaimAmount
        );

    /// @dev Give the infomation of this stakeContracts
    /// @return return1  [token, vault, stakeRegistry, coinage]
    /// @return return2  [poolToken0, poolToken1, nonfungiblePositionManager, uniswapV3FactoryAddress]
    /// @return return3  [totalStakers, totalStakedAmount, rewardClaimedTotal,rewardNonLiquidityClaimTotal]
    function infos()
        external
        view
        returns (
            address[4] memory,
            address[4] memory,
            uint256[4] memory
        );
}
