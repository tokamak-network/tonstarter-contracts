//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeFactory {

    function deploy(
        uint256 _pahse,
        address _vault,
        string memory _name,
        address _token,
        address _paytoken,
        uint256 _period
    )
        external
        returns (address);

}
