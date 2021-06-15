const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
const loadDeployedInput = require("./load_deployed_input");

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
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

  let VaultName = null;
  let StakeType = null;

  StakeType = loadDeployedInput(process.env.NETWORK, "StakeType");
  VaultName = loadDeployedInput(process.env.NETWORK, "VaultName");
  console.log("StakeType", StakeType);
  console.log("VaultName", VaultName);

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
  const provider = await ethers.getDefaultProvider("rinkeby");
  console.log("ADMIN_ROLE", ADMIN_ROLE);
  const curBlock = await provider.getBlockNumber();
  console.log("curBlock", curBlock);

  let saleStartBlock = parseInt(curBlock) + (60 * 5) / 13;
  saleStartBlock = parseInt(saleStartBlock);

  let stakeStartBlock = parseInt(saleStartBlock) + (60 * 5) / 13;
  stakeStartBlock = parseInt(stakeStartBlock);

  const vault = {
    allocatedTOS: "100000",
    saleStartBlock: saleStartBlock,
    stakeStartBlock: stakeStartBlock,
    phase: 1,
    hashName : keccak256(VaultName),
    type: 0,
  }

  let token = null ;
  if(StakeType == "TON"){
    vault.type = 0;
    token = ton;

  }else if(StakeType == "ETH"){
    vault.type = 1;
    token = zeroAddress;
  }

  console.log('StakeType',StakeType);
  console.log('token',token);
  await createValue(vault, token);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
