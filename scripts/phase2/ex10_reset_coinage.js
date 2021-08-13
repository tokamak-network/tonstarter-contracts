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
console.log("ADMIN_ROLE:",ADMIN_ROLE);

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
  //================================================
  const Stake1Logic = await ethers.getContractAt("Stake1Logic", proxy);
  const Stake2Vault = await ethers.getContractAt("Stake2Vault", process.env.PHASE2_LP_VAULT_ADDRESS);
  const StakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);

   //=====================================
  // let tx0 = await Stake1Logic.grantRole(process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS, ADMIN_ROLE, deployer.address);
  // console.log("\n Stake1Logic grantRole:", tx0.hash);


  console.log("\n =========== resetCoinageTime ");
  let tx =  await StakeUniswapV3.resetCoinageTime();
  console.log("\n StakeUniswapV3 resetCoinageTime:", tx.hash);


  let coinageLastMintBlockTimetamp =  await StakeUniswapV3.coinageLastMintBlockTimetamp();
  console.log("\n StakeUniswapV3 coinageLastMintBlockTimetamp:", coinageLastMintBlockTimetamp.toString()  );


  let startTime =  await StakeUniswapV3.startTime();
  console.log("\n -------- StakeUniswapV3 startTime:", startTime.toString());


  let res2 =  await StakeUniswapV3.totalSupplyCoinage();
  console.log("\n StakeUniswapV3 totalSupplyCoinage:", utils.formatUnits(res2.toString(), 27)  );

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
