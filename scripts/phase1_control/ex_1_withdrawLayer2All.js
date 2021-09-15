const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

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
const wton = loadDeployed(process.env.NETWORK, "WTON");
const DepositManager = loadDeployed(process.env.NETWORK, "DepositManager");
const SeigManager = loadDeployed(process.env.NETWORK, "SeigManager");


const StakeTONControl = loadDeployed(process.env.NETWORK, "StakeTONControl");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);
  const stakeTONControl = await ethers.getContractAt("StakeTONControl", StakeTONControl);
  let can = await stakeTONControl.canWithdrawLayer2All();

  console.log("stakeTONControl canWithdrawLayer2All :", can);

  if(can.can){

    let tx1 = await stakeTONControl.connect(deployer).withdrawLayer2All();
    console.log("withdrawLayer2All StakeTONControl ", tx1.hash);
    printGasUsedOfUnits('withdrawLayer2All StakeTONControl',tx1);

  }

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
