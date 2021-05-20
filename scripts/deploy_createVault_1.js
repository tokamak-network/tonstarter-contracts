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


async function createValueTON(tonVault) {

  const [deployer, user1] = await ethers.getSigners();
  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);

  let tx = await stakeEntry.createVault(
      ton,
      toWei(tonVault.allocatedFLD, 'ether'),
      tonVault.saleStartBlock,
      tonVault.stakeStartBlock,
      tonVault.phase,
      tonVault.hashName,
      0,
      zeroAddress
    );

  console.log("createValueTON tx:", tx.hash);

  return;
}

async function createStakeContractTON(tonVaultAddress, periodBlock, name) {

  const [deployer, user1] = await ethers.getSigners();
  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  var overrideOptions = {}
  try {
    const estimateGas = await stakeEntry.estimateGas.createStakeContract(
      1,
      tonVaultAddress,
      fldtoken,
      ton,
      periodBlock,
      name
    );
    //const gasLimitCalculated = await estimateGas();

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
      tonVaultAddress,
      fldtoken,
      ton,
      periodBlock,
      name,
      overrideOptions
    );

  console.log("createStakeContractTON ",name,",tx:", tx.hash);

  return;
}


async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());
  const provider = await ethers.getDefaultProvider("rinkeby");

  let curBlock = await provider.getBlockNumber();
  console.log('curBlock',curBlock);

  let saleStartBlock = parseInt(curBlock)+ (60*2/13);
  saleStartBlock = parseInt(saleStartBlock);
  let stakeStartBlock = parseInt(saleStartBlock)+ (60*5/13);
  stakeStartBlock = parseInt(stakeStartBlock);

  let ton_vault = {
    allocatedFLD : '100000',
    saleStartBlock : saleStartBlock,
    stakeStartBlock : stakeStartBlock,
    phase: 1,
    hashName : keccak256("TON_TEST_20210520_14"),
  }

  // await createValueTON(ton_vault);

  let periodBlockHour1 = 60 * 60 / 13;
  periodBlockHour1= parseInt(periodBlockHour1);

  let periodBlockMin5 = 60 * 5 / 13;
  periodBlockMin5= parseInt(periodBlockMin5);

  let vaultAddress ='0xF461E52aC79eaCc412Fbf6b97B8CC89FFed491DD';
  console.log('vaultAddress',vaultAddress);
  console.log('periodBlockMin2',periodBlockMin5);

  await createStakeContractTON(vaultAddress, periodBlockMin5,'TON_5_MIN');

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
