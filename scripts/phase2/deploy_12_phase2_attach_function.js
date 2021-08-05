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
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const vaultFactory = loadDeployed(process.env.NETWORK, "StakeVaultFactory");

const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");

const Stake2LogicAddress = loadDeployed(process.env.NETWORK, "Stake2Logic");

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Stake1Proxy = await ethers.getContractAt("Stake1Proxy", proxy);
  console.log("Stake1Proxy:", Stake1Proxy.address);
  // const Stake2Logic = await ethers.getContractAt("Stake2Logic", Stake2LogicAddress);
  // console.log("Stake2Logic:", Stake2Logic.address);

  // attach stake2logic
  let _func1 = Web3EthAbi.encodeFunctionSignature("createVault2(uint256,uint256,address[4],string)") ;
  let _func2 = Web3EthAbi.encodeFunctionSignature("setVaultLogicByPhase(uint256,address)") ;
  let _func3 = Web3EthAbi.encodeFunctionSignature("setPool(address,address[4])") ;
  let _func4 = Web3EthAbi.encodeFunctionSignature("setMiningIntervalSeconds(address,uint256)") ;
  let _func5 = Web3EthAbi.encodeFunctionSignature("resetCoinageTime(address)") ;
  let _func6 = Web3EthAbi.encodeFunctionSignature("setStartTimeOfVault2(address,uint256)") ;
  let _func7 = Web3EthAbi.encodeFunctionSignature("setEndTimeOfVault2(address,uint256)") ;
  // console.log('balanceOf(address,address)',_func1);
  // console.log('balanceOfTOS(address)',_func2);
  // console.log('createVault2',_func3);
  // console.log('setVaultLogicByPhase',_func4);
  // console.log('setPool',_func5);

  let tx1 =  await Stake1Proxy.setImplementation(
    Stake2LogicAddress,
    ethers.BigNumber.from("1"),
    true);

  console.log("Stake2Logic setImplementation: " , tx1.hash);
  printGasUsedOfUnits('Stake2Logic setImplementation', tx1);
  //=====================================

  let tx2 =  await Stake1Proxy.setSelectorImplementations(
        [_func1, _func2, _func3, _func4, _func5, _func6, _func7],
        Stake2LogicAddress);

  console.log("Stake2Logic setSelectorImplementations: " , tx2.hash);
  printGasUsedOfUnits('Stake2Logic setSelectorImplementations', tx2);


  console.log("finish phase2-functions-setting");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
