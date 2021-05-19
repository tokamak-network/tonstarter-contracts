//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IStakeFactory {
    function deploy(
        uint256 _pahse,
        address _vault,
        address _token,
        address _paytoken,
        uint256 _period,
        address[4] memory tokamakAddr
    ) external returns (address);

    function setStakeTONFactory(address _stakeTONFactory)
        external;

    function setStakeStableCoinFactory(address _stakeStableCoinFactory)
        external;
}
