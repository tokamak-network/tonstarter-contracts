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

let donateInfo = [];

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
    let customLPRewardProxy1, customLPRewardProxy2 ;


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


    describe("# 5. Create CustomLP ", async function () {
        it("1. Create CustomLPReward", async function () {
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

            let _func1 = Web3EthAbi.encodeFunctionSignature("initInfo(address,address,address,address,uint256)") ;
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

        it("2. initInfo fail if non-admin", async function () {

            customLPRewardProxy2 = await ethers.getContractAt("CustomLPRewardLogic2", customLPRewardProxy.address);

            await expect(
                customLPRewardProxy2.connect(tester1.account).initInfo(
                    stakeregister.address,
                    deployedUniswapV3.nftPositionManager.address,
                    deployedUniswapV3.coreFactory.address,
                    customCommonLib.address,
                    ethers.BigNumber.from('100000000000000000000'))
            ).to.be.revertedWith("Accessible: Caller is not an admin");
        });

        it("3. initInfo  ", async function () {

            customLPRewardProxy2 = await ethers.getContractAt("CustomLPRewardLogic2", customLPRewardProxy.address);

            await customLPRewardProxy2.connect(owner).initInfo(
                    stakeregister.address,
                    deployedUniswapV3.nftPositionManager.address,
                    deployedUniswapV3.coreFactory.address,
                    customCommonLib.address,
                    ethers.BigNumber.from('100000000000000000000')
                    );

            expect(await customLPRewardProxy2.stakeRegistry()).to.be.eq(stakeregister.address);
            expect(await customLPRewardProxy2.nonfungiblePositionManager()).to.be.eq(deployedUniswapV3.nftPositionManager.address);
            expect(await customLPRewardProxy2.uniswapV3Factory()).to.be.eq(deployedUniswapV3.coreFactory.address);
            expect(await customLPRewardProxy2.commonLib()).to.be.eq(customCommonLib.address);
        });

        it("4. setPool", async function () {

            await customLPRewardProxy2.connect(owner).setPool(
                    tester1.tokens[0]);

            const [token0, token1] = getAlignedPair(wton.address, tos.address);

            expect(await customLPRewardProxy2.poolToken0()).to.be.eq(token0);
            expect(await customLPRewardProxy2.poolToken1()).to.be.eq(token1);
            //expect(await customLPRewardProxy2.poolFee()).to.be.eq( );
            expect(await customLPRewardProxy2.poolAddress()).to.be.eq(pool_wton_tos_address);
        });
    });

    describe("# 6. Staking if no-reward ", async function () {

        it("1. staking fail if didn't approve LP ", async function () {
            let tester = tester1;

            customLPRewardProxy1 = await ethers.getContractAt("CustomLPRewardLogic1", customLPRewardProxy.address);

            await expect(
                customLPRewardProxy1.connect(tester.account).stake(tester.tokens[0])
            ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");

        });

        it("2. setApprovalForAll ", async function () {
            let tester = tester1;
            await deployedUniswapV3.nftPositionManager.connect(tester.account).setApprovalForAll(customLPRewardProxy.address, true);
        });

        it("3. staking ", async function () {
            let tester = tester1;
            let tokenId = tester.tokens[0];
            await customLPRewardProxy1.connect(tester.account).stake(tokenId);
            let depositToken = await customLPRewardProxy1.depositTokens(tokenId);

            expect(depositToken.owner).to.be.eq(tester.account.address);
            expect(depositToken.liquidity).to.be.above(0);
        });

        it("4. canClaimableWhenFullLiquidity is false if no-reward ", async function () {
            ethers.provider.send("evm_increaseTime", [10]);
            ethers.provider.send("evm_mine");
            let blockNumber = await ethers.provider.getBlockNumber();
            let block = await ethers.provider.getBlock(blockNumber);
            let currentTime = block.timestamp;

            let tester = tester1;
            let tokenId = tester.tokens[0];
            // let canClaim = await customLPRewardProxy1.canClaimableWhenFullLiquidity(tokenId, currentTime);
            // expect(canClaim.canFlag).to.be.eq(false);
        });
        /*
        it("5. claim fail if no reward", async function () {

            let tester = tester1;
            let tokenId = tester.tokens[0];
            await expect(
                customLPRewardProxy1.connect(tester.account).claim(tokenId)
            ).to.be.revertedWith("CustomLPRewardLogic1: no reward");
        });
        */
    });

    describe("# 6. DonateReward ", async function () {
        it("1. donate fail if no-approve", async function () {
            let tester = tester1;
            let amount = ethers.BigNumber.from('200000000000000000000');
            let periodSeconds = ethers.BigNumber.from('10') ;
            let _donate = {
                        token: '',
                        amount: amount,
                        periods: periodSeconds,
                        rewardPerSeconds : amount.div(periodSeconds)
                    }
            await tos.mint(tester.account.address, amount, {
                from: defaultSender,
            });
            expect(await tos.balanceOf(tester.account.address)).to.be.above(amount);

            await expect(
                customLPRewardProxy1.connect(tester.account).donateReward(
                    tos.address,
                    amount,
                    periodSeconds
                )
            ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        });

        it("2. donate TOS", async function () {
            let tester = tester1;
            let amount = ethers.BigNumber.from('200000000000000000000');
            let periodSeconds = ethers.BigNumber.from('10') ;
            let _donate = {
                        index:0,
                        token: '',
                        donator: '',
                        amount: amount,
                        periodSeconds: periodSeconds,
                        rewardPerSeconds : amount.div(periodSeconds),
                        start: 0,
                        end: 0
                    }
            let rewardCountPre = await customLPRewardProxy1.rewardCount();

            await tos.connect(tester.account).approve(customLPRewardProxy.address, amount );

            expect(
                await tos.allowance(tester.account.address, customLPRewardProxy.address)
            ).to.be.gte(amount);

            let tx = await customLPRewardProxy1.connect(tester.account).donateReward(
                tos.address,
                amount,
                periodSeconds
            );

            const receipt = await tx.wait();
            //console.log('receipt',receipt) ;

            for (let i = 0; i < receipt.events.length; i++) {
                if (
                    receipt.events[i].event == "DonatedReward"  &&
                    receipt.events[i].args != null
                ) {
                    //console.log(receipt.events[i]) ;
                    expect(receipt.events[i].args.donator).to.be.eq(tester.account.address);
                    expect(receipt.events[i].args.token).to.be.eq(tos.address);
                    expect(receipt.events[i].args.amount).to.be.eq(amount);
                    expect(receipt.events[i].args.periodSeconds).to.be.eq(periodSeconds);
                    _donate.index = receipt.events[i].args.rewardIndex;
                }
            }

            expect(_donate.index).to.be.above(0);

            let block = await ethers.provider.getBlock(tx.blockNumber);
            _donate.token = tos.address;
            _donate.donator = tester.account.address;
            _donate.start = block.timestamp;
            _donate.end = _donate.start + periodSeconds.toNumber();
            donateInfo.push(_donate);

            expect(await customLPRewardProxy1.rewardCount()).to.be.eq(rewardCountPre.add(1));

            let rewardToken = await customLPRewardProxy1.rewardTokens(_donate.index);
            console.log('rewardToken.allocatedAmount ', rewardToken.allocatedAmount.toString() );
            console.log('rewardToken.start ', rewardToken.start.toString() );
            console.log('rewardToken.end ', rewardToken.end.toString() );
            console.log('rewardToken.rewardPerSecond ', rewardToken.rewardPerSecond.toString() );
            console.log('rewardToken.tokenPerShare ', rewardToken.tokenPerShare.toString() );
            console.log('rewardToken.lastRewardTime ', rewardToken.lastRewardTime.toString() );


            expect(rewardToken.allocatedAmount).to.be.eq(amount);
            expect(rewardToken.rewardPerSecond).to.be.eq(_donate.rewardPerSeconds);
            expect(_donate.periodSeconds).to.be.eq((rewardToken.end).sub(rewardToken.start));

            // console.log(_donate.periodSeconds);
            // console.log(rewardToken.end);
            // console.log(rewardToken.start);

        });

        it("3. canClaimable ", async function () {
            let blockNumber = await ethers.provider.getBlockNumber();
            let block = await ethers.provider.getBlock(blockNumber);
            let currentTime = block.timestamp;
            console.log('currentTime',currentTime );

            let tester = tester1;
            let tokenId = tester.tokens[0];

            let data = await customLPRewardProxy1.canClaimable(tokenId, currentTime );
            console.log(data);

            console.log('canFlag ', data.canFlag);
            for(let i=0; i< data.claimableList.length; i++){
                console.log('claimableList ', i,  data.claimableList[i].toString());
            }

            // console.log('tokenList ', data.tokenList);
            // console.log('tokenIndexList ', data.tokenIndexList);

            // let rewardToken = await customLPRewardProxy1.rewardTokens(donateInfo[0].index);

            // //console.log(rewardToken);
            // console.log('rewardToken.allocatedAmount ', rewardToken.allocatedAmount.toString() );
            // console.log('rewardToken.start ', rewardToken.start.toString() );
            // console.log('rewardToken.end ', rewardToken.end.toString() );
            // console.log('rewardToken.rewardPerSecond ', rewardToken.rewardPerSecond.toString() );
            // console.log('rewardToken.tokenPerShare ', rewardToken.tokenPerShare.toString() );
            // console.log('rewardToken.lastRewardTime ', rewardToken.lastRewardTime.toString() );
        });
        it("3. claim ", async function () {
            // ethers.provider.send("evm_increaseTime", [5]);
            // ethers.provider.send("evm_mine");
            let blockNumber = await ethers.provider.getBlockNumber();
            let block = await ethers.provider.getBlock(blockNumber);
            let currentTime = block.timestamp;
            console.log('currentTime',currentTime );

            let tester = tester1;
            let tokenId = tester.tokens[0];

            let tx = await customLPRewardProxy1.connect(tester.account).claim(tokenId);
            const receipt = await tx.wait();
            //console.log('receipt',receipt) ;

            for (let i = 0; i < receipt.events.length; i++) {
                if (
                    receipt.events[i].event == "Claimed"  &&
                    receipt.events[i].args != null
                ) {
                    console.log('token:',receipt.events[i].args.token) ;
                    console.log('rewards:',receipt.events[i].args.rewards.toString()) ;
                    console.log('claimedReward:',receipt.events[i].args.claimedReward.toString()) ;
                }
            }

        });
        it("2. donate TOS", async function () {
            let tester = tester1;
            let amount = ethers.BigNumber.from('100000000000000000000');
            let periodSeconds = ethers.BigNumber.from('20') ;
            let _donate = {
                        index:0,
                        token: '',
                        donator: '',
                        amount: amount,
                        periodSeconds: periodSeconds,
                        rewardPerSeconds : amount.div(periodSeconds),
                        start: 0,
                        end: 0
                    }
            let rewardCountPre = await customLPRewardProxy1.rewardCount();

            await tos.connect(tester.account).approve(customLPRewardProxy.address, amount );

            expect(
                await tos.allowance(tester.account.address, customLPRewardProxy.address)
            ).to.be.gte(amount);

            let tx = await customLPRewardProxy1.connect(tester.account).donateReward(
                tos.address,
                amount,
                periodSeconds
            );

            const receipt = await tx.wait();
            //console.log('receipt',receipt) ;

            for (let i = 0; i < receipt.events.length; i++) {
                if (
                    receipt.events[i].event == "DonatedReward"  &&
                    receipt.events[i].args != null
                ) {
                    //console.log(receipt.events[i]) ;
                    expect(receipt.events[i].args.donator).to.be.eq(tester.account.address);
                    expect(receipt.events[i].args.token).to.be.eq(tos.address);
                    expect(receipt.events[i].args.amount).to.be.eq(amount);
                    expect(receipt.events[i].args.periodSeconds).to.be.eq(periodSeconds);
                    _donate.index = receipt.events[i].args.rewardIndex;
                }
            }

            expect(_donate.index).to.be.above(0);

            let block = await ethers.provider.getBlock(tx.blockNumber);
            _donate.token = tos.address;
            _donate.donator = tester.account.address;
            _donate.start = block.timestamp;
            _donate.end = _donate.start + periodSeconds.toNumber();
            donateInfo.push(_donate);

            expect(await customLPRewardProxy1.rewardCount()).to.be.eq(rewardCountPre.add(1));

            let rewardToken = await customLPRewardProxy1.rewardTokens(_donate.index);
            // console.log('rewardToken.allocatedAmount ', rewardToken.allocatedAmount.toString() );
            // console.log('rewardToken.start ', rewardToken.start.toString() );
            // console.log('rewardToken.end ', rewardToken.end.toString() );
            // console.log('rewardToken.rewardPerSecond ', rewardToken.rewardPerSecond.toString() );
            // console.log('rewardToken.tokenPerShare ', rewardToken.tokenPerShare.toString() );
            // console.log('rewardToken.lastRewardTime ', rewardToken.lastRewardTime.toString() );


            expect(rewardToken.allocatedAmount).to.be.eq(amount);
            expect(rewardToken.rewardPerSecond).to.be.eq(_donate.rewardPerSeconds);
            expect(_donate.periodSeconds).to.be.eq((rewardToken.end).sub(rewardToken.start));

            // console.log(_donate.periodSeconds);
            // console.log(rewardToken.end);
            // console.log(rewardToken.start);

        });

        it("3. canClaimable ", async function () {
            ethers.provider.send("evm_increaseTime", [10]);
            ethers.provider.send("evm_mine");
            let blockNumber = await ethers.provider.getBlockNumber();
            let block = await ethers.provider.getBlock(blockNumber);
            let currentTime = block.timestamp;
            console.log('currentTime',currentTime );

            let tester = tester1;
            let tokenId = tester.tokens[0];

            let data = await customLPRewardProxy1.canClaimable(tokenId, currentTime );
            console.log(data);

            console.log('canFlag ', data.canFlag);
            for(let i=0; i< data.claimableList.length; i++){
                console.log('claimableList ', i,  data.claimableList[i].toString());
            }

            // console.log('tokenList ', data.tokenList);
            // console.log('tokenIndexList ', data.tokenIndexList);

            // let rewardToken = await customLPRewardProxy1.rewardTokens(donateInfo[0].index);

            // //console.log(rewardToken);
            // console.log('rewardToken.allocatedAmount ', rewardToken.allocatedAmount.toString() );
            // console.log('rewardToken.start ', rewardToken.start.toString() );
            // console.log('rewardToken.end ', rewardToken.end.toString() );
            // console.log('rewardToken.rewardPerSecond ', rewardToken.rewardPerSecond.toString() );
            // console.log('rewardToken.tokenPerShare ', rewardToken.tokenPerShare.toString() );
            // console.log('rewardToken.lastRewardTime ', rewardToken.lastRewardTime.toString() );
        });

        it("3. updateReward  ", async function () {

            let tester = tester1;
            let tokenId = tester.tokens[0];

            await customLPRewardProxy1.connect(tester.account).updateReward();

            for(let i=0; i< donateInfo.length; i++){
                let rewardToken = await customLPRewardProxy1.rewardTokens(donateInfo[i].index);
                //console.log(rewardToken);
                console.log('rewardToken.allocatedAmount ', i, rewardToken.allocatedAmount.toString() );
                console.log('rewardToken.start ',  i, rewardToken.start.toString() );
                console.log('rewardToken.end ',  i, rewardToken.end.toString() );
                console.log('rewardToken.rewardPerSecond ',  i, rewardToken.rewardPerSecond.toString() );
                console.log('rewardToken.tokenPerShare ', i,  rewardToken.tokenPerShare.toString() );
                console.log('rewardToken.lastRewardTime ',  i, rewardToken.lastRewardTime.toString() );
            }

        });
        /*
        it("3. canClaimableWhenFullLiquidity ", async function () {
            ethers.provider.send("evm_increaseTime", [10]);
            ethers.provider.send("evm_mine");
            let blockNumber = await ethers.provider.getBlockNumber();
            let block = await ethers.provider.getBlock(blockNumber);
            let currentTime = block.timestamp;
            console.log('currentTime',currentTime );

            let tester = tester1;
            let tokenId = tester.tokens[0];

            let data = await customLPRewardProxy1.canClaimableWhenFullLiquidity(tokenId, currentTime );
            //console.log(data);

            console.log('canFlag ', data.canFlag);
            console.log('claimableList ', data.claimableList);
            console.log('tokenList ', data.tokenList);
            console.log('tokenIndexList ', data.tokenIndexList);

            let rewardToken = await customLPRewardProxy1.rewardTokens(data.tokenIndexList[0]);
            //console.log(rewardToken);

            console.log('rewardToken.allocatedAmount ', rewardToken.allocatedAmount.toString() );
            console.log('rewardToken.start ', rewardToken.start.toString() );
            console.log('rewardToken.end ', rewardToken.end.toString() );
            console.log('rewardToken.rewardPerSecond ', rewardToken.rewardPerSecond.toString() );
            console.log('rewardToken.tokenPerShare ', rewardToken.tokenPerShare.toString() );
            console.log('rewardToken.tokenPlastRewardTimeerShare ', rewardToken.lastRewardTime.toString() );

        });
        */
         it("3. canClaimable 2 ", async function () {
            ethers.provider.send("evm_increaseTime", [10]);
            ethers.provider.send("evm_mine");
            let blockNumber = await ethers.provider.getBlockNumber();
            let block = await ethers.provider.getBlock(blockNumber);
            let currentTime = block.timestamp;
            console.log('currentTime',currentTime );

            let tester = tester1;
            let tokenId = tester.tokens[0];

            let data = await customLPRewardProxy1.canClaimable(tokenId, currentTime );
            console.log(data);
            for(let i=0; i< data.claimableList.length; i++){
                console.log('claimableList ', i,  data.claimableList[i].toString());
            }

            // console.log('canFlag ', data.canFlag);
            // console.log('claimableList ', data.claimableList);
            // console.log('tokenList ', data.tokenList);
            // console.log('tokenIndexList ', data.tokenIndexList);

            // let rewardToken = await customLPRewardProxy1.rewardTokens(donateInfo[0].index);

            // //console.log(rewardToken);
            // console.log('rewardToken.allocatedAmount ', rewardToken.allocatedAmount.toString() );
            // console.log('rewardToken.start ', rewardToken.start.toString() );
            // console.log('rewardToken.end ', rewardToken.end.toString() );
            // console.log('rewardToken.rewardPerSecond ', rewardToken.rewardPerSecond.toString() );
            // console.log('rewardToken.tokenPerShare ', rewardToken.tokenPerShare.toString() );
            // console.log('rewardToken.lastRewardTime ', rewardToken.lastRewardTime.toString() );
        });

    });



    describe("# 7. Claim  ", async function () {
        it("3. claim ", async function () {
            let tester = tester1;
            let tokenId = tester.tokens[0];

            let tx = await customLPRewardProxy1.connect(tester.account).claim(tokenId);
            const receipt = await tx.wait();
            //console.log('receipt',receipt) ;

            for (let i = 0; i < receipt.events.length; i++) {
                if (
                    receipt.events[i].event == "Claimed"  &&
                    receipt.events[i].args != null
                ) {
                    console.log('token:',receipt.events[i].args.token) ;
                    console.log('rewards:',receipt.events[i].args.rewards.toString()) ;
                    console.log('claimedReward:',receipt.events[i].args.claimedReward.toString()) ;
                }
            }

        });
    });

    describe("# 6. Withdraw ", async function () {

    });

});