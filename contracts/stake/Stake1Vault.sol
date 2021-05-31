//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import {IFLD} from "../interfaces/IFLD.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IStake1Vault.sol";
import "../interfaces/IStake1.sol";
import "../libraries/LibTokenStake1.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "./StakeVaultStorage.sol";

/// @title FLD Token's Vault - stores the fld for the period of time
/// @notice A vault is associated with the set of stake contracts.
/// Stake contracts can interact with the vault to claim fld tokens
contract Stake1Vault is StakeVaultStorage {
    using SafeMath for uint256;

    bytes32 public constant ZERO_HASH =
        0x0000000000000000000000000000000000000000000000000000000000000000;

    //////////////////////////////
    // Events
    //////////////////////////////
    event ClosedSale(uint256 amount);
    event ClaimedReward(address indexed from, address to, uint256 amount);

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    receive() external payable {}

    /// Initializes all variables
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
        require(info.startBlock == 0, "Stake1Vault: Already added");

        stakeAddresses.push(stakeContract);
        uint256 _endBlock = stakeStartBlock.add(periodBlocks);

        info.name = _name;
        info.startBlock = stakeStartBlock;
        info.endBlock = _endBlock;

        if (stakeEndBlock < _endBlock) stakeEndBlock = _endBlock;
        orderedEndBlocks.push(stakeEndBlock);
    }

    /// @dev Close sale
    function closeSale() external {
        require(saleClosed == false, "already closed");
        require(
            cap > 0 &&
                stakeStartBlock > 0 &&
                stakeStartBlock < stakeEndBlock &&
                block.number > stakeStartBlock,
            "closeSale init fail"
        );
        require(stakeAddresses.length > 0, "no stakes");

        realEndBlock = stakeEndBlock;

        // check balance, update balance
        for (uint256 i = 0; i < stakeAddresses.length; i++) {
            LibTokenStake1.StakeInfo storage stakeInfo =
                stakeInfos[stakeAddresses[i]];
            if (paytoken == address(0)) {
                stakeInfo.balance = address(uint160(stakeAddresses[i])).balance;
            } else {
                (bool success, bytes memory returnData) =
                    paytoken.call(
                        abi.encodeWithSignature(
                            "balanceOf(address)",
                            stakeAddresses[i]
                        )
                    );
                require(success, "balance call fail");
                uint256 balanceAmount = abi.decode(returnData, (uint256));
                stakeInfo.balance = balanceAmount;
            }
            if (stakeInfo.balance > 0)
                realEndBlock = stakeInfos[stakeAddresses[i]].endBlock;
        }

        blockTotalReward = cap.div(realEndBlock.sub(stakeStartBlock));

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
                    total = total.add(stakeInfos[stakeAddresses[j]].balance);
                }
            }

            if (totalcheck.endBlock <= realEndBlock) {
                stakeEndBlockTotal[totalcheck.endBlock] = total;

                sum = sum.add(total);

                // reward total
                uint256 totalReward = 0;
                for (uint256 k = i; k > 0; k--) {
                    if (
                        stakeEndBlockTotal[
                            stakeInfos[stakeAddresses[k]].endBlock
                        ] > 0
                    ) {
                        totalReward = totalReward.add(
                            stakeInfos[stakeAddresses[k]]
                                .endBlock
                                .sub(stakeInfos[stakeAddresses[k - 1]].endBlock)
                                .mul(blockTotalReward)
                                .mul(totalcheck.balance)
                                .div(
                                stakeEndBlockTotal[
                                    stakeInfos[stakeAddresses[k]].endBlock
                                ]
                            )
                        );
                    }
                }

                if (
                    stakeEndBlockTotal[stakeInfos[stakeAddresses[0]].endBlock] >
                    0
                ) {
                    totalReward = totalReward.add(
                        stakeInfos[stakeAddresses[0]]
                            .endBlock
                            .sub(stakeInfos[stakeAddresses[0]].startBlock)
                            .mul(blockTotalReward)
                            .mul(totalcheck.balance)
                            .div(
                            stakeEndBlockTotal[
                                stakeInfos[stakeAddresses[0]].endBlock
                            ]
                        )
                    );
                }
                totalcheck.totalRewardAmount = totalReward;
            }
        }

        saleClosed = true;
        emit ClosedSale(sum);
    }

    /// @dev
    /// sender is a staking contract.
    /// A function that pays the amount(_amount) to _to by the staking contract.
    /// A function that _to claim the amount(_amount) from the staking contract and gets the FLD in the vault.
    function claim(address _to, uint256 _amount) external returns (bool) {
        require(saleClosed && _amount > 0, "disclose sale");
        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "not enough balance");

        LibTokenStake1.StakeInfo storage stakeInfo = stakeInfos[msg.sender];
        require(stakeInfo.startBlock > 0, "zero");
        require(stakeInfo.totalRewardAmount > 0, "totalRewardAmount is zero");
        require(
            stakeInfo.totalRewardAmount >=
                stakeInfo.claimRewardAmount.add(_amount),
            "claim amount exceeds"
        );

        stakeInfo.claimRewardAmount = stakeInfo.claimRewardAmount.add(_amount);

        require(fld.transfer(_to, _amount), "FLD transfer fail");

        emit ClaimedReward(msg.sender, _to, _amount);
        return true;
    }

    /// @dev How much you can claim
    function canClaim(address _to, uint256 _amount)
        external
        view
        returns (uint256)
    {
        require(saleClosed, "disclose");
        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "not enough");

        LibTokenStake1.StakeInfo storage stakeInfo = stakeInfos[_to];
        require(stakeInfo.startBlock > 0, "startBlock is zero");

        require(stakeInfo.totalRewardAmount > 0, "amount is wrong");
        require(
            stakeInfo.totalRewardAmount >=
                stakeInfo.claimRewardAmount.add(_amount),
            "amount exceeds"
        );

        return stakeInfo.totalRewardAmount;
    }

    /// @dev Returns the FLD balance stored in the vault
    function balanceFLDAvailableAmount() external view returns (uint256) {
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

    /// @dev Total reward amount of stakeContract
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
