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

// rinkeby
const StakeTONUnstaking_Address = "0xf9381fB7167FC3e81849aE82960144274D1553C2";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  // const TOS_Address = tostoken;
  // const tos = await ethers.getContractAt("TOS", TOS_Address);
  // console.log("tos:", tos.address);
  const stakeTONUnstaking = await ethers.getContractAt("StakeTONUnstaking", StakeTONUnstaking_Address);

   // console.log("stakeTONUnstaking :", stakeTONUnstaking);


  let can = await stakeTONUnstaking.canRequestUnstakingLayer2All();

  console.log("stakeTONUnstaking canRequestUnstakingLayer2All :", can);

  /*
  if(can.can){

    let tx1 = await stakeTONUnstaking.connect(deployer).requestUnstakingLayer2All();
    console.log("stakeTONUnstaking requestUnstakingLayer2All ", tx1.hash);
    printGasUsedOfUnits('stakeTONUnstaking requestUnstakingLayer2All',tx1);

  }
  */

  return null;
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
