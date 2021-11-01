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
  stakeinfos: [],
  claims:[],
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
  stakeinfos: [],
  claims:[],
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

/**
 * 테스트 확인사항 : 같은 환경에 같은 자산을 스테이킹하여, 같은 유동성을 갖게 되는 경우, 한달뒤, 인출한다 가정할때, 클래임 시기에 따라서, 리워드 받는 양은 어떻게 달라질까?
 - 테스트 환경 : 우리는 테스터 2의 경우를 선택을 바꿔가며 리워드 값을 비교할 것이다. ( 각 토큰의 자산 가치는 같다고 가정한다. 1:1 )

 - 경우1 :
    -  테스터1 : WTON 1000 , 토슽 1000 을 예치 , 테스터2 : WTON 1000 , 토스를 1000 을 예치
    -  테스터 1은 같은 시각 예치한 후, 한달뒤에 인출하여 리워드를 가져간다.
    -  테스터 2는 매일 리워드를 클래임하고, 한달뒤에 인춣한다.
    -  테스터 1과 테스터 2의 총 받은 리워드를 집계한다.

  - 경우2 :
    -  테스터1 : WTON 1000 , 토슽 1000 을 예치 , 테스터2 : WTON 1000 , 토스를 1000 을 예치
    -  테스터 1은 같은 시각 예치한 후, 한달뒤에 인출하여 리워드를 가져간다.
    -  테스터 2도 같은 시각 예치한 후, 한달뒤에 인출하여 리워드를 가져간다.
    -  테스터 1과 테스터 2의 총 받은 리워드를 집계한다.
 */


let stakePeriodDay = 60*60*24*1;
let stakePeriodDayCount = 30;
let stakePeriodMonth = 60*60*24*30;

let init_datas = {
  initAmount: ethers.utils.parseUnits("2000", 18),
  wtonAmountStake :  ethers.utils.parseUnits("1000", 18),
  tosAmountStake :  ethers.utils.parseUnits("1000", 18),
  tosMiningAmountPserSeconds: ethers.utils.parseUnits("84559445290038900",0),
  tosAllocateAmount : 0,
  stakeSecondsUser1 : stakePeriodMonth,
  stakeSecondsUser2 : stakePeriodDay,
}

init_datas.tosAllocateAmount = init_datas.tosMiningAmountPserSeconds.mul(ethers.BigNumber.from(stakePeriodMonth+''));

