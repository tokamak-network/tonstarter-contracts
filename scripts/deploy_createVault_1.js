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

const zeroAddress = '0x0000000000000000000000000000000000000000';
const ADMIN_ROLE = keccak256("ADMIN");

let fldtoken = loadDeployed(process.env.NETWORK,"FLD");
let registry = loadDeployed(process.env.NETWORK,"StakeRegistry");
let factory = loadDeployed(process.env.NETWORK,"StakeFactory");
let logic = loadDeployed(process.env.NETWORK,"Stake1Logic");
let proxy = loadDeployed(process.env.NETWORK,"Stake1Proxy");
let tonFactory = loadDeployed(process.env.NETWORK,"StakeTONFactory");
let stablecoinFactory = loadDeployed(process.env.NETWORK,"StakeForStableCoinFactory");
let ton = loadDeployed(process.env.NETWORK,"TON");

async function createValue(tonVault, paytoken) {

  const [deployer, user1] = await ethers.getSigners();
  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);

  let tx = await stakeEntry.createVault(
      paytoken,
      toWei(tonVault.allocatedFLD, 'ether'),
      tonVault.saleStartBlock,
      tonVault.stakeStartBlock,
      tonVault.phase,
      tonVault.hashName,
      0,
      zeroAddress
    );

  console.log("createValue tx:", tx.hash);

  return;
}

async function createStakeContract(vaultAddress, periodBlock, name, paytoken ) {

  const [deployer, user1] = await ethers.getSigners();
  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  var overrideOptions = {}
  try {
    const estimateGas = await stakeEntry.estimateGas.createStakeContract(
      1,
      vaultAddress,
      fldtoken,
      paytoken,
      periodBlock,
      name
    );

    let gasInt = estimateGas * 1.5 ;
    gasInt = parseInt(gasInt);
    overrideOptions = {
      gasLimit: gasInt
    }
  } catch(error) {
    console.error(error);
  }

  let tx = await stakeEntry.createStakeContract(
      1,
      vaultAddress,
      fldtoken,
      paytoken,
      periodBlock,
      name,
      overrideOptions
    );

  console.log("createStakeContract ",name,",tx:", tx.hash);

  return;
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
  console.log('ADMIN_ROLE',ADMIN_ROLE);
  let curBlock = await provider.getBlockNumber();
  console.log('curBlock',curBlock);

  let saleStartBlock = parseInt(curBlock)+ (60*20/13);
  saleStartBlock = parseInt(saleStartBlock);

  let stakeStartBlock = parseInt(saleStartBlock)+ (60*20/13);
  stakeStartBlock = parseInt(stakeStartBlock);

  let ton_vault = {
    allocatedFLD : '100000',
    saleStartBlock : saleStartBlock,
    stakeStartBlock : stakeStartBlock,
    phase: 1,
    hashName : keccak256("ETH_TEST_20210521_09"),
  }

  console.log('vault',ton_vault);


  let periodBlockMin5 = 60 * 5 / 13;
  periodBlockMin5= parseInt(periodBlockMin5);

  let periodBlockMin30 = 60 * 30 / 13;
  periodBlockMin30= parseInt(periodBlockMin30);

  let periodBlockHour1 = 60 * 60 / 13;
  periodBlockHour1= parseInt(periodBlockHour1);

  let periodBlockHour2 = 60 * 120 / 13;
  periodBlockHour2= parseInt(periodBlockHour2);


////////////////////////////////////////////////////////
//   Making Vault when staking TON or ETH
// 1. Make a Vault. hashName must be specified as a unique value.
// 2. After confirming that the vault is deployed in the rinkeby,
//    write the generated tone address directly to vaultAddress.
// 3. Uncomment and execute createStakeContract creation for the desired period.
// Note: If you want to enter multiple createStakeContracts, you must create a contract with a shorter period.


  ////////////////////////////////////////////////////////
  // For TON Vault : hashName must be specified as a unique value.
  // ton_vault.hashName = keccak256("TON_TEST_20210522_16");
  // await createValue(ton_vault, ton);

  ////////////////////////////////////////////////////////
  // For TON StakeContract of Vault
  // write your vault .
  //  let vaultAddress ='0x57Ac4234c5E4CA367fB2b956679415d46f757CBd';
  //  console.log('vaultAddress',vaultAddress);
  //  await createStakeContract(vaultAddress, periodBlockMin5,'TON_5_MIN', ton );
  //  console.log('createStakeContract TON_5_MIN');
  //  timeout(10000);
  //  await createStakeContract(vaultAddress, periodBlockMin30,'TON_30_MIN', ton );
  // console.log('createStakeContract TON_30_MIN');
  // timeout(10000);
  //  await createStakeContract(vaultAddress, periodBlockHour1,'TON_1_HOUR', ton );
  // console.log('createStakeContract TON_1_HOUR');
  // timeout(10000);
  //  await createStakeContract(vaultAddress, periodBlockHour2,'TON_2_HOUR', ton );
  // console.log('createStakeContract TON_2_HOUR');
  // timeout(10000);

  ////////////////////////////////////////////////////////
  // For Ether Vault
  // ton_vault.hashName = keccak256("ETH_TEST_20210522_1640");
  // await createValue(ton_vault, zeroAddress);

  ////////////////////////////////////////////////////////
  // For Ether StakeContract of Vault
  // write your vault .
  let vaultAddress ='0x564A0747511C4E0Bc67BB9e1EA9f193aB27C2E6f';
  console.log('vaultAddress',vaultAddress);
  await createStakeContract(vaultAddress, periodBlockMin5,'ETH_5_MIN', zeroAddress );
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockMin30,'ETH_30_MIN', zeroAddress );
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockHour1,'ETH_1_HOUR', zeroAddress );
  timeout(10000);
  await createStakeContract(vaultAddress, periodBlockHour2,'ETH_2_HOUR', zeroAddress );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
