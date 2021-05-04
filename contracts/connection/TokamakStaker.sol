// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
//import { IERC20 } from "../interfaces/IERC20.sol";
import { ITON } from "../interfaces/ITON.sol";
import { IDepositManager } from "../interfaces/IDepositManager.sol";
import { ISeigManager } from "../interfaces/ISeigManager.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
//import { ERC165 } from "@openzeppelin/contracts/introspection/ERC165.sol";
import "../stake/Stake1Storage.sol";

/// @title The connector that integrates zkopru and tokamak
abstract contract TokamakStaker is Stake1Storage, AccessControl
{

    address public ton;
    address public wton;
    address public depositManager;
    address public seigManager;
    address public tokamakLayer2;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier nonZero(address _addr) {
        require(_addr != address(0), "Stake1Proxy: zero address");
        _;
    }
    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Stake1Proxy: Caller is not an admin");
        _;
    }

    function setTokamak(
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager
    )
        external onlyOwner
    {
        require(_ton != address(0) && _wton != address(0)
            && _depositManager != address(0) && _seigManager != address(0), "TokamakStaker: zero address");
        ton =  _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;
    }

    function setTON(
        address _ton
    )
        external onlyOwner
    {
        require(_ton != address(0) && ton != _ton, "TokamakStaker: zero address");
        ton =  _ton;
    }

    function tokamakStaking(
        address _layer2,
        uint256 _amount
    )
        external onlyOwner
    {
        require(ton != address(0) && wton != address(0) && depositManager != address(0)
            && seigManager != address(0) && _layer2 != address(0) && _amount > 0, "TokamakStaker: zero address");

        if (tokamakLayer2 == address(0)) tokamakLayer2 = _layer2;
        else {
            uint256 stakeOf = ISeigManager(seigManager).stakeOf(_layer2, address(this));
            if (stakeOf == 0) tokamakLayer2 = _layer2;
            else require(tokamakLayer2 == _layer2, "TokamakStaker: layer2 is different ");
        }

        //bytes memory data = abi.encodePacked(depositManager, _layer2);
        bytes memory data = abi.encode(depositManager, _layer2);
        require(ITON(ton).approveAndCall(wton, _amount, data), "TokamakStaker: approveAndCall fail");
    }

    function tokamakRequestUnStakingAll(
        address _layer2
    )
        public onlyOwner nonZero(depositManager)
    {
        require(tokamakLayer2 == _layer2, "TokamakStaker: layer2 is different ");

        IDepositManager(depositManager).requestWithdrawalAll(_layer2);
        tokamakLayer2 = address(0);
    }

    function tokamakRequestUnStaking(
        address _layer2,
        uint256 _amount
    )
        public onlyOwner
    {
        require(depositManager != address(0)
            && _layer2 == tokamakLayer2 && _amount > 0, "TokamakStaker: zero address");

        uint256 stakeOf = ISeigManager(seigManager).stakeOf(_layer2, address(this));
        require(stakeOf - _amount >= totalStakedAmount, "TokamakStaker: The withdrawal balance must maintain the principal funds.");
        IDepositManager(depositManager).requestWithdrawal(_layer2, _amount);
    }

    function tokamakProcessUnStaking(
        address _layer2,
        bool receiveTON
    )
        public onlyOwner
    {
        require(depositManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        IDepositManager(depositManager).processRequest(_layer2, receiveTON);
    }

    function tokamakPendingUnstaked(
        address _layer2
    )
        external view returns (uint256 wtonAmount)
    {
        require(depositManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        return IDepositManager(depositManager).pendingUnstaked(_layer2, address(this));
    }

    function tokamakAccStaked(
        address _layer2
    )
        external view returns (uint256 wtonAmount)
    {
        require(seigManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        return IDepositManager(depositManager).accStaked(_layer2, address(this));
    }

    function tokamakAccUnstaked(
        address _layer2
    )
        external view returns (uint256 wtonAmount)
    {
        require(seigManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        return IDepositManager(depositManager).accUnstaked(_layer2, address(this));
    }

    function tokamakStakeOf(
        address _layer2
    )
        external view returns (uint256 wtonAmount)
    {
        require(seigManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        return ISeigManager(seigManager).stakeOf(_layer2, address(this));
    }

    /*
    function tokenTransfer(
        address to,
        uint256 amount
    )
        public onlyOwner
    {
        IERC20(ton).transfer(to, amount);
    }
    */
}
