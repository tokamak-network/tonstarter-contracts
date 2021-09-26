// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "../ERC20/ERC20Snapshot.sol";
import "../ERC20/ERC20.sol";


contract ERC20SnapshotMock is ERC20, ERC20Snapshot {
    uint256 public constant INITIAL_SUPPLY = 10000 * (10**18);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(_msgSender(), INITIAL_SUPPLY);
    }   

    function snapshot() public returns (uint256) {
        uint256 snapId = _snapshot();
        return snapId;
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}