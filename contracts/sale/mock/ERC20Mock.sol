// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";


/**
 * @title ERC20Mock
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */

contract ERC20Mock is ERC20, ERC20Burnable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * (10**18);
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(_msgSender(), INITIAL_SUPPLY);
    }
}
