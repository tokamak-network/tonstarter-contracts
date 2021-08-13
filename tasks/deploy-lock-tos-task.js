const { findAccount } = require("./utils");
const { time } = require("@openzeppelin/test-helpers");

task("rinkeby-deploy-lock-tos", "Deploy TOS").setAction(async () => {
  const { RINKEBY_DEPLOY_ACCOUNT: account, RINKEBY_TOS_ADDRESS: tokenAddress } =
    process.env;
  const phase3StartTime = "0"; // (await time.latest()) + time.duration.weeks(4);
  console.log({ phase3StartTime });
  const deployer = await findAccount(account);

  const lockTOS = await (await ethers.getContractFactory("LockTOS"))
    .connect(deployer)
    .deploy(deployer.address, tokenAddress, phase3StartTime);
  await lockTOS.deployed();
  console.log("LockTOS: ", lockTOS.address);
  await run("verify", {
    address: lockTOS.address,
    constructorArgsParams: [tokenAddress, phase3StartTime]
  });
});
