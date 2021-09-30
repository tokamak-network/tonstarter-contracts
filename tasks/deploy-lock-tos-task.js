const { findAccount } = require("./utils");
const { time } = require("@openzeppelin/test-helpers");

task("mainnet-deploy-lock-tos", "Deploy TOS").setAction(async () => {
  const { MAINNET_DEPLOY_ACCOUNT: account, RINKEBY_TOS_ADDRESS: tosAddress } =
    process.env;
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

  await (
    await lockTOSProxy.initialize(
      tosAddress,
      parseInt(time.duration.minutes(10)),
      parseInt(time.duration.minutes(156 * 10))
    )
  ).wait();

  const adminAddress = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1";
  await (await lockTOSProxy.transferAdmin(adminAddress)).wait();

  await run("verify", {
    address: lockTOSAddress,
    constructorArgsParams: [],
  });

  await run("verify", {
    address: lockTOSProxyAddress,
    constructorArgsParams: [lockTOSAddress, deployer.address],
  });
});

task("rinkeby-deploy-lock-tos", "Deploy TOS").setAction(async () => {
  const { RINKEBY_DEPLOY_ACCOUNT: account, RINKEBY_TOS_ADDRESS: tosAddress } =
    process.env;
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

  await (
    await lockTOSProxy.initialize(
      tosAddress,
      parseInt(time.duration.days(1)),
      parseInt(time.duration.days(156 * 1))
    )
  ).wait();

  const adminAddress = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1";
  await (await lockTOSProxy.transferAdmin(adminAddress)).wait();

  await run("verify", {
    address: lockTOSAddress,
    constructorArgsParams: [],
  });

  await run("verify", {
    address: lockTOSProxyAddress,
    constructorArgsParams: [lockTOSAddress, deployer.address],
  });
});

task("rinkeby-verify-dividend-pool", "verify").setAction(async () => {
  const { RINKEBY_DEPLOY_ACCOUNT: account } = process.env;
  const deployer = await findAccount(account);

  const dividendPoolAddress = "0x0160504C84A972fB9C5D8d6b8DE14419A1637580";
  const dividendPoolProxyAddrress = "0xDBB66D79a0A141Ea57CE256B425fe0BccD0d6822";
  
  await run("verify", {
    address: dividendPoolAddress,
    constructorArgsParams: [],
  });

  await run("verify", {
    address: dividendPoolProxyAddrress,
    constructorArgsParams: [dividendPoolAddress, deployer.address],
  });

});

task("rinkeby-deploy-dividend-implementation", "Deploy TOS").setAction(async () => {
  const { RINKEBY_DEPLOY_ACCOUNT: account, RINKEBY_LOCK_TOS_ADDRESS: lockTOSAddress } =
  process.env;
  const deployer = await findAccount(account);

  const dividendPool = await (await ethers.getContractFactory("LockTOSDividend"))
    .connect(deployer)
    .deploy();
  await dividendPool.deployed(); 
});

task("rinkeby-deploy-dividend-pool", "Deploy TOS").setAction(async () => {
  const { RINKEBY_DEPLOY_ACCOUNT: account, RINKEBY_LOCK_TOS_ADDRESS: lockTOSAddress } =
  process.env;
  const deployer = await findAccount(account);

  const dividendPool = await (await ethers.getContractFactory("LockTOSDividend"))
    .connect(deployer)
    .deploy();
  await dividendPool.deployed();
  console.log("Dividend Pool: ", dividendPool.address);
  const dividendPoolAddress = dividendPool.address;

  const dividendPoolProxy = await (await ethers.getContractFactory("LockTOSDividendProxy"))
    .connect(deployer)
    .deploy(dividendPoolAddress, deployer.address);
  await dividendPoolProxy.deployed();
  console.log("Dividend Pool Proxy: ", dividendPoolProxy.address);
  const dividendPoolProxyAddrress = dividendPoolProxy.address;

  await (
    await dividendPoolProxy.initialize(
      lockTOSAddress,
      parseInt(time.duration.days(1)),
    )
  ).wait();

  // const adminAddress = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1";
  // await (await dividendPoolProxy.transferAdmin(adminAddress)).wait();

  await run("verify", {
    address: dividendPoolAddress,
    constructorArgsParams: [],
  });

  await run("verify", {
    address: dividendPoolProxyAddrress,
    constructorArgsParams: [dividendPoolAddress, deployer.address],
  });

});