console.log('init_datas.tosAllocateAmount', init_datas.tosAllocateAmount.toString());


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

    tester1.wtonAmount = init_datas.initAmount;
    tester1.tosAmount = init_datas.initAmount;
    tester1.amount0Desired = init_datas.wtonAmountStake;
    tester1.amount1Desired = init_datas.tosAmountStake;

    tester2.wtonAmount = init_datas.initAmount;
    tester2.tosAmount = init_datas.initAmount;
    tester2.amount0Desired = init_datas.wtonAmountStake;
    tester2.amount1Desired = init_datas.tosAmountStake;

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
            init_datas.tosAllocateAmount,
            init_datas.tosMiningAmountPserSeconds,
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
        init_datas.tosMiningAmountPserSeconds
      );

      expect(await TestStake2Vault.cap()).to.be.equal(
        init_datas.tosAllocateAmount
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

      const period = stakePeriodMonth;
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


  describe("# 6. StakeUniswapV3 Of TONStarter : set & fail stake", () => {
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

  });


  describe("# 7. Upgrade : stakeUniswapV3Proxy2, stakeUniswapV3Upgrade, stakeUniswapV3Upgrade1 ", () => {

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
      let _func5 = Web3EthAbi.encodeFunctionSignature("mint(int24,int24,uint256,uint256,uint256,uint256,uint256)") ;

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

    });

    it("2. approve tos : tester1 ", async () => {
      this.timeout(1000000);
      const tester = tester1;
      tester.tosbalanceBefore = await tos.balanceOf(tester.account.address);
      await approve(tos, tester.account, deployedUniswapV3.swapRouter.address, tester.tosbalanceBefore);

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

      let block = await ethers.provider.getBlock();


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

      let stakeinfo = {
        liquidity: depositToken.liquidity,
        totalDepositAmount: userTotalStaked.totalDepositAmount,
        time : block.timestamp
      }

      //console.log('stakeinfo1',stakeinfo);

      tester.stakeinfos.push(stakeinfo);


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

      let block = await ethers.provider.getBlock();

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

      let stakeinfo = {
        liquidity: depositToken.liquidity,
        totalDepositAmount: userTotalStaked.totalDepositAmount,
        time : block.timestamp
      }

      //console.log('stakeinfo2',stakeinfo);

      tester.stakeinfos.push(stakeinfo);

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
    /**
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
     */

    it("9. claim : tester2 ", async () => {
      this.timeout(1000000);
      const tester = tester2;


      let start = tester.stakeinfos[0].time;


      let miningEndTime = await TestStake2Vault.miningEndTime();

      let claimFlag = true;
      let i = 0;
      while(claimFlag){

        ethers.provider.send("evm_increaseTime", [stakePeriodDay])
        ethers.provider.send("evm_mine")

        const vaultBalanceTOS = await tos.balanceOf(vaultAddress);
        const totalSupplyTOS = await tos.totalSupply();
        let miningAmount = ethers.BigNumber.from("0");
        let nonminingAmount = ethers.BigNumber.from("0");

        const tosBalanceBefore = await tos.balanceOf(tester.account.address);
        const miningInfosBefore = await TestStakeUniswapV3.getMiningTokenId(
          tester.tokens[0]
        );


        const coinageTokenBefore = await TestStakeUniswapV3.stakedCoinageTokens(
          tester.tokens[0]
        );

        let depositToken = await TestStakeUniswapV3.depositTokens(
          tester.tokens[0]
        );

        //console.log('claim start ', i ) ;
        const tx = await TestStakeUniswapV3.connect(tester.account).claim(
          tester.tokens[0]
        );
        const receipt = await tx.wait();
        //console.log('claim receipt ',receipt) ;
        //topic0Claimed
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


          }
        }
        const minableAmount = miningAmount.add(nonminingAmount);

        let claimInfo = {
            miningAmount: miningAmount,
            nonminingAmount: nonminingAmount,
            minableAmount: minableAmount
        }
        tester.claims.push(claimInfo);

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


        i++;
        if(i > 29) claimFlag = false;
      }

      //console.log('claim end ' );

      // let totlaClaims = ethers.BigNumber.from("0");
      // let j = 0;
      // tester.claims.forEach(e=>{
      //       console.log(j,',',e.minableAmount.toString());
      //       totlaClaims = totlaClaims.add(e.minableAmount);
      //       j++;
      // });
      // console.log('totlaClaims ',totlaClaims.toString() );
    });

  });

  describe("# 9. StakeUniswapV3 Of TONStarter : withdraw ", () => {
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
      let block = await ethers.provider.getBlock();
      const miningEndTime = await TestStake2Vault.miningEndTime();

      if(block.timestamp < parseInt(miningEndTime.toString())){
        let diff = parseInt(miningEndTime.toString())-block.timestamp;

        ethers.provider.send("evm_increaseTime", [diff+10])
        ethers.provider.send("evm_mine")      // mine the next block
      }

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

      let claimInfo = {
            miningAmount: miningAmount,
            nonminingAmount: nonminingAmount,
            minableAmount: minableAmount
        }
        tester.claims.push(claimInfo);

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

      console.log('tester1 totlaClaims ', tester.claims[0].minableAmount.toString());
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

      let claimInfo = {
            miningAmount: miningAmount,
            nonminingAmount: nonminingAmount,
            minableAmount: minableAmount
        }
        tester.claims.push(claimInfo);

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


      let totlaClaims = ethers.BigNumber.from("0");
      let j = 0;
      tester.claims.forEach(e=>{
            console.log(j,',',e.minableAmount.toString());
            totlaClaims = totlaClaims.add(e.minableAmount);
            j++;
      });

      console.log('tester2 totlaClaims ',totlaClaims.toString() );

      console.log('tester1 liquidity ',tester1.stakeinfos[0].liquidity.toString() );
      console.log('tester2 liquidity ',tester2.stakeinfos[0].liquidity.toString() );
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
});



