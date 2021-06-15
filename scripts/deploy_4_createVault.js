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

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
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

// change vault name
  let VaultName = "TON #4";
  let periodsMins = [
      {
        name: VaultName + " 10 MINs",
        period: getPeriodBlockByTimes(0, 0, 10)
      },
      {
        name: VaultName + " 30 MINs",
        period: getPeriodBlockByTimes(0, 0, 30)
      },
      {
        name: VaultName + " 60 MINs",
        period: getPeriodBlockByTimes(0, 0, 60)
      }
    ];

  let periodsHours = [
    {
      name: VaultName + " 2 HOUR",
      period: getPeriodBlockByTimes(0, 1, 0)
    },
    {
      name: VaultName + " 4 HOURS",
      period: getPeriodBlockByTimes(0, 2, 0)
    },
    {
      name: VaultName + " 6 HOURS",
      period: getPeriodBlockByTimes(0, 5, 0)
    }
  ];

  let periodsDays = [
    {
      name: VaultName + " 1 Day",
      period: getPeriodBlockByTimes(1, 0, 0)
    },
    {
      name: VaultName + " 2 Days",
      period: getPeriodBlockByTimes(2, 0, 0)
    },
    {
      name: VaultName + " 3 Days",
      period: getPeriodBlockByTimes(3, 0, 0)
    }
  ]

  const ton_vault = {
    allocatedTOS: "100000",
    saleStartBlock: saleStartBlock,
    stakeStartBlock: stakeStartBlock,
    phase: 1,
    hashName : keccak256(VaultName),
    type: 0,
  }

  const ether_vault = {
    allocatedTOS: "100000",
    saleStartBlock: saleStartBlock,
    stakeStartBlock: stakeStartBlock,
    phase: 1,
    hashName : keccak256(VaultName),
    type: 1,
  }


 // console.log('vault',ton_vault);

////////////////////////////////////////////////////////
//   Making Vault when staking TON or ETH
// 1. Make a Vault. hashName must be specified as a unique value.
// 2. After confirming that the vault is deployed in the rinkeby,
//    write the generated tone address directly to vaultAddress.
// 3. Uncomment and execute createStakeContract creation for the desired period.
// Note: If you want to enter multiple createStakeContracts, you must create a contract with a shorter period.


  ////////////////////////////////////////////////////////
  // For TON Vault : hashName must be specified as a unique value.
  // ton_vault.hashName = keccak256(VaultName);
  // ton_vault.saleStartBlock = parseInt(curBlock) + parseInt(60*10/13);
  // ton_vault.stakeStartBlock = ton_vault.saleStartBlock + parseInt(60*60*24*3/13);
  // await createValue(ton_vault, ton);

  ////////////////////////////////////////////////////////
  // For Ether Vault
  // ether_vault.saleStartBlock = parseInt(curBlock) + parseInt(60*30/13);
  // ether_vault.stakeStartBlock = ether_vault.saleStartBlock + parseInt(60*60*4/13);
  // await createValue(ether_vault, zeroAddress);

  /// /////////////////////////////////////////////////////
  // For StakeContract of Vault
  // write your vault
  let token = ton;
  // let token = zeroAddress;
  let vaultAddress ='0xd2495Bbc9150739E50Ad78b2c5a4FEf9c8e2C608';
  console.log('vaultAddress',vaultAddress);
  let periods = periodsDays;
  console.log('periods',periods);
  for (let i =0; i< periods.length ; i++){
    await createStakeContract(vaultAddress, periods[i].period.blocks, periods[i].name, token );
    timeout(10000);
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
