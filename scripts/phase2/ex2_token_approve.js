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

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log("NonfungiblePositionManagerAddress:", NonfungiblePositionManagerAddress);

  const tokenId3476 = ethers.BigNumber.from("3476");
  const tokenId3484 = ethers.BigNumber.from("3484");
  // let token = {
  //   id: tokenId3476,
  //   name: '3476',
  //   sender : user1
  // }

  // let token = {
  //   id: tokenId3484,
  //   name: '3484',
  //   sender : user2
  // }

  // wton-tos
  const tokenId3690 = ethers.BigNumber.from("3690");
  const tokenId3880 = ethers.BigNumber.from("3880");

  // let token = {
  //   id: tokenId3690,
  //   name: '3690',
  //   sender : user1
  //}
  let token = {
    id: tokenId3880,
    name: '3880',
    sender : user2
  }

  const NPMContract = new ethers.Contract(
    NonfungiblePositionManagerAddress,
    NonfungiblePositionManagerJson.abi, ethers.provider);

  console.log("NPMContract:", NPMContract.address);

  let tx = await NPMContract.connect(token.sender).approve(
    process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS,
    token.id
  );

  console.log("NPMContract.approve", tx.hash );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
