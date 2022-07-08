const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";


async function deployMain(defaultSender) {

  const [deployer, user1] = await ethers.getSigners();

  const TokamakStakeUpgrade4 = await ethers.getContractFactory("TokamakStakeUpgrade4");

  const tokamakStakeUpgrade4 = await TokamakStakeUpgrade4.deploy();
  let tx  = await tokamakStakeUpgrade4.deployed();
  console.log("TokamakStakeUpgrade4:", tokamakStakeUpgrade4.address);

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
