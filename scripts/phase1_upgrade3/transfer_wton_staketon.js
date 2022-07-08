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
const wton = process.env.WTON;


const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");


const wtonABI = require("../../abis/TOS.json");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const wtonContract = await ethers.getContractAt(wtonABI.abi, wton, ethers.provider);
  console.log("wton:", wton);
  let wtonbalance = await wtonContract.balanceOf(process.env.PHASE1_TON_1_ADDRESS);
  console.log("wtonbalance:", wtonbalance.toString());


  let tx1 = await wtonContract.connect(user1).transfer(
    process.env.PHASE1_TON_1_ADDRESS,
    ethers.BigNumber.from("100000000000000000000000000000")
  );
  console.log("transfer", tx1);
  await tx1.wait();

  wtonbalance = await wtonContract.balanceOf(process.env.PHASE1_TON_1_ADDRESS);
  console.log("wtonbalance:", wtonbalance.toString());

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
