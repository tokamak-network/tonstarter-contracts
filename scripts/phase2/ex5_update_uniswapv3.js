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

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const tos = await ethers.getContractAt("TOS", tostoken);
  console.log("tos:", tos.address);


  //================================================

  const StakeUniswapV3 = await ethers.getContractFactory("StakeUniswapV3");

  let stakeUniswapV3 = await StakeUniswapV3.deploy();
  tx =  await stakeUniswapV3.deployed();
  console.log("StakeUniswapV3:", stakeUniswapV3.address);
  console.log("StakeUniswapV3 deployed:", tx);

  /*
  deployInfo = {
    name: "StakeUniswapV3",
    address: stakeUniswapV3.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('StakeUniswapV3 Deploy',tx);
  */

  const Stake1Entry = await ethers.getContractAt("Stake1Logic",proxy);
  tx =  await Stake1Entry.upgradeStakeTo(
    process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS,
    stakeUniswapV3.address);
  console.log("StakeUniswapV3 upgradeStakeTo:", tx.hash);

   //=====================================

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
