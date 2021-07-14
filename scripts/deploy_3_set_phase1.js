const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
//const loadDeployedInitVariable = require("./load_deployed_init");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();


const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const vaultfactory = loadDeployed(process.env.NETWORK, "StakeVaultFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");

const ton = loadDeployed(process.env.NETWORK, "TON");
const wton = loadDeployed(process.env.NETWORK, "WTON");
const depositManager = loadDeployed(process.env.NETWORK, "DepositManager");
const seigManager = loadDeployed(process.env.NETWORK, "SeigManager");
const swapProxy = loadDeployed(process.env.NETWORK, "SwapProxy");


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const uniswapRouter = process.env.UniswapRoute;
  const uniswapNPM = process.env.NonfungiblePositionManager;
  const uniswapFee = process.env.UniswapFee;
  const uniswapWeth = process.env.WethAddress;
  const uniswapRouter2 = process.env.UniswapRouter2;

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:", stakeEntry.address);

  // console.log("tostoken:", tostoken);
  // console.log("registry:", registry);
  // console.log("factory:", factory);
  // console.log("vaultfactory:", wton);
  // console.log("ton:", ton);
  // console.log("wton:", vaultfactory);
  // console.log("depositManager:", depositManager);
  // console.log("seigManager:", seigManager);

  await stakeEntry.setStore(
    tostoken,
    registry,
    factory,
    vaultfactory,
    ton,
    wton,
    depositManager,
    seigManager
  );
  console.log("stakeEntry setStore:");

  const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);

  await stakeRegistry.setTokamak(ton, wton, depositManager, seigManager, swapProxy);
  console.log("stakeRegistry setTokamak:");

  await stakeRegistry.addDefiInfo(
    "UNISWAP_V3",
    uniswapRouter,
    uniswapNPM,
    uniswapWeth,
    parseInt(uniswapFee),
    uniswapRouter2
  );
  console.log("stakeRegistry addDefiInfo:");

  await stakeRegistry.grantRole(ADMIN_ROLE, proxy);
  console.log("stakeRegistry grantRole: proxy");

  const stakeFactory = await ethers.getContractAt("StakeFactory", factory);
  await stakeFactory.grantRole(ADMIN_ROLE, proxy);
  console.log("stakeFactory grantRole: proxy");


  const stakeVaultFactory = await ethers.getContractAt("StakeVaultFactory", vaultfactory);
  await stakeVaultFactory.grantRole(ADMIN_ROLE, proxy);
  console.log("StakeVaultFactory grantRole: proxy");

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
