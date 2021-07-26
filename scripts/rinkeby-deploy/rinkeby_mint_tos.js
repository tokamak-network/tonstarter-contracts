const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("./log_tx");

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

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());


  const tos = await ethers.getContractAt("TOS", tostoken);


  const tx = await tos.mint(
      process.env.PHASE1_TON_VAULT_ADDRESS,
      utils.parseUnits(process.env.PHASE1_TON_ALLOCATED + "." + "0".repeat(18))
    );

  console.log("tos.mint tx ", tx.hash );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
