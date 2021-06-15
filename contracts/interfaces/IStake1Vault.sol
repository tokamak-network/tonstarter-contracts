//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;
import "../libraries/LibTokenStake1.sol";

interface IStake1Vault {
    /// @dev Initializes all variables
    /// @param _tos  TOS token address
    /// @param _paytoken  Tokens staked by users, can be used as ERC20 tokens.
    //                     (In case of ETH, input address(0))
    /// @param _cap  Maximum amount of rewards issued, allocated reward amount.
    /// @param _saleStartBlock  the sale start block
    /// @param _stakeStartBlock  the staking start block
    /// @param _stakefactory the factory address to create stakeContract
    /// @param _stakeType  Type of staking contract, 0 TON staking, 1 basic ERC20 staking, 2 Defi linked staking
    /// @param _defiAddr Used when an external address is required. default: address(0)
    function initialize(
        address _tos,
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        address _stakefactory,
        uint256 _stakeType,
        address _defiAddr
    ) external;

    /// @dev Sets TOS address
    /// @param _tos  TOS address
    function setTOS(address _tos) external;

    /// @dev Change cap of the vault
    /// @param _cap  allocated reward amount
    function changeCap(uint256 _cap) external;

    /// @dev Set Defi Address
    /// @param _defiAddr DeFi related address
    function setDefiAddr(address _defiAddr) external;

    /// @dev  Add stake contract
    /// @param _name stakeContract's name
    /// @param stakeContract stakeContract's address
    /// @param periodBlocks the period that give rewards of stakeContract
    function addSubVaultOfStake(
        string memory _name,
        address stakeContract,
        uint256 periodBlocks
    ) external;

    /// @dev  Close the sale that can stake by user
    function closeSale() external;

    /// @dev claim function.
    /// @dev sender is a staking contract.
    /// @dev A function that pays the amount(_amount) to _to by the staking contract.
    /// @dev A function that _to claim the amount(_amount) from the staking contract and gets the TOS in the vault.
    /// @param _to a user that received reward
    /// @param _amount the receiving amount
    /// @return true
    function claim(address _to, uint256 _amount) external returns (bool);

    /// @dev whether it is available to claim amount, if it is available , return the total reward amount
    /// @param _to  a staking contract.
    /// @param _amount the total reward amount of stakeContract
    /// @return true
    function canClaim(address _to, uint256 _amount)
        external
        view
        returns (bool);

    /// @dev Give the infomation of this vault
    /// @return paytoken, cap, saleStartBlock, stakeStartBlock, stakeEndBlock, blockTotalReward, saleClosed
    function infos()
        external
        view
        returns (
            address[2] memory,
            uint256,
            uint256,
            uint256[3] memory,
            uint256,
            bool
        );

    /// @dev Returns Give the TOS balance stored in the vault
    /// @return the balance of TOS in this vault.
    function balanceTOSAvailableAmount() external view returns (uint256);

    /// @dev Give Total reward amount of stakeContract(_account)
    /// @return Total reward amount of stakeContract(_account)
    function totalRewardAmount(address _account)
        external
        view
        returns (uint256);

    /// @dev Give all stakeContracts's addresses in this vault
    /// @return all stakeContracts's addresses
    function stakeAddressesAll() external view returns (address[] memory);

    /// @dev Give the ordered end blocks of stakeContracts in this vault
    /// @return the ordered end blocks
    function orderedEndBlocksAll() external view returns (uint256[] memory);
}
