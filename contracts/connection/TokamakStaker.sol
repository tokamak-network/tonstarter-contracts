// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../interfaces/ITokamakStaker.sol";
import {ITON} from "../interfaces/ITON.sol";
import {IIStake1Vault} from "../interfaces/IIStake1Vault.sol";
import {IIDepositManager} from "../interfaces/IIDepositManager.sol";
import {IISeigManager} from "../interfaces/IISeigManager.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../stake/StakeTONStorage.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

interface IERC20BASE {
    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

interface IIWTON {
    function swapToTON(uint256 wtonAmount) external returns (bool);
}

interface ITokamakRegistry {
    function getTokamak()
        external
        view
        returns (
            address,
            address,
            address,
            address,
            address
        );

    function getUniswap()
        external
        view
        returns (
            address,
            address,
            address,
            uint256,
            address
        );
}

/// @title The connector that integrates tokamak
contract TokamakStaker is StakeTONStorage, AccessControl, ITokamakStaker {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier nonZero(address _addr) {
        require(_addr != address(0), "TokamakStaker: zero address");
        _;
    }

    modifier sameTokamakLayer(address _addr) {
        require(tokamakLayer2 == _addr, "TokamakStaker:different layer");
        _;
    }

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "TokamakStaker: Caller is not an admin"
        );
        _;
    }

    modifier lock() {
        require(_lock == 0, "TokamakStaker:LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    event SetRegistry(address registry);
    event SetTokamakLayer2(address layer2);
    event tokamakStaked(address layer2, uint256 amount, bool isTON);
    event tokamakRequestedUnStaking(address layer2, uint256 amount);
    event tokamakProcessedUnStaking(
        address layer2,
        uint256 rn,
        bool receiveTON
    );
    event exchangedWTONtoFLD(
        address caller,
        uint256 amountIn,
        uint256 amountOut
    );

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "TokamakStaker:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev set registry address
    /// @param _registry new registry address
    function setRegistry(address _registry)
        external
        onlyOwner
        nonZero(_registry)
    {
        stakeRegistry = _registry;

        emit SetRegistry(stakeRegistry);
    }

    /// @dev set the tokamak Layer2 address
    /// @param _layer2 new the tokamak Layer2 address
    function setTokamakLayer2(address _layer2) external override onlyOwner {
        require(
            _layer2 != address(0) && tokamakLayer2 != _layer2,
            "TokamakStaker:tokamakLayer2 zero "
        );
        tokamakLayer2 = _layer2;

        emit SetTokamakLayer2(_layer2);
    }

    /// @dev get the addresses that used in uniswap interfaces
    /// @return uniswapRouter the address of uniswapRouter
    /// @return npm the address of positionManagerAddress
    /// @return ext the address of ext
    /// @return fee the amount of fee
    function getUniswapInfo()
        external
        view
        override
        returns (
            address uniswapRouter,
            address npm,
            address ext,
            uint256 fee,
            address uniswapRouterV2
        )
    {
        return ITokamakRegistry(stakeRegistry).getUniswap();
    }

    // function approveUniswapRouter(uint256 amount) external override {
    //     (address uniswapRouter, address npm, , , ) =
    //         ITokamakRegistry(stakeRegistry).getUniswap();

    //     if (uniswapRouter != address(0))
    //         IERC20BASE(paytoken).approve(uniswapRouter, amount);
    //     if (npm != address(0)) IERC20BASE(paytoken).approve(npm, amount);
    // }

    /**
    function swapTONtoWTON(uint256 amount, bool toWTON)
        public
        lock
        nonZero(swapProxy)
    {
        uint256 balance = 0;

        if (toWTON) {
            balance = IERC20BASE(ton).balanceOf(address(this));
            require(
                balance >= amount,
                "TokamakStaker: swapTONtoWTON ton balance is insufficient"
            );
            bytes memory data = abi.encode(swapProxy, swapProxy);
            require(
                ITON(ton).approveAndCall(wton, amount, data),
                "TokamakStaker:swapTONtoWTON approveAndCall fail"
            );
        } else {
            balance = IERC20BASE(wton).balanceOf(address(this));
            require(
                balance >= amount,
                "TokamakStaker: swapTONtoWTON wton balance is insufficient"
            );
            require(
                IIWTON(wton).swapToTON(amount),
                "TokamakStaker:swapToTON fail"
            );
        }
    }
    */
    /// @dev  staking the staked TON in layer2 in tokamak
    /// @param _layer2 the layer2 address in tokamak
    /// @param stakeAmount the amount that stake to layer2
    /// @param isTON TON is true, WTON is false
    function tokamakStaking(
        address _layer2,
        uint256 stakeAmount,
        bool isTON
    ) external override lock nonZero(stakeRegistry) nonZero(_layer2) {
        require(block.number <= endBlock, "TokamakStaker:period end");
        require(stakeAmount > 0, "TokamakStaker:stakeAmount is zero");
        require(
            IIStake1Vault(vault).saleClosed() == true,
            "TokamakStaker:not closed"
        );
        defiStatus = uint256(LibTokenStake1.DefiStatus.DEPOSITED);

        if (ton == address(0)) {
            (
                address _ton,
                address _wton,
                address _depositManager,
                address _seigManager,
                address _swapProxy
            ) = ITokamakRegistry(stakeRegistry).getTokamak();

            ton = _ton;
            wton = _wton;
            depositManager = _depositManager;
            seigManager = _seigManager;
            swapProxy = _swapProxy;
        }

        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "TokamakStaker:ITokamakRegistry zero"
        );

        uint256 globalWithdrawalDelay =
            IIDepositManager(depositManager).globalWithdrawalDelay();
        require(
            block.number < endBlock - globalWithdrawalDelay,
            "TokamakStaker:period(withdrawalDelay) end"
        );

        if (tokamakLayer2 == address(0)) tokamakLayer2 = _layer2;
        else {
            if (
                IISeigManager(seigManager).stakeOf(
                    tokamakLayer2,
                    address(this)
                ) >
                0 ||
                IIDepositManager(depositManager).pendingUnstaked(
                    tokamakLayer2,
                    address(this)
                ) >
                0
            ) {
                require(
                    tokamakLayer2 == _layer2,
                    "TokamakStaker:different layer"
                );
            } else {
                if (tokamakLayer2 != _layer2) tokamakLayer2 = _layer2;
            }
        }

        uint256 balance = 0;
        if (isTON) {
            balance = IERC20BASE(ton).balanceOf(address(this));
            require(
                balance >= stakeAmount,
                "TokamakStaker: ton balance is zero"
            );
            toTokamak = toTokamak.add(stakeAmount);
            bytes memory data = abi.encode(depositManager, _layer2);
            require(
                ITON(ton).approveAndCall(wton, stakeAmount, data),
                "TokamakStaker:approveAndCall fail"
            );
        } else {
            balance = IERC20BASE(wton).balanceOf(address(this));
            require(
                balance >= stakeAmount,
                "TokamakStaker: wton balance is zero"
            );
            toTokamak = toTokamak.add(stakeAmount.div(10**9));
            IERC20BASE(wton).approve(depositManager, stakeAmount);
            require(
                IIDepositManager(depositManager).deposit(_layer2, stakeAmount),
                "TokamakStaker:deposit fail"
            );
        }

        emit tokamakStaked(_layer2, stakeAmount, isTON);
    }

    /// @dev  request unstaking the wtonAmount in layer2 in tokamak
    /// @param _layer2 the layer2 address in tokamak
    /// @param wtonAmount the amount requested to unstaking
    function tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)
        public
        override
        lock
        nonZero(stakeRegistry)
        sameTokamakLayer(_layer2)
    {
        require(
            IIStake1Vault(vault).saleClosed() == true,
            "TokamakStaker:not closed"
        );
        defiStatus = uint256(LibTokenStake1.DefiStatus.REQUESTWITHDRAW);
        requestNum = requestNum.add(1);

        (
            address ton,
            address wton,
            address depositManager,
            address seigManager,
        ) = ITokamakRegistry(stakeRegistry).getTokamak();
        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "TokamakStaker:ITokamakRegistry zero"
        );

        uint256 stakeOf =
            IISeigManager(seigManager).stakeOf(_layer2, address(this));

        require(stakeOf >= wtonAmount, "TokamakStaker:lack");

        IIDepositManager(depositManager).requestWithdrawal(_layer2, wtonAmount);

        emit tokamakRequestedUnStaking(_layer2, wtonAmount);
    }

    /// @dev process unstaking in layer2 in tokamak
    /// @param _layer2 the layer2 address in tokamak
    function tokamakProcessUnStaking(address _layer2)
        public
        override
        lock
        nonZero(stakeRegistry)
        sameTokamakLayer(_layer2)
    {
        require(
            defiStatus != uint256(LibTokenStake1.DefiStatus.WITHDRAW),
            "TokamakStaker:Already ProcessUnStaking"
        );
        require(
            IIStake1Vault(vault).saleClosed() == true,
            "TokamakStaker:not closed"
        );
        defiStatus = uint256(LibTokenStake1.DefiStatus.WITHDRAW);
        uint256 rn = requestNum;
        requestNum = 0;

        (
            address ton,
            address wton,
            address depositManager,
            address seigManager,
        ) = ITokamakRegistry(stakeRegistry).getTokamak();

        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "TokamakStaker:ITokamakRegistry zero"
        );

        if (
            IISeigManager(seigManager).stakeOf(tokamakLayer2, address(this)) ==
            0
        ) tokamakLayer2 = address(0);

        fromTokamak += IIDepositManager(depositManager).pendingUnstaked(
            _layer2,
            address(this)
        );

        // receiveTON = false . to WTON
        IIDepositManager(depositManager).processRequests(_layer2, rn, true);

        emit tokamakProcessedUnStaking(_layer2, rn, true);
    }

    /// @dev exchange holded WTON to FLD using uniswap
    /// @param _amountIn the input amount
    /// @param _amountOutMinimum the minimun output amount
    /// @param _deadline deadline
    /// @param _sqrtPriceLimitX96 sqrtPriceLimitX96
    /// @param _kind the function type, if 0, use exactInputSingle function, else if, use exactInput function
    /// @return amountOut the amount of exchanged out token
    function exchangeWTONtoFLD(
        uint256 _amountIn,
        uint256 _amountOutMinimum,
        uint256 _deadline,
        uint160 _sqrtPriceLimitX96,
        uint256 _kind
    ) external override returns (uint256 amountOut) {
        require(block.number <= endBlock, "TokamakStaker: period end");
        (
            address ton,
            address wton,
            ,
            address seigManager
        ) = ITokamakRegistry(stakeRegistry).getTokamak();

        require(IIStake1Vault(vault).saleClosed() == true, "TokamakStaker: not closed");
        require(_kind < 2, "TokamakStaker: no kind");
        require(
            ton != address(0) &&
                wton != address(0) &&
                seigManager != address(0),
            "TokamakStaker:tokamak zero"
        );

        {
            uint256 _amountWTON = IERC20BASE(wton).balanceOf(address(this));
            uint256 _amountTON = IERC20BASE(ton).balanceOf(address(this));
            uint256 stakeOf = 0;
            if (tokamakLayer2 != address(0)) {
                stakeOf = IISeigManager(seigManager).stakeOf(
                    tokamakLayer2,
                    address(this)
                );
            }
            uint256 holdAmount = _amountWTON;
            if (_amountTON > 0) holdAmount = holdAmount.add(_amountTON.mul(10**9));
            require(holdAmount >= _amountIn, "TokamakStaker: wton insufficient");

            if (stakeOf > 0) {
                holdAmount = stakeOf.add(_amountWTON);
            }
            require(
                holdAmount > totalStakedAmount.mul(10**9) &&
                    holdAmount.sub(totalStakedAmount.mul(10**9)) >= _amountIn,
                "TokamakStaker:insufficient"
            );
            if (_amountWTON < _amountIn) {
                bytes memory data = abi.encode(swapProxy, swapProxy);
                require(
                    ITON(ton).approveAndCall(wton, _amountIn.sub(_amountWTON), data),
                    "TokamakStaker:exchangeWTONtoFLD approveAndCall fail"
                );
            }
        }

        toUniswapWTON += _amountIn;
        (address uniswapRouter, , address wethAddress, uint256 _fee, ) =
            ITokamakRegistry(stakeRegistry).getUniswap();
        require(uniswapRouter != address(0), "TokamakStaker:uniswap zero");
        require(
            IERC20BASE(wton).approve(uniswapRouter, _amountIn),
            "TokamakStaker:can't approve uniswapRouter"
        );

        if (_kind == 0) {
            ISwapRouter.ExactInputSingleParams memory params =
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: wton,
                    tokenOut: token,
                    fee: uint24(_fee),
                    recipient: address(this),
                    deadline: _deadline,
                    amountIn: _amountIn,
                    amountOutMinimum: _amountOutMinimum,
                    sqrtPriceLimitX96: _sqrtPriceLimitX96
                });
            amountOut = ISwapRouter(uniswapRouter).exactInputSingle(params);
        } else if (_kind == 1) {
            ISwapRouter.ExactInputParams memory params =
                ISwapRouter.ExactInputParams({
                    path: abi.encodePacked(
                        wton,
                        uint24(_fee),
                        wethAddress,
                        uint24(_fee),
                        token
                    ),
                    recipient: address(this),
                    amountIn: _amountIn,
                    amountOutMinimum: _amountOutMinimum,
                    deadline: _deadline
                });
            amountOut = ISwapRouter(uniswapRouter).exactInput(params);
        }

        emit exchangedWTONtoFLD(msg.sender, _amountIn, amountOut);
    }

    /// @dev exchange holded WTON to FLD using uniswap-v2
    /// @param _amountIn the input amount
    /// @param _amountOutMinimum the minimun output amount
    /// @param _deadline deadline
    /// @param _kind the function type, if 0, use exactInputSingle function, else if, use exactInput function
    function exchangeWTONtoFLDv2(
        uint256 _amountIn,
        uint256 _amountOutMinimum,
        uint256 _deadline,
        uint256 _kind
    ) external override returns (uint256 amountOut) {
        require(block.number <= endBlock, "TokamakStaker:period end");
        require(
            IIStake1Vault(vault).saleClosed() == true,
            "TokamakStaker:not closed"
        );
        require(_kind < 2, "no kind");
        require(
            ton != address(0) &&
                wton != address(0) &&
                seigManager != address(0),
            "TokamakStaker:tokamak zero"
        );

        {
            uint256 _amountWTON = IERC20BASE(wton).balanceOf(address(this));
            uint256 _amountTON = IERC20BASE(ton).balanceOf(address(this));
            uint256 stakeOf = 0;
            if (tokamakLayer2 != address(0)) {
                stakeOf = IISeigManager(seigManager).stakeOf(
                    tokamakLayer2,
                    address(this)
                );
            }
            uint256 holdAmount = _amountWTON;
            if (_amountTON > 0) holdAmount = holdAmount.add(_amountTON.mul(10**9));
            require(holdAmount >= _amountIn, "TokamakStaker: wton insufficient");

            if (stakeOf > 0) holdAmount = stakeOf.add(_amountWTON);
            require(
                holdAmount > totalStakedAmount.mul(10**9) &&
                    holdAmount.sub(totalStakedAmount.mul(10**9)) >= _amountIn,
                "TokamakStaker:insufficient"
            );
            if (_amountWTON < _amountIn) {
                bytes memory data = abi.encode(swapProxy, swapProxy);
                require(
                    ITON(ton).approveAndCall(wton, _amountIn.sub(_amountWTON), data),
                    "TokamakStaker:exchangeWTONtoFLD approveAndCall fail"
                );
            }
        }

        toUniswapWTON += _amountIn;
        (, , address wethAddress, , address uniswapRouterV2) =
            ITokamakRegistry(stakeRegistry).getUniswap();

        require(uniswapRouterV2 != address(0), "uniswap zero");
        require(
            IERC20BASE(wton).approve(uniswapRouterV2, _amountIn),
            "TokamakStaker:can't approve uniswapRouter"
        );

        if (_kind == 0) {
            address[] memory path = new address[](2);
            path[0] = wton;
            path[1] = token;
            uint256[] memory amounts =
                IUniswapV2Router01(uniswapRouterV2).swapExactTokensForTokens(
                    _amountIn,
                    _amountOutMinimum,
                    path,
                    address(this),
                    _deadline
                );
            amountOut = amounts[amounts.length - 1];
        } else {
            address[] memory path = new address[](3);
            path[0] = wton;
            path[1] = wethAddress;
            path[2] = token;
            uint256[] memory amounts =
                IUniswapV2Router01(uniswapRouterV2).swapExactTokensForTokens(
                    _amountIn,
                    _amountOutMinimum,
                    path,
                    address(this),
                    _deadline
                );
            amountOut = amounts[amounts.length - 1];
        }

        emit exchangedWTONtoFLD(msg.sender, _amountIn, amountOut);
    }

}
