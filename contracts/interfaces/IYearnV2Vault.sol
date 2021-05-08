// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface IYearnV2Vault {
    function calcTotalValue() external returns (uint256 underlyingAmount);

    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function underlyingYield() external returns (uint256);

    function unclaimedProfit(address user) external view returns (uint256);

    function claim() external;

    // Used to claim on behalf of certain contracts e.g. Uniswap pool
    //function claimOnBehalf(address recipient) external ;

    // The owner has to wait 2 days to confirm changing the strat.
    // This protects users from an upgrade to a malicious strategy
    // Users must watch the timelock contract on Etherscan for any transactions
    //function setStrat(IStrat strat_, bool force) external ;
}
