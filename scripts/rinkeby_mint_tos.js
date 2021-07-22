const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
//const loadDeployedInitVariable = require("./load_deployed_init");
const { printGasUsedOfUnits } = require("./log_tx");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();


const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  console.log("deployer:", deployer.address);

  const tos  = await ethers.getContractAt("TOS", tostoken);
  console.log("tos:", tos.address);



  let tx  =  await tos.mint(deployer.address, utils.parseUnits(process.env.PHASE1_TON_ALLOCATED + "." + "0".repeat(18)));
  console.log("tos.mint:",tx.hash);
  // let tx0 = await stakeEntry.setStore(
  //   tostoken,
  //   registry,
  //   factory,
  //   vaultfactory,
  //   ton,
  //   wton,
  //   depositManager,
  //   seigManager
  // );
  // console.log("stakeEntry setStore:");
  // printGasUsedOfUnits('StakeRegistry setTokamak',tx0);

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
