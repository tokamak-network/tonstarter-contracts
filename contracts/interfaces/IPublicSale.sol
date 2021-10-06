//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPublicSale {

    function setSnapshot(uint256 _snapshot) external;

    function setExclusiveTime(
        uint256 _startAddWhiteTime,
        uint256 _endAddWhiteTime,
        uint256 _startExclusiveTime,
        uint256 _endExclusiveTime
    ) external;

    function setOpenTime(
        uint256 _startDepositTime,
        uint256 _endDepositTime,
        uint256 _startOpenSaleTime,
        uint256 _endOpenSaleTime
    ) external;

    function setClaim(
        uint256 _startClaimTime,
        uint256 _claimInterval,
        uint256 _claimPeriod
    ) external;

    function setSaleAmount(uint256 _totalExpectSaleAmount, uint256 _totalExpectOpenSaleAmount)
        external;

    function setTier(uint256 _tier1, uint256 _tier2, uint256 _tier3, uint256 _tier4)
        external;

    function setTierPercents(uint256 _tier1, uint256 _tier2, uint256 _tier3, uint256 _tier4)
        external;

    function endExclusiveSale() external ;

    function setTokenPrice(uint256 _saleTokenPrice, uint256 _payTokenPrice)
        external;

    function calculSaleToken(uint256 _amount) external view returns(uint256);

    function calculPayToken(uint256 _amount) external view returns(uint256);

    function calculTier(address _address)
        external view
        returns(uint);

    function calculTierAmount(address _address) external view returns(uint256);

    function calculOpenSaleAmount(address _account, uint256 _amount) external view returns(uint256);

    function calculCalimAmount(
        address _account
    ) external view returns(uint256);

    function addWhiteList() external;

    function exclusiveSale(uint256 _amount) external;

    function deposit(uint256 _amount) external;

    function openSale() external;

    function claim() external;
}
