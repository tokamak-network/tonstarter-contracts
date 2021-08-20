const { findAccount } = require("./utils");
const { time } = require("@openzeppelin/test-helpers");

task("rinkeby-deploy-lock-tos", "Deploy TOS").setAction(async () => {
  const { RINKEBY_DEPLOY_ACCOUNT: account, RINKEBY_TOS_ADDRESS: tosAddress } =
    process.env;

  const lastBlockNum = await ethers.provider.getBlockNumber();
  const lastBlock = await ethers.provider.getBlock(lastBlockNum);
  const lastTimestamp = parseInt(lastBlock.timestamp);
  console.log({ lastTimestamp });
  const phase3StartTime = lastTimestamp + parseInt(time.duration.weeks(4));
  console.log({ phase3StartTime });
  const deployer = await findAccount(account);

  const lockTOS = await (await ethers.getContractFactory("LockTOS"))
    .connect(deployer)
    .deploy();
  await lockTOS.deployed();
  console.log("LockTOS: ", lockTOS.address);
  const lockTOSAddress = lockTOS.address;

  const lockTOSProxy = await (await ethers.getContractFactory("LockTOSProxy"))
    .connect(deployer)
    .deploy(lockTOS.address, deployer.address);
  await lockTOSProxy.deployed();
  console.log("LockTOSProxy: ", lockTOSProxy.address);
  const lockTOSProxyAddress = lockTOSProxy.address;

  // await (
  //   await lockTOSProxy.initialize(
  //     tosAddress,
  //     time.duration.weeks(1),
  //     time.duration.weeks(156),
  //     phase3StartTime
  //   )
  // ).wait();

  const adminAddress = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1";
  await (await lockTOSProxy.addAdmin(adminAddress)).wait();

  await run("verify", {
    address: lockTOSAddress,
    constructorArgsParams: [],
  });

  await run("verify", {
    address: lockTOSProxyAddress,
    constructorArgsParams: [lockTOSAddress, deployer.address],
  });
});

task("rinkeby-deploy-lock-tos-dividend", "Deploy TOS").setAction(async () => {
  const {
    RINKEBY_DEPLOY_ACCOUNT: account,
    RINKEBY_TOS_ADDRESS: tokenAddress,
    RINKEBY_LOCK_TOS_ADDRESS: lockTOSAddress,
  } = process.env;
  const phase3StartTime = "0"; // (await time.latest()) + time.duration.weeks(4);
  console.log({ phase3StartTime });
  const deployer = await findAccount(account);

  const lockTOS = await (await ethers.getContractFactory("LockTOSDividend"))
    .connect(deployer)
    .deploy(deployer.address, tokenAddress, phase3StartTime);
  await lockTOS.deployed();
  console.log("LockTOS: ", lockTOS.address);
  await run("verify", {
    address: lockTOS.address,
    constructorArgsParams: [deployer.address, tokenAddress, phase3StartTime],
  });
});
