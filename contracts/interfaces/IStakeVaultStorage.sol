//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

interface IStakeVaultStorage {
    //function fld() external view returns (address);

    function paytoken() external view returns (address);

    function cap() external view returns (uint256);

    function stakeType() external view returns (uint256);

    function defiAddr() external view returns (address);

    function saleStartBlock() external view returns (uint256);

    function stakeStartBlock() external view returns (uint256);

    function stakeEndBlock() external view returns (uint256);

    function realEndBlock() external view returns (uint256);

    function blockTotalReward() external view returns (uint256);

    function saleClosed() external view returns (bool);

    function stakeEndBlockTotal(uint256 endblock)
        external
        view
        returns (uint256 totalStakedAmount);
}
