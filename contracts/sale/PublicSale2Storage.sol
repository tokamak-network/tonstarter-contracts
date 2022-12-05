//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

contract PublicSale2Storage {
    bytes32 internal constant IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    bool public exchangeTOS;
    int24 public changeTick;
}