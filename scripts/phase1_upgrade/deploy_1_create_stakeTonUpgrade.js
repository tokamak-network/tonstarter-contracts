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

const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const StakeTONUpgrade = await ethers.getContractFactory("StakeTONUpgrade");

  let deployInfo = {name:'', address:''};

  const stakeTONUpgrade = await StakeTONUpgrade.deploy();
  let tx  = await stakeTONUpgrade.deployed();
  console.log("StakeTONUpgrade:", stakeTONUpgrade.address);

  deployInfo = {
    name: "StakeTONUpgrade",
    address: stakeTONUpgrade.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('StakeTONUpgrade Deploy',tx);

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:", stakeEntry.address);

  let tx1 = await stakeEntry.upgradeStakeTo(process.env.PHASE1_TON_1_ADDRESS, stakeTONUpgrade.address);
  console.log("Stake1Logic upgradeStakeTo PHASE1_TON_1_ADDRESS", tx1.hash);
  printGasUsedOfUnits('Stake1Logic upgradeStakeTo PHASE1_TON_1_ADDRESS',tx1.hash);
  /*
  let tx2 = await stakeEntry.upgradeStakeTo(process.env.PHASE1_TON_2_ADDRESS, stakeTONUpgrade.address);
  console.log("Stake1Logic upgradeStakeTo PHASE1_TON_2_ADDRESS", tx2.hash);
  printGasUsedOfUnits('Stake1Logic upgradeStakeTo PHASE1_TON_2_ADDRESS',tx2.hash);

  let tx3 = await stakeEntry.upgradeStakeTo(process.env.PHASE1_TON_3_ADDRESS, stakeTONUpgrade.address);
  console.log("Stake1Logic upgradeStakeTo PHASE1_TON_3_ADDRESS", tx3.hash);
  printGasUsedOfUnits('Stake1Logic upgradeStakeTo PHASE1_TON_3_ADDRESS',tx3.hash);

  let tx4 = await stakeEntry.upgradeStakeTo(process.env.PHASE1_TON_4_ADDRESS, stakeTONUpgrade.address);
  console.log("Stake1Logic upgradeStakeTo PHASE1_TON_4_ADDRESS", tx4.hash);
  printGasUsedOfUnits('Stake1Logic upgradeStakeTo PHASE1_TON_4_ADDRESS',tx4.hash);


  let tx5 = await stakeEntry.upgradeStakeTo(process.env.PHASE1_TON_5_ADDRESS, stakeTONUpgrade.address);
  console.log("Stake1Logic upgradeStakeTo PHASE1_TON_5_ADDRESS", tx5.hash);
  printGasUsedOfUnits('Stake1Logic upgradeStakeTo PHASE1_TON_5_ADDRESS',tx5.hash);

  */
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
