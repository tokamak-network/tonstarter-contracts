// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../interfaces/IPublicSaleProxy.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import "../common/AccessibleCommon.sol";
import "./PublicSaleStorage.sol";
import "../stake/ProxyBase.sol";

import { OnApprove } from "./OnApprove.sol";
import "../interfaces/IWTON.sol";
import "../interfaces/IPublicSale.sol";

contract PublicSaleProxy is
    PublicSaleStorage,
    AccessibleCommon,
    ProxyBase,
    OnApprove,
    IPublicSaleProxy
{
    event Upgraded(address indexed implementation);

    /// @dev constructor of PublicSaleProxy
    /// @param _impl the logic address of PublicSaleProxy
    constructor(address _impl) {
        assert(
            IMPLEMENTATION_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
        );

        require(_impl != address(0), "PublicSaleProxy: logic is zero");

        _setImplementation(_impl);

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Set pause state
    /// @param _pause true:pause or false:resume
    function setProxyPause(bool _pause) external override onlyOwner {
        pauseProxy = _pause;
    }

    /// @notice Set implementation contract
    /// @param impl New implementation contract address
    function upgradeTo(address impl) external override onlyOwner {
        require(impl != address(0), "PublicSaleProxy: input is zero");
        require(_implementation() != impl, "PublicSaleProxy: same");
        _setImplementation(impl);
        emit Upgraded(impl);
    }

    /// @dev returns the implementation
    function implementation() public override view returns (address) {
        return _implementation();
    }

    /// @dev receive ether
    receive() external payable {
        revert("cannot receive Ether");
    }

    /// @dev fallback function , execute on undefined function call
    fallback() external payable {
        _fallback();
    }

    /// @dev fallback function , execute on undefined function call
    function _fallback() internal {
        address _impl = _implementation();
        require(
            _impl != address(0) && !pauseProxy,
            "PublicSaleProxy: impl OR proxy is false"
        );

        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
                // delegatecall returns 0 on error.
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }

    /// @dev Initialize
    function initialize(
        address _saleTokenAddress,
        address _getTokenAddress,
        address _getTokenOwner,
        address _sTOS,
        address _wton
    ) external override onlyOwner {
        require(startAddWhiteTime == 0, "possible to setting the whiteTime before");
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        getTokenOwner = _getTokenOwner;
        sTOS = ILockTOS(_sTOS);
        wton = _wton;
    }

    function onApprove(
        address sender,
        address spender,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        require(msg.sender == address(getToken) || msg.sender == address(IWTON(wton)), "PublicSale: only accept TON and WTON approve callback");
        if(msg.sender == address(getToken)) {
            uint256 wtonAmount = IPublicSale(address(this))._decodeApproveData(data);
            if(wtonAmount == 0){
                if(block.timestamp >= startExclusiveTime && block.timestamp < endExclusiveTime) {
                    IPublicSale(address(this)).exclusiveSale(sender,amount);
                } else {
                    require(block.timestamp >= startDepositTime && block.timestamp < endDepositTime, "PublicSale: not SaleTime");
                    IPublicSale(address(this)).deposit(sender,amount);
                }
            } else {
                uint256 totalAmount = amount + wtonAmount;
                if(block.timestamp >= startExclusiveTime && block.timestamp < endExclusiveTime) {
                    IPublicSale(address(this)).exclusiveSale(sender,totalAmount);
                }
                else {
                    require(block.timestamp >= startDepositTime && block.timestamp < endDepositTime, "PublicSale: not SaleTime");
                    IPublicSale(address(this)).deposit(sender,totalAmount);
                }
            }
        } else if (msg.sender == address(IWTON(wton))) {
            uint256 wtonAmount = IPublicSale(address(this))._toWAD(amount);
            if(block.timestamp >= startExclusiveTime && block.timestamp < endExclusiveTime) {
                IPublicSale(address(this)).exclusiveSale(sender,wtonAmount);
            }
            else {
                require(block.timestamp >= startDepositTime && block.timestamp < endDepositTime, "PublicSale: not SaleTime");
                IPublicSale(address(this)).deposit(sender,wtonAmount);
            }
        }

        return true;
    }
}