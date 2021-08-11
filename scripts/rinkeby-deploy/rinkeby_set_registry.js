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

const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const uniswapRouter = "0xe592427a0aece92de3edee1f18e0157c05861564";
  const uniswapNPM = "0xC4E54951aE132778970bB5273b8e642B15D92911";
  const uniswapFee = 500;
  const uniswapWeth = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
  const uniswapRouter2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);

  // await stakeRegistry.addDefiInfo(
  //   "UNISWAP_V3",
  //   uniswapRouter,
  //   uniswapNPM,
  //   uniswapWeth,
  //   parseInt(uniswapFee),
  //   uniswapRouter2
  // );
  // console.log("stakeRegistry addDefiInfo:");


  let res = await stakeRegistry.getUniswap();
  console.log("stakeRegistry addDefiInfo:", res);




  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("stakeRegistry.addDefiInfo  with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
