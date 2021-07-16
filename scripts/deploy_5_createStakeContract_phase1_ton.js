const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
//const loadDeployedInput = require("./load_deployed_input");
const {
  // padLeft,
  // toBN,
  // toWei,
  // fromWei,
  keccak256,
  // soliditySha3,
  // solidityKeccak256,
} = require("web3-utils");

require("dotenv").config();

const { printGasUsedOfUnits } = require("./log_tx");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");

const {
  createValue,
  createStakeContract,
  timeout,
  getPeriodBlockByTimes,
  getEndTime
} = require("../utils/deploy_common.js");

const periods = [
  {
    name: process.env.PHASE1_TON_0_NAME,
    period: process.env.PHASE1_TON_0_PERIOD,
    startTime: process.env.PHASE1_TON_MINING_STARTTIME,
    endTime: 0 ,
    periodBlocks: 0
  },
  {
    name: process.env.PHASE1_TON_1_NAME,
    period: process.env.PHASE1_TON_1_PERIOD,
    startTime: process.env.PHASE1_TON_MINING_STARTTIME,
    endTime: 0 ,
    periodBlocks: 0
  },
  {
    name: process.env.PHASE1_TON_2_NAME,
    period: process.env.PHASE1_TON_2_PERIOD,
    startTime: process.env.PHASE1_TON_MINING_STARTTIME,
    endTime: 0,
    periodBlocks: 0
  },
  {
    name: process.env.PHASE1_TON_3_NAME,
    period: process.env.PHASE1_TON_3_PERIOD,
    startTime: process.env.PHASE1_TON_MINING_STARTTIME,
    endTime: 0,
    periodBlocks: 0
  },
  {
    name: process.env.PHASE1_TON_4_NAME,
    period: process.env.PHASE1_TON_4_PERIOD,
    startTime: process.env.PHASE1_TON_MINING_STARTTIME,
    endTime: 0,
    periodBlocks: 0
  },
  {
    name: process.env.PHASE1_TON_5_NAME,
    period: process.env.PHASE1_TON_5_PERIOD,
    startTime: process.env.PHASE1_TON_MINING_STARTTIME,
    endTime: 0,
    periodBlocks: 0
  },
];

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  for(let i=0; i< periods.length; i++){
    let res = getEndTime(periods[i].startTime, periods[i].period);

    periods[i].endTime = res.stakeEndDate;
    periods[i].periodBlocks = res.periodBlocks;
  }

  console.log("periods", periods);

  let token = null;

  if (
    process.env.PHASE1_TON_VAULT_ADDRESS != null &&
    process.env.PHASE1_TON_VAULT_ADDRESS.length > 0 &&
    (
      process.env.PHASE1_TON_STAKE_TYPE == "TON" ||
      process.env.PHASE1_TON_STAKE_TYPE == "ETH"
    ) &&
    process.env.PHASE1_TON_VAULT_NAME != null
  ) {
    if (process.env.PHASE1_TON_STAKE_TYPE == "TON") {
      token = ton;

    } else if (process.env.PHASE1_TON_STAKE_TYPE == "ETH") {
      token = zeroAddress;
    }
    console.log("PHASE1_TON_STAKE_TYPE", process.env.PHASE1_TON_STAKE_TYPE);
    console.log("PHASE1_TON_VAULT_ADDRESS", process.env.PHASE1_TON_VAULT_ADDRESS);
    console.log("token", token);


    for (let i = 0; i < periods.length; i++) {
      await createStakeContract(
        process.env.PHASE1_TON_VAULT_ADDRESS,
        periods[i].periodBlocks,
        periods[i].name,
        token
      );
      timeout(10000);
    }
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
