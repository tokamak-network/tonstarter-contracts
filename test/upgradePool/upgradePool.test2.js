const { time, expectEvent } = require("@openzeppelin/test-helpers");
// const { ethers } = require("ethers");
const { ethers } = require("hardhat");
const utils = ethers.utils;
const {
  POOL_BYTECODE_HASH,
  computePoolAddress,
} = require("./computePoolAddress.js");
//const StakeUniswapV3 = require("@uniswap/v3-periphery/artifacts/contracts/libraries/PoolAddress.sol/PoolAddress.json");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const IStakeUniswapV3ABI = require("../../abis/StakeUniswapV3Total.json");
const UpgradePool_ABI = require('../../artifacts/contracts/stake/UpgradePool.sol/UpgradePool.json');


const JSBI = require('jsbi');
const BN = require("bn.js");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { expect, assert } = chai;
chai.use(require("chai-bn")(BN));
chai.use(solidity);
require("chai").should();

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

const {
  defaultSender,
  accounts,
  contract,
  web3,
  privateKeys,
} = require("@openzeppelin/test-environment");

const {
  deployedUniswapV3Contracts,
  FeeAmount,
  TICK_SPACINGS,
  getMinTick,
  getMaxTick,
  getNegativeOneTick,
  getPositiveOneMaxTick,
  encodePriceSqrt,
  getUniswapV3Pool,
  getBlock,
  mintPosition2,
  getTick,
  // getMaxLiquidityPerTick,
} = require("../uniswap-v3-stake/uniswap-v3-contracts");

const {
  ICO20Contracts,
  PHASE2_ETHTOS_Staking,
  PHASE2_MINING_PERSECOND,
  HASH_PHASE2_ETHTOS_Staking,
} = require("../../utils/ico_test_deploy_ethers.js");

const {
  getAddresses,
  findSigner,
  setupContracts,
  mineBlocks,
} = require("../hardhat-test/utils");

const { timeout } = require("../common.js");

const Web3EthAbi = require("web3-eth-abi");
const abiDecoder = require("abi-decoder");
const {
  topic0Collected,
  topic0IncreasedLiquidity,
  topic0DecreasedLiquidity,
  topic0WithdrawalToken,
  topic0Claimed,
  topic0MintAndStaked,
  abiCollected,
  abiIncreasedLiquidity,
  abiDecreasedLiquidity,
  abiWithdrawalToken,
  abiClaimed,
  abiMintAndStaked
  } = require("./stakeUniswapV3Constant");

let deployedUniswapV3;
let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
let pool_wton_tos_address;
const zeroAddress = "0x0000000000000000000000000000000000000000";
let vaultAddress = null;
let stakeContractAddress = null;
let deployer;
let tokenId_First, tokenId_second;
let TestStakeUniswapV3, TestStake2Vault;
let TestStakeUniswapV3Proxy, TestStakeUniswapV3Upgrade;
let secondsPerMining;
let alignPair = 1;

const stakeUniswapV3Storage ={
  token: '',
  stakeRegistry: '',
  vault: '',
  miningAmountTotal: '',
  nonMiningAmountTotal: '',
  totalStakedAmount: '',
  totalStakers: '',
  pauseProxy: '',
  stakeStartTime: '',
  saleStartTime: '',
  miningIntervalSeconds: '',
  poolToken0: '',
  poolToken1: '',
  poolAddress: '',
  poolFee: '',
  uniswapV3FactoryAddress: '',
  totalTokens: '',
  migratedL2: '',
}

