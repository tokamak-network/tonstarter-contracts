// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../interfaces/IAutoRefactorCoinageWithTokenId.sol";
import "../interfaces/IIStake2Vault.sol";
import "../libraries/DSMath.sol";
import "../common/AccessibleCommon.sol";
import "../stake/StakeUniswapV3Storage.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../libraries/SafeMath32.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//import "hardhat/console.sol";

/// @title StakeUniswapV3
/// @notice Uniswap V3 Contract for staking LP and mining TOS
contract StakeUniswapV3Upgrade2 is
    StakeUniswapV3Storage,
    AccessibleCommon,
    DSMath
{
    using SafeMath for uint256;
    using SafeMath32 for uint32;

    /// @dev constructor of StakeCoinage
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);

    }

    /// @dev receive ether - revert
    receive() external payable {
        revert();
    }


    function stakerEndIncentive(address staker, IncentiveKey memory key)
        external returns (uint256 refund)
    {
        return staker.endIncentive(key);
    }

    //
    function stakerStakeToken(address staker, IncentiveKey memory key, uint256 tokenId)
        external
    {
        return staker.stakeToken(key, tokenId);
    }


    function withdrawToken(
        address staker,
        uint256 tokenId
    ) external {
        staker.withdrawToken(tokenId, address(this), 0x);
    }

}
