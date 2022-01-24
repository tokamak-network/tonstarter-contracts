//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IPrivateSale {
    /// @dev calculator the SaleAmount(input TON how many get the anotherToken)
    /// @param _amount input the TON amount
    function calculSaleToken(uint256 _amount) external view returns (uint256);

    /// @dev calculator the getAmount(want to get _amount how many input the TON?)
    /// @param _amount input the anotherTokenAmount
    function calculGetToken(uint256 _amount) external view returns (uint256);
    
    
    /// @dev address setting
    /// @param _saleToken saleTokenAddress (contract have token)
    /// @param _getToken getTokenAddress (TON)
    /// @param _ownerToken get TON transfer to wallet
    function addressSetting(
        address _saleToken,
        address _getToken,
        address _ownerToken
    ) external;

    function changeWTONAddress(address _wton) external;

    function changeTokenAddress(address _saleToken, address _getToken) external;

    function changeGetAddress(address _address) external;

    function settingAll(
        uint256[4] calldata _time,
        uint256 _saleTokenPrice,
        uint256 _getTokenPrice
    ) external;

    function settingPrivateTime(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _firstTime,
        uint256 _claimTime
    ) external;

    function settingSaleTime(uint256 _startTime,uint256 _endTime) external;

    function settingFirstClaimTime(uint256 _claimTime) external;

    function settingClaimTime(uint256 _time) external;
    
    function claimAmount(
        address _account
    ) external view returns (uint256);

    function addWhiteList(address _account,uint256 _amount) external;

    function addWhiteListArray(address[] calldata _account, uint256[] calldata _amount) external;

    function delWhiteList(address _account, uint256 _amount) external;

    function buy(
        address _sender,
        uint256 _amount
    ) external;

    function claim() external;

    function _decodeApproveData(
        bytes memory data
    ) external pure returns (uint256 approveData);

    function _toWAD(uint256 v) external pure returns (uint256);

}