const tester1 = {
  account: null,
  wtonAmount: null,
  tosAmount: null,
  amount0Desired: null,
  amount1Desired: null,
  tokens: [],
  positions: [],
  wtonbalanceBefore: 0,
  tosbalanceBefore: 0,
  miningTimeLast: 0,
  snapshot: {
    depositTokens : null,
    positions: null,
    stakedCoinageTokens : null,
    userTotalStaked : null,
    increasedLiquidity: null,
    decreasedLiquidity:null,
    decreasedLiquidityEvent: null,
    collect: null
    }
};
const tester2 = {
  account: null,
  wtonAmount: null,
  tosAmount: null,
  amount0Desired: null,
  amount1Desired: null,
  tokens: [],
  positions: [],
  wtonbalanceBefore: 0,
  tosbalanceBefore: 0,
  miningTimeLast: 0,
  snapshot: {
    depositTokens : null,
    positions: null,
    stakedCoinageTokens : null,
    userTotalStaked : null,
    increasedLiquidity: null,
    decreasedLiquidity:null,
    decreasedLiquidityEvent: null,
    collect: null
    }
};

function getAlignedPair(_token0, _token1) {
  let token0 = _token0;
  let token1 = _token1;
  if (token0 > token1) {
    token0 = _token1;
    token1 = _token0;
    alignPair = 0;
  }

  return [token0, token1];
}

async function approve(token, account, to, amount ) {
  const tx = await token
        .connect(account)
        .approve(to, amount );

  await tx.wait();

  expect(
      await token.allowance(
        account.address,
        to
      )
    ).to.be.equal(amount);

  return [token, account];
}

