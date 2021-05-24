const { BigNumber } = require('ethers');
const { ethers, upgrades } = require('hardhat');
const utils = ethers.utils;
const save = require('./save_deployed_file');

const { padLeft, toBN, toWei, fromWei, keccak256, soliditySha3, solidityKeccak256 } = require('web3-utils');

require('dotenv').config();

const initialTotal = process.env.initialTotal + '.' + '0'.repeat(18);

const Pharse1_TOTAL = process.env.Pharse1_TOTAL + '.' + '0'.repeat(18);
const Pharse1_TON_Staking = process.env.Pharse1_TON_Staking + '.' + '0'.repeat(18);
const Pharse1_ETH_Staking = process.env.Pharse1_ETH_Staking + '.' + '0'.repeat(18);
const Pharse1_FLDETHLP_Staking = process.env.Pharse1_FLDETHLP_Staking + '.' + '0'.repeat(18);
const Pharse1_DEV_Mining = process.env.Pharse1_DEV_Mining + '.' + '0'.repeat(18);

const Pharse2_TOTAL = process.env.Pharse2_TOTAL + '.' + '0'.repeat(18);
const Pharse2_FLDETH_Staking = process.env.Pharse2_FLDETH_Staking + '.' + '0'.repeat(18);
const Pharse2_FLD_Staking = process.env.Pharse2_FLD_Staking + '.' + '0'.repeat(18);
const Pharse2_DEV_Mining = process.env.Pharse2_DEV_Mining + '.' + '0'.repeat(18);

const Pharse3_TOTAL = process.env.Pharse3_TOTAL + '.' + '0'.repeat(18);
const Pharse3_FLDETH_Staking = process.env.Pharse3_FLDETH_Staking + '.' + '0'.repeat(18);
const Pharse3_FLD_Staking = process.env.Pharse3_FLD_Staking + '.' + '0'.repeat(18);
const Pharse3_DEV_Mining = process.env.Pharse3_DEV_Mining + '.' + '0'.repeat(18);

const zeroAddress = '0x0000000000000000000000000000000000000000';
const sendAmountForTest = '10000';

const ADMIN_ROLE = keccak256('ADMIN');
const MINTER_ROLE = keccak256('MINTER');
const BURNER_ROLE = keccak256('BURNER');
const CLAIMER_ROLE = keccak256('CLAIMER');
const PHASE2_VAULT_HASH = keccak256('PHASE2_VAULT');
const EVENT_VAULT_HASH = keccak256('EVENT_VAULT');

