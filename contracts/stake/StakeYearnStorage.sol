//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "./Stake1Storage.sol";

contract StakeYearnStorage is Stake1Storage {
    address public yearnV2Vault;
}
