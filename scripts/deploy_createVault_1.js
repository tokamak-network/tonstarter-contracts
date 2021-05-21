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

  let saleStartBlock = parseInt(curBlock)+ (60*5/13);
  saleStartBlock = parseInt(saleStartBlock);

  let stakeStartBlock = parseInt(saleStartBlock)+ (60*15/13);
  stakeStartBlock = parseInt(stakeStartBlock);

  let ton_vault = {
    allocatedFLD : '100000',
    saleStartBlock : saleStartBlock,
    stakeStartBlock : stakeStartBlock,
    phase: 1,
    hashName : keccak256("ETH_TEST_20210521_09"),
  }

  console.log('vault',ton_vault);

  let periodBlockHour1 = 60 * 60 / 13;
  periodBlockHour1= parseInt(periodBlockHour1);

  let periodBlockMin5 = 60 * 5 / 13;
  periodBlockMin5= parseInt(periodBlockMin5);

  let periodBlockMin30 = 60 * 30 / 13;
  periodBlockMin30= parseInt(periodBlockMin30);


////////////////////////////////////////////////////////
//   Making Vault when staking TON or ETH
// 1. Make a Vault. hashName must be specified as a unique value.
// 2. After confirming that the vault is deployed in the rinkeby,
//    write the generated tone address directly to vaultAddress.
// 3. Uncomment and execute createStakeContract creation for the desired period.
// Note: If you want to enter multiple createStakeContracts, you must create a contract with a shorter period.


  ////////////////////////////////////////////////////////
  // For TON Vault : hashName must be specified as a unique value.
  // ton_vault.hashName = keccak256("TON_TEST_20210522_01");
  // await createValue(ton_vault, ton);

  ////////////////////////////////////////////////////////
  // For TON StakeContract of Vault
  // write your vault .
   let vaultAddress ='0x7eCC1eC34Ca5a87B57308C4576C11fe2307E9e0f';
   console.log('vaultAddress',vaultAddress);
  //  await createStakeContract(vaultAddress, periodBlockMin5,'TON_5_MIN', ton );
  //  console.log('createStakeContract TON_5_MIN');
   timeout(1000);
   await createStakeContract(vaultAddress, periodBlockMin30,'TON_30_MIN', ton );
  console.log('createStakeContract TON_30_MIN');
  ////////////////////////////////////////////////////////
  // For Ether Vault
  // ton_vault.hashName = keccak256("ETH_TEST_20210521_1440");
  // await createValue(ton_vault, zeroAddress);

  ////////////////////////////////////////////////////////
  // For Ether StakeContract of Vault
  // write your vault .
  // let vaultAddress ='0x23988d7f685A17BF5dB64246cF9231c8669dd8A0';
  // console.log('vaultAddress',vaultAddress);
  // await createStakeContract(vaultAddress, periodBlockMin5,'ETH_5_MIN', zeroAddress );
  // await createStakeContract(vaultAddress, periodBlockMin30,'ETH_30_MIN', zeroAddress );
  // await createStakeContract(vaultAddress, periodBlockHour1,'ETH_1_HOUR', zeroAddress );


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
