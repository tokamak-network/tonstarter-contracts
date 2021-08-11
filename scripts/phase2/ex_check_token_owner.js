const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");
const NonfungiblePositionManagerJson = require("../../abis_uniswap3_periphery/NonfungiblePositionManager.json");
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

const NonfungiblePositionManagerAddress = process.env.NonfungiblePositionManager;

const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log("NonfungiblePositionManagerAddress:", NonfungiblePositionManagerAddress);

  const NPMContract = new ethers.Contract(
    NonfungiblePositionManagerAddress,
    NonfungiblePositionManagerJson.abi, ethers.provider);
  //================================================
  console.log("NPMContract:", NPMContract.address);
  let tokenId = ethers.BigNumber.from("3383");

  let owner = await NPMContract.connect(user1).ownerOf(tokenId);
  console.log("owner", tokenId.toString(), owner );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
