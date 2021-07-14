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
  getPeriodBlockByTimes
  } = require("../utils/deploy_common.js");

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const provider = ethers.provider;

  // console.log("ADMIN_ROLE", ADMIN_ROLE);
  const curBlock = await provider.getBlockNumber();
  //console.log("curBlock", curBlock);

  let curUnixTimestamp = Math.floor(new Date().getTime()/1000);
  //console.log("curUnixTimestamp", curUnixTimestamp);
  let saleStartTime = Math.floor(new Date(process.env.PHASE1_TON_SALE_STARTTIME).getTime()/1000);
  //console.log("saleStartTime", saleStartTime);

  let saleStartBlock = curBlock+((saleStartTime-curUnixTimestamp)/process.env.BLOCKTIME);
  saleStartBlock = parseInt(saleStartBlock);
  //console.log("saleStartBlock", saleStartBlock);

  let stakeStartTime = Math.floor(new Date(process.env.PHASE1_TON_MINING_STARTTIME).getTime()/1000);
  //console.log("stakeStartTime", stakeStartTime);

  let stakeStartBlock = curBlock+((stakeStartTime-curUnixTimestamp)/process.env.BLOCKTIME);
  stakeStartBlock = parseInt(stakeStartBlock);
  //console.log("stakeStartBlock", stakeStartBlock);

  const vault = {
    allocatedTOS: process.env.PHASE1_TON_ALLOCATED,
    saleStartBlock: saleStartBlock,
    stakeStartBlock: stakeStartBlock,
    phase: 1,
    hashName : keccak256(process.env.PHASE1_TON_VAULT_NAME),
    type: 0,
  }

  let token = null ;
  if(process.env.PHASE1_TON_STAKE_TYPE == "TON"){
    vault.type = 0;
    token = ton;

  }else if(process.env.PHASE1_TON_STAKE_TYPE == "ETH"){
    vault.type = 1;
    token = zeroAddress;
  }

  console.log("vault", vault);
  console.log("token", token);
  await createValue(vault, token);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
