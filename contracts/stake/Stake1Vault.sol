//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../libraries/LibTokenStake1.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import { IFLD } from "../interfaces/IFLD.sol";
//import { IERC20 } from "../interfaces/IERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IFLDVault } from "../interfaces/IFLDVault.sol";
import { IStake1 } from "../interfaces/IStake1.sol";
/**
FLD Token's Vault
*/
contract Stake1Vault is  AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER");
    bytes32 public constant ZERO_HASH = 0x0000000000000000000000000000000000000000000000000000000000000000;

    //address payable public self;

    IFLD public fld;
    address public paytoken;
    uint256 public cap;
    uint256 public saleStartBlock;
    uint256 public stakeStartBlock;
    uint256 public stakeEndBlock;
    uint256 public blockTotalReward;
    bool public saleClosed;

    address[] public stakeAddresses;
    mapping(address => LibTokenStake1.stakeInfo) public stakeInfos;

    uint256[] public orderedEndBlocks;
    mapping(uint256 => uint256) public stakeEndBlockTotal;

    //mapping(bytes32 => uint) private lock;
    uint private _lock;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Stake1Vault: Caller is not an admin");
        _;
    }
    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, msg.sender), "Stake1Vault: Caller is not a manager");
        _;
    }

    modifier onlyClaimer() {
        require(hasRole(CLAIMER_ROLE, msg.sender), "Stake1Vault: Caller is not a claimer");
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

    event ClaimReward(address indexed from, address to, uint256 amount);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(CLAIMER_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(CLAIMER_ROLE, msg.sender);
    }

    receive() external payable {
    }

    function initialize(
        address _fld,
        address _paytoken,
        uint256 _cap,
        uint256 _saleStartBlcok,
        uint256 _stakeStartBlcok,
        address _stakefactory
    ) external  onlyOwner {
        require(_fld != address(0) && _stakefactory != address(0), "Stake1Vault: input is zero");
        require(_cap > 0 , "Stake1Vault: _cap is zero");
        require(_saleStartBlcok < _stakeStartBlcok && _stakeStartBlcok > 0 , "Stake1Vault: startBlock is unavailable");

        //self = address(uint160(address(this)));
        fld = IFLD(_fld);
        cap = _cap;
        paytoken = _paytoken;
        saleStartBlock = _saleStartBlcok;
        stakeStartBlock = _stakeStartBlcok;

        grantRole(ADMIN_ROLE, _stakefactory);
    }

    /**
    * Set the FLD address.
    */
    function setFLD(address _fld) external  onlyOwner {
        require(_fld != address(0), "Stake1Vault: input is zero");
        fld = IFLD(_fld);

    }
    /**
    * change the cap of vault.
    */
    function changeCap(uint256 _cap) external  onlyOwner {
        require(_cap > 0 && cap != _cap , "Stake1Vault: changeCap fails");
        cap = _cap;
    }

    function changeOrderedEndBlocks(uint256[] memory _ordered) external  onlyOwner {
        require(stakeEndBlock < block.number && orderedEndBlocks.length > 0 && orderedEndBlocks.length == _ordered.length , "Stake1Vault: changeOrderedEndBlocks fails");
        orderedEndBlocks = _ordered;
    }

    /**
    * add Stake Contract
    */
    function addSubVaultOfStake(
        string memory _name,
        address stakeContract,
        uint256 periodBlocks
    )
        external  onlyOwner
    {
        require(stakeContract != address(0) && cap > 0  && periodBlocks > 0 , "Stake1Vault: addStakerInVault init fails");
        require(block.number < stakeStartBlock, "Stake1Vault: Already started stake" ) ;
        require(saleClosed == false , "Stake1Vault: closed sale" ) ;
        require(paytoken == IStake1(stakeContract).paytoken(), "Different paytoken");

        LibTokenStake1.stakeInfo storage info = stakeInfos[stakeContract];
        require(info.startBlcok == 0, "Stake1Vault: Already added" ) ;

        stakeAddresses.push(stakeContract);
        uint256 _endBlock = stakeStartBlock + periodBlocks;

        info.name = _name;
        info.startBlcok = stakeStartBlock;
        info.endBlock = _endBlock;

        if(stakeEndBlock < _endBlock) stakeEndBlock = _endBlock;
        orderedEndBlocks.push(stakeEndBlock);
    }

    /**
    * close Sale ,
    */
    function closeSale()
        external
    {
        require(cap > 0 && stakeStartBlock > 0 && stakeEndBlock > 0 && stakeStartBlock < stakeEndBlock
            && block.number < stakeEndBlock, "Stake1Vault: closeSale init fail");
        require(stakeAddresses.length > 0, "Stake1Vault: no stakes");
        blockTotalReward = cap / (stakeEndBlock - stakeStartBlock);
        // update balance
        for(uint i = 0; i < stakeAddresses.length; i++){
            address stake = stakeAddresses[i];
            LibTokenStake1.stakeInfo storage stakeInfo = stakeInfos[stake];
            if(paytoken == address(0)) {
                stakeInfo.balance = address(uint160(stake)).balance;
            } else {
                stakeInfo.balance = IERC20(paytoken).balanceOf(stake);
            }
        }

        // update total
        for(uint i1 = 0; i1 < stakeAddresses.length; i1++){
            LibTokenStake1.stakeInfo storage totalcheck = stakeInfos[stakeAddresses[i1]];
            uint256 total = 0;
            for(uint j = 0; j < stakeAddresses.length; j++){
                if (stakeInfos[stakeAddresses[j]].endBlock >= totalcheck.endBlock){
                    total += stakeInfos[stakeAddresses[j]].balance;
                }
            }
            stakeEndBlockTotal[totalcheck.endBlock] = total;

            // reward total
            uint256 totalReward = 0;
            for(uint k = i1; k > 0; k--){
                totalReward += (stakeInfos[stakeAddresses[k]].endBlock - stakeInfos[stakeAddresses[k-1]].endBlock) * blockTotalReward * totalcheck.balance /  stakeEndBlockTotal[stakeInfos[stakeAddresses[k]].endBlock];
            }
            totalReward += (stakeInfos[stakeAddresses[0]].endBlock - stakeInfos[stakeAddresses[0]].startBlcok) * blockTotalReward * totalcheck.balance /  stakeEndBlockTotal[stakeInfos[stakeAddresses[0]].endBlock];

            totalcheck.totalRewardAmount = totalReward;
        }

        saleClosed = true;
    }

    /**
    * The sender approves spender(_to) to spend sender's  tokens(_token) in the amount(_amount).
    */
    function claim(address _to, uint256 _amount)
        external
        returns (bool )
    {
        require(saleClosed && _amount > 0 , "Stake1Vault: disclose sale");
        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "Stake1Vault: claimVault: not enough balance");

        LibTokenStake1.stakeInfo storage stakeInfo = stakeInfos[msg.sender];
        require(stakeInfo.startBlcok > 0, "Stake1Vault: claimVault startBlcok is zero");
        require(stakeInfo.totalRewardAmount > 0
            && (stakeInfo.totalRewardAmount - stakeInfo.claimRewardAmount - _amount) > 0 , "Stake1Vault: claim amount is wrong");

        stakeInfo.claimRewardAmount += _amount;

        require(fld.transfer(_to, _amount), "Stake1Vault: FLD transfer fail");

        emit ClaimReward(msg.sender, _to, _amount);
        return true;
    }

    function canClaim(address _to, uint256 _amount)
        external view
        returns (uint256 )
    {
        require(saleClosed, "Stake1Vault: disclose sale");
        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "Stake1Vault: claimVault: not enough balance");

        LibTokenStake1.stakeInfo storage stakeInfo = stakeInfos[_to];
        require(stakeInfo.startBlcok > 0, "Stake1Vault: claimVault startBlcok is zero");
        require(stakeInfo.totalRewardAmount > 0
            && (stakeInfo.totalRewardAmount - stakeInfo.claimRewardAmount - _amount) > 0 , "Stake1Vault: claim amount is wrong");

        return stakeInfo.totalRewardAmount;
    }


    /**
    * Returns the FLD balance stored in the vault.
    */
    function balanceFLDAvailableAmount()
        external
        view
        onlyClaimer
        returns (uint256)
    {
        return  fld.balanceOf(address(this));
    }

    function stakeAddressesAll()
        external view
        returns (address[] memory)
    {
        return stakeAddresses;
    }
    function orderedEndBlocksAll()
        external view
        returns (uint256[] memory)
    {
        return orderedEndBlocks;
    }

    function totalRewardAmount(address _account)
        external view
        returns (uint256 )
    {
        return stakeInfos[_account].totalRewardAmount;
    }

    function infos()
        external view
        returns
        (address, uint256, uint256,
        uint256, uint256, uint256, bool)
    {
        return (paytoken, cap, saleStartBlock, stakeStartBlock, stakeEndBlock, blockTotalReward, saleClosed);
    }

}
