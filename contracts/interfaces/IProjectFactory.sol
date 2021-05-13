//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IProjectFactory {
    function deploy(
        uint256 _projectId,
        string memory _projectName,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _tokenPrice,
        address _developer,
        address _token,
        string memory _tokenName,
        string memory _symbol
    ) external returns (address);
}
