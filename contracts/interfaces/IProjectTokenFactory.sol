//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IProjectTokenFactory {
    function deploy(
        string memory _tokenName,
        string memory _symbol,
        uint256 _totalSupply,
        address to
    ) external returns (address);
}
