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

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const fldtoken = loadDeployed(process.env.NETWORK, "FLD");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");

async function changeStakeTONFactory() {
  const StakeTONLogic = await ethers.getContractFactory("StakeTON");
  const StakeTONProxyFactory = await ethers.getContractFactory(
    "StakeTONProxyFactory"
  );
  const StakeTONFactory = await ethers.getContractFactory("StakeTONFactory");
  const StakeFactory = await ethers.getContractFactory("StakeFactory");

  const stakeTONLogic = await StakeTONLogic.deploy();
  await stakeTONLogic.deployed();

  const stakeTONProxyFactory = await StakeTONProxyFactory.deploy();
  await stakeTONProxyFactory.deployed();

  const stakeTONFactory = await StakeTONFactory.deploy(
    stakeTONProxyFactory.address,
    stakeTONLogic.address
  );
  await stakeTONFactory.deployed();

  const stakeFactory = await StakeFactory.attach(factory);
  const tx = await stakeFactory.setStakeTONFactory(stakeTONFactory.address);
  await tx.wait();
}
async function createValue(tonVault, paytoken) {
  // const [deployer, user1] = await ethers.getSigners();
  // const stakeProxy = await ethers.getContractAt("Stake1Proxy", proxy);
  // const newImplementation = await (
  //   await ethers.getContractFactory("Stake1Logic")
  // )
  //   .connect(deployer)
  //   .deploy();
  // await newImplementation.deployed();
  // await stakeProxy.upgradeTo(newImplementation.address);

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);

  const tx = await stakeEntry.createVault(
    paytoken,
    toWei(tonVault.allocatedFLD, "ether"),
    tonVault.saleStartBlock,
    tonVault.stakeStartBlock,
    tonVault.phase,
    tonVault.hashName,
    0,
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
      fldtoken,
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
    fldtoken,
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

async function main() {
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

  let stakeStartBlock = parseInt(saleStartBlock) + (60 * 5) / 13;
  stakeStartBlock = parseInt(stakeStartBlock);

  const ton_vault = {
    allocatedFLD: "100000",
    saleStartBlock: saleStartBlock,
    stakeStartBlock: stakeStartBlock,
    phase: 1,
    hashName: keccak256("ETH_TEST_20210521_09"),
  };

  console.log("vault", ton_vault);

  let periodBlockMin2 = (60 * 2) / 13;
  periodBlockMin2 = parseInt(periodBlockMin2);

  let periodBlockMin3 = (60 * 3) / 13;
  periodBlockMin3 = parseInt(periodBlockMin3);

  let periodBlockMin5 = (60 * 5) / 13;
  periodBlockMin5 = parseInt(periodBlockMin5);

  let periodBlockMin15 = (60 * 15) / 13;
  periodBlockMin15 = parseInt(periodBlockMin15);

  let periodBlockMin20 = (60 * 20) / 13;
  periodBlockMin20 = parseInt(periodBlockMin20);

  let periodBlockMin30 = (60 * 30) / 13;
  periodBlockMin30 = parseInt(periodBlockMin30);

  let periodBlockHour1 = (60 * 60) / 13;
  periodBlockHour1 = parseInt(periodBlockHour1);

  let periodBlockHour2 = (60 * 120) / 13;
  periodBlockHour2 = parseInt(periodBlockHour2);

  let periodBlockDay1 = (60 * 60 * 24 * 1) / 13;
  periodBlockDay1 = parseInt(periodBlockDay1);
  let periodBlockDay2 = (60 * 60 * 24 * 2) / 13;
  periodBlockDay2 = parseInt(periodBlockDay2);
  let periodBlockDay3 = (60 * 60 * 24 * 3) / 13;
  periodBlockDay3 = parseInt(periodBlockDay3);
  let periodBlockDay4 = (60 * 60 * 24 * 4) / 13;
  periodBlockDay4 = parseInt(periodBlockDay4);

  let periodBlockWeek1 = (60 * 60 * 24 * 7) / 13;
  periodBlockWeek1 = parseInt(periodBlockWeek1);
  let periodBlockWeek2 = (60 * 60 * 24 * 14) / 13;
  periodBlockWeek2 = parseInt(periodBlockWeek2);
  let periodBlockWeek3 = (60 * 60 * 24 * 21) / 13;
  periodBlockWeek3 = parseInt(periodBlockWeek3);
  let periodBlockWeek4 = (60 * 60 * 24 * 28) / 13;
  periodBlockWeek4 = parseInt(periodBlockWeek4);

  /// /////////////////////////////////////////////////////
  //   Making Vault when staking TON or ETH
  // 1. Make a Vault. hashName must be specified as a unique value.
  // 2. After confirming that the vault is deployed in the rinkeby,
  //    write the generated tone address directly to vaultAddress.
  // 3. Uncomment and execute createStakeContract creation for the desired period.
  // Note: If you want to enter multiple createStakeContracts, you must create a contract with a shorter period.

  /// /////////////////////////////////////////////////////
  // For TON Vault : hashName must be specified as a unique value.
  ton_vault.hashName = keccak256("TON_TEST_20210528_0900");
  // await changeStakeTONFactory();
  // await createValue(ton_vault, ton);

  /// /////////////////////////////////////////////////////
  // For TON StakeContract of Vault
  // write your vault .
  const vaultAddress = "0x6A9eFcA62c17BD03E12E9eFe0A2CABab31735995";
  console.log("vaultAddress", vaultAddress);
  await createStakeContract(vaultAddress, periodBlockMin3, "TON_3_MIN", ton);
  console.log("createStakeContract periodBlockMin3 ");
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockMin5, "TON_5_MIN", ton);
  console.log("createStakeContract periodBlockMin5");
  timeout(10000);

  await createStakeContract(vaultAddress, periodBlockDay1, "TON_1_DAY", ton);
  console.log("createStakeContract periodBlockDay1 ");
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockDay2, "TON_2_DAY", ton);
  console.log("createStakeContract periodBlockDay2");
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockDay3, "TON_3_DAY", ton);
  console.log("createStakeContract periodBlockDay3");
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockDay4, "TON_4_DAY", ton);
  console.log("createStakeContract periodBlockDay4");
  timeout(10000);

  /// /////////////////////////////////////////////////////
  // For Ether Vault
  // ton_vault.hashName = keccak256("ETH_TEST_20210527_1650");
  // await createValue(ton_vault, zeroAddress);

  /// /////////////////////////////////////////////////////
  // For Ether StakeContract of Vault
  // write your vault .
  // let vaultAddress ='0x23B49bc68632A5cd5d6aeB9CB3ab8b4C2e8DB4BF';
  // console.log('vaultAddress',vaultAddress);
  // await createStakeContract(vaultAddress, periodBlockDay1, 'ETH_1_DAY', zeroAddress );
  // timeout(10000);
  // await createStakeContract(vaultAddress, periodBlockDay2, 'ETH_2_DAY', zeroAddress );
  // timeout(10000);
  // await createStakeContract(vaultAddress, periodBlockDay3, 'ETH_3_DAY', zeroAddress );
  // timeout(10000);
  // await createStakeContract(vaultAddress, periodBlockDay4, 'ETH_4_DAY', zeroAddress );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
