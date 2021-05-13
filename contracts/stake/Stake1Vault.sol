//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenStake1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import {IFLD} from "../interfaces/IFLD.sol";
//import { IERC20 } from "../interfaces/IERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IStake1} from "../interfaces/IStake1.sol";
import "../interfaces/IStake1Vault.sol";

/// @title FLD Token's Vault - stores the fld for the period of time
/// @notice A vault is associated with the set of stake contracts.
/// Stake contracts can interact with the vault to claim fld tokens
contract Stake1Vault is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER");
    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    //address payable public self;

    IFLD public fld;
    address public paytoken;
    uint256 public cap;
    uint256 public saleStartBlock;
    uint256 public stakeStartBlock;
    uint256 public stakeEndBlock;
    uint256 public blockTotalReward;
    bool public saleClosed;
    uint256 public stakeType; // 0 : Stake1 ( eth or ton) , 2 : stable coin
    address public defiAddr; // uniswapRouter or yraenV2Vault

    address[] public stakeAddresses;
    mapping(address => LibTokenStake1.StakeInfo) public stakeInfos;

    uint256[] public orderedEndBlocks;
    mapping(uint256 => uint256) public stakeEndBlockTotal;

    //mapping(bytes32 => uint) private lock;
    uint256 private _lock;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Stake1Vault: Caller is not an admin"
        );
        _;
    }

    modifier onlyManager() {
        require(
            hasRole(MANAGER_ROLE, msg.sender),
            "Stake1Vault: Caller is not a manager"
        );
        _;
    }

    modifier onlyClaimer() {
        require(
            hasRole(CLAIMER_ROLE, msg.sender),
            "Stake1Vault: Caller is not a claimer"
        );
        _;
    }

    modifier lock() {
        require(_lock == 0, "Stake1Vault: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    //////////////////////////////
    // Events
    //////////////////////////////
    event ClosedSale(uint256 amount);
    event ClaimReward(address indexed from, address to, uint256 amount);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CLAIMER_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(CLAIMER_ROLE, msg.sender);
    }

    receive() external payable {}

    /// @dev Initializes all variables
    /// @param _fld - FLD token address
    /// @param _paytoken - Tokens staked by users, can be used as ERC20 tokens.
    //                     (In case of ETH, input address(0))
    /// @param _cap - Maximum amount of rewards issued
    /// @param _saleStartBlock - Sales start block
    /// @param _stakeStartBlock - Staking start block
    /// @param _stakefactory - factory address to create stakeContract
    /// @param _stakeType - if paytokein is stable coin, it is true.
    function initialize(
        address _fld,
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlock,
        uint256 _stakeStartBlock,
        address _stakefactory,
        uint256 _stakeType,
        address _defiAddr
    ) external onlyOwner {
        require(
            _fld != address(0) && _stakefactory != address(0),
            "Stake1Vault: input is zero"
        );
        require(_cap > 0, "Stake1Vault: _cap is zero");
        require(
            _saleStartBlock < _stakeStartBlock && _stakeStartBlock > 0,
            "Stake1Vault: startBlock is unavailable"
        );

        fld = IFLD(_fld);
        cap = _cap;
        paytoken = _paytoken;
        saleStartBlock = _saleStartBlock;
        stakeStartBlock = _stakeStartBlock;
        stakeType = _stakeType;
        defiAddr = _defiAddr;

        grantRole(ADMIN_ROLE, _stakefactory);
    }

    /// @dev Sets FLD address
    function setFLD(address _fld) external onlyOwner {
        require(_fld != address(0), "Stake1Vault: input is zero");
        fld = IFLD(_fld);
    }

    /// @dev Change cap of the vault
    function changeCap(uint256 _cap) external onlyOwner {
        require(_cap > 0 && cap != _cap, "Stake1Vault: changeCap fails");
        cap = _cap;
    }

    /// @dev Change orders
    function changeOrderedEndBlocks(uint256[] memory _ordered)
        external
        onlyOwner
    {
        // solhint-disable-next-line max-line-length
        require(
            stakeEndBlock < block.number &&
                orderedEndBlocks.length > 0 &&
                orderedEndBlocks.length == _ordered.length,
            "Stake1Vault: changeOrderedEndBlocks fails"
        );
        orderedEndBlocks = _ordered;
    }

    /// @dev Set Defi Address
    function setDefiAddr(address _defiAddr) external onlyOwner {
        require(
            _defiAddr != address(0) && defiAddr != _defiAddr,
            "Stake1Vault: _defiAddr is zero"
        );
        defiAddr = _defiAddr;
    }

    /// @dev Add stake contract
    function addSubVaultOfStake(
        string memory _name,
        address stakeContract,
        uint256 periodBlocks
    ) external onlyOwner {
        require(
            stakeContract != address(0) && cap > 0 && periodBlocks > 0,
            "Stake1Vault: addStakerInVault init fails"
        );
        require(
            block.number < stakeStartBlock,
            "Stake1Vault: Already started stake"
        );
        require(saleClosed == false, "Stake1Vault: closed sale");
        require(
            paytoken == IStake1(stakeContract).paytoken(),
            "Different paytoken"
        );

        LibTokenStake1.StakeInfo storage info = stakeInfos[stakeContract];
        require(info.startBlcok == 0, "Stake1Vault: Already added");

        stakeAddresses.push(stakeContract);
        uint256 _endBlock = stakeStartBlock + periodBlocks;

        info.name = _name;
        info.startBlcok = stakeStartBlock;
        info.endBlock = _endBlock;

        if (stakeEndBlock < _endBlock) stakeEndBlock = _endBlock;
        orderedEndBlocks.push(stakeEndBlock);
    }

    /// @dev Close sale
    function closeSale() external {
        require(saleClosed == false, "Stake1Vault: sale is already closed");
        require(
            cap > 0 &&
                stakeStartBlock > 0 &&
                stakeStartBlock < stakeEndBlock &&
                block.number > stakeStartBlock &&
                block.number < stakeEndBlock,
            "Stake1Vault: closeSale init fail"
        );
        require(stakeAddresses.length > 0, "Stake1Vault: no stakes");
        blockTotalReward = cap / (stakeEndBlock - stakeStartBlock);

        // update balance
        for (uint256 i = 0; i < stakeAddresses.length; i++) {
            address stake = stakeAddresses[i];
            LibTokenStake1.StakeInfo storage stakeInfo = stakeInfos[stake];
            if (paytoken == address(0)) {
                stakeInfo.balance = address(uint160(stake)).balance;
            } else {
                stakeInfo.balance = IERC20(paytoken).balanceOf(stake);
            }
        }
        uint256 sum = 0;
        // update total
        for (uint256 i = 0; i < stakeAddresses.length; i++) {
            LibTokenStake1.StakeInfo storage totalcheck =
                stakeInfos[stakeAddresses[i]];
            uint256 total = 0;
            for (uint256 j = 0; j < stakeAddresses.length; j++) {
                if (
                    stakeInfos[stakeAddresses[j]].endBlock >=
                    totalcheck.endBlock
                ) {
                    total += stakeInfos[stakeAddresses[j]].balance;
                }
            }
            stakeEndBlockTotal[totalcheck.endBlock] = total;
            sum += total;

            // reward total
            uint256 totalReward = 0;
            for (uint256 k = i; k > 0; k--) {
                totalReward +=
                    ((stakeInfos[stakeAddresses[k]].endBlock -
                        stakeInfos[stakeAddresses[k - 1]].endBlock) *
                        blockTotalReward *
                        totalcheck.balance) /
                    stakeEndBlockTotal[stakeInfos[stakeAddresses[k]].endBlock];
            }
            totalReward +=
                ((stakeInfos[stakeAddresses[0]].endBlock -
                    stakeInfos[stakeAddresses[0]].startBlcok) *
                    blockTotalReward *
                    totalcheck.balance) /
                stakeEndBlockTotal[stakeInfos[stakeAddresses[0]].endBlock];

            totalcheck.totalRewardAmount = totalReward;
        }

        saleClosed = true;
        emit ClosedSale(sum);
    }

    /// @dev
    /// sender is a staking contract.
    /// A function that pays the amount(_amount) to _to by the staking contract.
    /// A function that _to claim the amount(_amount) from the staking contract and gets the FLD in the vault.
    function claim(address _to, uint256 _amount) external returns (bool) {
        require(saleClosed && _amount > 0, "Stake1Vault: disclose sale");
        uint256 fldBalance = fld.balanceOf(address(this));
        require(
            fldBalance >= _amount,
            "Stake1Vault: claimVault: not enough balance"
        );

        LibTokenStake1.StakeInfo storage stakeInfo = stakeInfos[msg.sender];
        require(
            stakeInfo.startBlcok > 0,
            "Stake1Vault: claimVault startBlcok is zero"
        );
        require(
            stakeInfo.totalRewardAmount >=
                stakeInfo.claimRewardAmount + _amount,
            "Stake1Vault: claim amount exceeds the reward left"
        );
        require(
            stakeInfo.totalRewardAmount > 0 &&
                (stakeInfo.totalRewardAmount -
                    stakeInfo.claimRewardAmount -
                    _amount) >
                0,
            "Stake1Vault: claim amount is wrong"
        );

        stakeInfo.claimRewardAmount += _amount;

        require(fld.transfer(_to, _amount), "Stake1Vault: FLD transfer fail");

        emit ClaimReward(msg.sender, _to, _amount);
        return true;
    }

    /// @dev How much you can claim
    function canClaim(address _to, uint256 _amount)
        external
        view
        returns (uint256)
    {
        require(saleClosed, "Stake1Vault: disclose sale");
        uint256 fldBalance = fld.balanceOf(address(this));
        require(
            fldBalance >= _amount,
            "Stake1Vault: claimVault: not enough balance"
        );

        LibTokenStake1.StakeInfo storage stakeInfo = stakeInfos[_to];
        require(
            stakeInfo.startBlcok > 0,
            "Stake1Vault: claimVault startBlcok is zero"
        );

        require(
            stakeInfo.totalRewardAmount > 0,
            "Stake1Vault: claim amount is wrong"
        );
        require(
            stakeInfo.totalRewardAmount >=
                stakeInfo.claimRewardAmount + _amount,
            "Stake1Vault: claim amount exceeds the reward left"
        );
        require(
            stakeInfo.totalRewardAmount -
                stakeInfo.claimRewardAmount -
                _amount >
                0,
            "Stake1Vault: wrong"
        );
        return stakeInfo.totalRewardAmount;
    }

    /// @dev Returns the FLD balance stored in the vault
    function balanceFLDAvailableAmount()
        external
        view
        returns (
            // onlyClaimer
            uint256
        )
    {
        return fld.balanceOf(address(this));
    }

    /// @dev Returns all addresses
    function stakeAddressesAll() external view returns (address[] memory) {
        return stakeAddresses;
    }

    /// @dev Ordered end blocks
    function orderedEndBlocksAll() external view returns (uint256[] memory) {
        return orderedEndBlocks;
    }

    /// @dev Total reward amount
    function totalRewardAmount(address _account)
        external
        view
        returns (uint256)
    {
        return stakeInfos[_account].totalRewardAmount;
    }

    /// @dev Returns info
    function infos()
        external
        view
        returns (
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        return (
            paytoken,
            cap,
            saleStartBlock,
            stakeStartBlock,
            stakeEndBlock,
            blockTotalReward,
            saleClosed
        );
    }
}
