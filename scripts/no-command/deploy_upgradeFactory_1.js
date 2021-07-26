const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
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

const ADMIN_ROLE = keccak256("ADMIN");
let tostoken = loadDeployed(process.env.NETWORK,"TOS");
let registry = loadDeployed(process.env.NETWORK,"StakeRegistry");
let factory = loadDeployed(process.env.NETWORK,"StakeFactory");
let logic = loadDeployed(process.env.NETWORK,"Stake1Logic");
let proxy = loadDeployed(process.env.NETWORK,"Stake1Proxy");
let tonFactory = loadDeployed(process.env.NETWORK,"StakeTONFactory");


async function deployStakeTONFactory(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const StakeTONLogicFactory = await ethers.getContractFactory("StakeTONLogicFactory");
  const stakeTONLogicFactory = await StakeTONLogicFactory.deploy();
  console.log('StakeTONLogicFactory done:', stakeTONLogicFactory.address);

  const StakeTONProxyFactory = await ethers.getContractFactory("StakeTONProxyFactory");
  const stakeTONProxyFactory = await StakeTONProxyFactory.deploy();
  console.log('StakeTONProxyFactory done:', stakeTONProxyFactory.address);

  const StakeTONFactory = await ethers.getContractFactory("StakeTONFactory");
  const stakeTONFactory = await StakeTONFactory.deploy();
  console.log('StakeTONFactory done:', stakeTONFactory.address);

  return;
}

async function deployStakeFactory(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  console.log("tonFactory:", tonFactory);

  const StakeFactory = await ethers.getContractFactory("StakeFactory");

  const stakeFactory = await StakeFactory.deploy();
  console.log('StakeFactory done:', stakeFactory.address);
  //await stakeFactory.grantRole(ADMIN_ROLE, proxy);
  //console.log('StakeFactory grantRole done:', proxy);
  return;
}
async function deployLogic1(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const Stake1Logic = await ethers.getContractFactory("Stake1Logic");
  const stake1Logic = await Stake1Logic.deploy();
  console.log('Stake1Logic done:', stake1Logic.address);
  return;
}
async function setStakeFactory(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  console.log("factory:", factory);

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry done:", stakeEntry.address);

  await stakeEntry.setStakeFactory(factory);
  console.log("setStakeFactory done:", factory);
  return;
}

async function upgradeLogic(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  console.log("logic:", logic);

  const stakeEntry = await ethers.getContractAt("Stake1Proxy", proxy);
  console.log("stakeEntry done:", stakeEntry.address);

  await stakeEntry.upgradeTo(logic);
  console.log("upgradeTo done:", logic);
  return;
}
async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  //await deployStakeTONFactory(deployer);
  //await deployStakeFactory(deployer);
  //await setStakeFactory(deployer);
  //await deployLogic1(deployer);
  await upgradeLogic(deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
