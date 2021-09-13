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
  abiCollected,
  abiIncreasedLiquidity,
  abiDecreasedLiquidity,
  abiWithdrawalToken,
  abiClaimed
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

describe("Stake CustomLP ", function () {
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

  let CustomLPReward, CustomLPRewardLogic1 , CustomLPRewardLogic2,  CustomCommonLib ;
  let customLPRewardProxy, customLPReward, customLPRewardLogic1, customLPRewardLogic2, customCommonLib ;


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

  describe("# 3. UniswapV3 Pool Setting & Token Creation", () => {
    it("1. pool is created and initialized  ", async () => {
        this.timeout(1000000);
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

        //await timeout(10);


        const pool = new ethers.Contract(
            expectedAddress,
            IUniswapV3PoolABI.abi,
            sender
        );

        expect(expectedAddress).to.eq(pool.address);

        await pool.connect(sender).initialize(sqrtPrice);

        //await timeout(10);
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

  });

  describe("# 4. Swap : change the current tick", () => {
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

  describe("# 5. CustomLP ", async function () {
    it("1. Create CustomLP ", async function () {
        this.timeout(1000000);

        CustomLPReward = await ethers.getContractFactory("CustomLPReward");
        CustomLPRewardLogic1 = await ethers.getContractFactory("CustomLPRewardLogic1");
        CustomLPRewardLogic2 = await ethers.getContractFactory("CustomLPRewardLogic2");
        CustomCommonLib = await ethers.getContractFactory("CustomCommonLib");

        customCommonLib = await CustomCommonLib.connect(owner).deploy();
        customLPRewardLogic1 = await CustomLPRewardLogic1.connect(owner).deploy();
        customLPRewardLogic2 = await CustomLPRewardLogic2.connect(owner).deploy();

        customLPRewardProxy = await CustomLPReward.connect(owner).deploy();

        await customLPRewardProxy.connect(owner).setAliveImplementation(customLPRewardLogic1.address, true);
        await customLPRewardProxy.connect(owner).setImplementation(customLPRewardLogic1.address, 0, true);

        expect(await customLPRewardProxy.implementation(0)).to.be.eq(customLPRewardLogic1.address);

        let _func1 = Web3EthAbi.encodeFunctionSignature("initInfo(address,address,address,address)") ;
        let _func2 = Web3EthAbi.encodeFunctionSignature("setPool(uint256)") ;
        let _func3 = Web3EthAbi.encodeFunctionSignature("setCommonLib(address)") ;
        await customLPRewardProxy.connect(owner).setAliveImplementation(customLPRewardLogic2.address, true);
        await customLPRewardProxy.connect(owner).setImplementation(customLPRewardLogic2.address, 1, true);
        await customLPRewardProxy.connect(owner).setSelectorImplementations([_func1,_func2,_func3], customLPRewardLogic2.address);

        expect(await customLPRewardProxy.implementation(1)).to.be.eq(customLPRewardLogic2.address);
        expect(await customLPRewardProxy.getSelectorImplementation(_func1)).to.be.eq(customLPRewardLogic2.address);
        expect(await customLPRewardProxy.getSelectorImplementation(_func2)).to.be.eq(customLPRewardLogic2.address);
        expect(await customLPRewardProxy.getSelectorImplementation(_func3)).to.be.eq(customLPRewardLogic2.address);
    });

    // it("1. set init ", async function () {
    // });

  });

});