const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const Web3EthAbi = require("web3-eth-abi");

const { toBN, keccak256 } = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  const TOS_Address = tostoken;

  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);
  const tosbalance = await tos.balanceOf(process.env.PHASE1_TON_4_ADDRESS);
  console.log("tosbalance:", tosbalance.toString());

  const stakeTON1 = await ethers.getContractAt(
    "StakeTONUpgrade3",
    process.env.PHASE1_TON_1_ADDRESS
  );
  let version = await stakeTON1.connect(user1).version();
  console.log("PHASE1_TON_1_ADDRESS version", version);

  const stakeTON2 = await ethers.getContractAt(
    "StakeTONUpgrade3",
    process.env.PHASE1_TON_2_ADDRESS
  );
  version = await stakeTON2.connect(user1).version();
  console.log("PHASE1_TON_2_ADDRESS version", version);

  const stakeTON3 = await ethers.getContractAt(
    "StakeTONUpgrade3",
    process.env.PHASE1_TON_3_ADDRESS
  );
  version = await stakeTON3.connect(user1).version();
  console.log("PHASE1_TON_3_ADDRESS version", version);

  const stakeTON4 = await ethers.getContractAt(
    "StakeTONUpgrade3",
    process.env.PHASE1_TON_4_ADDRESS
  );
  version = await stakeTON4.connect(user1).version();
  console.log("PHASE1_TON_4_ADDRESS version", version);

  const stakeTON5 = await ethers.getContractAt(
    "StakeTONUpgrade3",
    process.env.PHASE1_TON_5_ADDRESS
  );
  version = await stakeTON5.connect(user1).version();
  console.log("PHASE1_TON_5_ADDRESS version", version);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    deployer.address,
    process.env.NETWORK
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
