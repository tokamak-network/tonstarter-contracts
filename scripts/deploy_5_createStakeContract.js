const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
const loadDeployedInput = require("./load_deployed_input");
const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");

const {
  createValue,
  createStakeContract,
  timeout,
  getPeriodBlockByTimes,
} = require("../utils/deploy_common.js");

const periodsMins = [
  {
    name: " 10 MINs",
    period: getPeriodBlockByTimes(0, 0, 10),
  },
  {
    name: " 30 MINs",
    period: getPeriodBlockByTimes(0, 0, 30),
  },
  {
    name: " 60 MINs",
    period: getPeriodBlockByTimes(0, 0, 60),
  },
];

const periodsHours = [
  {
    name: " 2 HOUR",
    period: getPeriodBlockByTimes(0, 1, 0),
  },
  {
    name: " 4 HOURS",
    period: getPeriodBlockByTimes(0, 2, 0),
  },
  {
    name: " 6 HOURS",
    period: getPeriodBlockByTimes(0, 5, 0),
  },
];
const periodsDays = [
  {
    name: " 1 Day",
    period: getPeriodBlockByTimes(1, 0, 0),
  },
  {
    name: " 2 Days",
    period: getPeriodBlockByTimes(2, 0, 0),
  },
  {
    name: " 3 Days",
    period: getPeriodBlockByTimes(3, 0, 0),
  },
];

async function main() {
  let VaultName = null;
  let VaultAddress = null;
  let StakeType = null;

  StakeType = loadDeployedInput(process.env.NETWORK, "StakeType");
  VaultName = loadDeployedInput(process.env.NETWORK, "VaultName");
  VaultAddress = loadDeployedInput(process.env.NETWORK, "VaultAddress");
  console.log("StakeType", StakeType);
  console.log("VaultName", VaultName);
  console.log("VaultAddress", VaultAddress);

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const provider = await ethers.getDefaultProvider("rinkeby");
  console.log("ADMIN_ROLE", ADMIN_ROLE);
  const curBlock = await provider.getBlockNumber();
  console.log("curBlock", curBlock);

  let saleStartBlock = parseInt(curBlock) + (60 * 5) / 13;
  saleStartBlock = parseInt(saleStartBlock);

  let stakeStartBlock = parseInt(saleStartBlock) + (60 * 60 * 2) / 13;
  stakeStartBlock = parseInt(stakeStartBlock);

  //= =============================
  // let periods = periodsMins;

  const periods = periodsMins.concat(periodsHours).concat(periodsDays);
  console.log("periods", periods);

  let token = null;

  if (
    VaultAddress != null &&
    VaultAddress.length > 5 &&
    (StakeType == "TON" || StakeType == "ETH") &&
    VaultName != null &&
    VaultName.length > 1
  ) {
    if (StakeType == "TON") {
      token = ton;
    } else if (StakeType == "ETH") {
      token = zeroAddress;
    }
    console.log("StakeType", StakeType);
    console.log("token", token);
    console.log("periods", periods);

    for (let i = 0; i < periods.length; i++) {
      await createStakeContract(
        VaultAddress,
        periods[i].period.blocks,
        VaultName + periods[i].name,
        token
      );
      timeout(10000);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
