const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const { toBN, keccak256 } = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";

// mainnet
const tostoken = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const LockTOSv2Logic0 = await ethers.getContractFactory("LockTOSv2Logic0");
  const LockTOSv2Proxy = await ethers.getContractFactory("LockTOSv2Proxy");

  let deployInfo = { name: "", address: "" };

  const lockTOSv2Logic0 = await LockTOSv2Logic0.deploy();
  let tx = await lockTOSv2Logic0.deployed();
  console.log("LockTOSv2Logic0:", lockTOSv2Logic0.address);
  deployInfo = {
    name: "LockTOSv2Logic0",
    address: lockTOSv2Logic0.address,
  };

  // if (deployInfo.address != null && deployInfo.address.length > 0) {
  //   save(process.env.NETWORK, deployInfo);
  // }

  printGasUsedOfUnits("LockTOSv2Logic0  Deploy", tx);

  const lockTOSv2Proxy = await LockTOSv2Proxy.deploy();

  console.log("LockTOSv2Proxy:", lockTOSv2Proxy.address);

  tx = await lockTOSv2Proxy.deployed();

  deployInfo = {
    name: "LockTOSv2Proxy",
    address: lockTOSv2Proxy.address,
  };

  // if (deployInfo.address != null && deployInfo.address.length > 0) {
  //   save(process.env.NETWORK, deployInfo);
  // }

  printGasUsedOfUnits("LockTOSv2Proxy Deploy", tx);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    deployer.address,
    process.env.NETWORK
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
