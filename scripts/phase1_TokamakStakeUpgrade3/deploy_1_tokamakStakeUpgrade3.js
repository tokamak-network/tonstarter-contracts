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

// rinkeby
let TOS_Address = "";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TokamakStakeUpgrade3 = await ethers.getContractFactory("TokamakStakeUpgrade3");

  let deployInfo = {name:'', address:''};

  const tokamakStakeUpgrade3 = await TokamakStakeUpgrade3.deploy();
  let tx  = await tokamakStakeUpgrade3.deployed();
  console.log("TokamakStakeUpgrade3:", tokamakStakeUpgrade3.address);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
