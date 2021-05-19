// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
import {ITON} from "../interfaces/ITON.sol";
import {IStake1Vault} from "../interfaces/IStake1Vault.sol";
import {IIDepositManager} from "../interfaces/IIDepositManager.sol";
import {IISeigManager} from "../interfaces/IISeigManager.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../stake/StakeTONStorage.sol";
interface IERC20BASE {
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    //function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

/// @title The connector that integrates zkopru and tokamak
contract TokamakStaker is StakeTONStorage, AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier nonZero(address _addr) {
        require(_addr != address(0), "TokamakStaker: zero address");
        _;
    }

    modifier sameTokamakLayer(address _addr) {
        require(tokamakLayer2 == _addr, "different layer");
        _;
    }

    modifier nonZeroInit() {
        require(ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0), "init zero address");
        _;
    }
    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "TokamakStaker: Caller is not an admin"
        );
        _;
    }

    //////////////////////////////
    // Events
    //////////////////////////////

    event SetTokamak(address ton, address wton, address depositManager, address seigManager, address defiAddr);
    event SetUniswapRouter(address router);
    /*
    event tokamakStaked(address layer2, uint256 amount);
    event tokamakRequestedUnStakingAll(address layer2);
    event tokamakRequestedUnStakingReward(address layer2);
    event tokamakProcessedUnStaking(address layer2, bool receiveTON);
    */
    function setTokamak(
        address _ton,
        address _wton,
        address _depositManager,
        address _seigManager,
        address _defiAddr
    ) external onlyOwner
        nonZero(_ton)
        nonZero(_wton)
        nonZero(_depositManager)
        nonZero(_seigManager)
    {
        ton = _ton;
        wton = _wton;
        depositManager = _depositManager;
        seigManager = _seigManager;
        _uniswapRouter = _defiAddr;
        tokamakLayer2 = address(0);

        emit SetTokamak(ton, wton, depositManager, seigManager, _defiAddr);
    }

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

        emit SetUniswapRouter(_router);
    }

    function approveUniswapRouter(uint256 amount) external {
        require(
            IERC20BASE(paytoken).approve(_uniswapRouter, amount),
            "TokamakStaker: approve fail"
        );
    }

    function uniswapRouter() public view returns (address) {
        return _uniswapRouter;
    }

    function tokamakStaking(address _layer2)
        external nonZeroInit nonZero(_layer2)
    {
        require(
            IStake1Vault(vault).saleClosed() == true,
            "not closed"
        );
        uint256 _amount = IERC20BASE(ton).balanceOf(address(this));
        require(
                _amount > 0,
            "zero"
        );

        if (tokamakLayer2 == address(0)) tokamakLayer2 = _layer2;
        else {
            uint256 stakeOf =
                IISeigManager(seigManager).stakeOf(tokamakLayer2, address(this));

            uint256 pendingUnstaked = IIDepositManager(depositManager).pendingUnstaked(
                tokamakLayer2,
                address(this)
            );

            if (stakeOf > 0 || pendingUnstaked > 0) {
                require(
                    tokamakLayer2 == _layer2,
                    "different layer"
                );
            } else {
                if (tokamakLayer2 != _layer2) tokamakLayer2 == _layer2;
            }
        }
        toTokamak += _amount;
        bytes memory data = abi.encode(depositManager, _layer2);
        require(
            ITON(ton).approveAndCall(wton, _amount, data),
            "approveAndCall fail"
        );

        //emit tokamakStaked(_layer2, _amount);
    }

    function tokamakRequestUnStakingAll(address _layer2)
        public
        nonZeroInit sameTokamakLayer(_layer2)
    {
        IIDepositManager(depositManager).requestWithdrawalAll(_layer2);

        //emit tokamakRequestedUnStakingAll(_layer2);
    }

    function tokamakRequestUnStakingReward(address _layer2)
        public nonZeroInit sameTokamakLayer(_layer2)
    {
        require(
            IStake1Vault(vault).saleClosed() == true,
            "not closed"
        );

        uint256 stakeOf =
            IISeigManager(seigManager).stakeOf(_layer2, address(this));


        require(
            stakeOf > (totalStakedAmount * 10**9) + 1,
            "too small"
        );

        uint256 _amount = stakeOf - (totalStakedAmount * 10**9)  - 1;
        require(
                _amount > 0,
            "zero"
        );

        IIDepositManager(depositManager).requestWithdrawal(_layer2, _amount);

        //emit tokamakRequestedUnStakingReward(_layer2);
    }

    function tokamakProcessUnStaking(address _layer2, bool receiveTON)
        public nonZeroInit sameTokamakLayer(_layer2)
    {
        require(
            IStake1Vault(vault).saleClosed() == true,
            "not closed"
        );

        uint256 stakeOf = IISeigManager(seigManager).stakeOf(tokamakLayer2, address(this));
        if (stakeOf == 0 ) tokamakLayer2 = address(0);

        fromTokamak += IIDepositManager(depositManager).pendingUnstaked(
                _layer2,
                address(this)
            );
        IIDepositManager(depositManager).processRequest(_layer2, receiveTON);

        //emit tokamakProcessedUnStaking(_layer2, receiveTON);
    }

    /*
    function tokamakPendingUnstaked(address _layer2)
        public nonZeroInit nonZero(_layer2)
        view
        returns (uint256 wtonAmount)
    {
        return
            IIDepositManager(depositManager).pendingUnstaked(
                _layer2,
                address(this)
            );
    }

    function tokamakAccStaked(address _layer2)
        external nonZeroInit nonZero(_layer2)
        view
        returns (uint256 wtonAmount)
    {

        return
            IIDepositManager(depositManager).accStaked(_layer2, address(this));
    }

    function tokamakAccUnstaked(address _layer2)
        external nonZeroInit nonZero(_layer2)
        view
        returns (uint256 wtonAmount)
    {
        return
            IIDepositManager(depositManager).accUnstaked(_layer2, address(this));
    }

    function tokamakStakeOf(address _layer2)
        external nonZeroInit nonZero(_layer2)
        view
        returns (uint256 wtonAmount)
    {
        return IISeigManager(seigManager).stakeOf(_layer2, address(this));
    }
    */

}
