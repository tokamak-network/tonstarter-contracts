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

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const StakeTONUnstaking = await ethers.getContractFactory("StakeTONUnstaking");

  let deployInfo = {name:'', address:''};

  const stakeTONUnstaking = await StakeTONUnstaking.deploy();
  let tx  = await stakeTONUnstaking.deployed();
  console.log("StakeTONUnstaking:", stakeTONUnstaking.address);

  deployInfo = {
    name: "StakeTONUnstaking",
    address: stakeTONUnstaking.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('StakeTONUnstaking Deploy',tx);
  return null;
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
