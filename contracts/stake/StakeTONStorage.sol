//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IStakeTONStorage.sol";
import "./Stake1Storage.sol";

contract StakeTONStorage is Stake1Storage, IStakeTONStorage {

    /// @dev TON address
    address public override ton;

    /// @dev WTON address
    address public override wton;

    /// @dev SeigManager address
    address public override seigManager;

    /// @dev DepositManager address
    address public override depositManager;

    /// @dev the layer2 address in Tokamak
    address public override tokamakLayer2;

    /// @dev the accumulated TON amount staked into tokamak , in wei unit
    uint256 public override toTokamak;

    /// @dev the accumulated WTON amount unstaked from tokamak , in ray unit
    uint256 public override fromTokamak;

    /// @dev the accumulated WTON amount swapped using uniswap , in ray unit
    uint256 public override toUniswapWTON;

    /// @dev the FLD balance in this contract
    uint256 public override swappedAmountFLD;

    /// @dev the TON balance in this contract when withdraw at first
    uint256 public override finalBalanceTON;

    /// @dev the WTON balance in this contract when withdraw at first
    uint256 public override finalBalanceWTON;

    /// @dev defi status
    uint256 public override defiStatus;

    /// @dev the number of requesting unstaking to tokamak , when process unstaking, reset zero.
    uint256 public requestNum;

    /// @dev the withdraw flag, when withdraw at first, set true
    bool public override withdrawFlag;
}
