const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const LockTOSv2Proxy = await ethers.getContractFactory("LockTOSv2Proxy");

  let deployInfo = {name:'', address:''};

  const lockTOSv2Proxy = await LockTOSv2Proxy.deploy();
  let tx  = await lockTOSv2Proxy.deployed();
  console.log("LockTOSv2Proxy:", lockTOSv2Proxy.address);

  deployInfo = {
    name: "LockTOSv2Proxy",
    address: lockTOSv2Proxy.address
  }

  console.log(deployInfo);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
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
