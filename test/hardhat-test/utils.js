/* eslint-disable no-undef */
const { createCurrency, createCurrencyRatio } = require("@makerdao/currency");
const { ethers } = require("hardhat");
const utils = ethers.utils;

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time,
  ether,
} = require("@openzeppelin/test-helpers");
const { connect } = require("http2");
const { toBN, toWei, keccak256, fromWei } = require("web3-utils");

async function findSigner(address) {
  const signers = await ethers.getSigners();
  for (const signer of signers) {
    if (signer.address === address) {
      return signer;
    }
  }
  throw Error("Address not found in Signers");
}

async function getAddresses() {
  const signers = await ethers.getSigners();
  const addresses = [];
  for (const signer of signers) {
    addresses.push(signer.address);
  }
  return addresses;
}



async function setupContracts(account) {
  const _TON = createCurrency("TON");
  const _WTON = createCurrency("WTON");
  const _WTON_TON = createCurrencyRatio(_WTON, _TON);

  const WITHDRAWAL_DELAY = 10;
  const SEIG_PER_BLOCK = _WTON("3.92");
  const ROUND_DURATION = time.duration.minutes(5).toString();
  const TON_UNIT = "wei";
  const WTON_UNIT = "ray";
  const WTON_TON_RATIO = _WTON_TON("1");
  const TON_INITIAL_SUPPLY = _TON("50000000");
  const POWERTON_SEIG_RATE = _WTON("0.1");
  const DAO_SEIG_RATE = _WTON("0.5");
  const PSEIG_RATE = _WTON("0.4");

  const ADMIN_ROLE = keccak256("ADMIN");
  const MINTER_ROLE = keccak256("MINTER");
  const BURNER_ROLE = keccak256("BURNER");

  const TON_INITIAL_HOLDERS = _TON("1000000");
  const TON_VAULT_AMOUNT = _WTON("10000000");

  const TON_MINIMUM_STAKE_AMOUNT = _TON("1000");

const name = "TONStarter";
const symbol = "TOS";
const version = "1.0";

  const addresses = await getAddresses();

  const [
    candidate1,
    candidate2,
    candidate3,
    user1,
    user2,
    user3,
    user4,
    user5,
    operator1,
    operator2,
  ] = addresses;
  const candidates = [candidate1, candidate2, candidate3];
  const users = [user1, user2, user3, user4, user5];
  const operators = [operator1, operator2];

  const deployer = await findSigner(account);

  const tos = await (await ethers.getContractFactory("TOS"))
    .connect(deployer)
    .deploy(name, symbol, version);
  await tos.deployed();

  const stakeRegistry = await (await ethers.getContractFactory("StakeRegistry"))
    .connect(deployer)
    .deploy(tos.address);
  await stakeRegistry.deployed();

  const stakeSimple = await (await ethers.getContractFactory("StakeSimple"))
    .connect(deployer)
    .deploy();
  await stakeSimple.deployed();
  const stakeSimpleFactory = await (
    await ethers.getContractFactory("StakeSimpleFactory")
  )
    .connect(deployer)
    .deploy(stakeSimple.address);
  await stakeSimpleFactory.deployed();

  const stake1Vault = await (await ethers.getContractFactory("Stake1Vault"))
    .connect(deployer)
    .deploy();
  await stake1Vault.deployed();

  const stakeVaultFactory = await (
    await ethers.getContractFactory("StakeVaultFactory")
  )
    .connect(deployer)
    .deploy(stake1Vault.address);
  await stakeVaultFactory.deployed();

  const stakeTONLogic = await (await ethers.getContractFactory("StakeTON"))
    .connect(deployer)
    .deploy();
  await stakeTONLogic.deployed();

  const stakeTONProxyFactory = await (
    await ethers.getContractFactory("StakeTONProxyFactory")
  )
    .connect(deployer)
    .deploy();
  await stakeTONProxyFactory.deployed();

  const stakeTONFactory = await (
    await ethers.getContractFactory("StakeTONFactory")
  )
    .connect(deployer)
    .deploy(stakeTONProxyFactory.address, stakeTONLogic.address);
  await stakeTONProxyFactory.deployed();

  const stakeDefiFactory = await (
    await ethers.getContractFactory("StakeDefiFactory")
  )
    .connect(deployer)
    .deploy(stakeSimple.address);
  await stakeDefiFactory.deployed();

  const stakeFactory = await (await ethers.getContractFactory("StakeFactory"))
    .connect(deployer)
    .deploy(
      stakeSimpleFactory.address,
      stakeTONFactory.address,
      stakeDefiFactory.address
    );
  await stakeFactory.deployed();

  const stake1Logic = await (await ethers.getContractFactory("Stake1Logic"))
    .connect(deployer)
    .deploy();
  await stake1Logic.deployed();

  const stake1Proxy = await (await ethers.getContractFactory("Stake1Proxy"))
    .connect(deployer)
    .deploy(stake1Logic.address);
  await stake1Proxy.deployed();

  // await stake1Proxy.connect(deployer).upgradeTo(stake1Logic.address);

  const stakeEntry = await (
    await ethers.getContractFactory("Stake1Logic")
  ).attach(stake1Proxy.address);

  const ton = await (await ethers.getContractFactory("TON"))
    .connect(deployer)
    .deploy();
  await ton.deployed();

  const wton = await (await ethers.getContractFactory("WTON"))
    .connect(deployer)
    .deploy(ton.address);
  await wton.deployed();

  const layer2Registry = await (
    await ethers.getContractFactory("Layer2Registry")
  )
    .connect(deployer)
    .deploy();
  await layer2Registry.deployed();

  const depositManager = await (
    await ethers.getContractFactory("DepositManager")
  )
    .connect(deployer)
    .deploy(wton.address, layer2Registry.address, WITHDRAWAL_DELAY);
  await depositManager.deployed();


  const coinageFactory = await (
    await ethers.getContractFactory("CoinageFactory")
  )
    .connect(deployer)
    .deploy();
  await coinageFactory.deployed();

  const currentTime = await time.latest();
  const daoVault = await (await ethers.getContractFactory("DAOVault"))
    .connect(deployer)
    .deploy(wton.address, currentTime.toString());
  await daoVault.deployed();

  const seigManager = await (await ethers.getContractFactory("SeigManager"))
    .connect(deployer)
    .deploy(
      ton.address,
      wton.address,
      layer2Registry.address,
      depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      coinageFactory.address
    );
  await seigManager.deployed();

  const powerTON = await (await ethers.getContractFactory("PowerTON"))
    .connect(deployer)
    .deploy(seigManager.address, wton.address, ROUND_DURATION);
  await powerTON.deployed();
  await powerTON.connect(deployer).init();

  await seigManager.connect(deployer).setPowerTON(powerTON.address);
  await powerTON.connect(deployer).start();
  await seigManager.connect(deployer).setDao(daoVault.address);
  await wton.connect(deployer).addMinter(seigManager.address);
  await ton.connect(deployer).addMinter(wton.address);

  await Promise.all(
    [depositManager, wton].map((contract) =>
      contract.connect(deployer).setSeigManager(seigManager.address)
    )
  );

  // ton setting
  await ton
    .connect(deployer)
    .mint(deployer.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));
  await ton
    .connect(deployer)
    .approve(wton.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));

  await seigManager
    .connect(deployer)
    .setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
  await seigManager
    .connect(deployer)
    .setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
  await seigManager
    .connect(deployer)
    .setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));

  await Promise.all(
    candidates.map((account) =>
      ton
        .connect(deployer)
        .transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT))
    )
  );

  await Promise.all(
    users.map((account) =>
      ton
        .connect(deployer)
        .transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT))
    )
  );

  await Promise.all(
    operators.map((account) =>
      ton
        .connect(deployer)
        .transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT))
    )
  );

  await wton
    .connect(deployer)
    .mint(daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));

  await seigManager
    .connect(deployer)
    .setMinimumAmount(
      TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT)
    );

  const swapProxy = await (await ethers.getContractFactory("SwapProxy"))
    .connect(deployer)
    .deploy();

  return {
    ton,
    tos,
    stakeRegistry,
    stakeSimple,
    stakeSimpleFactory,
    stake1Vault,
    stakeVaultFactory,
    stakeTONLogic,
    stakeTONProxyFactory,
    stakeTONFactory,
    stakeDefiFactory,
    stakeFactory,
    stake1Logic,
    stake1Proxy,
    stakeEntry,
    swapProxy,
    initEntry: async () => {
      await stakeEntry
        .connect(deployer)
        .setStore(
          tos.address,
          stakeRegistry.address,
          stakeFactory.address,
          stakeVaultFactory.address,
          ton.address,
          wton.address,
          depositManager.address,
          seigManager.address
        );

      await stakeRegistry
        .connect(deployer)
        .setTokamak(
          ton.address,
          wton.address,
          depositManager.address,
          seigManager.address,
          swapProxy.address
        );

      await stakeRegistry
        .connect(deployer)
        .grantRole(ADMIN_ROLE, stake1Proxy.address);

      await stakeFactory
        .connect(deployer)
        .grantRole(ADMIN_ROLE, stake1Proxy.address);

      return stakeEntry;
    },
  };
}

const mineBlocks = async (untilBlock) => {
  const blockNumber = await ethers.provider.getBlockNumber();
  for (let i = blockNumber; i < untilBlock; ++i) {
    await ethers.provider.send("evm_mine");
  }
};

module.exports = { setupContracts, getAddresses, findSigner, mineBlocks };
