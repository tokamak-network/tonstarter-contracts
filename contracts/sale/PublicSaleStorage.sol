//SPDX-License-Identifier: Unlicense

pragma solidity ^0.7.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


contract PublicSaleStorage is Ownable {
    
    IERC20 public saleToken;
    IERC20 public getToken;

    uint256 public rateSaleToken;   //구매시 받을 토큰 계산

    function setTokenPrice(uint256 _saleTokenPrice, uint256 _payTokenPrice) external 
}