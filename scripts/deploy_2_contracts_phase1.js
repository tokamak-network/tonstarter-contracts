const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed");
const { printGasUsedOfUnits } = require("./log_tx");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("./load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const StakeSimple = await ethers.getContractFactory("StakeSimple");
  const StakeSimpleFactory = await ethers.getContractFactory(
    "StakeSimpleFactory"
  );

  // const StakeTONLogicFactory = await ethers.getContractFactory('StakeTONLogicFactory');
  const StakeTONLogic = await ethers.getContractFactory("StakeTON");
  const StakeTONProxyFactory = await ethers.getContractFactory(
    "StakeTONProxyFactory"
  );

  const Stake1Vault = await ethers.getContractFactory("Stake1Vault");
  const StakeVaultFactory = await ethers.getContractFactory(
    "StakeVaultFactory"
  );
  const StakeRegistry = await ethers.getContractFactory("StakeRegistry");
  const Stake1Logic = await ethers.getContractFactory("Stake1Logic");
  const Stake1Proxy = await ethers.getContractFactory("Stake1Proxy");
  const StakeFactory = await ethers.getContractFactory("StakeFactory");
  const StakeTONFactory = await ethers.getContractFactory("StakeTONFactory");

  //-------phase 2 -------------
  const StakeUniswapV3Factory = await ethers.getContractFactory("StakeUniswapV3Factory");
  const Stake2Vault = await ethers.getContractFactory("Stake2Vault");
  const Stake2VaultProxy = await ethers.getContractFactory("Stake2VaultProxy");
  const Stake2Logic = await ethers.getContractFactory("Stake2Logic");
  const StakeUniswapV3 = await ethers.getContractFactory("StakeUniswapV3");
  const StakeUniswapV3Proxy = await ethers.getContractFactory("StakeUniswapV3Proxy");
  const StakeCoinageFactory = await ethers.getContractFactory("StakeCoinageFactory");
  //--------------------

  let deployInfo = {name:'', address:''};
  const stakeTONLogic = await StakeTONLogic.deploy();
  let tx = await stakeTONLogic.deployed();
  console.log("StakeTONLogic:", stakeTONLogic.address);
  deployInfo = {
    name: "StakeTON",
    address: stakeTONLogic.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }


  printGasUsedOfUnits('StakeTON  Deploy',tx);


  const stakeTONProxyFactory = await StakeTONProxyFactory.deploy();
  tx =  await stakeTONProxyFactory.deployed();
  console.log("StakeTONProxyFactory:", stakeTONProxyFactory.address);
  deployInfo = {
    name: "StakeTONProxyFactory",
    address: stakeTONProxyFactory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('StakeTONProxyFactory Deploy',tx);


  const stakeTONFactory = await StakeTONFactory.deploy(
    stakeTONProxyFactory.address,
    stakeTONLogic.address
  );
  tx =  await stakeTONFactory.deployed();
  console.log("stakeTONFactory:", stakeTONFactory.address);
  deployInfo = {
    name: "StakeTONFactory",
    address: stakeTONFactory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('StakeTONFactory Deploy',tx);

  /*
  // const stakeDefiFactory = await StakeDefiFactory.deploy(stakeSimple.address);
  // await stakeDefiFactory.deployed();
  // console.log("stakeDefiFactory:", stakeDefiFactory.address);
  const stakeUniswapV3 = await StakeUniswapV3.deploy();
  const stakeCoinageFactory = await StakeCoinageFactory.deploy();

  const stakeUniswapV3Factory = await StakeUniswapV3Factory.deploy(
        stakeUniswapV3.address,
        stakeCoinageFactory.address
  );

  console.log("stakeUniswapV3:", stakeUniswapV3.address);
  console.log("stakeCoinageFactory:", stakeCoinageFactory.address);
  console.log("stakeUniswapV3Factory:", stakeUniswapV3Factory.address);
  */

  //------------------
  const stakeFactory = await StakeFactory.deploy(
    zeroAddress,
    stakeTONFactory.address,
    zeroAddress
  );

  let tx1 = await stakeFactory.deployed();
  console.log("stakeFactory:", stakeFactory.address);
  deployInfo = {
    name: "StakeFactory",
    address: stakeFactory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('StakeFactory Deploy',tx1);

  const stakeRegistry = await StakeRegistry.deploy(tos.address);
  let tx2 = await stakeRegistry.deployed();
  console.log("stakeRegistry:", stakeRegistry.address);
  deployInfo = {
    name: "StakeRegistry",
    address: stakeRegistry.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('stakeRegistry Deploy',tx2);

  const stake1Vault = await Stake1Vault.deploy();
  let tx3 = await stake1Vault.deployed();
  console.log("Stake1Vault:", stake1Vault.address);

  deployInfo = {
    name: "Stake1Vault",
    address: stake1Vault.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('Stake1Vault Deploy',tx3);

  const stakeVaultFactory = await StakeVaultFactory.deploy(stake1Vault.address);
  let tx4 = await stakeVaultFactory.deployed();
  console.log("stakeVaultFactory:", stakeVaultFactory.address);
  deployInfo = {
    name: "StakeVaultFactory",
    address: stakeVaultFactory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('StakeVaultFactory Deploy',tx4);

  const stake1Logic = await Stake1Logic.deploy();
  let tx5 = await stake1Logic.deployed();
  console.log("stake1Logic:", stake1Logic.address);
  deployInfo = {
    name: "Stake1Logic",
    address: stake1Logic.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('Stake1Logic Deploy',tx5);

  const stake1Proxy = await Stake1Proxy.deploy(stake1Logic.address);
  let tx6 = await stake1Proxy.deployed();
  console.log("stake1Proxy:", stake1Proxy.address);

  deployInfo = {
    name: "Stake1Proxy",
    address: stake1Proxy.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('Stake1Proxy Deploy',tx6);

  let _implementation = await stake1Proxy.implementation(0);
  console.log("stake1Proxy implementation:", _implementation);

  const stakeEntry = await ethers.getContractAt(
    "Stake1Logic",
    stake1Proxy.address
  );
  console.log("stakeEntry:", stakeEntry.address);

  // let out = {};
  // out.TOS = tos.address;
  // out.Stake1Proxy = stake1Proxy.address;
  // out.Stake1Logic = stake1Logic.address;
  // out.StakeRegistry = stakeRegistry.address;
  // out.StakeTON = stakeTONLogic.address;
  // out.StakeTONProxyFactory = stakeTONProxyFactory.address;
  // out.StakeTONFactory = stakeTONFactory.address;
  // out.StakeFactory = stakeFactory.address;
  // out.Stake1Vault = stake1Vault.address;
  // out.StakeVaultFactory = stakeVaultFactory.address;
  // return out;

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);
  console.log("contracts:", process.env.NETWORK, contracts);


  deployInfo = {
    name: "TON",
    address: process.env.TON
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  deployInfo = {
    name: "WTON",
    address: process.env.WTON
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  deployInfo = {
    name: "DepositManager",
    address: process.env.DepositManager
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  deployInfo = {
    name: "SeigManager",
    address: process.env.SeigManager
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  deployInfo = {
    name: "SwapProxy",
    address: process.env.SwapProxy
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
