// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

interface IERC20Snapshot {
    function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256);
}
