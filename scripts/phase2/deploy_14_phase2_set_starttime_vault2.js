const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

const {
  // padLeft,
  // toBN,
  // toWei,
  // fromWei,
  keccak256,
  // soliditySha3,
  // solidityKeccak256,
} = require("web3-utils");
const Web3EthAbi = require('web3-eth-abi');

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const vaultFactory = loadDeployed(process.env.NETWORK, "StakeVaultFactory");

const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");
  /*
const {
  createValue,
  createStakeContract,
  timeout,
  getPeriodBlockByTimes
  } = require("../../utils/deploy_common.js");
*/

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const stakeEntry2 = await ethers.getContractAt("Stake2Logic", proxy);
  console.log("stakeEntry2:", stakeEntry2.address);

  let vault = {
    address: process.env.PHASE2_LP_VAULT_ADDRESS,
    startTime : process.env.PHASE2_WTONTOS_STARTTIME,
    timestamp:0,
    endTime: process.env.PHASE2_WTONTOS_ENDTIME,
    timestampEnd:0,
  }
  let startTime = new Date(vault.startTime).getTime();
  vault.timestamp = Math.floor(startTime/1000);

  let endTime = new Date(vault.endTime).getTime();
  vault.timestampEnd = Math.floor(endTime/1000);


  console.log("setStartTimeOfVault2  ", vault );

  let tx = await stakeEntry2.setStartTimeOfVault2(
    vault.address,
    vault.timestamp
  );

  console.log("Phase2 setStartTimeOfVault2  ", tx.hash );
  printGasUsedOfUnits('Phase2 setStartTimeOfVault2 ', tx.hash);

  let tx1 = await stakeEntry2.setEndTimeOfVault2(
    vault.address,
    vault.timestampEnd
  );
  console.log("Phase2 setEndTimeOfVault2  ", tx1.hash );
  printGasUsedOfUnits('Phase2 setEndTimeOfVault2 ', tx1.hash);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
