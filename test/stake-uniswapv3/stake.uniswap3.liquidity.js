const { time, expectEvent } = require("@openzeppelin/test-helpers");
// const { ethers } = require("ethers");
const { ethers } = require("hardhat");
const utils = ethers.utils;
const {
  POOL_BYTECODE_HASH,
  computePoolAddress,
} = require("./computePoolAddress.js");
const StakeUniswapV3 = require("@uniswap/v3-periphery/artifacts/contracts/libraries/PoolAddress.sol/PoolAddress.json");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

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
let secondsPerMining;
let alignPair = 1;

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

describe(" StakeUniswapV3 ", function () {
  let sender;
  let usersInfo;
  let tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth,
    vault_phase1_ton,
    vault_phase1_tosethlp,
    vault_phase1_dev;
  let ton, wton, depositManager, seigManager;
  let stakeEntry,
    stakeEntry2,
    layer2,
    stakeUniswapV3Factory,
    stakeUniswapV3,
    stake2Logic,
    stake2Vault,
    stakeVaultFactory;
  let Stake2Logic, StakeUniswapV3, StakeUniswapV3Factory, Stake2Vault;

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
          [
            deployedUniswapV3.nftPositionManager.address,
            deployedUniswapV3.coreFactory.address,
            wton.address,
            tos.address,
          ],
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
    });

    it("2. setStartTimeOfVault2", async function () {
      this.timeout(1000000);
      let startTime = new Date().getTime();
      startTime = Math.floor(startTime / 1000);
      startTime = parseInt(startTime);

      const period = 60 * 60 * 2;
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

      // await timeout(10);
    });

    it("3. approve token : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      // console.log('wtonbalanceBefore:',tester.wtonbalanceBefore.toString());
      // console.log('tosbalanceBefore:',tester.tosbalanceBefore.toString());

      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);
      // console.log('call approve wton & tos');
      // await timeout(5);

      await wton
        .connect(tester.account)
        .approve(
          deployedUniswapV3.nftPositionManager.address,
          tester.wtonbalanceBefore
        );
      await tos
        .connect(tester.account)
        .approve(
          deployedUniswapV3.nftPositionManager.address,
          tester.tosbalanceBefore
        );
      // console.log('approve wton & tos');

      // await timeout(5);
      expect(
        await wton.allowance(
          tester.account.address,
          deployedUniswapV3.nftPositionManager.address
        )
      ).to.be.equal(tester.wtonbalanceBefore);
      expect(
        await tos.allowance(
          tester.account.address,
          deployedUniswapV3.nftPositionManager.address
        )
      ).to.be.equal(tester.tosbalanceBefore);
      // console.log('check approve & allowance of wton , tos');

      // await timeout(5);
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

      // await timeout(3);
      // console.log('5');

      const wtonBalanceAfter = await wton.balanceOf(tester.account.address);
      const tosBalanceAfter = await tos.balanceOf(tester.account.address);

      // console.log('wtonBalanceAfter:',wtonBalanceAfter.toString());
      // console.log('tosBalanceAfter:',tosBalanceAfter.toString());

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

    it("5. approve  : tester2 ", async () => {
      this.timeout(1000000);
      const tester = tester2;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);

      expect(tester.wtonbalanceBefore).to.be.above(tester.amount0Desired);
      expect(tester.tosbalanceBefore).to.be.above(tester.amount1Desired);

      // console.log('call approve wton & tos');
      // await timeout(5);
      await wton
        .connect(tester.account)
        .approve(
          deployedUniswapV3.nftPositionManager.address,
          tester.wtonbalanceBefore
        );
      await tos
        .connect(tester.account)
        .approve(
          deployedUniswapV3.nftPositionManager.address,
          tester.tosbalanceBefore
        );
      // console.log('check approve & allowance of wton , tos');
      // await timeout(5);

      expect(
        await wton.allowance(
          tester.account.address,
          deployedUniswapV3.nftPositionManager.address
        )
      ).to.be.equal(tester.wtonbalanceBefore);
      expect(
        await tos.allowance(
          tester.account.address,
          deployedUniswapV3.nftPositionManager.address
        )
      ).to.be.equal(tester.tosbalanceBefore);
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
      // console.log('slot0.tick',slot0.tick.toString());

      expect(tester.positions.length).to.be.above(0);

      // console.log('tester.positions[0].tickLower',tester.positions[0].tickLower.toString());
      // console.log('tester.positions[0].tickUpper',tester.positions[0].tickUpper.toString());

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
      await wton
        .connect(tester.account)
        .approve(
          deployedUniswapV3.swapRouter.address,
          tester.wtonbalanceBefore
        );

      expect(
        await wton.allowance(
          tester.account.address,
          deployedUniswapV3.swapRouter.address
        )
      ).to.be.equal(tester.wtonbalanceBefore);
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
      TestStakeUniswapV3 = await ico20Contracts.getContract(
        "StakeUniswapV3",
        stakeContractAddress,
        tester.account.address
      );

      await TestStakeUniswapV3.connect(tester.account).setPoolAddress(tester.tokens[0]);
      let pool = await TestStakeUniswapV3.poolAddress();
      //console.log('pool', pool);
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
      // console.log('slot0.tick',slot0.tick.toString());

      expect(tester.positions.length).to.be.above(0);
      if (alignPair)
        expect(slot0.tick).to.be.below(tester.positions[0].tickLower);
      else expect(slot0.tick).to.be.above(tester.positions[0].tickLower);
      // console.log('tester.positions[0].tickLower',tester.positions[0].tickLower.toString());
      // console.log('tester.positions[0].tickUpper',tester.positions[0].tickUpper.toString());

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

    it("2. approve  : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);
      await tos
        .connect(tester.account)
        .approve(deployedUniswapV3.swapRouter.address, tester.tosbalanceBefore);

      expect(
        await tos.allowance(
          tester.account.address,
          deployedUniswapV3.swapRouter.address
        )
      ).to.be.equal(tester.tosbalanceBefore);
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
      // console.log('slot0.tick',slot0.tick.toString());

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

    it("6. stake : after approve tester1's token ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      await deployedUniswapV3.nftPositionManager
        .connect(tester.account)
        .approve(stakeContractAddress, tester.tokens[0]);

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

    it("7. stake : after approve tester2's token ", async () => {
      this.timeout(1000000);
      const tester = tester2;
      await deployedUniswapV3.nftPositionManager
        .connect(tester.account)
        .approve(stakeContractAddress, tester.tokens[0]);

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

    it("8. miningCoinage :  ", async () => {
      this.timeout(1000000);
      const coinageLastMintBlockTimetampBefore =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );

      await TestStakeUniswapV3.connect(tester1.account).miningCoinage();

      const canBalanceAfter = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
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
      // console.log('diffTimeMining 1 : ',diffTimeMining.toString());
      // console.log('miningAmount 1 : ', remainMiningTotal.toString());
    });

    it("9. claim : tester1 ", async () => {
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
        // console.log('receipt.events[i].event',i, receipt.events[i].event);
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

      //

    });

    it("10. claim : tester2 ", async () => {
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

  describe("# 9. Swap : change the current tick to outside range", () => {
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
      await wton
        .connect(tester.account)
        .approve(
          deployedUniswapV3.swapRouter.address,
          tester.wtonbalanceBefore
        );

      expect(
        await wton.allowance(
          tester.account.address,
          deployedUniswapV3.swapRouter.address
        )
      ).to.be.equal(tester.wtonbalanceBefore);
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

  describe("# 10. StakeUniswapV3 Of TONStarter : case in partial liquidity ", () => {
    it("1. miningCoinage :  ", async () => {
      this.timeout(1000000);
      await timeout(15);

      const coinageLastMintBlockTimetampBefore =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );

      await TestStakeUniswapV3.connect(tester1.account).miningCoinage();

      const canBalanceAfter = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
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

    it("2. claim : case in partial liquidity", async () => {
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
      // console.log('tosBalanceBefore: ',tosBalanceBefore.toString());
      // console.log('miningInfosBefore.miningAmount : ',miningInfosBefore.miningAmount.toString());
      // console.log('miningInfosBefore.nonMiningAmount : ',miningInfosBefore.nonMiningAmount.toString());
      // console.log('miningInfosBefore.minableAmount : ',miningInfosBefore.minableAmount.toString());

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

      await timeout(5);

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

      const depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );
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

      const secondDiff = ethers.BigNumber.from(
        depositToken.secondsInsideLast.toString()
      ).sub(
        ethers.BigNumber.from(depositToken.secondsInsideInitial.toString())
      );

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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });
  });

  describe("# 11. Swap : change the current tick to inside range", () => {
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

    it("2. approve  : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.wtonbalanceBefore = await wton.balanceOf(tester.account.address);
      await wton
        .connect(tester.account)
        .approve(
          deployedUniswapV3.swapRouter.address,
          tester.wtonbalanceBefore
        );

      expect(
        await wton.allowance(
          tester.account.address,
          deployedUniswapV3.swapRouter.address
        )
      ).to.be.equal(tester.wtonbalanceBefore);
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

  describe("# 12. StakeUniswapV3 Of TONStarter : Mining only during liquidity provision time", () => {
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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.equal(
        tester1.miningTimeLast
      );

      await TestStakeUniswapV3.connect(tester1.account).miningCoinage();

      const canBalanceAfter = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3.balanceOfCoinage(
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

      let currentliquidityTokenId = await TestStakeUniswapV3.connect(tester1.account).currentliquidityTokenId(
        tester1.tokens[0],
        coinageLastMintBlockTimetampBefore.add(ethers.BigNumber.from(interval))
      );

      // console.log('currentliquidityTokenId.secondsAbsolute', currentliquidityTokenId.secondsAbsolute.toString());
      // console.log('currentliquidityTokenId.secondsInsideDiff256', currentliquidityTokenId.secondsInsideDiff256.toString());
      // console.log('currentliquidityTokenId.liquidity', currentliquidityTokenId.liquidity.toString());
      // console.log('currentliquidityTokenId.expectTime', currentliquidityTokenId.expectTime.toString());

      let currentCoinageBalanceTokenId = await TestStakeUniswapV3.connect(tester1.account).currentCoinageBalanceTokenId(
        tester1.tokens[0],
        coinageLastMintBlockTimetampBefore.add(ethers.BigNumber.from(interval))
      );

      // console.log('currentCoinageBalanceTokenId.currentTotalCoinage', currentCoinageBalanceTokenId.currentTotalCoinage.toString());
      // console.log('currentCoinageBalanceTokenId.afterTotalCoinage', currentCoinageBalanceTokenId.afterTotalCoinage.toString());
      // console.log('currentCoinageBalanceTokenId.afterBalanceTokenId', currentCoinageBalanceTokenId.afterBalanceTokenId.toString());
      // console.log('currentCoinageBalanceTokenId.expectTime', currentCoinageBalanceTokenId.expectTime.toString());
      // console.log('currentCoinageBalanceTokenId.addIntervalTime', currentCoinageBalanceTokenId.addIntervalTime.toString());

      let expectedInfo = await TestStakeUniswapV3.connect(tester1.account).expectedPlusClaimableAmount(
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

      expect(miningInfosBefore.miningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const tx = await TestStakeUniswapV3.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        // console.log('receipt.events[i].event',i, receipt.events[i].event);
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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });
  });

  describe("# 13. StakeUniswapV3 Of TONStarter : withdraw ", () => {
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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.equal(
        tester1.miningTimeLast
      );

      await TestStakeUniswapV3.connect(tester1.account).miningCoinage();

      const canBalanceAfter = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
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

    it("3. pass miningEndTime :  ", async () => {

      const miningEndTime = await TestStake2Vault.miningEndTime();
      ethers.provider.send("evm_increaseTime", [miningEndTime.toNumber()])   // add 60 seconds
      ethers.provider.send("evm_mine")      // mine the next block

    });

    it("4. stake : Fail ", async () => {
      this.timeout(1000000);
      await expect(
        TestStakeUniswapV3.connect(tester1.account).stake(tester1.tokens[0])
      ).to.be.revertedWith("StakeUniswapV3: end mining");
    });

    it("5. miningCoinage :  ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const coinageLastMintBlockTimetampBefore =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      const canBalanceBefore = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.equal(
        tester1.miningTimeLast
      );

      await TestStakeUniswapV3.connect(tester1.account).miningCoinage();

      const canBalanceAfter = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      const coinageLastMintBlockTimetampAfter =
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      expect(canBalanceAfter).to.be.equal(
        canBalanceBefore
      );
      expect(coinageLastMintBlockTimetampBefore).to.be.equal(
        coinageLastMintBlockTimetampAfter
      );
    });

    it("6. withdraw : tester1 ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const tester = tester1;

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");
      const tosBalanceBefore = await tos.balanceOf(tester.account.address);

      const totalStakedAmountBefore =
        await TestStakeUniswapV3.totalStakedAmount();
      const totalTokensBefore = await TestStakeUniswapV3.totalTokens();
      const miningAmountTotalBefore =
        await TestStakeUniswapV3.miningAmountTotal();
      const nonMiningAmountTotalBefore =
        await TestStakeUniswapV3.nonMiningAmountTotal();

      const coinageTokenBefore = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const depositTokenBefore = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );

      const tx = await TestStakeUniswapV3.connect(tester.account).withdraw(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].event == "WithdrawalToken" &&
          receipt.events[i].args != null
        ) {
          const miningAmount1 = receipt.events[i].args.miningAmount;
          const nonMiningAmount1 = receipt.events[i].args.nonMiningAmount;
          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
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

      const depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3.userTotalStaked(
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
      expect(miningInfosAfter.secondsInside).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmountRay).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const totalStakedAmountAfter =
        await TestStakeUniswapV3.totalStakedAmount();
      const totalTokensAfter = await TestStakeUniswapV3.totalTokens();
      const miningAmountTotalAfter =
        await TestStakeUniswapV3.miningAmountTotal();
      const nonMiningAmountTotalAfter =
        await TestStakeUniswapV3.nonMiningAmountTotal();

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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("7. claim: tester2 ", async () => {
      this.timeout(1000000);

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");

      const tester = tester2;

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

      expect(miningInfosBefore.miningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosBefore.nonMiningAmount).to.be.above(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosBefore.minableAmount).to.be.above(
        ethers.BigNumber.from("0")
      );

      const tx = await TestStakeUniswapV3.connect(tester.account).claim(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        // console.log('receipt.events[i].event',i, receipt.events[i].event);
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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("8. withdraw : tester2 ", async () => {
      this.timeout(1000000);
      await timeout(10);
      const tester = tester2;

      const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
      const totalSupplyTOS = await tos.totalSupply();
      let miningAmount = ethers.BigNumber.from("0");
      let nonminingAmount = ethers.BigNumber.from("0");
      const tosBalanceBefore = await tos.balanceOf(tester.account.address);

      const totalStakedAmountBefore =
        await TestStakeUniswapV3.totalStakedAmount();
      const totalTokensBefore = await TestStakeUniswapV3.totalTokens();
      const miningAmountTotalBefore =
        await TestStakeUniswapV3.miningAmountTotal();
      const nonMiningAmountTotalBefore =
        await TestStakeUniswapV3.nonMiningAmountTotal();

      const coinageTokenBefore = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const depositTokenBefore = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );

      const tx = await TestStakeUniswapV3.connect(tester.account).withdraw(
        tester.tokens[0]
      );
      const receipt = await tx.wait();

      for (let i = 0; i < receipt.events.length; i++) {
        if (
          receipt.events[i].event == "WithdrawalToken" &&
          receipt.events[i].args != null
        ) {
          const miningAmount1 = receipt.events[i].args.miningAmount;
          const nonMiningAmount1 = receipt.events[i].args.nonMiningAmount;
          miningAmount = miningAmount.add(miningAmount1);
          nonminingAmount = nonminingAmount.add(nonMiningAmount1);
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

      const depositToken = await TestStakeUniswapV3.depositTokens(
        tester.tokens[0]
      );
      const coinageToken = await TestStakeUniswapV3.stakedCoinageTokens(
        tester.tokens[0]
      );
      const userTotalStaked = await TestStakeUniswapV3.userTotalStaked(
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
      expect(miningInfosAfter.secondsInside).to.be.equal(
        ethers.BigNumber.from("0")
      );
      expect(miningInfosAfter.minableAmountRay).to.be.equal(
        ethers.BigNumber.from("0")
      );

      const totalStakedAmountAfter =
        await TestStakeUniswapV3.totalStakedAmount();
      const totalTokensAfter = await TestStakeUniswapV3.totalTokens();
      const miningAmountTotalAfter =
        await TestStakeUniswapV3.miningAmountTotal();
      const nonMiningAmountTotalAfter =
        await TestStakeUniswapV3.nonMiningAmountTotal();

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
        await TestStakeUniswapV3.coinageLastMintBlockTimetamp();
      tester1.miningTimeLast = coinageLastMintBlockTimetampAfter;
      tester2.miningTimeLast = coinageLastMintBlockTimetampAfter;
    });

    it("9. check :  storage ", async () => {
      const totalStakedAmount = await TestStakeUniswapV3.totalStakedAmount();
      const totalTokens = await TestStakeUniswapV3.totalTokens();

      const totalSupplyCoinage = await TestStakeUniswapV3.totalSupplyCoinage();
      const balanceOfCoinageTester1 = await TestStakeUniswapV3.balanceOfCoinage(
        tester1.tokens[0]
      );
      const balanceOfCoinageTester2 = await TestStakeUniswapV3.balanceOfCoinage(
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
});
