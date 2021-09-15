const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed");
const { printGasUsedOfUnits } = require("./log_tx");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("./load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");

async function deployMain() {
  const [deployer, user1] = await ethers.getSigners();

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:", stakeEntry.address);
  let tx = await stakeEntry.removeAdmin(deployer.address);
  console.log("stakeEntry removeAdmin", deployer.address, tx.hash);
  printGasUsedOfUnits('stakeEntry removeAdmin',tx);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("\nDeploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString() +"\n");

  await deployMain();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
