const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

const {
  // padLeft,
  // toBN,
  // toWei,
  // fromWei,
  keccak256,
  // soliditySha3,
  // solidityKeccak256,
} = require("web3-utils");
const Web3EthAbi = require('web3-eth-abi');

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");

const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");

const Stake1Vault = loadDeployed(process.env.NETWORK, "Stake1Vault");

const ton = loadDeployed(process.env.NETWORK, "TON");


async function createNewVaultFactory() {
  const [deployer  ] = await ethers.getSigners();
  let tx;
  let stakeType = ethers.BigNumber.from("2");
  let phase = ethers.BigNumber.from("2");

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:", stakeEntry.address);

  //=====================================
  // 1. 볼트 팩토리를 새로 만들어서 바꿔야 한다.
  // 1-1. 생성
  const StakeVaultFactory = await ethers.getContractFactory("StakeVaultFactory");
  let stakeVaultFactory = await StakeVaultFactory.deploy(Stake1Vault);
  tx =  await stakeVaultFactory.deployed();
  console.log("Phase2.StakeVaultFactory:", stakeVaultFactory.address);
  deployInfo = {
    name: "StakeVaultFactory",
    address: stakeVaultFactory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('Phase2.StakeVaultFactory Deploy',tx);

}


async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  await createNewVaultFactory();

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
