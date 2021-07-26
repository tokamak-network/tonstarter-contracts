const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

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

const tostoken = loadDeployed(process.env.NETWORK, "TOS");

const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

async function main() {

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const tokenId = ethers.BigNumber.from("3476");
  //const tokenId = ethers.BigNumber.from("3484");

  const tokenId3476 = ethers.BigNumber.from("3476");
  const tokenId3484 = ethers.BigNumber.from("3484");

  let token = {
    id: tokenId3476,
    name: '3476',
    sender : user1
  }

  // let token = {
  //   id: tokenId3484,
  //   name: '3484',
  //   sender : user2
  // }

  //================================================
  const stakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);
  console.log("stakeUniswapV3:", stakeUniswapV3.address);

  let tx = await stakeUniswapV3.connect(token.sender).stake(token.id);

  console.log("stakeUniswapV3 stake", tx.hash);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
