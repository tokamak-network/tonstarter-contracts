const fs = require("fs");
const {
  getLockTosHolderList,
  getStosBalances,
  getlockIds,
  increaseLockTOSAmounts,
  compareLockTOSAmounts,
  migrateStakeAndeLockTOS,
  compareStakeAnfLockTOSAmounts,
} = require("../test/lockTos/tosv2-migration");

task("get-stos-holder-list", "Retrieve sTos holder list into a file")
  .addParam("lockTosAddress", "LockTOS Address")
  .setAction(async ({ lockTosAddress }) => {
    await getLockTosHolderList(lockTosAddress);
  });

task(
  "get-stos-balances-accounts",
  "Retrieve sTos balance of accounts into a file"
)
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("blockNumber", "blockNumber ")
  .setAction(async ({ lockTosAddress, blockNumber }) => {
    await getStosBalances(lockTosAddress, blockNumber);
  });

task("get-lock-tos-list", "Retrieve sTos holder list into a file")
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("blockNumber", "blockNumber")
  .setAction(async ({ lockTosAddress, blockNumber }) => {
    await getlockIds(lockTosAddress, blockNumber);
  });

task("compare-lock-tos-v2", "Check lockTosV2 amount")
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("blockNumber", "blockNumber")
  .setAction(async ({ lockTosAddress, blockNumber }) => {
    await compareLockTOSAmounts(lockTosAddress, blockNumber);
  });

task("compare-stake-and-lock-tos", "Check lockTosV2 and Stake amount")
  .addParam("stakeAddress", "Stake Address")
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("blockNumber", "blockNumber")
  .setAction(async ({ stakeAddress, lockTosAddress, blockNumber }) => {
    await compareStakeAnfLockTOSAmounts(
      stakeAddress,
      lockTosAddress,
      blockNumber
    );
  });

task("increase-lock-tos", "Increase lockTos")
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("blockNumber", "blockNumber")
  .addParam("adminAddress", "admin Address")
  .addParam("round", "round")
  .setAction(async ({ lockTosAddress, blockNumber, adminAddress, round }) => {
    await increaseLockTOSAmounts(
      lockTosAddress,
      blockNumber,
      adminAddress,
      round
    );
  });

task("migrate-stake-lock-tos", "Increase lockTos")
  .addParam("stakeAddress", "Stake Address")
  .addParam("blockNumber", "blockNumber")
  .addParam("adminAddress", "admin Address")
  .addParam("round", "round")
  .setAction(async ({ stakeAddress, blockNumber, adminAddress, round }) => {
    await migrateStakeAndeLockTOS(
      stakeAddress,
      blockNumber,
      adminAddress,
      round
    );
  });

task("deploy-lock-tos-v2", "Depoly LockTosV2")
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("adminAddress", "admin Address")
  .setAction(async ({ lockTosAddress, adminAddress }) => {
    const { RINKEBY_DEPLOY_ACCOUNT: account } = process.env;

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    console.log("deployer: ", deployer.address);

    await hre.network.provider.send("hardhat_impersonateAccount", [
      adminAddress,
    ]);
    await hre.network.provider.send("hardhat_setBalance", [
      adminAddress,
      "0x10000000000000000000000000",
    ]);
    const admin = await hre.ethers.getSigner(adminAddress);
    console.log("admin", admin.address);

    // admin
    const lockTOSv2Logic0 = await (
      await ethers.getContractFactory("LockTOSv2Logic0")
    )
      .connect(admin)
      .deploy();

    await lockTOSv2Logic0.deployed();

    console.log("LockTOSv2Logic0: ", lockTOSv2Logic0.address);
    const lockTOSv2Logic0Address = lockTOSv2Logic0.address;

    const lockTOSv2Proxy = await (
      await ethers.getContractFactory("LockTOSv2Proxy")
    )
      .connect(admin)
      .deploy();

    await lockTOSv2Proxy.deployed();

    console.log("LockTOSv2Proxy Proxy: ", lockTOSv2Proxy.address);
    const lockTOSv2ProxyAddrress = lockTOSv2Proxy.address;

    const lockTOSProxy = await ethers.getContractAt(
      "LockTOSProxy",
      lockTosAddress
    );

    let tx = await lockTOSProxy
      .connect(admin)
      .upgradeTo(lockTOSv2ProxyAddrress);
    console.log("lockTOSProxy upgradeTo LockTOSv2Proxy: ", tx.hash);
    await tx.wait();

    const lockTOSv2ProxyContract = await ethers.getContractAt(
      "LockTOSv2Proxy",
      lockTosAddress
    );

    tx = await lockTOSv2ProxyContract
      .connect(admin)
      .setImplementation2(lockTOSv2Logic0Address, 0, true);
    console.log(
      "lockTOSv2Proxy  setImplementation2 LockTOSv2Logic0: ",
      tx.hash
    );
    await tx.wait();

    /*
      await run("verify", {
        address: lockTOSv2Logic0Address,
        constructorArgsParams: [],
      });

      await run("verify", {
        address: lockTOSv2ProxyAddrress,
        constructorArgsParams: [],
      });
      */
  });

