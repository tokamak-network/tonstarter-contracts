//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import { IFLDVault } from "../interfaces/IFLDVault.sol";
import { IFLD } from "../interfaces/IFLD.sol";
import { IERC20 } from "../interfaces/IERC20.sol";

contract FLDVault is  IFLDVault , AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant CLAIMER_ROLE = keccak256("CLAIMER");

    IFLD public fld;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "FLDVault: Caller is not an admin");
        _;
    }

    modifier onlyClaimer() {
        require(hasRole(CLAIMER_ROLE, msg.sender), "FLDVault: Caller is not a claimer");
        _;
    }

    //////////////////////////////
    // Events
    //////////////////////////////

    event ClaimedFLD(address indexed from, address indexed to, uint256 amount);
    event ClaimedToken(address indexed token, address indexed from, address indexed to, uint256 amount);
    event Approved(address indexed token, address indexed to, uint256 amount);

    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);

        _setRoleAdmin(CLAIMER_ROLE, ADMIN_ROLE);
        _setupRole(CLAIMER_ROLE, msg.sender);
    }


    receive() external payable {

    }

    function setFLD(address _fld) external override onlyOwner {
        require(_fld != address(0), "FLDVault: input is zero");
        fld = IFLD(_fld);
    }

    function approveFLD(address _to, uint256 _amount) external override onlyClaimer {
        fld.approve(_to, _amount);
        emit Approved(address(fld), _to, _amount);
    }

    /// @notice Approves ERC20 token to specific address
    /// @param _token Token address
    /// @param _to Address to be approved
    /// @param _amount Approving ERC20 token amount
    function approveERC20(address _token, address _to, uint256 _amount) external override onlyClaimer {
        IERC20(_token).approve(_to, _amount);
        emit Approved(address(_token), _to, _amount);
    }

    function claimFLDAvailableAmount()
        external
        view
        onlyClaimer
        returns (uint256)
    {
        return  fld.balanceOf(address(this));
    }


    function claimFLD(address _to, uint256 _amount)
        external
        override
        onlyClaimer
        returns (bool)
    {
        uint256 fldBalance = fld.balanceOf(address(this));
        require(fldBalance >= _amount, "FLDVault: not enough balance");

        fld.transfer(_to, _amount);
        emit ClaimedFLD(msg.sender, _to, _amount);
        return true;
    }

    /// @notice Transfers ERC20 token to specific address
    /// @param _to Address to receive
    /// @param _amount Transfer ERC20 token amount
    function claimERC20(address _token, address _to, uint256 _amount)
        external
        override
        onlyClaimer
    {
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "FLDVault: not enough balance");
        IERC20(_token).transfer(_to, _amount);
        emit ClaimedToken(_token, msg.sender, _to, _amount);
    }

    function _toRAY(uint256 v) internal pure returns (uint256) {
        return v * 10 ** 9;
    }

    function _toWAD(uint256 v) internal pure returns (uint256) {
        return v / 10 ** 9;
    }
}
