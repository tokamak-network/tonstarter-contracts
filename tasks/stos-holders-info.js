const fs = require('fs');
const {
  getLockTosHolderList,
  getStosBalances,
  applyStosBalances
} = require("../test/lockTos/tosv2-migration");

task("get-stos-holder-list", "Retrieve sTos holder list into a file")
    .addParam("lockTosAddress", "LockTOS Address")
    .setAction(async ({ lockTosAddress }) => {
      await getLockTosHolderList(lockTosAddress);
    })



task("get-stos-balances-accounts", "Retrieve sTos balance of accounts into a file")
    .addParam("lockTosAddress", "LockTOS Address")
    .addParam("blockNumber", "blockNumber ")
    .setAction(async ({ lockTosAddress, blockNumber }) => {
      await getStosBalances(lockTosAddress, blockNumber);
    })


task("apply-stos-balances-accounts", "Apply sTos balance of accounts into Staking")
    .addParam("lockTosAddress", "LockTOS Address")
    .addParam("stakeAddress", "stake Address ")
    .setAction(async ({ lockTosAddress, stakeAddress }) => {
      await applyStosBalances(lockTosAddress, stakeAddress);
    })

