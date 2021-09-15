const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);
  console.log("stakeRegistry:", stakeRegistry.address);

  let tx1 = await stakeRegistry.connect(deployer).addDefiInfo(
          process.env.PHASE1_SWAPTOS_BURNPERCENT_NAME,
          StakeTONUpgrade3,
          zeroAddress,
          zeroAddress,
          process.env.PHASE1_SWAPTOS_BURNPERCENT,
          zeroAddress
        );

  console.log("addDefiInfo PHASE1_SWAPTOS_BURNPERCENT", tx1.hash);
  printGasUsedOfUnits('addDefiInfo PHASE1_SWAPTOS_BURNPERCENT',tx1);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
