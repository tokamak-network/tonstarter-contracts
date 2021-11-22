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

let layer2 = "0x42ccf0769e87cb2952634f607df1c7d62e0bbc52";
let addTons = ["0x9a8294566960Ab244d78D266FFe0f284cDf728F1","0x7da4E8Ab0bB29a6772b6231b01ea372994c2A49A","0xFC1fC3a05EcdF6B3845391aB5CF6a75aeDef7CeA"];


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const stakeTONUnstaking = await ethers.getContractAt("ITokamakStakerUpgrade", addTons[0]);
  let canTokamakRequestUnStaking1 = await stakeTONUnstaking.canTokamakRequestUnStaking(layer2);

  console.log("stakeTONUnstaking canTokamakRequestUnStaking1 :", canTokamakRequestUnStaking1.toString());

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
