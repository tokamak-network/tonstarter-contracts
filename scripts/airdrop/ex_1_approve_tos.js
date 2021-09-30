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


const TON_ABI = require("../../abis_plasma_ethers/contracts/stake/tokens/TON.sol/TON.json");

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const tontoken = loadDeployed(process.env.NETWORK, "TON");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);
  const ton = await new ethers.Contract(tontoken, TON_ABI.abi, ethers.provider);
  console.log("ton:", ton.address);

  let total = await tos.totalSupply();
  let totalton = await ton.totalSupply();

  let target = "0xef632A3C8Ee385506884f117D1aEb5EB57Ef32a7";
  await tos.connect(user1).approve(target, total);
  await ton.connect(user1).approve(target, totalton);
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
