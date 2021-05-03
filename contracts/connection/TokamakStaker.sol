// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
//import { IERC20 } from "../interfaces/IERC20.sol";
import { ITON } from "../interfaces/ITON.sol";
import { IDepositManager } from "../interfaces/IDepositManager.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
//import { ERC165 } from "@openzeppelin/contracts/introspection/ERC165.sol";



/// @title The connector that integrates zkopru and tokamak
abstract contract TokamakStaker is AccessControl
{

    address public ton;
    address public wton;
    address public depositManager;

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
        address _depositManager
    )
        external onlyOwner
    {
        require(_ton != address(0) && _wton != address(0) && _depositManager != address(0), "TokamakStaker: zero address");
        ton =  _ton;
        wton = _wton;
        depositManager = _depositManager;
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
        public onlyOwner
    {
        require(ton != address(0) && wton != address(0) && depositManager != address(0)
            && _layer2 != address(0) && _amount > 0, "TokamakStaker: zero address");

        bytes memory data = abi.encodePacked(depositManager, _layer2, _amount);
        ITON(ton).approveAndCall(wton, _amount, data);
    }

    function tokamakRequestUnStakingAll(
        address _layer2
    )
        public onlyOwner
    {
        require(depositManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        IDepositManager(depositManager).requestWithdrawalAll(_layer2);
    }

    function tokamakRequestUnStaking(
        address _layer2,
        uint256 _amount
    )
        public onlyOwner
    {
        require(depositManager != address(0)
            && _layer2 != address(0) && _amount > 0, "TokamakStaker: zero address");
        IDepositManager(depositManager).requestWithdrawal(_layer2,_amount);
    }

    function tokamakProcessUnStaking(
        address _layer2,
        bool receiveTON
    )
        public onlyOwner
    {
        require(depositManager != address(0) && _layer2 != address(0), "TokamakStaker: zero address");
        IDepositManager(depositManager).processRequest(_layer2,receiveTON);
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
