const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");

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
const loadDeployedInitVariable = require("./load_deployed_init");

const tostoken = loadDeployedInitVariable(process.env.NETWORK, "TOS");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const StakeRegistry = await ethers.getContractFactory("StakeRegistry");

  const stakeRegistry = await StakeRegistry.deploy(tos.address);
  await stakeRegistry.deployed();
  console.log("stakeRegistry:", stakeRegistry.address);

  const out = {};
  out.StakeRegistry = stakeRegistry.address;

  return out;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contracts = await deployMain(deployer);
  console.log("contracts:", process.env.NETWORK, contracts);

  // The address the Contract WILL have once mined

  // const out = {};
  // out.StakeRegistry = contracts.StakeRegistry;

  // save(process.env.NETWORK, out);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