task("set-stake-lock-tos2", "Set Stake in LockTosV2")
  .addParam("stakeAddress", "Stake Address")
  .addParam("lockTosAddress", "LockTOS Address")
  .addParam("adminAddress", "admin Address")
  .setAction(async ({ lockTosAddress, adminAddress }) => {
    const { RINKEBY_DEPLOY_ACCOUNT: account } = process.env;

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    console.log("deployer: ", deployer.address);

    await hre.network.provider.send("hardhat_impersonateAccount", [
      adminAddress,
    ]);
    await hre.network.provider.send("hardhat_setBalance", [
      adminAddress,
      "0x10000000000000000000000000",
    ]);
    const admin = await hre.ethers.getSigner(adminAddress);
    console.log("admin", admin.address);

    const lockTosABI = require("../../abis/LockTOSv2Logic0.json").abi;

    const lockTOS = new ethers.Contract(
      lockTosAddress,
      lockTosABI,
      ethers.provider
    );

    const tx = await lockTOS.connect(admin).setStaker(stakeAddress);
    console.log("setStaker: ", tx.hash);
    await tx.wait();

    const staker = await lockTOS.connect(admin).staker();
    console.log("staker: ", staker);
  });

/*
  task("set-lock-tos-v2-proxy", "Depoly LockTosV2")
    .addParam("lockTosAddress", "LockTOS Address")
    .addParam("lockTosv2ProxyAddrress", "LockTOSProxy2 Address")
    .setAction(async ({lockTosAddress, lockTosv2ProxyAddrress}) => {
      const { RINKEBY_DEPLOY_ACCOUNT: account } = process.env;

      const accounts = await ethers.getSigners();
      const deployer = accounts[0];
      console.log("deployer: ", deployer.address);

      const lockTOSProxy = await ethers.getContractAt(
          "LockTOSProxy",
          lockTosAddress
      );

      let tx = await lockTOSProxy.connect(deployer).upgradeTo(lockTosv2ProxyAddrress);
      console.log("lockTOSProxy upgradeTo LockTOSv2Proxy: ", tx.hash);
      await tx.wait();

  })

  task("set-lock-tos-v2-logic", "Depoly LockTosV2")
    .addParam("lockTosAddress", "LockTOS Address")
    .addParam("lockTosv2Logic0Address", "LockTosv2Logic0Address Address")
    .setAction(async ({lockTosAddress, lockTosv2Logic0Address}) => {
      const { RINKEBY_DEPLOY_ACCOUNT: account } = process.env;

      const accounts = await ethers.getSigners();
      const deployer = accounts[0];
      console.log("deployer: ", deployer.address);

      const lockTOSv2ProxyContract = await ethers.getContractAt(
          "LockTOSv2Proxy",
          lockTosAddress
      );

      tx = await lockTOSv2ProxyContract.connect(deployer).setImplementation2(
        lockTosv2Logic0Address, 0, true);
      console.log("lockTOSv2Proxy  setImplementation2 LockTOSv2Logic0: ", tx.hash);
      await tx.wait();


  })
  */

// task("apply-stos-balances-accounts", "Apply sTos balance of accounts into Staking")
//     .addParam("lockTosAddress", "LockTOS Address")
//     .addParam("stakeAddress", "stake Address ")
//     .setAction(async ({ lockTosAddress, stakeAddress }) => {
//       await applyStosBalances(lockTosAddress, stakeAddress);
//     })
