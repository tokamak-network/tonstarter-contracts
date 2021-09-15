// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import { PublicSaleStorage } from "./PublicSaleStorage.sol";

import { IERC20Snapshot } from "./ERC20/IERC20Snapshot.sol";

contract ExclusiveSale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct UserInfoEx {
        bool join;
        uint tier;
        uint256 payAmount;
        uint256 saleAmount;
    }

    address public getTokenOwner;
    uint256 public snapshot;

    uint256 public startExclusiveTime = 0;
    uint256 public endExclusiveTime = 0;
    uint256 public startClaimTime = 0;
    uint256 public endClaimTime = 0;

    uint256 public totalWhitelists = 0;         //총 화이트리스트 수 (exclusive)
    uint256 public totalExSaleAmount = 0;       //총 판매토큰 양 (exclusive)
    uint256 public totalExpectSaleAmount = 0;   //예정된 판매토큰 양 (exclusive)
    uint256 public totalExPurchasedAmount = 0;  //총 지불토큰 받은 양 (exclusive)

    mapping (address => UserInfoEx) public usersEx;

    constructor(address _saleTokenAddress, address _getTokenAddress, address _getTokenOwner) {
        saleToken = IERC20(_saleTokenAddress);
        getToken = IERC20(_getTokenAddress);
        getTokenOwner = _getTokenOwner;
    }

    function setSnapshot(uint256 _snapshot) external onlyOwner {
        snapshot = _snapshot;
    }

    function setExStartTime(uint256 _startExclusiveTime) external onlyOwner {
        startExclusiveTime = _startExclusiveTime;
    }

    function setExEndTime(uint256 _endExclusiveTime) external onlyOwner {
        endExclusiveTime = _endExclusiveTime;
    }
    
}