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
const TONJson = require("../../abis_plasma/TON.json").abi;

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const tonAddress = loadDeployed(process.env.NETWORK, "TON");

async function deployMain() {
  const [deployer, user1, user2] = await ethers.getSigners();

  const ton = await ethers.getContractAt(TONJson, tonAddress);
  console.log("ton:", ton.address);

  let amount = ethers.BigNumber.from("10000000000000000000000");

  let tx = await ton.connect(user2).approve("0xEb492922afa05D0D7704AD5c202f2ddCc386DA75", amount);
  console.log(tx);
  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain();

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
