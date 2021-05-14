// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITON} from "../interfaces/ITON.sol";
import {IDepositManager} from "../interfaces/IDepositManager.sol";
import {ISeigManager} from "../interfaces/ISeigManager.sol";
//import {IUniswapActor} from "../interfaces/IUniswapActor.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
//import { ERC165 } from "@openzeppelin/contracts/introspection/ERC165.sol";
import "../stake/StakeTONStorage.sol";
// import {OnApprove} from "../tokens/OnApprove.sol";

/// @title The connector that integrates zkopru and tokamak
contract TokamakStaker is StakeTONStorage, AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier nonZero(address _addr) {
        require(_addr != address(0), "TokamakStaker: zero address");
        _;
    }

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "TokamakStaker: Caller is not an admin"
        );
        _;
    }

    function setTokamak(
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager,
        address _defiAddr
    ) external onlyOwner {
        require(
            _ton != address(0) &&
                _wton != address(0) &&
                _depositManager != address(0) &&
                _seigManager != address(0),
            "TokamakStaker: zero address"
        );
        ton = _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;
        _uniswapRouter = _defiAddr;
    }

    // function setTON(address _ton) external onlyOwner {
    //     require(
    //         _ton != address(0) && ton != _ton,
    //         "TokamakStaker: zero address"
    //     );
    //     ton = _ton;
    // }

    function setUniswapRouter(address _router) external onlyOwner {
        // TODO: check!!
        require(
            block.number < saleStartBlock,
            "TokamakStaker: Already started"
        );
        require(
            _router != address(0) && _uniswapRouter != _router,
            "TokamakStaker: zero address"
        );
        _uniswapRouter = _router;
    }

    function approveUniswapRouter(uint256 amount) external {
        require(
            IERC20(paytoken).approve(_uniswapRouter, amount),
            "TokamakStaker: approve fail"
        );
    }

    function uniswapRouter() public view returns (address) {
        return _uniswapRouter;
    }

    /// TODO: Withdrawal for operating profit
    function withdrawProfit(address _token, uint256 amount) external {}

    /*
    /// @dev Approves
    function onApprove(
        address owner,
        address spender,
        uint256 tonAmount,
        bytes calldata data
    ) external override returns (bool) {
        (address _spender, uint256 _amount) = _decodeStakeData(data);
        require(
            tonAmount == _amount && spender == _spender,
            "TokamakStaker: tonAmount != stakingAmount "
        );
        require(
            stakeOnApprove(msg.sender, owner, _spender, _amount),
            "TokamakStaker: stakeOnApprove fails "
        );
        return true;
    }

    function _decodeStakeData(bytes calldata input)
        internal
        pure
        returns (address spender, uint256 amount)
    {
        (spender, amount) = abi.decode(input, (address, uint256));
    }

    /// @dev stake with ton
    function stakeOnApprove(
        address from,
        address _owner,
        address _spender,
        uint256 _amount
    ) public returns (bool) {
        require(
            (paytoken == from && _amount > 0 && _spender == address(this)),
            "TokamakStaker: stakeOnApprove init fail"
        );
        require(
            block.number >= saleStartBlock && saleStartBlock < startBlock,
            "TokamakStaker: stakeTON period is unavailable"
        );

        LibTokenStake1.StakedAmount storage staked = userStaked[_owner];
        staked.amount += _amount;
        totalStakedAmount += _amount;
        require(
            IERC20(from).transferFrom(_owner, _spender, _amount),
            "TokamakStaker: failed to transfer ton from creator"
        );
        return true;
    }
    */
    function tokamakStaking(address _layer2, uint256 _amount)
        external
        onlyOwner
    {
        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0) &&
                _layer2 != address(0) &&
                _amount > 0,
            "TokamakStaker: zero address"
        );

        if (tokamakLayer2 == address(0)) tokamakLayer2 = _layer2;
        else {
            uint256 stakeOf =
                ISeigManager(seigManager).stakeOf(_layer2, address(this));
            if (stakeOf == 0) tokamakLayer2 = _layer2;
            else
                require(
                    tokamakLayer2 == _layer2,
                    "TokamakStaker: layer2 is different "
                );
        }

        bytes memory data = abi.encode(depositManager, _layer2);
        require(
            ITON(ton).approveAndCall(wton, _amount, data),
            "TokamakStaker: approveAndCall fail"
        );
    }

    function tokamakRequestUnStakingAll(address _layer2)
        public
        onlyOwner
        nonZero(depositManager)
    {
        require(
            tokamakLayer2 == _layer2,
            "TokamakStaker: layer2 is different "
        );

        IDepositManager(depositManager).requestWithdrawalAll(_layer2);
        tokamakLayer2 = address(0);
    }

    // unstaking except to principal fund
    function tokamakRequestUnStaking(address _layer2, uint256 _amount)
        public
        onlyOwner
    {
        require(
            depositManager != address(0) &&
                _layer2 == tokamakLayer2 &&
                _amount > 0,
            "TokamakStaker: zero address"
        );

        uint256 stakeOf =
            ISeigManager(seigManager).stakeOf(_layer2, address(this));
        require(
            stakeOf - _amount >= totalStakedAmount,
            "TokamakStaker: The withdrawal balance is lack"
        );

        IDepositManager(depositManager).requestWithdrawal(_layer2, _amount);
    }

    function tokamakProcessUnStaking(address _layer2, bool receiveTON)
        public
        onlyOwner
    {
        require(
            depositManager != address(0) && _layer2 != address(0),
            "TokamakStaker: zero address"
        );

        uint256 pending = tokamakPendingUnstaked(_layer2);
        uint256 balanceOf = ITON(ton).balanceOf(address(this));

        rewardTokamak = balanceOf + pending - totalStakedAmount;

        IDepositManager(depositManager).processRequest(_layer2, receiveTON);
    }

    function tokamakPendingUnstaked(address _layer2)
        public
        view
        returns (uint256 wtonAmount)
    {
        require(
            depositManager != address(0) && _layer2 != address(0),
            "TokamakStaker: zero address"
        );
        return
            IDepositManager(depositManager).pendingUnstaked(
                _layer2,
                address(this)
            );
    }

    function tokamakAccStaked(address _layer2)
        external
        view
        returns (uint256 wtonAmount)
    {
        require(
            seigManager != address(0) && _layer2 != address(0),
            "TokamakStaker: zero address"
        );
        return
            IDepositManager(depositManager).accStaked(_layer2, address(this));
    }

    function tokamakAccUnstaked(address _layer2)
        external
        view
        returns (uint256 wtonAmount)
    {
        require(
            seigManager != address(0) && _layer2 != address(0),
            "TokamakStaker: zero address"
        );
        return
            IDepositManager(depositManager).accUnstaked(_layer2, address(this));
    }

    function tokamakStakeOf(address _layer2)
        external
        view
        returns (uint256 wtonAmount)
    {
        require(
            seigManager != address(0) && _layer2 != address(0),
            "TokamakStaker: zero address"
        );
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