describe("UpgradePool ", function () {
  let sender;
  let usersInfo;
  let tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth,
    vault_phase1_ton,
    vault_phase1_tosethlp,
    vault_phase1_dev;
  let ton, wton, depositManager, seigManager;
  let stakeEntry, stakeProxy2,
    stakeEntry2,
    layer2,
    stakeUniswapV3Factory,
    stakeUniswapV3,
    stake2Logic,
    stake2Vault,
    stakeVaultFactory,
    stakeUniswapV3Upgrade1;
  let Stake2Logic, StakeUniswapV3, StakeUniswapV3Factory, Stake2Vault, StakeUniswapV3Upgrade1;
  let upgradePool, upgradePoolContract, poolContract, upgradeCoinageFactory, upgradeCoinageFactoryContract;
  let upgradePoolAddress;
  let upgradePool1;

  let user4tosAmount, tosPerSecond, totalReward;
  let upPoolStartTime, upPoolEndTime;
  let incentiveId;

  const stakeType = "2"; // stake type for uniswapV3 stake

  let setup;
  let nftPositionManager, weth;
  let accountlist;
  let user1, user2, user3, user4, user5, user6;
  let admin;
  let defaultSender;
  let owner;
  let sqrtPrice;

  let swapAmountWTON, swapAmountTOS, remainMiningTotal;
  remainMiningTotal = ethers.BigNumber.from("0");

  before(async () => {
    ico20Contracts = new ICO20Contracts();
    accountlist = await getAddresses();

    defaultSender = accountlist[0];
    // console.log("defaultSender :", defaultSender )
    user1 = accountlist[1];
    user2 = accountlist[2];
    user3 = accountlist[3];
    user4 = await findSigner(accountlist[4]);
    user5 = await findSigner(accountlist[5]);
    user6 = await findSigner(accountlist[6]);
    admin = await findSigner(accountlist[7]);


    sender = await ico20Contracts.findSigner(defaultSender);
    tester1.account = await ico20Contracts.findSigner(user1);
    tester2.account = await ico20Contracts.findSigner(user2);
    owner = sender;

    tester1.wtonAmount = ethers.utils.parseUnits("1000", 18);
    tester1.tosAmount = ethers.utils.parseUnits("1000", 18);
    tester1.amount0Desired = ethers.utils.parseUnits("50", 18);
    tester1.amount1Desired = ethers.utils.parseUnits("50", 18);

    tester2.wtonAmount = ethers.utils.parseUnits("1000", 18);
    tester2.tosAmount = ethers.utils.parseUnits("1000", 18);
    tester2.amount0Desired = ethers.utils.parseUnits("300", 18);
    tester2.amount1Desired = ethers.utils.parseUnits("300", 18);

    user4tosAmount = ethers.utils.parseUnits("2000", 18);

    tosPerSecond = ethers.utils.parseUnits("2", 18);

    totalReward = ethers.utils.parseUnits("2000", 18);

    sqrtPrice = encodePriceSqrt(1, 1);
  });

  describe("# 1. Deploy UniswapV3", async function () {
    it("deployedUniswapV3Contracts", async function () {
      this.timeout(1000000);

      deployedUniswapV3 = await deployedUniswapV3Contracts(defaultSender);
      nftPositionManager = deployedUniswapV3.nftPositionManager;
    });
  });

  describe("# 2. TONStarter Deployed ", async function () {
    it("1. ico20Contracts init  ", async function () {
      this.timeout(1000000);
      ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
        defaultSender
      );
    });

    it("2. tokamakContracts init  ", async function () {
      this.timeout(1000000);
      TokamakContractsDeployed =
        await ico20Contracts.initializePlasmaEvmContracts(defaultSender);
      const cons = await ico20Contracts.getPlasamContracts();

      ton = cons.ton;
      wton = cons.wton;
      depositManager = cons.depositManager;
      seigManager = cons.seigManager;
      globalWithdrawalDelay = await depositManager.globalWithdrawalDelay();

      await ton.mint(defaultSender, ethers.utils.parseUnits("1000", 18), {
        from: defaultSender,
      });
      await wton.mint(defaultSender, ethers.utils.parseUnits("1000", 27), {
        from: defaultSender,
      });

      await wton.mint(tester1.account.address, tester1.wtonAmount, {
        from: defaultSender,
      });
      await wton.mint(tester2.account.address, tester2.wtonAmount, {
        from: defaultSender,
      });
    });

    it("3. Set StakeProxy ", async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntryExceptUniswap(defaultSender);

      const cons = await ico20Contracts.getICOContracts();
      stakeregister = cons.stakeregister;
      tos = cons.tos;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;

      await stakeregister.addDefiInfo(
        "UNISWAP_V3",
        deployedUniswapV3.swapRouter.address,
        deployedUniswapV3.nftPositionManager.address,
        deployedUniswapV3.weth.address,
        FeeAmount.LOW,
        zeroAddress
      );

      await tos.mint(tester1.account.address, tester1.tosAmount, {
        from: defaultSender,
      });
      await tos.mint(tester2.account.address, tester2.tosAmount, {
        from: defaultSender,
      });
    });
  });

  describe("# 3. Regist Stake2Vault with phase=2 ", async function () {
    it("1. addStake2LogicAndVault2Factory for UniswapV3 Staking", async function () {
      this.timeout(1000000);

      stakeEntry2 = await ico20Contracts.addStake2LogicAndVault2Factory(
        defaultSender
      );
      const cons = await ico20Contracts.getICOContracts();
      
      stake2logic = cons.stake2logic;
      stakeUniswapV3Logic = cons.stakeUniswapV3Logic;
      stakeCoinageFactory = cons.stakeCoinageFactory;
      stakeUniswapV3Factory = cons.stakeUniswapV3Factory;
      stakeVaultFactory = cons.stakeVaultFactory;
      stake2vaultlogic = cons.stake2vaultlogic;
      upgradePool1 = cons.upgradePool1;
      
      // console.log("upgradePool1", upgradePool1);
    });
  });

  describe("# 4. Phase 2 : Create StakeUniswapV3 ", async function () {
    it("1. Create StakeUniswapV3 Vaults & Stake Contract ", async function () {
      this.timeout(1000000);

      // let balance  = await stakeEntry2.balanceOf(wton.address, defaultSender);

      const cons = await ico20Contracts.getICOContracts();
      stakeVaultFactory = cons.stakeVaultFactory;
      stakeEntry2 = cons.stakeEntry2;
      tos = cons.tos;
      stakefactory = cons.stakefactory;

      const tx = await stakeEntry2
        .connect(owner)
        .createVault2(
          utils.parseUnits(PHASE2_ETHTOS_Staking, 18),
          utils.parseUnits(PHASE2_MINING_PERSECOND, 0),
            deployedUniswapV3.nftPositionManager.address,
            deployedUniswapV3.coreFactory.address,
            wton.address,
            tos.address,
          "UniswapV3"
        );
      const receipt = await tx.wait();
      // console.log('receipt',receipt);

      for (let i = 0; i < receipt.events.length; i++) {
        // console.log('receipt.events[i].event',i, receipt.events[i].event);
        if (
          receipt.events[i].event == "CreatedStakeContract2" &&
          receipt.events[i].args != null
        ) {
          vaultAddress = receipt.events[i].args.vault;
          stakeContractAddress = receipt.events[i].args.stakeContract;
        }
      }

      const codeAfter = await owner.provider.getCode(vaultAddress);
      expect(codeAfter).to.not.eq("0x");

      if (vaultAddress != null) {
        await tos
          .connect(owner)
          .mint(vaultAddress, utils.parseUnits(PHASE2_ETHTOS_Staking, 18));
      }
      expect(await tos.balanceOf(vaultAddress)).to.be.equal(
        utils.parseUnits(PHASE2_ETHTOS_Staking, 18)
      );

      TestStake2Vault = await ico20Contracts.getContract(
        "Stake2Vault",
        vaultAddress,
        owner.address
      );

      expect(await TestStake2Vault.miningPerSecond()).to.be.equal(
        utils.parseUnits(PHASE2_MINING_PERSECOND, 0)
      );

      expect(await TestStake2Vault.cap()).to.be.equal(
        utils.parseUnits(PHASE2_ETHTOS_Staking, 18)
      );
      expect(await TestStake2Vault.stakeType()).to.be.equal(
        ethers.BigNumber.from("2")
      );
      expect(await TestStake2Vault.stakeAddress()).to.be.equal(
        stakeContractAddress
      );
      expect(await TestStake2Vault.tos()).to.be.equal(tos.address);

      let addrArray = await TestStake2Vault.stakeAddressesAll();
      expect(addrArray.length).to.be.equal(1);
      expect(addrArray[0]).to.be.equal(stakeContractAddress);

    });

    it("2. setStartTimeOfVault2", async function () {
      this.timeout(1000000);
      let startTime = new Date().getTime();
      startTime = Math.floor(startTime / 1000);
      startTime = parseInt(startTime);

      const period = 60 * 60 * 24 * 365 * 3;
      const endTime = startTime + period;

      await stakeEntry2.setStartTimeOfVault2(vaultAddress, startTime);
      const miningStartTime = await TestStake2Vault.miningStartTime();
      expect(miningStartTime.toString()).to.be.equal(startTime + "");

      await stakeEntry2.setEndTimeOfVault2(vaultAddress, endTime);
      const miningEndTime = await TestStake2Vault.miningEndTime();
      expect(miningEndTime).to.be.equal(
        miningStartTime.add(ethers.BigNumber.from(period + ""))
      );

      TestStakeUniswapV3 = await ico20Contracts.getContract(
        "StakeUniswapV3",
        stakeContractAddress,
        owner.address
      );
      const saleStartTime = await TestStakeUniswapV3.saleStartTime();
      expect(saleStartTime.toString()).to.be.equal(startTime + "");
    });

    it("3. tos.addBurner to vault", async function () {
      this.timeout(1000000);

      const tx = await tos.addBurner(vaultAddress);
      await tx.wait();
      expect(await tos.isBurner(vaultAddress)).to.be.equal(true);
    });
  });

  describe("# 5. UniswapV3 Pool Setting & Token Creation", () => {
    it("1. pool is created and initialized  ", async () => {
      const expectedAddress = computePoolAddress(
        deployedUniswapV3.coreFactory.address,
        [wton.address, tos.address],
        FeeAmount.MEDIUM
      );

      let code = await sender.provider.getCode(expectedAddress);
      expect(code).to.eq("0x");

      const [token0, token1] = getAlignedPair(wton.address, tos.address);

      await deployedUniswapV3.coreFactory
        .connect(sender)
        .createPool(token0, token1, FeeAmount.MEDIUM);
      await timeout(10);

      const pool = new ethers.Contract(
        expectedAddress,
        IUniswapV3PoolABI.abi,
        sender
      );

      expect(expectedAddress).to.eq(pool.address);

      await pool.connect(sender).initialize(sqrtPrice);

      await timeout(10);
      code = await sender.provider.getCode(expectedAddress);
      expect(code).to.not.eq("0x");

      pool_wton_tos_address = expectedAddress;
    });

    it("2. createAndInitializePoolIfNecessary ", async () => {
      this.timeout(1000000);
      // await timeout(5);

      const [token0, token1] = getAlignedPair(wton.address, tos.address);
      await deployedUniswapV3.nftPositionManager
        .connect(sender)
        .createAndInitializePoolIfNecessary(
          token0,
          token1,
          FeeAmount.MEDIUM,
          sqrtPrice
        );

    });

    it("3. approve wton, tos : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      await approve(wton, tester.account, deployedUniswapV3.nftPositionManager.address, tester.wtonbalanceBefore);
      await approve(tos, tester.account, deployedUniswapV3.nftPositionManager.address, tester.tosbalanceBefore);

    });

    it("4. mint : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      await timeout(5);
      const [token0, token1] = getAlignedPair(wton.address, tos.address);
      await deployedUniswapV3.nftPositionManager.connect(tester.account).mint({
        token0: token0,
        token1: token1,
        tickLower: getNegativeOneTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
        tickUpper: getPositiveOneMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
        fee: FeeAmount.MEDIUM,
        recipient: tester.account.address,
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: 100000000000000,
      });

      const wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);

      expect(wtonBalanceAfter).to.be.equal(
        tester.wtonbalanceBefore.sub(tester.amount0Desired)
      );
      expect(tosBalanceAfter).to.be.equal(
        tester.tosbalanceBefore.sub(tester.amount1Desired)
      );

      let len = await deployedUniswapV3.nftPositionManager.balanceOf(
        tester.account.address
      );

      expect(len).to.be.equal(ethers.BigNumber.from("1"));
      len = parseInt(len.toString());

      // console.log('6');
      for (let i = 0; i < len; i++) {
        const tokenId =
          await deployedUniswapV3.nftPositionManager.tokenOfOwnerByIndex(
            tester.account.address,
            i
          );
        tester.tokens.push(tokenId);
        const position = await deployedUniswapV3.nftPositionManager.positions(
          tokenId
        );
        tester.positions.push(position);
      }
      expect(tester.tokens.length).to.be.equal(1);
    });

    it("5. approve  wton , tos : tester2 ", async () => {
      this.timeout(1000000);
      const tester = tester2;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      await approve(wton, tester.account, deployedUniswapV3.nftPositionManager.address, tester.wtonbalanceBefore);
      await approve(tos, tester.account, deployedUniswapV3.nftPositionManager.address, tester.tosbalanceBefore);

    });

    it("6. mint : tester2 ", async () => {
      this.timeout(1000000);
      const tester = tester2;
      // await timeout(1);
      const [token0, token1] = getAlignedPair(wton.address, tos.address);
      await deployedUniswapV3.nftPositionManager.connect(tester.account).mint({
        token0: token0,
        token1: token1,
        tickLower: getNegativeOneTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
        tickUpper: getPositiveOneMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
        fee: FeeAmount.MEDIUM,
        recipient: tester.account.address,
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: 100000000000000,
      });

      await timeout(1);

      const wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);

      expect(wtonBalanceAfter).to.be.equal(
        tester.wtonbalanceBefore.sub(tester.amount0Desired)
      );
      expect(tosBalanceAfter).to.be.equal(
        tester.tosbalanceBefore.sub(tester.amount1Desired)
      );

      let len = await deployedUniswapV3.nftPositionManager.balanceOf(
        tester.account.address
      );

      expect(len).to.be.equal(ethers.BigNumber.from("1"));
      len = parseInt(len.toString());

      // console.log('6');
      for (let i = 0; i < len; i++) {
        const tokenId =
          await deployedUniswapV3.nftPositionManager.tokenOfOwnerByIndex(
            tester.account.address,
            i
          );
        tester.tokens.push(tokenId);
        const position = await deployedUniswapV3.nftPositionManager.positions(
          tokenId
        );
        tester.positions.push(position);
      }
      expect(tester.tokens.length).to.be.equal(1);
    });
  });

  describe("# 6. Deploy UpgradePool", async function () {
    it("deployCoinageFactory", async function () {
      upgradeCoinageFactory = await ethers.getContractFactory("StakeCoinageFactory");
      upgradeCoinageFactoryContract = await upgradeCoinageFactory.connect(owner).deploy();
    })
    it("deployUpgradePool", async function () {
      this.timeout(1000000);

      upgradePool = await ethers.getContractFactory("UpgradePool");
      upgradePoolContract = await upgradePool.connect(owner).deploy(admin.address);
      await upgradePoolContract.deployed();
      upgradePoolAddress = upgradePoolContract.address;

      await upgradePoolContract.connect(admin).setFactory(
        deployedUniswapV3.nftPositionManager.address,
        deployedUniswapV3.coreFactory.address
      );

      await upgradePoolContract.connect(admin).setCoinageFactory(upgradeCoinageFactoryContract.address);

      await upgradePoolContract.connect(admin).deployCoinage(pool_wton_tos_address);

      await tos.mint(user4.address, user4tosAmount, {
        from: defaultSender,
      });
      let tx = await tos.balanceOf(user4.address);
      expect(tx).to.be.equal(user4tosAmount);
    });

    // it("deploy UpgradePool1", async function () {
    //   const cons = await ico20Contracts.getICOContracts();
    //   upgradePool1 = cons.upgradePool1;
    //   console.log(upgradePool1)
    // })
  });

  describe("# 5. Staking the UpgradePool", () => {
    it("1. check current tick ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      // pool_wton_tos_address
      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();

      expect(tester.positions.length).to.be.above(0);

      expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
      expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);

      expect(tester2.positions.length).to.be.above(0);
      expect(slot0.tick).to.be.above(tester2.positions[0].tickLower);
      expect(slot0.tick).to.be.below(tester2.positions[0].tickUpper);
    });

    it("2. admin check", async () => {
      // console.log(upgradePoolContract.address);
      let tx = await upgradePoolContract.isAdmin(admin.address)
      expect(tx).to.be.equal(true);
    })

    it("3. add admin check", async () => {
      // console.log(upgradePoolContract.address);
      await upgradePoolContract.connect(admin).addAdmin(tester1.account.address)
      let tx = await upgradePoolContract.isAdmin(tester1.account.address)
      expect(tx).to.be.equal(true);

      await upgradePoolContract.connect(tester1.account).addAdmin(user4.address)
      let tx2 = await upgradePoolContract.isAdmin(user4.address)
      expect(tx2).to.be.equal(true);
      // console.log(tester1.tokens[0].toString());
      // console.log(tester2.tokens[0].toString());
    })

    it("3. create the Vault not admin", async () => {
      let curBlock = await ethers.provider.getBlock();
      upPoolStartTime = curBlock.timestamp + 50;
      upPoolEndTime = upPoolStartTime + 1000;
      await expect(
        upgradePoolContract.connect(tester2.account).createVault(
          tos.address,
          pool_wton_tos_address,
          [upPoolStartTime,upPoolEndTime],
          tosPerSecond,
          totalReward
        )
      ).to.be.revertedWith("Accessible: Caller is not an admin");
    })


    it("4. create the Vault caller admin, not approve", async () => {
      let curBlock = await ethers.provider.getBlock();
      upPoolStartTime = curBlock.timestamp + 50;
      upPoolEndTime = upPoolStartTime + 1000;
      await expect(
        upgradePoolContract.connect(user4).createVault(
          tos.address,
          pool_wton_tos_address,
          [upPoolStartTime,upPoolEndTime],
          tosPerSecond,
          totalReward
        )
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    })

    it("5. create the Vault caller admin after approve", async () => {
      await tos.connect(user4).approve(upgradePoolContract.address, totalReward);
      let curBlock = await ethers.provider.getBlock();
      upPoolStartTime = curBlock.timestamp + 50;
      upPoolEndTime = upPoolStartTime + 1000;

      await upgradePoolContract.connect(user4).createVault(
        tos.address,
        pool_wton_tos_address,
        [upPoolStartTime,upPoolEndTime],
        tosPerSecond,
        totalReward
      );
    })

    it("6. check the vaultInfo", async() => {
      let tx = await upgradePoolContract.vaultInfo(pool_wton_tos_address,0);
      expect(tx.owner).to.be.equal(user4.address);
      expect(tx.rewardToken).to.be.equal(tos.address);
      expect(tx.startTime).to.be.equal(upPoolStartTime);
      expect(tx.endTime).to.be.equal(upPoolEndTime);
    })

    it("7. staking the UgradePool before approve", async () => {
      this.timeout(1000000);

      await expect(
        upgradePoolContract.connect(tester1.account).stake(tester1.tokens[0])
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    it("8. staking the UgradePool after approve", async () => {
      this.timeout(1000000);
      await ethers.provider.send('evm_setNextBlockTimestamp', [upPoolStartTime]);
      await ethers.provider.send('evm_mine');

      const tester = tester1;

      await deployedUniswapV3.nftPositionManager
      .connect(tester.account)
      .setApprovalForAll(upgradePoolContract.address, true);

      await upgradePoolContract.connect(tester.account).stake(tester.tokens[0]);
      const tokenInfo = await upgradePoolContract.tokenInfo(tester.tokens[0]);
      // console.log(tokenInfo);
    })


    it("9. claim the vault", async () => {
      await ethers.provider.send('evm_setNextBlockTimestamp', [upPoolStartTime+20]);
      await ethers.provider.send('evm_mine');
      let tosBalace1 = await tos.balanceOf(tester1.account.address);
      console.log(Number(tosBalace1))
      await tos.connect(tester1.account).transfer(user6.address, tosBalace1);

      incentiveId = await upgradePoolContract.getIncentiveId(pool_wton_tos_address,0);

      await upgradePoolContract.connect(tester1.account).oneClaim(tester1.tokens[0],0)
      let tx = await upgradePoolContract.claimInfo(tester1.tokens[0],incentiveId)
      // console.log(tx)

      console.log(Number(tx.claimAmount))

      let tosBalace2 = await tos.balanceOf(tester1.account.address);
      console.log(Number(tosBalace2))
      // console.log((Number(tosBalace1)+Number(tx.claimAmount)))
      expect(Number(tosBalace2)).to.be.equal(Number(tx.claimAmount))
    })

    it("10. claim the vault endTime", async () => {
      await ethers.provider.send('evm_setNextBlockTimestamp', [upPoolEndTime+1]);
      await ethers.provider.send('evm_mine');

      let tosBalace1 = await tos.balanceOf(tester1.account.address);
      console.log(Number(tosBalace1))

      incentiveId = await upgradePoolContract.getIncentiveId(pool_wton_tos_address,0);

      await upgradePoolContract.connect(tester1.account).oneClaim(tester1.tokens[0],0)
      let tx = await upgradePoolContract.claimInfo(tester1.tokens[0],incentiveId)
      // console.log(tx)

      console.log(Number(tx.claimAmount))

      let tosBalace2 = await tos.balanceOf(tester1.account.address);
      console.log(Number(tosBalace2))
      // console.log((Number(tosBalace1)+Number(tx.claimAmount)))
      expect(Number(tosBalace2)).to.be.equal(Number(tx.claimAmount))
    })



  });

});
