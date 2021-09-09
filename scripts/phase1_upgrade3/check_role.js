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
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  console.log("PHASE1.SWAPTOS.BURNPERCENT: ", keccak256("PHASE1.SWAPTOS.BURNPERCENT"));
  console.log("ADMIN: ", keccak256("ADMIN"));
  console.log("BURNER: ", keccak256("BURNER"));
  let _func1 = Web3EthAbi.encodeFunctionSignature("withdraw()") ;
  let _func2 = Web3EthAbi.encodeFunctionSignature("withdrawData(address)") ;
  let _func3 = Web3EthAbi.encodeFunctionSignature("version()") ;
  console.log("_func1 withdraw()", _func1);
  console.log("_func2 withdrawData(address)", _func2);
  console.log("_func3 version()", _func3);
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
