const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const Web3EthAbi = require("web3-eth-abi");

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

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const stakeTON = await ethers.getContractAt("StakeTONProxy2", process.env.PHASE1_TON_2_ADDRESS);

  let isAdmin = await stakeTON.isAdmin(deployer.address);
  console.log("isAdmin PHASE1_TON_2_ADDRESS", deployer.address, isAdmin);

  let tx1 = await stakeTON.setImplementation2(StakeTONUpgrade2, 0, true);
  console.log("setImplementation2 PHASE1_TON_2_ADDRESS StakeTONUpgrade2 ", tx1.hash);
  printGasUsedOfUnits('setImplementation2 PHASE1_TON_2_ADDRESS StakeTONUpgrade2',tx1);

  let tx2 = await stakeTON.setImplementation2(StakeTONUpgrade3, 1, true);
  console.log("setImplementation2 PHASE1_TON_2_ADDRESS StakeTONUpgrade3", tx2.hash);
  printGasUsedOfUnits('setImplementation2 PHASE1_TON_2_ADDRESS StakeTONUpgrade3',tx2);

  let _func1 = Web3EthAbi.encodeFunctionSignature("withdraw()") ;
  console.log("_func1 withdraw()", _func1);
  let tx3 =  await stakeTON.setSelectorImplementations2([_func1], StakeTONUpgrade3 );
  console.log("setSelectorImplementations2 PHASE1_TON_2_ADDRESS withdraw", tx3.hash);
  printGasUsedOfUnits('setSelectorImplementations2 PHASE1_TON_2_ADDRESS withdraw',tx3);

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
