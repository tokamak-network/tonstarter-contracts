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

describe(" StakeUniswapV3 ", function () {
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

  const stakeType = "2"; // stake type for uniswapV3 stake

  let setup;
  let nftPositionManager, weth;
  let accountlist;
  let user1, user2, user3;
  let defaultSender;
  let owner;
  let sqrtPrice;

  let swapAmountWTON, swapAmountTOS, remainMiningTotal;
  remainMiningTotal = ethers.BigNumber.from("0");

  before(async () => {
    ico20Contracts = new ICO20Contracts();
    accountlist = await getAddresses();

    defaultSender = accountlist[0];
    user1 = accountlist[1];
    user2 = accountlist[2];
    user3 = accountlist[3];

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

  describe("# 6. Swap : change the current tick", () => {
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

    it("2. approve wton : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      await approve(wton, tester.account, deployedUniswapV3.swapRouter.address, tester.wtonbalanceBefore);

    });
    it("3. swap ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      swapAmountWTON = ethers.utils.parseUnits("900", 18);
      swapAmountTOS = ethers.utils.parseUnits("900", 18);

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      const params = {
        tokenIn: wton.address,
        tokenOut: tos.address,
        fee: FeeAmount.MEDIUM,
        recipient: tester1.account.address,
        deadline: 100000000000000,
        amountIn: swapAmountWTON,
        amountOutMinimum: ethers.BigNumber.from("0"),
        sqrtPriceLimitX96: ethers.BigNumber.from("0"),
      };

      const tx = await deployedUniswapV3.swapRouter
        .connect(tester.account)
        .exactInputSingle(params);
      tx.wait();

      const wtonBalance = await wton.balanceOf(tester.account.address);
      const tosBalance = await tos.balanceOf(tester.account.address);

      expect(wtonBalance).to.be.below(tester.wtonbalanceBefore);
      expect(tosBalance).to.be.above(tester.tosbalanceBefore);

      tester.wtonbalanceBefore = wtonBalance;
      tester.tosbalanceBefore = tosBalance;
    });

    it("4. out of current tick ", async () => {
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
      if (alignPair)
        expect(slot0.tick).to.be.below(tester.positions[0].tickLower);
      else expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
    });
  });

  describe("# 7. StakeUniswapV3 Of TONStarter : set & fail stake", () => {
    it("1. setMiningIntervalSeconds ", async () => {
      this.timeout(1000000);

      await ico20Contracts.stakeEntry2
        .connect(owner)
        .setMiningIntervalSeconds(
          stakeContractAddress,
          ethers.BigNumber.from("0")
        );

      TestStakeUniswapV3 = await ico20Contracts.getContract(
        "StakeUniswapV3",
        stakeContractAddress,
        tester1.account.address
      );

      expect(await TestStakeUniswapV3.miningIntervalSeconds()).to.be.equal(
        ethers.BigNumber.from("0")
      );
    });

    it("2. setPoolAddress ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      await ico20Contracts.stakeEntry2
        .connect(owner)
        .setPoolAddressWithTokenId(
          stakeContractAddress,
          tester.tokens[0]
        );

      let pool = await TestStakeUniswapV3.poolAddress();
      expect(pool).to.be.equal(pool_wton_tos_address);

    });

    it("3. stake : Fail when the current tick is outside the range provided by the token", async () => {
      this.timeout(1000000);
      await expect(
        TestStakeUniswapV3.connect(tester1.account).stake(tester1.tokens[0])
      ).to.be.revertedWith("StakeUniswapV3: out of tick range");
    });
  });

  describe("# 8. StakeUniswapV3 Of TONStarter ", () => {
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

      if (alignPair)
        expect(slot0.tick).to.be.below(tester.positions[0].tickLower);
      else expect(slot0.tick).to.be.above(tester.positions[0].tickLower);

      let poolSlot0 =  await TestStakeUniswapV3.poolSlot0();
      expect(poolSlot0.sqrtPriceX96).to.be.equal(slot0.sqrtPriceX96);
      expect(poolSlot0.tick).to.be.equal(slot0.tick);
      expect(poolSlot0.observationIndex).to.be.equal(slot0.observationIndex);
      expect(poolSlot0.observationCardinality).to.be.equal(slot0.observationCardinality);
      expect(poolSlot0.observationCardinalityNext).to.be.equal(slot0.observationCardinalityNext);
      expect(poolSlot0.feeProtocol).to.be.equal(slot0.feeProtocol);
      expect(poolSlot0.unlocked).to.be.equal(slot0.unlocked);

      /*
      let decimal_token0 = 1e27;
      let decimal_token1 = 1e18;
      let decimal_token1_1 = 18;
      let TOKEN0="WTON";
      if(tester.positions[0].token0 == tos.address) {
        decimal_token0 = 1e18;
        decimal_token1 = 1e27;
        decimal_token1_1 = 27;
        TOKEN0="TOS";
      }

      //var number_1 = JSBI.BigInt(poolSlot0.sqrtPriceX96*poolSlot0.sqrtPriceX96*decimal_token0/decimal_token1/JSBI.BigInt(2)**(JSBI.BigInt(192)));
      var number_1 = JSBI.BigInt(slot0.sqrtPriceX96*slot0.sqrtPriceX96*decimal_token1/JSBI.BigInt(2)**(JSBI.BigInt(192)));
      console.log(TOKEN0 ,' 1 : ',number_1.toString());
      let getPrice =  await TestStakeUniswapV3.getPrice(ethers.utils.parseUnits("1", 18))
      console.log('getPrice',getPrice.toString());
      */
    });

    it("2. approve tos : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);
      await approve(tos, tester.account, deployedUniswapV3.swapRouter.address, tester.tosbalanceBefore);

    });
    it("3. swap : change the current tick to inside range", async () => {
      this.timeout(1000000);
      const tester = tester1;

      swapAmountWTON = ethers.utils.parseUnits("900", 18);
      swapAmountTOS = ethers.utils.parseUnits("450", 18);

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      expect(tester.tosbalanceBefore).to.be.above(swapAmountTOS);

      const params = {
        tokenIn: tos.address,
        tokenOut: wton.address,
        fee: FeeAmount.MEDIUM,
        recipient: tester1.account.address,
        deadline: 100000000000000,
        amountIn: swapAmountTOS,
        amountOutMinimum: ethers.BigNumber.from("0"),
        sqrtPriceLimitX96: ethers.BigNumber.from("0"),
      };

      const tx = await deployedUniswapV3.swapRouter
        .connect(tester.account)
        .exactInputSingle(params);
      tx.wait();

      const wtonBalance = await wton.balanceOf(tester.account.address);
      const tosBalance = await tos.balanceOf(tester.account.address);

      expect(wtonBalance).to.be.above(tester.wtonbalanceBefore);
      expect(tosBalance).to.be.below(tester.tosbalanceBefore);

      tester.wtonbalanceBefore = wtonBalance;
      tester.tosbalanceBefore = tosBalance;
    });

    it("4. check current tick : inside the current tick ", async () => {
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
      // expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);

      // expect(tester2.positions.length).to.be.above(0);
      // expect(slot0.tick).to.be.above(tester2.positions[0].tickLower);
      // expect(slot0.tick).to.be.below(tester2.positions[0].tickUpper);

      /*
      let decimal_token0 = 1e27;
      let decimal_token1 = 1e18;
      let decimal_token1_1 = 18;
      let TOKEN0="WTON";

      if(tester.positions[0].token0 == tos.address) {
        decimal_token0 = 1e18;
        decimal_token1 = 1e27;
        decimal_token1_1 = 27;
        TOKEN0="TOS";
      }
      //var number_1 = JSBI.BigInt(poolSlot0.sqrtPriceX96*poolSlot0.sqrtPriceX96*decimal_token0/decimal_token1/JSBI.BigInt(2)**(JSBI.BigInt(192)));

      var number_1 = JSBI.BigInt(slot0.sqrtPriceX96*slot0.sqrtPriceX96*decimal_token1/JSBI.BigInt(2)**(JSBI.BigInt(192)));

      console.log(TOKEN0, ' 1 : ',number_1.toString());
      let getPrice =  await TestStakeUniswapV3.getPrice(ethers.utils.parseUnits("1", 18))
      console.log('getPrice',getPrice.toString());
      */
    });

    it("5. stake : fail stake without approve token", async () => {
      this.timeout(1000000);
      await expect(
        TestStakeUniswapV3.connect(tester1.account).stake(tester1.tokens[0])
      ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });

    it("6. stake : after setApprovalForAll tester1's token ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      await deployedUniswapV3.nftPositionManager
        .connect(tester.account)
        .setApprovalForAll(stakeContractAddress, true);

      TestStakeUniswapV3 = await ico20Contracts.getContract(
        "StakeUniswapV3",
        stakeContractAddress,
        tester.account.address
      );

      const totalStakedAmountBefore =
        await TestStakeUniswapV3.totalStakedAmount();

      await TestStakeUniswapV3.connect(tester.account).stake(tester.tokens[0]);
      const depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3.userTotalStaked(
        tester.account.address
      );

      expect(depositToken.owner).to.be.equal(tester.account.address);

      expect(depositToken.startTime).to.be.equal(coinageToken.startTime);
      expect(depositToken.liquidity).to.be.equal(coinageToken.amount);
      expect(depositToken.secondsInsideInitial).to.be.above(0);
      expect(depositToken.secondsInsideLast).to.be.equal(0);

      expect(userTotalStaked.staked).to.be.equal(true);
      expect(userTotalStaked.totalDepositAmount).to.be.equal(
        depositToken.liquidity
      );

      expect(await TestStakeUniswapV3.totalStakers()).to.be.equal(
        ethers.BigNumber.from("1")
      );
      expect(await TestStakeUniswapV3.totalTokens()).to.be.equal(
        ethers.BigNumber.from("1")
      );
      expect(await TestStakeUniswapV3.totalStakedAmount()).to.be.equal(
        totalStakedAmountBefore.add(depositToken.liquidity)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("7. stake : after setApprovalForAll tester2's token ", async () => {
      this.timeout(1000000);
      const tester = tester2;
      await deployedUniswapV3.nftPositionManager
        .connect(tester.account)
        .setApprovalForAll(stakeContractAddress, true);

      TestStakeUniswapV3 = await ico20Contracts.getContract(
        "StakeUniswapV3",
        stakeContractAddress,
        tester.account.address
      );
      const totalStakedAmountBefore =
        await TestStakeUniswapV3.totalStakedAmount();
      await TestStakeUniswapV3.connect(tester.account).stake(tester.tokens[0]);

      const depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3.userTotalStaked(
        tester.account.address
      );

      expect(depositToken.owner).to.be.equal(tester.account.address);

      expect(depositToken.startTime).to.be.equal(coinageToken.startTime);
      expect(depositToken.liquidity).to.be.equal(coinageToken.amount);
      expect(depositToken.secondsInsideInitial).to.be.above(0);
      expect(depositToken.secondsInsideLast).to.be.equal(0);

      expect(userTotalStaked.staked).to.be.equal(true);
      expect(userTotalStaked.totalDepositAmount).to.be.equal(
        depositToken.liquidity
      );

      expect(await TestStakeUniswapV3.totalStakers()).to.be.equal(
        ethers.BigNumber.from("2")
      );
      expect(await TestStakeUniswapV3.totalTokens()).to.be.equal(
        ethers.BigNumber.from("2")
      );

      expect(await TestStakeUniswapV3.totalStakedAmount()).to.be.equal(
        totalStakedAmountBefore.add(depositToken.liquidity)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("8. claim : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tosBalanceBefore = await tos.balanceOf(tester.account.address);
      const miningInfosBefore = await TestStakeUniswapV3.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosBefore.miningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString())
          .mul(
            ethers.BigNumber.from(
              miningInfosBefore.secondsInsideDiff256.toString()
            )
          )
          .div(
            ethers.BigNumber.from(
              miningInfosBefore.secondsAbsolute256.toString()
            )
          )
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString()).sub(
          ethers.BigNumber.from(miningInfosBefore.miningAmount.toString())
        )
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const coinageTokenBefore = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );

      let depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );

      // expect(miningInfosBefore.miningAmount).to.be.above(ethers.BigNumber.from('0'));
      // expect(miningInfosBefore.nonMiningAmount).to.be.above(ethers.BigNumber.from('0'));
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const tx = await TestStakeUniswapV3.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {

        if (
          receipt.events[i].event == "Claimed"  &&
          receipt.events[i].args != null
        ) {

          const miningAmount1 = receipt.events[i].args.miningAmount;
          const nonMiningAmount1 = receipt.events[i].args.nonMiningAmount;

          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
        }
      }
      const minableAmount = miningAmount.add(nonminingAmount);

      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const miningInfosAfter = await TestStakeUniswapV3.getMiningTokenId(
        tester.tokens[0]
      );
      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(tosBalanceBefore.add(miningAmount)).to.be.equal(tosBalanceAfter);

      depositToken = await TestStakeUniswapV3.depositTokens(tester.tokens[0]);
      const coinageToken = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3.userTotalStaked(
        tester.account.address
      );

      expect(
        coinageToken.claimedAmount.sub(coinageTokenBefore.claimedAmount)
      ).to.be.equal(miningAmount);
      expect(
        coinageToken.nonMiningAmount.sub(coinageTokenBefore.nonMiningAmount)
      ).to.be.equal(nonminingAmount);

      expect(depositToken.claimedTime).to.be.equal(coinageToken.claimedTime);
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        coinageToken.claimedAmount
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        coinageToken.nonMiningAmount
      );

      const secondDiff =
        depositToken.secondsInsideLast - depositToken.secondsInsideInitial;
      const miningAmountForSecondDiff = secondDiff * PHASE2_MINING_PERSECOND;

      expect(minableAmount).to.be.lte(
        ethers.BigNumber.from(miningAmountForSecondDiff + "")
      );
      remainMiningTotal = remainMiningTotal.sub(minableAmount);

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const totalSupplyTOSAfter = await tos.totalSupply();
      expect(vaultBalanceTOS).to.be.equal(
        vaultBalanceTOSAfter.add(minableAmount)
      );
      expect(totalSupplyTOS).to.be.equal(
        totalSupplyTOSAfter.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;

    });

    it("9. claim : tester2 ", async () => {
      this.timeout(1000000);
      const tester = tester2;
      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tosBalanceBefore = await tos.balanceOf(tester.account.address);
      const miningInfosBefore = await TestStakeUniswapV3.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosBefore.miningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString())
          .mul(
            ethers.BigNumber.from(
              miningInfosBefore.secondsInsideDiff256.toString()
            )
          )
          .div(
            ethers.BigNumber.from(
              miningInfosBefore.secondsAbsolute256.toString()
            )
          )
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString()).sub(
          ethers.BigNumber.from(miningInfosBefore.miningAmount.toString())
        )
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const coinageTokenBefore = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );

      let depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      const tx = await TestStakeUniswapV3.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].event == "Claimed" &&
          receipt.events[i].args != null
        ) {
          const miningAmount1 = receipt.events[i].args.miningAmount;
          const nonMiningAmount1 = receipt.events[i].args.nonMiningAmount;

          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
        }
      }
      const minableAmount = miningAmount.add(nonminingAmount);

      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const miningInfosAfter = await TestStakeUniswapV3.getMiningTokenId(
        tester.tokens[0]
      );
      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(tosBalanceBefore.add(miningAmount)).to.be.equal(tosBalanceAfter);

      depositToken = await TestStakeUniswapV3.depositTokens(tester.tokens[0]);
      const coinageToken = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3.userTotalStaked(
        tester.account.address
      );

      expect(
        coinageToken.claimedAmount.sub(coinageTokenBefore.claimedAmount)
      ).to.be.equal(miningAmount);
      expect(
        coinageToken.nonMiningAmount.sub(coinageTokenBefore.nonMiningAmount)
      ).to.be.equal(nonminingAmount);

      expect(depositToken.claimedTime).to.be.equal(coinageToken.claimedTime);
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        coinageToken.claimedAmount
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        coinageToken.nonMiningAmount
      );

      remainMiningTotal = remainMiningTotal.sub(minableAmount);

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const totalSupplyTOSAfter = await tos.totalSupply();
      expect(vaultBalanceTOS).to.be.equal(
        vaultBalanceTOSAfter.add(minableAmount)
      );
      expect(totalSupplyTOS).to.be.equal(
        totalSupplyTOSAfter.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });
  });

  describe("# 9. Upgrade : stakeUniswapV3Proxy2, stakeUniswapV3Upgrade, stakeUniswapV3Upgrade1 ", () => {

    it("0. snapshot proxy stakeUniswapV3Storage", async () => {

        stakeUniswapV3Storage.token = await TestStakeUniswapV3.token();
        stakeUniswapV3Storage.stakeRegistry = await TestStakeUniswapV3.stakeRegistry();
        stakeUniswapV3Storage.vault = await TestStakeUniswapV3.vault();
        stakeUniswapV3Storage.miningAmountTotal = await TestStakeUniswapV3.miningAmountTotal();
        stakeUniswapV3Storage.nonMiningAmountTotal = await TestStakeUniswapV3.nonMiningAmountTotal();
        stakeUniswapV3Storage.totalStakedAmount = await TestStakeUniswapV3.totalStakedAmount();
        stakeUniswapV3Storage.totalStakers = await TestStakeUniswapV3.totalStakers();
        stakeUniswapV3Storage.pauseProxy = await TestStakeUniswapV3.pauseProxy();
        stakeUniswapV3Storage.stakeStartTime = await TestStakeUniswapV3.stakeStartTime();
        stakeUniswapV3Storage.saleStartTime = await TestStakeUniswapV3.saleStartTime();
        stakeUniswapV3Storage.miningIntervalSeconds = await TestStakeUniswapV3.miningIntervalSeconds();
        stakeUniswapV3Storage.poolToken0 = await TestStakeUniswapV3.poolToken0();
        stakeUniswapV3Storage.poolToken1 = await TestStakeUniswapV3.poolToken1();
        stakeUniswapV3Storage.poolAddress = await TestStakeUniswapV3.poolAddress();
        stakeUniswapV3Storage.poolFee = await TestStakeUniswapV3.poolFee();
        stakeUniswapV3Storage.uniswapV3FactoryAddress = await TestStakeUniswapV3.uniswapV3FactoryAddress();
        stakeUniswapV3Storage.totalTokens = await TestStakeUniswapV3.totalTokens();
        stakeUniswapV3Storage.migratedL2 = await TestStakeUniswapV3.migratedL2();

    });
    it("1. change logic to stake2VaultUpgrade  in vault ", async () => {
      const cons = await ico20Contracts.getICOContracts();

      await stakeEntry.connect(owner).upgradeStakeTo(vaultAddress, cons.stake2VaultUpgrade.address);
      let stake2VaultUpgrade = await ico20Contracts.getContract(
        "Stake2VaultUpgrade",
        vaultAddress,
        owner.address
      );

      expect(await stake2VaultUpgrade.version()).to.be.equal("upgrade.v1.202108");

    });

    it("2. change logic to stakeUniswapV3Proxy2  in stakeContract ", async () => {
      const cons = await ico20Contracts.getICOContracts();

      let ABI_CODE =  [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "target",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "grantRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const sampleContractEthers = new ethers.Contract(cons.stake1proxy.address, ABI_CODE, ethers.provider);
      await sampleContractEthers.connect(owner).grantRole(stakeContractAddress, keccak256("ADMIN"), owner.address);

      await cons.stakeEntry.connect(owner).upgradeStakeTo(stakeContractAddress, cons.stakeUniswapV3Proxy2.address);

      stakeProxy2 =  await ico20Contracts.getContract(
        "StakeUniswapV3Proxy2",
        stakeContractAddress,
        owner.address
      );

      expect(await stakeProxy2.isAdmin(owner.address)).to.be.equal(true);
    });

    it("3. change logic to stakeUniswapV3Logic of stakeUniswapV3Proxy2  in stakeContract ", async () => {
      const cons = await ico20Contracts.getICOContracts();
      await stakeProxy2.connect(owner).setImplementation2(cons.stakeUniswapV3Logic.address, 0, true);
      expect(await stakeProxy2.implementation2(0)).to.be.equal(cons.stakeUniswapV3Logic.address);
    });

    it("4. regist stakeUniswapV3Upgrade functions to stakeUniswapV3Proxy2 in stakeContract ", async () => {
      const cons = await ico20Contracts.getICOContracts();

      let _func1 = Web3EthAbi.encodeFunctionSignature("miningCoinage()") ;
      let _func2 = Web3EthAbi.encodeFunctionSignature("getMiningTokenId(uint256)") ;
      let _func3 = Web3EthAbi.encodeFunctionSignature("stake(uint256)") ;
      let _func4 = Web3EthAbi.encodeFunctionSignature("stakePermit(uint256,uint256,uint8,bytes32,bytes32)") ;
      let _func5 = Web3EthAbi.encodeFunctionSignature("mint(bytes)") ;

      await stakeProxy2.connect(owner).setImplementation2(cons.stakeUniswapV3Upgrade.address, 1, true);
      expect(await stakeProxy2.implementation2(1)).to.be.equal(cons.stakeUniswapV3Upgrade.address);

      await stakeProxy2
        .connect(owner)
        .setSelectorImplementations2([_func1, _func2, _func3, _func4, _func5 ], cons.stakeUniswapV3Upgrade.address);

      expect(await stakeProxy2.getSelectorImplementation2(_func1)).to.be.equal(cons.stakeUniswapV3Upgrade.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func2)).to.be.equal(cons.stakeUniswapV3Upgrade.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func3)).to.be.equal(cons.stakeUniswapV3Upgrade.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func4)).to.be.equal(cons.stakeUniswapV3Upgrade.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func5)).to.be.equal(cons.stakeUniswapV3Upgrade.address);

    });


    it("5. regist stakeUniswapV3Upgrade1 functions to stakeUniswapV3Proxy2 in stakeContract ", async () => {
      const cons = await ico20Contracts.getICOContracts();

      let _func1 = Web3EthAbi.encodeFunctionSignature("safeApproveAll(address[],uint256[])") ;
      let _func2 = Web3EthAbi.encodeFunctionSignature("increaseLiquidity(uint256,uint256,uint256,uint256,uint256,uint256)") ;
      let _func3 = Web3EthAbi.encodeFunctionSignature("collect(uint256,uint128,uint128)") ;
      let _func4 = Web3EthAbi.encodeFunctionSignature("decreaseLiquidity(uint256,uint128,uint256,uint256,uint256)") ;
      let _func5 = Web3EthAbi.encodeFunctionSignature("claim(uint256)") ;
      let _func6 = Web3EthAbi.encodeFunctionSignature("withdraw(uint256)") ;
      let _func7 = Web3EthAbi.encodeFunctionSignature("claimAndCollect(uint256,uint128,uint128)") ;
      await stakeProxy2.connect(owner).setImplementation2(cons.stakeUniswapV3Upgrade1.address, 2, true);
      expect(await stakeProxy2.implementation2(2)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);

      await stakeProxy2
        .connect(owner)
        .setSelectorImplementations2([_func1, _func2, _func3, _func4, _func5, _func6, _func7],
          cons.stakeUniswapV3Upgrade1.address);

      expect(await stakeProxy2.getSelectorImplementation2(_func1)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func2)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func3)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func4)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func5)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func6)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(await stakeProxy2.getSelectorImplementation2(_func7)).to.be.equal(cons.stakeUniswapV3Upgrade1.address);

    });

    it("6. check proxy storage ", async () => {
        TestStakeUniswapV3Upgrade = new ethers.Contract(stakeContractAddress, IStakeUniswapV3ABI.abi, ethers.provider);

        expect(await TestStakeUniswapV3Upgrade.token()).to.be.equal(stakeUniswapV3Storage.token);
        expect(await TestStakeUniswapV3Upgrade.stakeRegistry()).to.be.equal(stakeUniswapV3Storage.stakeRegistry);
        expect(await TestStakeUniswapV3Upgrade.vault()).to.be.equal(stakeUniswapV3Storage.vault);
        expect(await TestStakeUniswapV3Upgrade.miningAmountTotal()).to.be.equal(stakeUniswapV3Storage.miningAmountTotal);
        expect(await TestStakeUniswapV3Upgrade.nonMiningAmountTotal()).to.be.equal(stakeUniswapV3Storage.nonMiningAmountTotal);
        expect(await TestStakeUniswapV3Upgrade.totalStakedAmount()).to.be.equal(stakeUniswapV3Storage.totalStakedAmount);
        expect(await TestStakeUniswapV3Upgrade.totalStakers()).to.be.equal(stakeUniswapV3Storage.totalStakers);
        expect(await TestStakeUniswapV3Upgrade.pauseProxy()).to.be.equal(stakeUniswapV3Storage.pauseProxy);
        expect(await TestStakeUniswapV3Upgrade.stakeStartTime()).to.be.equal(stakeUniswapV3Storage.stakeStartTime);
        expect(await TestStakeUniswapV3Upgrade.saleStartTime()).to.be.equal(stakeUniswapV3Storage.saleStartTime);
        expect(await TestStakeUniswapV3Upgrade.miningIntervalSeconds()).to.be.equal(stakeUniswapV3Storage.miningIntervalSeconds);
        expect(await TestStakeUniswapV3Upgrade.poolToken0()).to.be.equal(stakeUniswapV3Storage.poolToken0);
        expect(await TestStakeUniswapV3Upgrade.poolToken1()).to.be.equal(stakeUniswapV3Storage.poolToken1);
        expect(await TestStakeUniswapV3Upgrade.poolAddress()).to.be.equal(stakeUniswapV3Storage.poolAddress);
        expect(await TestStakeUniswapV3Upgrade.poolFee()).to.be.equal(stakeUniswapV3Storage.poolFee);
        expect(await TestStakeUniswapV3Upgrade.uniswapV3FactoryAddress()).to.be.equal(stakeUniswapV3Storage.uniswapV3FactoryAddress);
        expect(await TestStakeUniswapV3Upgrade.totalTokens()).to.be.equal(stakeUniswapV3Storage.totalTokens);
        expect(await TestStakeUniswapV3Upgrade.migratedL2()).to.be.equal(stakeUniswapV3Storage.migratedL2);

    });
    /*
    it("6. add stakeUniswapV3Upgrade1 in stakeUniswapV3Upgrade ", async () => {

      const cons = await ico20Contracts.getICOContracts();
      await stakeregister.connect(owner).addDefiInfo(
          "StakeUniswapV3Upgrade",
          cons.stakeUniswapV3Upgrade1.address,
          zeroAddress,
          zeroAddress,
          0,
          zeroAddress
        );

      let defiInfo = await stakeregister.defiInfo(keccak256("StakeUniswapV3Upgrade"));

      expect(defiInfo.router).to.be.equal(cons.stakeUniswapV3Upgrade1.address);
      expect(defiInfo.ext1).to.be.equal(zeroAddress);
      expect(defiInfo.ext2).to.be.equal(zeroAddress);
      expect(defiInfo.routerV2).to.be.equal(zeroAddress);

    });

    it("7. TestStakeUniswapV3Upgrade ", async () => {

      const tester = tester1;

      await TestStakeUniswapV3Upgrade.connect(owner).miningCoinage();
      const miningInfosBefore = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      console.log(
        'miningInfosBefore',miningInfosBefore.toString()
      );

    });
    */
  });


  describe("# 10. Swap : change the current tick to outside range", () => {
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

    it("2. approve  : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);

      await approve(wton, tester.account, deployedUniswapV3.swapRouter.address, tester.wtonbalanceBefore);

    });
    it("3. swap ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      swapAmountWTON = ethers.utils.parseUnits("500", 18);
      swapAmountTOS = ethers.utils.parseUnits("900", 18);

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      // expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      // expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      const params = {
        tokenIn: wton.address,
        tokenOut: tos.address,
        fee: FeeAmount.MEDIUM,
        recipient: tester1.account.address,
        deadline: 100000000000000,
        amountIn: swapAmountWTON,
        amountOutMinimum: ethers.BigNumber.from("0"),
        sqrtPriceLimitX96: ethers.BigNumber.from("0"),
      };

      const tx = await deployedUniswapV3.swapRouter
        .connect(tester.account)
        .exactInputSingle(params);
      await tx.wait();

      const wtonBalance = await wton.balanceOf(tester.account.address);
      const tosBalance = await tos.balanceOf(tester.account.address);
    });

    it("4. out of current tick ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      // pool_wton_tos_address
      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();
      // console.log('slot0.tick',slot0.tick.toString());

      expect(tester.positions.length).to.be.above(0);

      if (alignPair)
        expect(slot0.tick).to.be.below(tester.positions[0].tickLower);
      else expect(slot0.tick).to.be.above(tester.positions[0].tickLower);

      // expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);
      // expect(tester2.positions.length).to.be.above(0);
      // expect(slot0.tick).to.be.above(tester2.positions[0].tickLower);
      // expect(slot0.tick).to.be.below(tester2.positions[0].tickUpper);
    });
  });

  describe("# 11. StakeUniswapV3 Of TONStarter : case in partial liquidity ", () => {

    it("1. claim : case in partial liquidity", async () => {
      this.timeout(1000000);

      const tester = tester1;

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tosBalanceBefore = await tos.balanceOf(tester.account.address);
      const miningInfosBefore = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosBefore.miningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString())
          .mul(
            ethers.BigNumber.from(
              miningInfosBefore.secondsInsideDiff256.toString()
            )
          )
          .div(
            ethers.BigNumber.from(
              miningInfosBefore.secondsAbsolute256.toString()
            )
          )
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString()).sub(
          ethers.BigNumber.from(miningInfosBefore.miningAmount.toString())
        )
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const coinageTokenBefore = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );

      const tx = await TestStakeUniswapV3Upgrade.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0Claimed
        ) {
           const eventObj = web3.eth.abi.decodeLog(
            abiClaimed,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          const miningAmount1 = ethers.BigNumber.from(eventObj.miningAmount);
          const nonMiningAmount1 = ethers.BigNumber.from(eventObj.nonMiningAmount);
          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
          // console.log('calim miningAmount',miningAmount);
          // console.log('calim nonminingAmount',nonminingAmount);

        }
      }
      const minableAmount = miningAmount.add(nonminingAmount);

      const tosBalanceAfter = await tos.balanceOf(tester.account.address);

      const miningInfosAfter = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );


      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const depositToken = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
        tester.account.address
      );

      expect(
        coinageToken.claimedAmount.sub(coinageTokenBefore.claimedAmount)
      ).to.be.equal(miningAmount);
      expect(
        coinageToken.nonMiningAmount.sub(coinageTokenBefore.nonMiningAmount)
      ).to.be.equal(nonminingAmount);

      const secondDiff = ethers.BigNumber.from(
        depositToken.secondsInsideLast.toString()
      ).sub(
        ethers.BigNumber.from(depositToken.secondsInsideInitial.toString())
      );

      // console.log('PHASE2_MINING_PERSECOND',PHASE2_MINING_PERSECOND) ;
      // console.log('secondDiff',secondDiff) ;
      // console.log('depositToken.claimedTime',depositToken.claimedTime) ;
      // console.log('coinageToken.claimedTime',coinageToken.claimedTime) ;
      // console.log('userTotalStaked.totalMiningAmount',coinageToken.claimedTime) ;
      // console.log('userTotalStaked.totalNonMiningAmount',coinageToken.totalNonMiningAmount) ;


      const miningAmountForSecondDiff =
        secondDiff.toNumber() * PHASE2_MINING_PERSECOND;
      expect(ethers.BigNumber.from(miningInfosBefore.minableAmount)).to.be.lte(
        ethers.BigNumber.from(miningAmountForSecondDiff + "")
      );
      expect(depositToken.claimedTime).to.be.equal(coinageToken.claimedTime);
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        coinageToken.claimedAmount
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        coinageToken.nonMiningAmount
      );

      remainMiningTotal = remainMiningTotal.sub(minableAmount);

      expect(tosBalanceBefore.add(miningAmount)).to.be.equal(tosBalanceAfter);

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const totalSupplyTOSAfter = await tos.totalSupply();
      expect(vaultBalanceTOS).to.be.equal(
        vaultBalanceTOSAfter.add(minableAmount)
      );
      expect(totalSupplyTOS).to.be.equal(
        totalSupplyTOSAfter.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });
  });

  describe("# 12. Swap : change the current tick to inside range", () => {
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
      if (alignPair)
        expect(slot0.tick).to.be.below(tester.positions[0].tickLower);
      else expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
    });

    it("2. approve  wton : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      await approve(wton, tester.account, deployedUniswapV3.swapRouter.address, tester.wtonbalanceBefore);

    });
    it("3. swap ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      swapAmountWTON = ethers.utils.parseUnits("500", 18);
      swapAmountTOS = ethers.utils.parseUnits("500", 18);

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      const params = {
        tokenIn: tos.address,
        tokenOut: wton.address,
        fee: FeeAmount.MEDIUM,
        recipient: tester1.account.address,
        deadline: 100000000000000,
        amountIn: swapAmountTOS,
        amountOutMinimum: ethers.BigNumber.from("0"),
        sqrtPriceLimitX96: ethers.BigNumber.from("0"),
      };

      const tx = await deployedUniswapV3.swapRouter
        .connect(tester.account)
        .exactInputSingle(params);
      tx.wait();
    });

    it("4. change current tick to inside range ", async () => {
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
    });
  });

  describe("# 13. StakeUniswapV3 Of TONStarter : Mining only during liquidity provision time", () => {
    it("1. check current tick ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();

      expect(tester.positions.length).to.be.above(0);

      expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
      expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);
    });


    it("2. miningCoinage :  ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const coinageLastMintBlockTimetampBefore =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3Upgrade.balanceOfCoinage(
        tester1.tokens[0]
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.equal(
        tester1.miningTimeLast
      );

      await TestStakeUniswapV3Upgrade.connect(tester1.account).miningCoinage();

      const canBalanceAfter = await TestStakeUniswapV3Upgrade.balanceOfCoinage(
        tester1.tokens[0]
      );
      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      expect(canBalanceAfter).to.be.above(
        canBalanceBefore
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.lt(
        coinageLastMintBlockTimetampAfter
      );

      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;

      const diffTimeMining = coinageLastMintBlockTimetampAfter.sub(
        coinageLastMintBlockTimetampBefore
      );

      remainMiningTotal = remainMiningTotal.add(
        diffTimeMining.mul(utils.parseUnits(PHASE2_MINING_PERSECOND, 0))
      );

    });


    it("3. check expected mining amount :  ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const coinageLastMintBlockTimetampBefore =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3Upgrade.balanceOfCoinage(
        tester1.tokens[0]
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.equal(
        tester1.miningTimeLast
      );

      let interval = 50;

      let currentTime = new Date().getTime();
      currentTime = Math.floor(currentTime/1000);
      // console.log('currentTime', currentTime.toString());
      // console.log('coinageLastMintBlockTimetampBefore', coinageLastMintBlockTimetampBefore.toString());


      let miningPerSecond = await TestStake2Vault.miningPerSecond();
      let miningEndTime  = await TestStake2Vault.miningEndTime();
      // console.log('miningPerSecond', miningPerSecond.toString());
      // console.log('miningEndTime', miningEndTime.toString());

      ethers.provider.send("evm_increaseTime", [interval])   // add 26 seconds
      ethers.provider.send("evm_mine")      // mine the next block

      let currentliquidityTokenId = await TestStakeUniswapV3Upgrade.connect(tester1.account).currentliquidityTokenId(
        tester1.tokens[0],
        coinageLastMintBlockTimetampBefore.add(ethers.BigNumber.from(interval))
      );

      // console.log('currentliquidityTokenId.secondsAbsolute', currentliquidityTokenId.secondsAbsolute.toString());
      // console.log('currentliquidityTokenId.secondsInsideDiff256', currentliquidityTokenId.secondsInsideDiff256.toString());
      // console.log('currentliquidityTokenId.liquidity', currentliquidityTokenId.liquidity.toString());
      // console.log('currentliquidityTokenId.expectTime', currentliquidityTokenId.expectTime.toString());

      let currentCoinageBalanceTokenId = await TestStakeUniswapV3Upgrade.connect(tester1.account).currentCoinageBalanceTokenId(
        tester1.tokens[0],
        coinageLastMintBlockTimetampBefore.add(ethers.BigNumber.from(interval))
      );

      // console.log('currentCoinageBalanceTokenId.currentTotalCoinage', currentCoinageBalanceTokenId.currentTotalCoinage.toString());
      // console.log('currentCoinageBalanceTokenId.afterTotalCoinage', currentCoinageBalanceTokenId.afterTotalCoinage.toString());
      // console.log('currentCoinageBalanceTokenId.afterBalanceTokenId', currentCoinageBalanceTokenId.afterBalanceTokenId.toString());
      // console.log('currentCoinageBalanceTokenId.expectTime', currentCoinageBalanceTokenId.expectTime.toString());
      // console.log('currentCoinageBalanceTokenId.addIntervalTime', currentCoinageBalanceTokenId.addIntervalTime.toString());

      let expectedInfo = await TestStakeUniswapV3Upgrade.connect(tester1.account).expectedPlusClaimableAmount(
        tester1.tokens[0],
        coinageLastMintBlockTimetampBefore.add(ethers.BigNumber.from(interval))
      );

      // console.log('expectedInfo.miningAmount', expectedInfo.miningAmount.toString());
      // console.log('expectedInfo.nonMiningAmount', expectedInfo.nonMiningAmount.toString());
      // console.log('expectedInfo.minableAmount', expectedInfo.minableAmount.toString());
      // console.log('expectedInfo.minableAmountRay', expectedInfo.minableAmountRay.toString());
      // console.log('expectedInfo.expectTime', expectedInfo.expectTime.toString());

      expect(expectedInfo.miningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(expectedInfo.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      expect(expectedInfo.minableAmount).to.be.below(
        ethers.BigNumber.from(interval).mul(miningPerSecond)
      );

    });

    it("4. claim: check the minable amount case in partial liquidity ", async () => {
      this.timeout(1000000);

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tester = tester1;

      const tosBalanceBefore = await tos.balanceOf(tester.account.address);
      const miningInfosBefore = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosBefore.miningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString())
          .mul(
            ethers.BigNumber.from(
              miningInfosBefore.secondsInsideDiff256.toString()
            )
          )
          .div(
            ethers.BigNumber.from(
              miningInfosBefore.secondsAbsolute256.toString()
            )
          )
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString()).sub(
          ethers.BigNumber.from(miningInfosBefore.miningAmount.toString())
        )
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      const coinageTokenBefore = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );

      let depositToken = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );

      expect(miningInfosBefore.miningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const tx = await TestStakeUniswapV3Upgrade.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        // console.log('receipt.events[i].event',i, receipt.events[i].event);
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0Claimed
        ) {
           const eventObj = web3.eth.abi.decodeLog(
            abiClaimed,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          const miningAmount1 = ethers.BigNumber.from(eventObj.miningAmount);
          const nonMiningAmount1 = ethers.BigNumber.from(eventObj.nonMiningAmount);
          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
        }

      }
      const minableAmount = miningAmount.add(nonminingAmount);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const miningInfosAfter = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(tosBalanceBefore.add(miningAmount)).to.be.equal(tosBalanceAfter);

      depositToken = await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      const coinageToken = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
        tester.account.address
      );

      expect(
        coinageToken.claimedAmount.sub(coinageTokenBefore.claimedAmount)
      ).to.be.equal(miningAmount);
      expect(
        coinageToken.nonMiningAmount.sub(coinageTokenBefore.nonMiningAmount)
      ).to.be.equal(nonminingAmount);

      expect(depositToken.claimedTime).to.be.equal(coinageToken.claimedTime);
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        coinageToken.claimedAmount
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        coinageToken.nonMiningAmount
      );

      remainMiningTotal = remainMiningTotal.sub(
        miningAmount.add(nonminingAmount)
      );

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const totalSupplyTOSAfter = await tos.totalSupply();
      expect(vaultBalanceTOS).to.be.equal(
        vaultBalanceTOSAfter.add(minableAmount)
      );
      expect(totalSupplyTOS).to.be.equal(
        totalSupplyTOSAfter.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });
  });

  describe("# 14. Swap : change the current tick to outside range", () => {
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

    it("2. approve  : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);

      await approve(wton, tester.account, deployedUniswapV3.swapRouter.address, tester.wtonbalanceBefore);

    });
    it("3. swap ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      swapAmountWTON = ethers.utils.parseUnits("50", 18);
      swapAmountTOS = ethers.utils.parseUnits("900", 18);

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      // expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      // expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      const params = {
        tokenIn: wton.address,
        tokenOut: tos.address,
        fee: FeeAmount.MEDIUM,
        recipient: tester1.account.address,
        deadline: 100000000000000,
        amountIn: swapAmountWTON,
        amountOutMinimum: ethers.BigNumber.from("0"),
        sqrtPriceLimitX96: ethers.BigNumber.from("0"),
      };

      const tx = await deployedUniswapV3.swapRouter
        .connect(tester.account)
        .exactInputSingle(params);
      tx.wait();

      const wtonBalance = await wton.balanceOf(tester.account.address);
      const tosBalance = await tos.balanceOf(tester.account.address);
    });

    it("4. out of current tick ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      // pool_wton_tos_address
      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();


      // console.log('slot0.tick',slot0.tick.toString());
      // console.log('tester.positions[0].tickLower',tester.positions[0].tickLower);
      // console.log('tester.positions[0].tickUpper',tester.positions[0].tickUpper);
      expect(tester.positions.length).to.be.above(0);
      expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);
    });
  });

  describe("# 15. increaseLiquidity :   ", () => {

    it("1. snapshot : tester1  ", async () => {
      const tester = tester1;
      let depositTokens = await TestStakeUniswapV3Upgrade.depositTokens(
          tester.tokens[0]
        );

      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);


      let stakedCoinageTokens = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
          tester.tokens[0]
        );
      let userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
          tester.account.address
        );

      tester.snapshot.depositTokens = depositTokens;
      tester.snapshot.positions = positions;
      tester.snapshot.stakedCoinageTokens = stakedCoinageTokens;
      tester.snapshot.userTotalStaked = userTotalStaked;

    });

    it("2. snapshot : tester2  ", async () => {

      const tester = tester2;
      let depositTokens = await TestStakeUniswapV3Upgrade.depositTokens(
          tester.tokens[0]
        );
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      let stakedCoinageTokens = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
          tester.tokens[0]
        );
      let userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
          tester.account.address
        );

      tester.snapshot.depositTokens = depositTokens;
      tester.snapshot.positions = positions;
      tester.snapshot.stakedCoinageTokens = stakedCoinageTokens;
      tester.snapshot.userTotalStaked = userTotalStaked;

    });
    it("3. approve  wton , tos : TestStakeUniswapV3Upgrade ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      let registry =  await TestStakeUniswapV3Upgrade.stakeRegistry();

      let total_wton = await wton.totalSupply();
      let total_tos= await tos.totalSupply();
      let parms1 = {
        token: wton.address,
        total: total_wton
      }
      let parms2 = {
        token: tos.address,
        total: total_tos
      }

      await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .safeApproveAll([wton.address, tos.address], [total_wton, total_tos]);

      expect(
        await wton.allowance(
          TestStakeUniswapV3Upgrade.address,
          deployedUniswapV3.nftPositionManager.address)
      ).to.be.equal(total_wton);

      expect(
        await tos.allowance(
          TestStakeUniswapV3Upgrade.address,
          deployedUniswapV3.nftPositionManager.address
        )
      ).to.be.equal(total_tos);
    });

    it("4. approve  wton , tos : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      let total_wton = await wton.totalSupply();
      let total_tos= await tos.totalSupply();
      await approve(wton, tester.account, TestStakeUniswapV3Upgrade.address, total_wton);
      await approve(tos, tester.account, TestStakeUniswapV3Upgrade.address, total_tos);

    });

    it("5. approve  wton , tos : tester2 ", async () => {
      this.timeout(1000000);
      const tester = tester2;

      let total_wton = await wton.totalSupply();
      let total_tos= await tos.totalSupply();
      await approve(wton, tester.account, TestStakeUniswapV3Upgrade.address, total_wton);
      await approve(tos, tester.account, TestStakeUniswapV3Upgrade.address, total_tos);

    });

    it("6. increaseLiquidity : tester1 ", async () => {
      const tester = tester1;

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);
      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      let params = {
        tokenId: tester.tokens[0],
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: 100000000000000
      }

      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .increaseLiquidity(tester.tokens[0], tester.amount0Desired, tester.amount1Desired, 0,0,100000000000000);

      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0IncreasedLiquidity
        ) {
          const eventObj = web3.eth.abi.decodeLog(
            abiIncreasedLiquidity,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          tester.increasedLiquidity = eventObj.liquidity;
        }
      }

      const wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      expect(wtonBalanceAfter).to.be.equal(
        tester.wtonbalanceBefore.sub(tester.amount0Desired)
      );
      expect(tosBalanceAfter).to.be.equal(
        tester.tosbalanceBefore.sub(tester.amount1Desired)
      );

      let depositTokens = await await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      expect(depositTokens.liquidity).to.be.equal(tester.snapshot.depositTokens.liquidity.add(ethers.BigNumber.from(tester.increasedLiquidity)));
      expect(depositTokens.liquidity).to.be.equal(positions.liquidity);
      expect(positions.tokensOwed0).to.be.above(tester.snapshot.positions.tokensOwed0);
      expect(positions.tokensOwed1).to.be.above(tester.snapshot.positions.tokensOwed1);

    });

    it("7. increaseLiquidity : tester2 ", async () => {
      const tester = tester2;

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);
      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      let params = {
        tokenId: tester.tokens[0],
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: 100000000000000
      }

      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .increaseLiquidity(tester.tokens[0], tester.amount0Desired, tester.amount1Desired, 0,0,100000000000000);

      const receipt = await tx.wait();


      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0IncreasedLiquidity
        ) {
          const eventObj = web3.eth.abi.decodeLog(
            abiIncreasedLiquidity,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          tester.increasedLiquidity = eventObj.liquidity;
        }
      }

      const wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      expect(wtonBalanceAfter).to.be.equal(
        tester.wtonbalanceBefore.sub(tester.amount0Desired)
      );
      expect(tosBalanceAfter).to.be.equal(
        tester.tosbalanceBefore.sub(tester.amount1Desired)
      );

      let depositTokens = await await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      expect(depositTokens.liquidity).to.be.equal(tester.snapshot.depositTokens.liquidity.add(ethers.BigNumber.from(tester.increasedLiquidity)));
      expect(depositTokens.liquidity).to.be.equal(positions.liquidity);
      expect(positions.tokensOwed0).to.be.above(tester.snapshot.positions.tokensOwed0);
      expect(positions.tokensOwed1).to.be.above(tester.snapshot.positions.tokensOwed1);
    });
  });

  describe("# 16. decreaseLiquidity :   ", () => {

    it("1. snapshot : tester1  ", async () => {
      const tester = tester1;
      let depositTokens = await TestStakeUniswapV3Upgrade.depositTokens(
          tester.tokens[0]
        );
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      let stakedCoinageTokens = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
          tester.tokens[0]
        );
      let userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
          tester.account.address
        );

      tester.snapshot.depositTokens = depositTokens;
      tester.snapshot.positions = positions;
      tester.snapshot.stakedCoinageTokens = stakedCoinageTokens;
      tester.snapshot.userTotalStaked = userTotalStaked;

    });

    it("2. snapshot : tester2  ", async () => {

      const tester = tester2;
      let depositTokens = await TestStakeUniswapV3Upgrade.depositTokens(
          tester.tokens[0]
        );
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      let stakedCoinageTokens = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
          tester.tokens[0]
        );
      let userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
          tester.account.address
        );

      tester.snapshot.depositTokens = depositTokens;
      tester.snapshot.positions = positions;
      tester.snapshot.stakedCoinageTokens = stakedCoinageTokens;
      tester.snapshot.userTotalStaked = userTotalStaked;

    });

    it("3. decreaseLiquidity : tester1 ", async () => {
      const tester = tester1;

      let params = {
        tokenId: tester.tokens[0],
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: 100000000000000
      }

      let paramliquidity = tester.snapshot.depositTokens.liquidity.div(ethers.BigNumber.from('2'));


      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .decreaseLiquidity(tester.tokens[0], paramliquidity.toString(), 0, 0, 100000000000000);

      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        //console.log('receipt.events[i].event',i, receipt.events[i].event);
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0DecreasedLiquidity
        ) {
           const eventObj = web3.eth.abi.decodeLog(
            abiDecreasedLiquidity,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          tester.decreasedLiquidityEvent = eventObj;
        }
      }

      let depositTokens = await await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      expect(paramliquidity).to.be.equal(ethers.BigNumber.from(tester.decreasedLiquidityEvent.liquidity));

      expect(depositTokens.liquidity).to.be.equal(tester.snapshot.depositTokens.liquidity.sub(ethers.BigNumber.from(tester.decreasedLiquidityEvent.liquidity)));
      expect(depositTokens.liquidity).to.be.equal(positions.liquidity);


      expect(positions.tokensOwed0).to.be.equal(
        tester.snapshot.positions.tokensOwed0.add(ethers.BigNumber.from(tester.decreasedLiquidityEvent.amount0)) );
      expect(positions.tokensOwed1).to.be.equal(
        tester.snapshot.positions.tokensOwed1.add(ethers.BigNumber.from(tester.decreasedLiquidityEvent.amount1)) );

    });


    it("4. decreaseLiquidity : tester2 ", async () => {
      const tester = tester2;

      let params = {
        tokenId: tester.tokens[0],
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        deadline: 100000000000000
      }

      let paramliquidity = tester.snapshot.depositTokens.liquidity.div(ethers.BigNumber.from('2'));


      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .decreaseLiquidity(tester.tokens[0], paramliquidity.toString(), 0, 0, 100000000000000);

      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        //console.log('receipt.events[i].event',i, receipt.events[i].event);
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0DecreasedLiquidity
        ) {
           const eventObj = web3.eth.abi.decodeLog(
            abiDecreasedLiquidity,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          tester.decreasedLiquidityEvent = eventObj;
        }
      }

      let depositTokens = await await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      expect(paramliquidity).to.be.equal(ethers.BigNumber.from(tester.decreasedLiquidityEvent.liquidity));

      expect(depositTokens.liquidity).to.be.equal(tester.snapshot.depositTokens.liquidity.sub(ethers.BigNumber.from(tester.decreasedLiquidityEvent.liquidity)));
      expect(depositTokens.liquidity).to.be.equal(positions.liquidity);


      expect(positions.tokensOwed0).to.be.equal(
        tester.snapshot.positions.tokensOwed0.add(ethers.BigNumber.from(tester.decreasedLiquidityEvent.amount0)) );
      expect(positions.tokensOwed1).to.be.equal(
        tester.snapshot.positions.tokensOwed1.add(ethers.BigNumber.from(tester.decreasedLiquidityEvent.amount1)) );

    });

  });


  describe("# 17. collect ", () => {

    it("1. collect : tester1 ", async () => {
      const tester = tester1;

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);
      let params = {
        tokenId: tester.tokens[0],
        recipient: tester.account.address,
        amount0Max: ethers.BigNumber.from(positions.tokensOwed0).div(ethers.BigNumber.from('2')),
        amount1Max: ethers.BigNumber.from(positions.tokensOwed1).div(ethers.BigNumber.from('2'))
      }
      // console.log('amount0Max', params.amount0Max.toString());
      // console.log('amount1Max', params.amount1Max.toString());

      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .collect(tester.tokens[0], params.amount0Max.toString(), params.amount1Max.toString());


      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {

        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0Collected
        ) {

           const eventObj = web3.eth.abi.decodeLog(
            abiCollected,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );
          tester.snapshot.collect = eventObj;
        }
      }

      // console.log('amount0', tester.snapshot.collect.amount0.toString());
      // console.log('amount1', tester.snapshot.collect.amount1.toString());
      expect(ethers.BigNumber.from(tester.snapshot.collect.amount0)).to.be.equal(params.amount0Max);
      expect(ethers.BigNumber.from(tester.snapshot.collect.amount1)).to.be.equal(params.amount1Max);


      let wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      let tosBalanceAfter = await tos.balanceOf(tester.account.address);

      let tokenToggle = false;
      if(positions.token0 == tos.address) tokenToggle=true;

      if(!tokenToggle){
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(ethers.BigNumber.from(tester.snapshot.collect.amount0) ));
          expect(tosBalanceAfter).to.be.equal(tester.tosbalanceBefore.add(ethers.BigNumber.from(tester.snapshot.collect.amount1)));
      }else{
          expect(tosBalanceAfter).to.be.equal(tester.tosbalanceBefore.add(ethers.BigNumber.from(tester.snapshot.collect.amount0)));
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(ethers.BigNumber.from(tester.snapshot.collect.amount1)));
      }

    });

    it("2. claimAndCollect : tester2 ", async () => {
      const tester = tester2;

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tosBalanceBefore = await tos.balanceOf(tester.account.address);
      const miningInfosBefore = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosBefore.miningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString())
          .mul(
            ethers.BigNumber.from(
              miningInfosBefore.secondsInsideDiff256.toString()
            )
          )
          .div(
            ethers.BigNumber.from(
              miningInfosBefore.secondsAbsolute256.toString()
            )
          )
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from(miningInfosBefore.minableAmount.toString()).sub(
          ethers.BigNumber.from(miningInfosBefore.miningAmount.toString())
        )
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const coinageTokenBefore = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);
      let params = {
        tokenId: tester.tokens[0],
        recipient: tester.account.address,
        amount0Max: ethers.BigNumber.from(positions.tokensOwed0).div(ethers.BigNumber.from('2')),
        amount1Max: ethers.BigNumber.from(positions.tokensOwed1).div(ethers.BigNumber.from('2'))
      }

      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .claimAndCollect(
          tester.tokens[0], params.amount0Max , params.amount1Max
        );

      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {

        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0Collected
        ) {

           const eventObj = web3.eth.abi.decodeLog(
            abiCollected,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );
          tester.snapshot.collect = eventObj;
        }

        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0Claimed
        ) {

           const eventObj = web3.eth.abi.decodeLog(
            abiClaimed,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          const miningAmount1 = ethers.BigNumber.from(eventObj.miningAmount);
          const nonMiningAmount1 = ethers.BigNumber.from(eventObj.nonMiningAmount);
          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);

        }
      }

      expect(ethers.BigNumber.from(tester.snapshot.collect.amount0)).to.be.equal(params.amount0Max);
      expect(ethers.BigNumber.from(tester.snapshot.collect.amount1)).to.be.equal(params.amount1Max);

      //--- for claim
      let wtonBalanceAfter = await wton.balanceOf(tester.account.address);

      const minableAmount = miningAmount.add(nonminingAmount);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const miningInfosAfter = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

     // expect(tosBalanceBefore.add(miningAmount)).to.be.equal(tosBalanceAfter);

      depositToken = await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      const coinageToken = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
        tester.account.address
      );

      expect(
        coinageToken.claimedAmount.sub(coinageTokenBefore.claimedAmount)
      ).to.be.equal(miningAmount);
      expect(
        coinageToken.nonMiningAmount.sub(coinageTokenBefore.nonMiningAmount)
      ).to.be.equal(nonminingAmount);

      expect(depositToken.claimedTime).to.be.equal(coinageToken.claimedTime);
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        coinageToken.claimedAmount
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        coinageToken.nonMiningAmount
      );

      remainMiningTotal = remainMiningTotal.sub(
        miningAmount.add(nonminingAmount)
      );

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const totalSupplyTOSAfter = await tos.totalSupply();
      expect(vaultBalanceTOS).to.be.equal(
        vaultBalanceTOSAfter.add(minableAmount)
      );
      expect(totalSupplyTOS).to.be.equal(
        totalSupplyTOSAfter.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;

      //-- calim + collect

      let tokenToggle = false;
      if(positions.token0 == tos.address) tokenToggle=true;

      if(!tokenToggle){
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(ethers.BigNumber.from(tester.snapshot.collect.amount0) ));
          expect(tosBalanceAfter).to.be.equal(
            tester.tosbalanceBefore
            .add(ethers.BigNumber.from(tester.snapshot.collect.amount1))
            .add(miningAmount)
          );
      }else{
          expect(tosBalanceAfter).to.be.equal(
              tester.tosbalanceBefore
              .add(ethers.BigNumber.from(tester.snapshot.collect.amount0))
              .add(miningAmount)
            );
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(ethers.BigNumber.from(tester.snapshot.collect.amount1)));
      }

    });

  });


  describe("# 18. StakeUniswapV3 Of TONStarter : withdraw ", () => {
    it("1. check current tick ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();

      expect(tester.positions.length).to.be.above(0);

      expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
      expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);
    });
    it("2. pass some times :  ", async () => {
      let interval = 60*60*24*7; // 1 week

      ethers.provider.send("evm_increaseTime", [interval])
      ethers.provider.send("evm_mine")      // mine the next block
    });

    it("3. withdraw : tester1 ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const tester = tester1;

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");
      const tosBalanceBefore = await tos.balanceOf(tester.account.address);

      const totalStakedAmountBefore =
        await TestStakeUniswapV3Upgrade.totalStakedAmount();
      const totalTokensBefore = await TestStakeUniswapV3Upgrade.totalTokens();
      const miningAmountTotalBefore =
        await TestStakeUniswapV3Upgrade.miningAmountTotal();
      const nonMiningAmountTotalBefore =
        await TestStakeUniswapV3Upgrade.nonMiningAmountTotal();

      const coinageTokenBefore = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const depositTokenBefore = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );

      const tx = await TestStakeUniswapV3Upgrade.connect(tester.account).withdraw(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0WithdrawalToken
        ) {
           const eventObj = web3.eth.abi.decodeLog(
            abiWithdrawalToken,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          miningAmount = miningAmount.add(ethers.BigNumber.from(eventObj.miningAmount));
          nonminingAmount = nonminingAmount.add(ethers.BigNumber.from(eventObj.nonMiningAmount));
        }
      }

      const minableAmount = miningAmount.add(nonminingAmount);

      const ownerOf = await deployedUniswapV3.nftPositionManager.ownerOf(
        tester.tokens[0]
      );
      expect(ownerOf).to.be.equal(tester.account.address);

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const totalSupplyTOSAfter = await tos.totalSupply();

      const depositToken = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
        tester.account.address
      );

      expect(tosBalanceAfter).to.be.equal(tosBalanceBefore.add(miningAmount));
      expect(vaultBalanceTOSAfter).to.be.equal(
        vaultBalanceTOS.sub(minableAmount)
      );
      expect(totalSupplyTOSAfter).to.be.equal(
        totalSupplyTOS.sub(nonminingAmount)
      );

      expect(depositToken.owner).to.be.equal(zeroAddress);
      expect(depositToken.idIndex).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.liquidity).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.tickLower).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.tickUpper).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.startTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.claimedTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.secondsInsideInitial).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(depositToken.secondsInsideLast).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(coinageToken.amount).to.be.equal(ethers.BigNumber.from("0"));
      expect(coinageToken.startTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(coinageToken.claimedTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(coinageToken.claimedAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(coinageToken.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(userTotalStaked.staked).to.be.equal(false);

      expect(userTotalStaked.totalDepositAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const miningInfosAfter = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.secondsInside).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmountRay).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const totalStakedAmountAfter =
        await TestStakeUniswapV3Upgrade.totalStakedAmount();
      const totalTokensAfter = await TestStakeUniswapV3Upgrade.totalTokens();
      const miningAmountTotalAfter =
        await TestStakeUniswapV3Upgrade.miningAmountTotal();
      const nonMiningAmountTotalAfter =
        await TestStakeUniswapV3Upgrade.nonMiningAmountTotal();

      expect(totalStakedAmountAfter).to.be.equal(
        totalStakedAmountBefore.sub(depositTokenBefore.liquidity)
      );
      expect(totalTokensAfter).to.be.equal(
        totalTokensBefore.sub(ethers.BigNumber.from("1"))
      );
      expect(miningAmountTotalAfter).to.be.equal(
        miningAmountTotalBefore.add(miningAmount)
      );
      expect(nonMiningAmountTotalAfter).to.be.equal(
        nonMiningAmountTotalBefore.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("4. claim: tester2 ", async () => {
      this.timeout(1000000);

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tester = tester2;

      const tosBalanceBefore = await tos.balanceOf(tester.account.address);
      const miningInfosBefore = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      if(miningInfosBefore.secondsAbsolute256.gt(ethers.BigNumber.from('0'))
      && miningInfosBefore.secondsInsideDiff256.gt(ethers.BigNumber.from('0'))
      ){
        if(miningInfosBefore.secondsInsideDiff256.gte(miningInfosBefore.secondsAbsolute256)){
          expect(miningInfosBefore.miningAmount).to.be.equal(miningInfosBefore.minableAmount);

        } else {
          expect(miningInfosBefore.miningAmount).to.be.equal(
            ethers.BigNumber.from(miningInfosBefore.minableAmount.toString())
              .mul(
                ethers.BigNumber.from(
                  miningInfosBefore.secondsInsideDiff256.toString()
                )
              )
              .div(
                ethers.BigNumber.from(
                  miningInfosBefore.secondsAbsolute256.toString()
                )
              )
          );
          expect(miningInfosBefore.nonMiningAmount).to.be.equal(
            ethers.BigNumber.from(miningInfosBefore.minableAmount.toString()).sub(
              ethers.BigNumber.from(miningInfosBefore.miningAmount.toString())
            )
          );
          expect(miningInfosBefore.minableAmount).to.be.above(
            ethers.BigNumber.from("0")
          );
        }
      }

      const coinageTokenBefore = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );

      let depositToken = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );

      if(miningInfosBefore.secondsAbsolute256.gt(ethers.BigNumber.from('0'))){
        expect(miningInfosBefore.minableAmount).to.be.above(
          ethers.BigNumber.from("0")
        );
      }

      const tx = await TestStakeUniswapV3Upgrade.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        // console.log('receipt.events[i].event',i, receipt.events[i].event);
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0Claimed
        ) {
          const eventObj = web3.eth.abi.decodeLog(
            abiClaimed,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          const miningAmount1 = ethers.BigNumber.from(eventObj.miningAmount);
          const nonMiningAmount1 = ethers.BigNumber.from(eventObj.nonMiningAmount);
          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
        }
      }
      const minableAmount = miningAmount.add(nonminingAmount);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const miningInfosAfter = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(tosBalanceBefore.add(miningAmount)).to.be.equal(tosBalanceAfter);

      depositToken = await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      const coinageToken = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
        tester.account.address
      );

      expect(
        coinageToken.claimedAmount.sub(coinageTokenBefore.claimedAmount)
      ).to.be.equal(miningAmount);
      expect(
        coinageToken.nonMiningAmount.sub(coinageTokenBefore.nonMiningAmount)
      ).to.be.equal(nonminingAmount);

      expect(depositToken.claimedTime).to.be.equal(coinageToken.claimedTime);
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        coinageToken.claimedAmount
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        coinageToken.nonMiningAmount
      );

      remainMiningTotal = remainMiningTotal.sub(
        miningAmount.add(nonminingAmount)
      );

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const totalSupplyTOSAfter = await tos.totalSupply();
      expect(vaultBalanceTOS).to.be.equal(
        vaultBalanceTOSAfter.add(minableAmount)
      );
      expect(totalSupplyTOS).to.be.equal(
        totalSupplyTOSAfter.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("5. withdraw : tester2 ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const tester = tester2;

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");
      const tosBalanceBefore = await tos.balanceOf(tester.account.address);

      const totalStakedAmountBefore =
        await TestStakeUniswapV3Upgrade.totalStakedAmount();
      const totalTokensBefore = await TestStakeUniswapV3Upgrade.totalTokens();
      const miningAmountTotalBefore =
        await TestStakeUniswapV3Upgrade.miningAmountTotal();
      const nonMiningAmountTotalBefore =
        await TestStakeUniswapV3Upgrade.nonMiningAmountTotal();

      const coinageTokenBefore = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const depositTokenBefore = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );

      const tx = await TestStakeUniswapV3Upgrade.connect(tester.account).withdraw(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0WithdrawalToken
        ) {
            const eventObj = web3.eth.abi.decodeLog(
            abiWithdrawalToken,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );

          miningAmount = miningAmount.add(ethers.BigNumber.from(eventObj.miningAmount));
          nonminingAmount = nonminingAmount.add(ethers.BigNumber.from(eventObj.nonMiningAmount));
        }
      }
      const minableAmount = miningAmount.add(nonminingAmount);

      const ownerOf = await deployedUniswapV3.nftPositionManager.ownerOf(
        tester.tokens[0]
      );
      expect(ownerOf).to.be.equal(tester.account.address);

      const vaultBalanceTOSAfter = await tos.balanceOf(vaultAddress);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      const totalSupplyTOSAfter = await tos.totalSupply();

      const depositToken = await TestStakeUniswapV3Upgrade.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3Upgrade.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3Upgrade.userTotalStaked(
        tester.account.address
      );

      expect(tosBalanceAfter).to.be.equal(tosBalanceBefore.add(miningAmount));
      expect(vaultBalanceTOSAfter).to.be.equal(
        vaultBalanceTOS.sub(minableAmount)
      );
      expect(totalSupplyTOSAfter).to.be.equal(
        totalSupplyTOS.sub(nonminingAmount)
      );

      expect(depositToken.owner).to.be.equal(zeroAddress);
      expect(depositToken.idIndex).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.liquidity).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.tickLower).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.tickUpper).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.startTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.claimedTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(depositToken.secondsInsideInitial).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(depositToken.secondsInsideLast).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(coinageToken.amount).to.be.equal(ethers.BigNumber.from("0"));
      expect(coinageToken.startTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(coinageToken.claimedTime).to.be.equal(ethers.BigNumber.from("0"));
      expect(coinageToken.claimedAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(coinageToken.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      expect(userTotalStaked.staked).to.be.equal(false);

      expect(userTotalStaked.totalDepositAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(userTotalStaked.totalMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(userTotalStaked.totalNonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const miningInfosAfter = await TestStakeUniswapV3Upgrade.getMiningTokenId(
        tester.tokens[0]
      );

      expect(miningInfosAfter.miningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.nonMiningAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmount).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.secondsInside).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmountRay).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const totalStakedAmountAfter =
        await TestStakeUniswapV3Upgrade.totalStakedAmount();
      const totalTokensAfter = await TestStakeUniswapV3Upgrade.totalTokens();
      const miningAmountTotalAfter =
        await TestStakeUniswapV3Upgrade.miningAmountTotal();
      const nonMiningAmountTotalAfter =
        await TestStakeUniswapV3Upgrade.nonMiningAmountTotal();

      expect(totalStakedAmountAfter).to.be.equal(
        totalStakedAmountBefore.sub(depositTokenBefore.liquidity)
      );
      expect(totalTokensAfter).to.be.equal(
        totalTokensBefore.sub(ethers.BigNumber.from("1"))
      );
      expect(miningAmountTotalAfter).to.be.equal(
        miningAmountTotalBefore.add(miningAmount)
      );
      expect(nonMiningAmountTotalAfter).to.be.equal(
        nonMiningAmountTotalBefore.add(nonminingAmount)
      );

      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3Upgrade.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("6. check :  storage ", async () => {
      const totalStakedAmount = await TestStakeUniswapV3Upgrade.totalStakedAmount();
      const totalTokens = await TestStakeUniswapV3Upgrade.totalTokens();

      const totalSupplyCoinage = await TestStakeUniswapV3Upgrade.totalSupplyCoinage();
      const balanceOfCoinageTester1 = await TestStakeUniswapV3Upgrade.balanceOfCoinage(
        tester1.tokens[0]
      );
      const balanceOfCoinageTester2 = await TestStakeUniswapV3Upgrade.balanceOfCoinage(
        tester2.tokens[0]
      );

      expect(totalStakedAmount).to.be.equal(ethers.BigNumber.from("0"));
      expect(totalTokens).to.be.equal(ethers.BigNumber.from("0"));

      expect(
        totalSupplyCoinage.div(ethers.BigNumber.from(10 ** 9)).toNumber()
      ).to.be.equal(0);

      expect(
        balanceOfCoinageTester1.div(ethers.BigNumber.from(10 ** 9)).toNumber()
      ).to.be.equal(0);
      expect(
        balanceOfCoinageTester2.div(ethers.BigNumber.from(10 ** 9)).toNumber()
      ).to.be.equal(0);
    });

  });

  describe("# 19. nftPositionManager : collect ", () => {

    it("1. collect : tester1 ", async () => {

      const tester = tester1;

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);
      let params = {
        tokenId: tester.tokens[0],
        recipient: tester.account.address,
        amount0Max: positions.tokensOwed0,
        amount1Max: positions.tokensOwed1
      }

      let tx = await deployedUniswapV3.nftPositionManager.connect(tester.account).collect(params);

      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].event == "Collect" &&
          receipt.events[i].args != null
        ) {
          tester.snapshot.collect = receipt.events[i].args;
        }
      }

      expect(tester.snapshot.collect.amount0).to.be.above(ethers.BigNumber.from('0'));

      let wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      let tosBalanceAfter = await tos.balanceOf(tester.account.address);

      let tokenToggle = false;
      if(positions.token0 == tos.address) tokenToggle=true;

      if(!tokenToggle){
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(tester.snapshot.collect.amount0));
          expect(tosBalanceAfter).to.be.equal(tester.tosbalanceBefore.add(tester.snapshot.collect.amount1));
      }else{
          expect(tosBalanceAfter).to.be.equal(tester.tosbalanceBefore.add(tester.snapshot.collect.amount0));
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(tester.snapshot.collect.amount1));
      }
    });

    it("2. collect : tester2 ", async () => {

      const tester = tester2;

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);
      let params = {
        tokenId: tester.tokens[0],
        recipient: tester.account.address,
        amount0Max: positions.tokensOwed0,
        amount1Max: positions.tokensOwed1
      }

      let tx = await deployedUniswapV3.nftPositionManager.connect(tester.account).collect(params);

      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].event == "Collect" &&
          receipt.events[i].args != null
        ) {
          tester.snapshot.collect = receipt.events[i].args;
        }
      }

      expect(tester.snapshot.collect.amount0).to.be.above(ethers.BigNumber.from('0'));

      let wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      let tosBalanceAfter = await tos.balanceOf(tester.account.address);

      let tokenToggle = false;
      if(positions.token0 == tos.address) tokenToggle=true;

      if(!tokenToggle){
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(tester.snapshot.collect.amount0));
          expect(tosBalanceAfter).to.be.equal(tester.tosbalanceBefore.add(tester.snapshot.collect.amount1));
      }else{
          expect(tosBalanceAfter).to.be.equal(tester.tosbalanceBefore.add(tester.snapshot.collect.amount0));
          expect(wtonBalanceAfter).to.be.equal(tester.wtonbalanceBefore.add(tester.snapshot.collect.amount1));
      }
    });


  });

  describe("# 20. StakeUniswapV3 Of TONStarter : mint LP ", () => {

    it("1. check current tick ", async () => {
      this.timeout(1000000);
      const tester = tester1;

      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();

      expect(tester.positions.length).to.be.above(0);

      expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
      expect(slot0.tick).to.be.below(tester.positions[0].tickUpper);

    });

    it("2. mint : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      const pool = new ethers.Contract(
        pool_wton_tos_address,
        IUniswapV3PoolABI.abi,
        tester.account
      );
      const slot0 = await pool.slot0();

      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);
      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      let token0Address = wton.address;
      let token1Address = tos.address;
      if(!alignPair){
        token0Address = tos.address;
        token1Address = wton.address;
      }

      let tickLower = slot0.tick - 100;
      let tickUpper = slot0.tick + 100;
      MintParams
      let params = {
        token0: token0Address,
        token1: token1Address,
        fee: stakeUniswapV3Storage.poolFee,
        tickLower: tickLower,
        tickUpper: tickUpper,
        amount0Desired: tester.amount0Desired,
        amount1Desired: tester.amount1Desired,
        amount0Min: 0,
        amount1Min: 0,
        recipient: tester.account.address,
        deadline: 100000000000000
      }

    /*
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }
    */


      const tx = await TestStakeUniswapV3Upgrade
        .connect(tester.account)
        .mint(params);

      const receipt = await tx.wait();
      console.log('receipt',receipt);

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].topics.length > 0 &&
          receipt.events[i].topics[0] == topic0MintAndStaked
        ) {
          const eventObj = web3.eth.abi.decodeLog(
            abiMintAndStaked,
            receipt.events[i].data,
            receipt.events[i].topics.slice(1)
          );
          // tester.increasedLiquidity = eventObj.liquidity;
          console.log('eventObj',eventObj);
        }
      }
      /*
      const wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);
      expect(wtonBalanceAfter).to.be.equal(
        tester.wtonbalanceBefore.sub(tester.amount0Desired)
      );
      expect(tosBalanceAfter).to.be.equal(
        tester.tosbalanceBefore.sub(tester.amount1Desired)
      );

      let depositTokens = await await TestStakeUniswapV3Upgrade.depositTokens(tester.tokens[0]);
      let positions = await deployedUniswapV3.nftPositionManager.positions(tester.tokens[0]);

      expect(depositTokens.liquidity).to.be.equal(tester.snapshot.depositTokens.liquidity.add(ethers.BigNumber.from(tester.increasedLiquidity)));
      expect(depositTokens.liquidity).to.be.equal(positions.liquidity);
      expect(positions.tokensOwed0).to.be.above(tester.snapshot.positions.tokensOwed0);
      expect(positions.tokensOwed1).to.be.above(tester.snapshot.positions.tokensOwed1);
      */
    });


    it("2. mint fail on out of range ", async () => {

    });

    it("2. mint fail on pass the end time ", async () => {

    });

  });
});
