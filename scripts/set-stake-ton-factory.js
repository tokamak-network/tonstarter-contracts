const loadDeployed = require("./load_deployed");
const { findAccount } = require("../tasks/utils");

require("dotenv").config();

let tostoken = loadDeployed(process.env.NETWORK,"TOS");
let registry = loadDeployed(process.env.NETWORK,"StakeRegistry");
let factory = loadDeployed(process.env.NETWORK,"StakeFactory");
let vaultfactory = loadDeployed(process.env.NETWORK,"StakeVaultFactory");
let logic = loadDeployed(process.env.NETWORK,"Stake1Logic");
let proxy = loadDeployed(process.env.NETWORK,"Stake1Proxy");
console.log({ factory });

async function main() {
  const { RINKEBY_UNISWAP_V3_ACCOUNT_ADMIN } = process.env;

  const admin = await findAccount(RINKEBY_UNISWAP_V3_ACCOUNT_ADMIN);
  const StakeTONLogicFactory = await (await ethers.getContractFactory("StakeTONLogicFactory")).connect(admin).deploy();
  await StakeTONLogicFactory.deployed();

  const StakeTONProxyFactory = await (await ethers.getContractFactory("StakeTONProxyFactory")).connect(admin).deploy();
  await StakeTONProxyFactory.deployed();

  const StakeTONFactory = await (await ethers.getContractFactory("StakeTONFactory")).connect(admin).deploy(StakeTONProxyFactory.address, StakeTONLogicFactory.address);
  await StakeTONFactory.deployed();
  console.log("StakeTONFactory: ", StakeTONFactory.address);

  const StakeFactory = await ethers.getContractAt("Stake1Logic", logic);
  await StakeFactory.connect(admin).setStakeTONFactory(StakeTONFactory.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
