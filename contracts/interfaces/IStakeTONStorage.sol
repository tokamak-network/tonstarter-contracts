//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeTONStorage {

    /// @dev TON address
    function ton() external view returns (address);

    /// @dev WTON address
    function wton() external view returns (address);

    /// @dev SeigManager address
    function seigManager() external view returns (address);

    /// @dev DepositManager address
    function depositManager() external view returns (address);

    /// @dev the layer2 address in Tokamak
    function tokamakLayer2() external view returns (address);

    /// @dev the accumulated TON amount staked into tokamak , in wei unit
    function toTokamak() external view returns (uint256);

    /// @dev the accumulated WTON amount unstaked from tokamak , in ray unit
    function fromTokamak() external view returns (uint256);

    /// @dev the accumulated WTON amount swapped using uniswap , in ray unit
    function toUniswapWTON() external view returns (uint256);

    /// @dev the FLD balance in this contract
    function swappedAmountFLD() external view returns (uint256);

    /// @dev the TON balance in this contract when withdraw at first
    function finalBalanceTON() external view returns (uint256);

    /// @dev the WTON balance in this contract when withdraw at first
    function finalBalanceWTON() external view returns (uint256);

    /// @dev defi status -> NONE, APPROVE,DEPOSITED,REQUESTWITHDRAW,REQUESTWITHDRAWALL,WITHDRAW,END
    function defiStatus() external view returns (uint256);

    /// @dev the withdraw flag, when withdraw at first, set true
    function withdrawFlag() external view returns (bool);
}
