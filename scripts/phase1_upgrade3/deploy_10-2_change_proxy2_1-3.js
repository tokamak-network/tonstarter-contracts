const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const Web3EthAbi = require("web3-eth-abi");

const { toBN, keccak256 } = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");
const TokamakStakeUpgrade4 = loadDeployed(process.env.NETWORK, "TokamakStakeUpgrade4");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const stakeTON1 = await ethers.getContractAt(
    "StakeTONProxy2",
    process.env.PHASE1_TON_1_ADDRESS
  );

  const isAdmin = await stakeTON1.isAdmin(deployer.address);
  console.log("isAdmin PHASE1_TON_1_ADDRESS", deployer.address, isAdmin);

  const tx1 = await stakeTON1.setImplementation2(TokamakStakeUpgrade4, 2, true);
  console.log(
    "setImplementation2 PHASE1_TON_1_ADDRESS TokamakStakeUpgrade4 ",
    tx1.hash
  );
  printGasUsedOfUnits(
    "setImplementation2 PHASE1_TON_1_ADDRESS TokamakStakeUpgrade4",
    tx1
  );

  await tx1.wait();

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


  const tx3 = await stakeTON1.setSelectorImplementations2(
    [_func_exchangeWTONtoTOS,_func_getPoolAddress,_func_acceptMinTick,_func_acceptMaxTick,_func_limitPrameters],
    StakeTONUpgrade3
  );
  console.log(
    "setSelectorImplementations2 PHASE1_TON_1_ADDRESS ",
    tx3.hash
  );
  printGasUsedOfUnits(
    "setSelectorImplementations2 PHASE1_TON_1_ADDRESS ",
    tx3
  );

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    deployer.address,
    process.env.NETWORK
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
