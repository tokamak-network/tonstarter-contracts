// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import {ITON} from "../interfaces/ITON.sol";
import {IIStake1Vault} from "../interfaces/IIStake1Vault.sol";
import {IIDepositManager} from "../interfaces/IIDepositManager.sol";
import {IISeigManager} from "../interfaces/IISeigManager.sol";
import {SafeMath} from "../utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../stake/StakeTONStorage.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface IERC20BASE {
    function totalSupply() external view returns (uint256);

    function balanceOf(address owner) external view returns (uint256);

    //function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
}

interface ITokamakRegistry {
    function getTokamak()
        external
        view
        returns (
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
            uint256
        );
}

/// @title The connector that integrates zkopru and tokamak
contract TokamakStaker is StakeTONStorage, AccessControl {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier nonZero(address _addr) {
        require(_addr != address(0), "TokamakStaker: zero address");
        _;
    }

    modifier sameTokamakLayer(address _addr) {
        require(tokamakLayer2 = _addr, "different layer");
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
        require(_lock == 0, "LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }
    //////////////////////////////
    // Events
    //////////////////////////////

    event SetRegistry(address registry);
    event SetTokamakLayer2(address layer2);

    event tokamakStaked(address layer2, uint256 amount);
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

    function setRegistry(address _registry)
        external
        onlyOwner
        nonZero(_registry)
    {
        stakeRegistry = _registry;

        emit SetRegistry(stakeRegistry);
    }

    function setTokamakLayer2(address _layer2) external onlyOwner {
        // TODO: check!!
        // require(
        //     block.number < saleStartBlock,
        //     "TokamakStaker: Already started"
        // );
        require(
            _layer2 != address(0) && tokamakLayer2 != _layer2,
            "tokamakLayer2 zero "
        );
        tokamakLayer2 = _layer2;

        emit SetTokamakLayer2(_layer2);
    }

    function getUniswapInfo()
        external
        view
        returns (
            address uniswapRouter,
            address npm,
            address ext,
            uint256 fee
        )
    {
        return ITokamakRegistry(stakeRegistry).getUniswap();
    }

    function approveUniswapRouter(uint256 amount) external {
        (address uniswapRouter, address npm, , ) =
            ITokamakRegistry(stakeRegistry).getUniswap();

        if (uniswapRouter != address(0))
            IERC20BASE(paytoken).approve(uniswapRouter, amount);
        if (npm != address(0)) IERC20BASE(paytoken).approve(npm, amount);
    }

    function tokamakStaking(address _layer2)
        external
        lock
        nonZero(stakeRegistry)
        nonZero(_layer2)
    {
        require(block.number <= endBlock, "period end");
        require(IIStake1Vault(vault).saleClosed() == true, "not closed");
        defiStatus = uint256(LibTokenStake1.DefiStatus.DEPOSITED);

        if (ton == address(0)) {
            (
                address _ton,
                address _wton,
                address _depositManager,
                address _seigManager
            ) = ITokamakRegistry(stakeRegistry).getTokamak();

            ton = _ton;
            wton = _wton;
            depositManager = _depositManager;
            seigManager = _seigManager;
        }

        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "ITokamakRegistry zero"
        );

        uint256 globalWithdrawalDelay =
            IIDepositManager(depositManager).globalWithdrawalDelay();
        require(
            block.number < endBlock - globalWithdrawalDelay,
            "period(withdrawalDelay) end"
        );

        uint256 _amount = IERC20BASE(ton).balanceOf(address(this));
        uint256 _amountWTON = IERC20BASE(wton).balanceOf(address(this));

        require(_amount > 0 || _amountWTON > 0, "amount is zero");

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
                require(tokamakLayer2 == _layer2, "different layer");
            } else {
                if (tokamakLayer2 != _layer2) tokamakLayer2 == _layer2;
            }
        }
        if (_amount > 0) {
            toTokamak = toTokamak.add(_amount);
            bytes memory data = abi.encode(depositManager, _layer2);
            require(
                ITON(ton).approveAndCall(wton, _amount, data),
                "approveAndCall fail"
            );
        }
        if (_amountWTON > 0) {
            toTokamak = toTokamak.add(_amountWTON.div(10**9));
            IERC20BASE(wton).approve(depositManager, _amountWTON);
            require(
                IIDepositManager(depositManager).deposit(_layer2, _amountWTON),
                "deposit fail"
            );
        }
        emit tokamakStaked(_layer2, _amount);
    }

    function tokamakRequestUnStaking(address _layer2, uint256 wtonAmount)
        public
        lock
        nonZero(stakeRegistry)
        sameTokamakLayer(_layer2)
    {
        require(IIStake1Vault(vault).saleClosed() == true, "not closed");
        defiStatus = uint256(LibTokenStake1.DefiStatus.REQUESTWITHDRAW);
        requestNum = requestNum.add(1);

        (
            address ton,
            address wton,
            address depositManager,
            address seigManager
        ) = ITokamakRegistry(stakeRegistry).getTokamak();
        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "ITokamakRegistry zero"
        );

        uint256 stakeOf =
            IISeigManager(seigManager).stakeOf(_layer2, address(this));

        require(stakeOf >= wtonAmount, "lack");

        IIDepositManager(depositManager).requestWithdrawal(_layer2, wtonAmount);

        emit tokamakRequestedUnStaking(_layer2, wtonAmount);
    }

    function tokamakProcessUnStaking(address _layer2)
        public
        lock
        nonZero(stakeRegistry)
        sameTokamakLayer(_layer2)
    {
        require(
            defiStatus != uint256(LibTokenStake1.DefiStatus.WITHDRAW),
            "Already ProcessUnStaking"
        );
        require(IIStake1Vault(vault).saleClosed() == true, "not closed");
        defiStatus = uint256(LibTokenStake1.DefiStatus.WITHDRAW);
        uint256 rn = requestNum;
        requestNum = 0;

        (
            address ton,
            address wton,
            address depositManager,
            address seigManager
        ) = ITokamakRegistry(stakeRegistry).getTokamak();

        require(
            ton != address(0) &&
                wton != address(0) &&
                depositManager != address(0) &&
                seigManager != address(0),
            "ITokamakRegistry zero"
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
        IIDepositManager(depositManager).processRequests(_layer2, rn, false);

        emit tokamakProcessedUnStaking(_layer2, rn, false);
    }

    function exchangeWTONtoFLD(
        uint256 _amountIn,
        uint256 _amountOutMinimum,
        uint256 _deadline,
        uint160 sqrtPriceLimitX96,
        uint256 _kind
    ) external returns (uint256 amountOut) {
        require(block.number <= endBlock, "period end");
        require(IIStake1Vault(vault).saleClosed() == true, "not closed");
        require(_kind < 2, "no kind");
        require(
            ton != address(0) &&
                wton != address(0) &&
                seigManager != address(0),
            "tokamak zero"
        );
        (address uniswapRouter, , address wethAddress, uint256 _fee) =
            ITokamakRegistry(stakeRegistry).getUniswap();

        require(uniswapRouter != address(0), "uniswap zero");
        uint256 _amountWTON = IERC20BASE(wton).balanceOf(address(this));

        uint160 _sqrtPriceLimitX96 = uint160(sqrtPriceLimitX96);

        uint256 stakeOf = 0;
        if (tokamakLayer2 != address(0))
            stakeOf = IISeigManager(seigManager).stakeOf(
                tokamakLayer2,
                address(this)
            );
        uint256 kind = _kind;
        uint256 amountIn = _amountIn;
        uint256 deadline = _deadline;
        uint256 amountOutMinimum = _amountOutMinimum;
        uint24 fee = uint24(_fee);

        uint256 holdAmount = _amountWTON;
        if (stakeOf > 0) holdAmount = stakeOf.add(_amountWTON);

        require(
            holdAmount > totalStakedAmount.mul(10**9) &&
                holdAmount.sub(totalStakedAmount.mul(10**9)) >= amountIn,
            "insufficient"
        );
        toUniswapWTON += amountIn;
        require(
            IERC20BASE(wton).approve(uniswapRouter, amountIn),
            "can't approve uniswapRouter"
        );

        //uint256 amountOut = 0;

        if (kind == 0) {
            ISwapRouter.ExactInputSingleParams memory params =
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: wton,
                    tokenOut: token,
                    fee: fee,
                    recipient: address(this),
                    deadline: deadline,
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMinimum,
                    sqrtPriceLimitX96: _sqrtPriceLimitX96
                });

            amountOut = ISwapRouter(uniswapRouter).exactInputSingle(params);
        } else if (kind == 1) {
            bytes memory path =
                abi.encodePacked(wton, fee, wethAddress, fee, token);

            ISwapRouter.ExactInputParams memory params =
                ISwapRouter.ExactInputParams({
                    path: path,
                    recipient: address(this),
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMinimum,
                    deadline: deadline
                });

            amountOut = ISwapRouter(uniswapRouter).exactInput(params);
        }

        emit exchangedWTONtoFLD(msg.sender, amountIn, amountOut);
    }

    function ExactInputSingleParams(
        address[2] memory addrs,
        address tokenIn,
        address tokenOut,
        uint24 fee,
        address recipient,
        uint256 deadline,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint160 sqrtPriceLimitX96
    ) public returns (uint256 amountOut) {
        require(
            IERC20BASE(tokenIn).approve(addrs[0], amountIn),
            "can't approve uniswapRouter"
        );

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: recipient,
                deadline: deadline,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        amountOut = ISwapRouter(addrs[0]).exactInputSingle(params);
    }

    function exchangeWTONtoFLDexactInput(
        address uniswapRouter,
        address wton, // wton, wether
        address weth,
        uint256 fee,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline
    ) public returns (uint256 amountOut) {
        toUniswapWTON += amountIn;
        bytes memory path = abi.encodePacked(wton, fee, weth, fee, token);

        ISwapRouter.ExactInputParams memory params =
            ISwapRouter.ExactInputParams({
                path: path,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                deadline: deadline
            });

        amountOut = ISwapRouter(uniswapRouter).exactInput(params);

        emit exchangedWTONtoFLD(msg.sender, amountIn, amountOut);
    }
}
