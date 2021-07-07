const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
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

const loadDeployed = require("../scripts/load_deployed");
const loadDeployedInput = require("../scripts/load_deployed_input");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");

async function createValue(tonVault, paytoken) {
  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);

  const tx = await stakeEntry.createVault(
    paytoken,
    toWei(tonVault.allocatedTOS, "ether"),
    tonVault.saleStartBlock,
    tonVault.stakeStartBlock,
    tonVault.phase,
    tonVault.hashName,
    tonVault.type,
    zeroAddress
  );
  await tx.wait();
  console.log("createValue tx:", tx.hash);
}

async function createStakeContract(vaultAddress, periodBlock, name, paytoken) {
  const [deployer, user1] = await ethers.getSigners();
  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  let overrideOptions = {};
  try {
    const estimateGas = await stakeEntry.estimateGas.createStakeContract(
      1,
      vaultAddress,
      tostoken,
      paytoken,
      periodBlock,
      name
    );

    let gasInt = estimateGas * 1.5;
    gasInt = parseInt(gasInt);
    overrideOptions = {
      gasLimit: gasInt,
    };
  } catch (error) {
    console.error(error);
  }

  const tx = await stakeEntry.createStakeContract(
    1,
    vaultAddress,
    tostoken,
    paytoken,
    periodBlock,
    name,
    overrideOptions
  );
  await tx.wait();
  console.log("createStakeContract ", name, ",tx:", tx.hash);
}

function timeout(sec) {
  return new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
}

function getPeriodBlockByTimes(day, hour, min){
  let periodBlocks = {
    day: day,
    hour: hour,
    min: min,
    blocks: 0
  }
  let dayBlock = 0;
  let hourBlock = 0;
  let minBlock = 0;

  if (day > 0) {
    dayBlock = 60 * 60 * 24 * parseInt(day);
  }
  if (hour > 0) {
    hourBlock = 60 * 60 * parseInt(hour);
  }
  if (min > 0) {
    minBlock = 60 * parseInt(min);
  }
  periodBlocks.blocks = dayBlock + hourBlock + minBlock / 13;
  periodBlocks.blocks = parseInt(periodBlocks.blocks);

  return periodBlocks;
}

module.exports = {
  createValue,
  createStakeContract,
  timeout,
  getPeriodBlockByTimes
  };