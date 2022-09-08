const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

let LockTOSDividend = "0xCc3dE20A9358D5787f1E4A7d5F6eb473d0124878";
let adminAddress = "0x5b6e72248b19F2c5b88A4511A6994AD101d0c287";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const LockTOSDividendProxy = await ethers.getContractFactory("LockTOSDividendProxy");

  let deployInfo = {name:'', address:''};

  const lockTOSDividendProxy = await LockTOSDividendProxy.deploy(
    LockTOSDividend, adminAddress
  );

  let tx  = await lockTOSDividendProxy.deployed();
  console.log("LockTOSDividendProxy:", lockTOSDividendProxy.address);

  deployInfo = {
    name: "LockTOSDividendProxy",
    address: lockTOSDividendProxy.address
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
