const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const Web3EthAbi = require("web3-eth-abi");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
/*
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");
const wton = process.env.WTON;

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");
*/
const ton = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0";
const wton = "0x709bef48982Bbfd6F2D4Be24660832665F53406C";
const PHASE1_TON_1_ADDRESS = "0x59357d4698aa898da8a1390829ae9af68ae18c35";

const tonABI = require("../../abis/TOS.json");
const TokamakStakeUpgrade4ABI = require("../../abis/TokamakStakeUpgrade4.json");


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  let _func_exchangeWTONtoTOS = Web3EthAbi.encodeFunctionSignature("exchangeWTONtoTOS(uint256)");
  let _func_getPoolAddress = Web3EthAbi.encodeFunctionSignature("getPoolAddress()");
  let _func_acceptMinTick = Web3EthAbi.encodeFunctionSignature("acceptMinTick(int24,int24,int24)");
  let _func_acceptMaxTick = Web3EthAbi.encodeFunctionSignature("acceptMaxTick(int24,int24,int24)");
  let _func_limitPrameters = Web3EthAbi.encodeFunctionSignature("limitPrameters(uint256,address,address,address,int24)");

  console.log("_func_exchangeWTONtoTOS",_func_exchangeWTONtoTOS);
  console.log("_func_getPoolAddress",_func_getPoolAddress);
  console.log("_func_acceptMinTick",_func_acceptMinTick);
  console.log("_func_acceptMaxTick",_func_acceptMaxTick);
  console.log("_func_limitPrameters",_func_limitPrameters);

  const tonContract = await ethers.getContractAt(tonABI.abi, ton, ethers.provider);
  console.log("ton:", ton);
  let tonbalance = await tonContract.balanceOf(PHASE1_TON_1_ADDRESS);
  console.log("tonbalance:", tonbalance.toString());


  const StakeTON1 = await ethers.getContractAt(TokamakStakeUpgrade4ABI.abi,  PHASE1_TON_1_ADDRESS, ethers.provider);
  console.log("StakeTON1:", StakeTON1.address);

  let getPoolAddress = await StakeTON1.getPoolAddress();
  console.log("getPoolAddress:", getPoolAddress);

  let totalStakedAmount = await StakeTON1.totalStakedAmount();
  console.log("totalStakedAmount:", totalStakedAmount.toString());

  let tx = await StakeTON1.connect(deployer).exchangeWTONtoTOS(
    ethers.BigNumber.from("100000000000000000000000000000")
    );
  console.log("exchangeWTONtoTOS:", tx);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
