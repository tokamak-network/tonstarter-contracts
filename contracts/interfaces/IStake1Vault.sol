//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;
import "../libraries/LibTokenStake1.sol";

interface IStake1Vault {
    function initialize(
        address _fld,
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock
    ) external;

    /// @dev Sets the FLD address
    function setFLD(address _ton) external;

    /// @dev Changes the cap of vault.
    function changeCap(uint256 _cap) external;

    function addSubVaultOfStake(
        string memory _name,
        address stakeContract,
        uint256 periodBlocks
    ) external;

    function closeSale() external;

    function claim(address _to, uint256 _amount) external returns (bool);

    function canClaim(address _to, uint256 _amount)
        external
        view
        returns (uint256);

    function totalRewardAmount(address _account)
        external
        view
        returns (uint256);

    function stakeAddressesAll() external view returns (address[] memory);

    function orderedEndBlocksAll() external view returns (uint256[] memory);

    function fld() external view returns (address);

    function paytoken() external view returns (address);

    function cap() external view returns (uint256);

    function stakeType() external view returns (uint256);

    function defiAddr() external view returns (address);

    function saleStartBlock() external view returns (uint256);

    function stakeStartBlock() external view returns (uint256);

    function stakeEndBlock() external view returns (uint256);

    function blockTotalReward() external view returns (uint256);

    function saleClosed() external view returns (bool);

    function stakeEndBlockTotal(uint256 endblock)
        external
        view
        returns (uint256 totalStakedAmount);
}
