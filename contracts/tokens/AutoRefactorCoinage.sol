// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {AutoRefactorCoinageI} from "../interfaces/AutoRefactorCoinageI.sol";
import {DSMath} from "../libraries/DSMath.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../common/AccessibleCommon.sol";

/**
 * @dev Implementation of coin age token based on ERC20 of openzeppelin-solidity
 *
 * AutoRefactorCoinage stores `_totalSupply` and `_balances` as RAY BASED value,
 * `_allowances` as RAY FACTORED value.
 *
 * This takes public function (including _approve) parameters as RAY FACTORED value
 * and internal function (including approve) parameters as RAY BASED value, and emits event in RAY FACTORED value.
 *
 * `RAY BASED` = `RAY FACTORED`  / factor
 *
 *  factor increases exponentially for each block mined.
 */
contract AutoRefactorCoinage is ERC20, DSMath, AccessibleCommon {
    struct Balance {
        uint256 balance;
        uint256 refactoredCount;
        uint256 remain;
    }
    uint8 public decimal = 27;
    uint256 public REFACTOR_BOUNDARY = 10**28;
    uint256 public REFACTOR_DIVIDER = 2;

    uint256 public refactorCount;

    mapping(address => Balance) public balances;

    Balance public _totalSupply;

    uint256 public _factor;

    bool internal _transfersEnabled;

    event FactorSet(uint256 previous, uint256 current, uint256 shiftCount);

    modifier nonZero(address _addr) {
        require(_addr != address(0), "AutoRefactorCoinage:zero address");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 initfactor
    ) ERC20(name, symbol) {
        _factor = initfactor;

        //_factorIncrement = factorIncrement;
        //_lastBlock = block.number;
        //_transfersEnabled = transfersEnabled;

        _setupDecimals(decimal);

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function factor() public view returns (uint256) {
        uint256 result = _factor;
        for (uint256 i = 0; i < refactorCount; i++) {
            result = result * (REFACTOR_DIVIDER);
        }
        return result;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view override returns (uint256) {
        return
            _applyFactor(_totalSupply.balance, _totalSupply.refactoredCount) +
            (_totalSupply.remain);
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view override returns (uint256) {
        Balance storage b = balances[account];

        return _applyFactor(b.balance, b.refactoredCount) + (b.remain);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal override {
        require(
            account != address(0),
            "AutoRefactorCoinage: mint to the zero address"
        );
        Balance storage b = balances[account];

        uint256 currentBalance = balanceOf(account);
        uint256 newBalance = currentBalance + amount;

        uint256 rbAmount = _toRAYBased(newBalance);
        b.balance = rbAmount;
        b.refactoredCount = refactorCount;

        addTotalSupply(amount);
        emit Transfer(address(0), account, _toRAYFactored(rbAmount));
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal override {
        require(
            account != address(0),
            "AutoRefactorCoinage: burn from the zero address"
        );
        Balance storage b = balances[account];

        uint256 currentBalance = balanceOf(account);
        uint256 newBalance = currentBalance - amount;

        uint256 rbAmount = _toRAYBased(newBalance);
        b.balance = rbAmount;
        b.refactoredCount = refactorCount;

        subTotalSupply(amount);
        emit Transfer(account, address(0), _toRAYFactored(rbAmount));
    }

    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
    }

    // helpers

    /**
     * @param v the value to be factored
     */
    function _applyFactor(uint256 v, uint256 refactoredCount)
        internal
        view
        returns (uint256)
    {
        if (v == 0) {
            return 0;
        }

        v = rmul2(v, _factor);

        for (uint256 i = refactoredCount; i < refactorCount; i++) {
            v = v * (REFACTOR_DIVIDER);
        }

        return v;
    }

    /**
     * @dev Calculate RAY BASED from RAY FACTORED
     */
    function _toRAYBased(uint256 rf) internal view returns (uint256 rb) {
        return rdiv2(rf, _factor);
    }

    /**
     * @dev Calculate RAY FACTORED from RAY BASED
     */
    function _toRAYFactored(uint256 rb) internal view returns (uint256 rf) {
        return rmul2(rb, _factor);
    }

    // new

    function setFactor(uint256 infactor) external onlyOwner returns (uint256) {
        uint256 previous = _factor;

        uint256 count = 0;
        uint256 f = infactor;
        for (; f >= REFACTOR_BOUNDARY; f = (f / REFACTOR_DIVIDER)) {
            count = count + 1;
        }

        refactorCount = count;
        _factor = f;
        emit FactorSet(previous, f, count);

        return _factor;
    }

    function addTotalSupply(uint256 amount) internal {
        uint256 currentSupply =
            _applyFactor(_totalSupply.balance, _totalSupply.refactoredCount);
        uint256 newSupply = currentSupply + amount;

        uint256 rbAmount = _toRAYBased(newSupply);
        _totalSupply.balance = rbAmount;
        _totalSupply.refactoredCount = refactorCount;
    }

    function subTotalSupply(uint256 amount) internal {
        uint256 currentSupply =
            _applyFactor(_totalSupply.balance, _totalSupply.refactoredCount);
        uint256 newSupply = currentSupply - amount;

        uint256 rbAmount = _toRAYBased(newSupply);
        _totalSupply.balance = rbAmount;
        _totalSupply.refactoredCount = refactorCount;
    }

    // unsupported functions

    function transfer(address recipient, uint256 amount)
        public
        pure
        override
        returns (bool)
    {
        revert();
    }

    function allowance(address owner, address spender)
        public
        pure
        override
        returns (uint256)
    {
        return 0;
    }

    function approve(address spender, uint256 amount)
        public
        pure
        override
        returns (bool)
    {
        revert();
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public pure override returns (bool) {
        revert();
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount)
        public
        onlyOwner
        nonZero(account)
        returns (bool)
    {
        _mint(account, amount);
        return true;
    }

    function addMinter(address account) public onlyOwner nonZero(account) {
        grantRole(MINTER_ROLE, account);
    }

    function renounceMinter() public onlyOwner {
        renounceRole(MINTER_ROLE, msg.sender);
    }

    function transferOwnership(address newOwner)
        public
        onlyOwner
        nonZero(newOwner)
    {
        grantRole(ADMIN_ROLE, newOwner);
        renounceRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    /**
     * @dev See {ERC20-_burnFrom}.
     */
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burnFrom(account, amount);
    }
}