async function deployMain (defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const FLD = await ethers.getContractFactory('FLD');
  const fld = await FLD.deploy();
  console.log('fld:', fld.address);

  const StakeSimple = await ethers.getContractFactory('StakeSimple');
  const StakeSimpleFactory = await ethers.getContractFactory('StakeSimpleFactory');

  //const StakeTONLogicFactory = await ethers.getContractFactory('StakeTONLogicFactory');
  const StakeTONLogic = await ethers.getContractFactory('StakeTON');
  const StakeTONProxyFactory = await ethers.getContractFactory('StakeTONProxyFactory');

  const Stake1Vault = await ethers.getContractFactory('Stake1Vault');
  const StakeVaultFactory = await ethers.getContractFactory('StakeVaultFactory');
  const StakeRegistry = await ethers.getContractFactory('StakeRegistry');
  const Stake1Logic = await ethers.getContractFactory('Stake1Logic');
  const Stake1Proxy = await ethers.getContractFactory('Stake1Proxy');
  const StakeFactory = await ethers.getContractFactory('StakeFactory');
  const StakeTONFactory = await ethers.getContractFactory("StakeTONFactory");
  const StakeForStableCoinFactory = await ethers.getContractFactory("StakeForStableCoinFactory");

  const stakeSimple = await StakeSimple.deploy();
  const stakeSimpleFactory = await StakeSimpleFactory.deploy(stakeSimple.address);
  console.log('StakeSimpleFactory:', stakeSimpleFactory.address);

  // const stakeTONLogicFactory = await StakeTONLogicFactory.deploy();
  // console.log('StakeTONLogicFactory:', stakeTONLogicFactory.address);
  const stakeTONLogic = await StakeTONLogic.deploy();
  console.log('StakeTONLogic:', stakeTONLogic.address);

  const stakeTONProxyFactory = await StakeTONProxyFactory.deploy();
  console.log('StakeTONProxyFactory:', stakeTONProxyFactory.address);

  const stakeTONFactory = await StakeTONFactory.deploy(stakeTONProxyFactory.address, stakeTONLogic.address);
  console.log('stakeTONFactory:', stakeTONFactory.address);

  const stakeForStableCoinFactory = await StakeForStableCoinFactory.deploy();
  console.log('stakeForStableCoinFactory:', stakeForStableCoinFactory.address);

  const stakeFactory = await StakeFactory.deploy(stakeSimpleFactory.address, stakeTONFactory.address, stakeForStableCoinFactory.address);
  console.log('stakeFactory:', stakeFactory.address);

  const stakeRegistry = await StakeRegistry.deploy();
  console.log('stakeRegistry:', stakeRegistry.address);

  const stake1Vault = await Stake1Vault.deploy();
  console.log('Stake1Vault:', stake1Vault.address);

  const stakeVaultFactory = await StakeVaultFactory.deploy(stake1Vault.address);
  console.log('stakeVaultFactory:', stakeVaultFactory.address);

  const stake1Logic = await Stake1Logic.deploy();
  console.log('stake1Logic:', stake1Logic.address);

  const stake1Proxy = await Stake1Proxy.deploy();
  console.log('stake1Proxy:', stake1Proxy.address);

  await stake1Proxy.upgradeTo(stake1Logic.address);
  console.log('stake1Proxy upgradeTo:', stake1Logic.address);

  const stakeEntry = await ethers.getContractAt("Stake1Logic", stake1Proxy.address);
  console.log("stakeEntry:" , stakeEntry.address);

  const out = {};
  out.FLD = fld.address;
  out.StakeSimpleFactory = stakeSimpleFactory.address;
  out.StakeTONLogic = stakeTONLogic.address;
  out.StakeTONProxyFactory = stakeTONProxyFactory.address;
  out.StakeTONFactory = stakeTONFactory.address;
  out.StakeForStableCoinFactory = stakeForStableCoinFactory.address;
  out.StakeFactory = stakeFactory.address;
  out.StakeRegistry = stakeRegistry.address;
  out.StakeVaultFactory = stakeVaultFactory.address;
  out.Stake1Logic = stake1Logic.address;
  out.Stake1Proxy = stake1Proxy.address;
  return out;
}

async function main () {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log(
    'Deploying contracts with the account:',
    deployer.address
  );

  console.log('Account balance:', (await deployer.getBalance()).toString());

  let contracts = await deployMain(deployer);
  console.log('contracts:', process.env.NETWORK, contracts);

  // The address the Contract WILL have once mined

  let out = {};
  out.FLD = contracts.FLD;
  out.StakeSimpleFactory = contracts.StakeSimpleFactory;
  out.StakeTONLogicFactory = contracts.StakeTONLogicFactory;
  out.StakeTONProxyFactory = contracts.StakeTONProxyFactory;
  out.StakeTONFactory = contracts.StakeTONFactory;
  out.StakeForStableCoinFactory = contracts.StakeForStableCoinFactory;
  out.StakeFactory = contracts.StakeFactory;
  out.StakeRegistry = contracts.StakeRegistry;
  out.StakeVaultFactory = contracts.StakeVaultFactory;
  out.Stake1Logic = contracts.Stake1Logic;
  out.Stake1Proxy = contracts.Stake1Proxy;

  out.TON = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0";
  out.WTON = "0x709bef48982Bbfd6F2D4Be24660832665F53406C";
  out.DepositManager = "0x57F5CD759A5652A697D539F1D9333ba38C615FC2";
  out.SeigManager = "0x957DaC3D3C4B82088A4939BE9A8063e20cB2efBE";

  save(
    process.env.NETWORK, out
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
