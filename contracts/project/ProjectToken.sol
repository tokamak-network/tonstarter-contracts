//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ProjectToken is ERC20, AccessControl {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address to
    ) ERC20(name, symbol) {
        _mint(to, totalSupply * 10**uint256(decimals()));
    }
}
