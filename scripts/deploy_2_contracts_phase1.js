const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();
//const loadDeployedInitVariable = require("./load_deployed_init");
const loadDeployed = require("./load_deployed");

//const initialTotal = process.env.initialTotal + "." + "0".repeat(18);

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
  //const StakeDefiFactory = await ethers.getContractFactory("StakeDefiFactory");
  const StakeUniswapV3Factory = await ethers.getContractFactory("StakeUniswapV3Factory");
  const Stake2Vault = await ethers.getContractFactory("Stake2Vault");
  const Stake2VaultProxy = await ethers.getContractFactory("Stake2VaultProxy");
  const Stake2Logic = await ethers.getContractFactory("Stake2Logic");
  const StakeUniswapV3 = await ethers.getContractFactory("StakeUniswapV3");
  const StakeUniswapV3Proxy = await ethers.getContractFactory("StakeUniswapV3Proxy");
  const StakeCoinageFactory = await ethers.getContractFactory("StakeCoinageFactory");
  //--------------------

  const stakeSimple = await StakeSimple.deploy();
  const stakeSimpleFactory = await StakeSimpleFactory.deploy(
    stakeSimple.address
  );
  await stakeSimpleFactory.deployed();
  console.log("StakeSimpleFactory:", stakeSimpleFactory.address);

  const stakeTONLogic = await StakeTONLogic.deploy();
  await stakeTONLogic.deployed();
  console.log("StakeTONLogic:", stakeTONLogic.address);

  const stakeTONProxyFactory = await StakeTONProxyFactory.deploy();
  await stakeTONProxyFactory.deployed();
  console.log("StakeTONProxyFactory:", stakeTONProxyFactory.address);

  const stakeTONFactory = await StakeTONFactory.deploy(
    stakeTONProxyFactory.address,
    stakeTONLogic.address
  );
  await stakeTONFactory.deployed();
  console.log("stakeTONFactory:", stakeTONFactory.address);

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
    stakeSimpleFactory.address,
    stakeTONFactory.address,
    zeroAddress
  );

  await stakeFactory.deployed();
  console.log("stakeFactory:", stakeFactory.address);

  const stakeRegistry = await StakeRegistry.deploy(tos.address);
  await stakeRegistry.deployed();
  console.log("stakeRegistry:", stakeRegistry.address);

  const stake1Vault = await Stake1Vault.deploy();
  await stake1Vault.deployed();
  console.log("Stake1Vault:", stake1Vault.address);

  const stakeVaultFactory = await StakeVaultFactory.deploy(stake1Vault.address);
  await stakeVaultFactory.deployed();
  console.log("stakeVaultFactory:", stakeVaultFactory.address);

  const stake1Logic = await Stake1Logic.deploy();
  await stake1Logic.deployed();
  console.log("stake1Logic:", stake1Logic.address);

  const stake1Proxy = await Stake1Proxy.deploy(stake1Logic.address);
  await stake1Proxy.deployed();
  console.log("stake1Proxy:", stake1Proxy.address);

  let _implementation = await stake1Proxy.implementation(0);
  console.log("stake1Proxy implementation:", _implementation);

  const stakeEntry = await ethers.getContractAt(
    "Stake1Logic",
    stake1Proxy.address
  );
  console.log("stakeEntry:", stakeEntry.address);


  const out = {};
  out.TOS = tos.address;
  out.StakeSimple = stakeSimple.address;
  out.StakeSimpleFactory = stakeSimpleFactory.address;
  out.StakeTONLogic = stakeTONLogic.address;
  out.StakeTONProxyFactory = stakeTONProxyFactory.address;
  out.StakeTONFactory = stakeTONFactory.address;
  //out.StakeDefiFactory = stakeDefiFactory.address;
  //out.StakeUniswapV3Factory = stakeUniswapV3Factory.address;

  out.StakeFactory = stakeFactory.address;
  out.StakeRegistry = stakeRegistry.address;

  out.Stake1Vault = stake1Vault.address;
  out.StakeVaultFactory = stakeVaultFactory.address;
  out.Stake1Logic = stake1Logic.address;
  out.Stake1Proxy = stake1Proxy.address;
  return out;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);
  console.log("contracts:", process.env.NETWORK, contracts);

  const out = {};
  out.TOS = contracts.TOS;
  out.StakeSimple = contracts.StakeSimple;
  out.StakeSimpleFactory = contracts.StakeSimpleFactory;
  out.StakeTONLogic = contracts.StakeTONLogic;
  out.StakeTONProxyFactory = contracts.StakeTONProxyFactory;
  out.StakeTONFactory = contracts.StakeTONFactory;
  out.StakeUniswapV3Factory = contracts.StakeUniswapV3Factory;
  //out.StakeDefiFactory = contracts.StakeDefiFactory;
  out.StakeFactory = contracts.StakeFactory;
  out.StakeRegistry = contracts.StakeRegistry;
  out.Stake1Vault = contracts.Stake1Vault;
  out.StakeVaultFactory = contracts.StakeVaultFactory;
  out.Stake1Logic = contracts.Stake1Logic;
  out.Stake1Proxy = contracts.Stake1Proxy;

  out.TON = process.env.TON;
  out.WTON = process.env.WTON;
  out.DepositManager = process.env.DepositManager;
  out.SeigManager = process.env.SeigManager;
  out.SwapProxy = process.env.SwapProxy;

  save(process.env.NETWORK, out);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
