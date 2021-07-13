const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require("ethers");
const utils = ethers.utils;

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
  encodePriceSqrt,
  // getMaxLiquidityPerTick,
} = require("./uniswap-v3-stake/uniswap-v3-contracts");

const {
  ICO20Contracts,
  Pharse2_ETHTOS_Staking,
  Pharse2_REWARD_PERBLOCK,
  HASH_Pharse2_ETHTOS_Staking
  } = require("../utils/ico_test_deploy.js");

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
] = accounts;

let deployedUniswapV3;
let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
let pool_eth_ton_address , pool_eth_tos_address;
const zeroAddress = "0x0000000000000000000000000000000000000000";

const createPool = async (token0, token1, nftPositionManager ) => {
    const tx = await nftPositionManager.createAndInitializePoolIfNecessary(
      token0,
      token1,
      FeeAmount.MEDIUM,
      encodePriceSqrt(1, 1)
    );
    await tx.wait();
  };

const mintPosition = async (
    token0,
    token1,
    amount0Desired,
    amount1Desired,
    nftPositionManager,
    sender
  ) => {
    const tx = await nftPositionManager.connect(sender).mint({
      token0,
      token1,
      amount0Desired,
      amount1Desired,
      amount0Min: 0,
      amount1Min: 0,
      deadline: 100000000000000,
      recipient: sender.address,
      fee: FeeAmount.MEDIUM,
      tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
      tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
    });
    await tx.wait();
  };

describe(" UniswapV3 Staking", function () {
  let sender;
  let usersInfo;
  let tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth, vault_phase1_ton, vault_phase1_tosethlp, vault_phase1_dev;
  let ton, wton, depositManager, seigManager;
  let stakeEntry, stakeEntry2, layer2;

  const stakeType = "2"; // stake type for uniswapV3 stake


  let setup;
  let nftPositionManager, weth;

  before(async () => {
    ico20Contracts = new ICO20Contracts();
  });

  describe('# 1. Deploy UniswapV3', async function () {

    it("deployedUniswapV3Contracts", async function () {
      this.timeout(1000000);
      deployedUniswapV3  = await deployedUniswapV3Contracts(defaultSender);
      // console.log('nftPositionManager', deployedUniswapV3.nftPositionManager.address );
      // console.log('nftDescriptor', deployedUniswapV3.nftDescriptor.address );
      // console.log('weth', deployedUniswapV3.weth.address );
      // console.log('swapRouter', deployedUniswapV3.swapRouter.address );
      // console.log('coreFactory', deployedUniswapV3.coreFactory.address );

    });

  });

  describe('# 2. TONStarter Deployed ', async function () {

    it("ico20Contracts init  ", async function () {
      this.timeout(1000000);
      ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
        defaultSender
      );
    });

    it("tokamakContracts init  ", async function () {
      this.timeout(1000000);
      TokamakContractsDeployed =
        await ico20Contracts.initializePlasmaEvmContracts(defaultSender);

      const cons = await ico20Contracts.getPlasamContracts();
      ton = cons.ton;
      wton = cons.wton;
      depositManager = cons.depositManager;
      seigManager = cons.seigManager;
      globalWithdrawalDelay = await depositManager.globalWithdrawalDelay();



      await ton.mint(defaultSender, ethers.utils.parseUnits('1000', 18), { from: defaultSender });
      await wton.mint(defaultSender, ethers.utils.parseUnits('1000', 18), { from: defaultSender });
    });

    it("Set StakeProxy ", async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntryExceptUniswap(defaultSender);

      const cons = await ico20Contracts.getICOContracts();
      stakeregister = cons.stakeregister;
      tos = cons.tos;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;
      stakeEntry2 = cons.stakeEntry2;

      console.log('stakeEntry2',stakeEntry2.address);


      // await stakeregister.addDefiInfo(
      //   "UNISWAP_V3",
      //   deployedUniswapV3.swapRouter.address,
      //   deployedUniswapV3.nftPositionManager.address,
      //   deployedUniswapV3.weth.address,
      //   FeeAmount.LOW,
      //   zeroAddress
      // );

    });

  });
  /*
  describe('# 3. Set Uniswap V3 Pool', async function () {

    it("Create WETH-WTON Pool ", async function () {
      let [token0, token1] = [deployedUniswapV3.weth, wton];
      if (wton.address < deployedUniswapV3.weth.address) {
        [token0, token1] = [wton, deployedUniswapV3.weth];
      }
      await token0.connect(defaultSender).approve(deployedUniswapV3.nftPositionManager.address, 100);
      await token1.connect(defaultSender).approve(deployedUniswapV3.nftPositionManager.address, 300);
     // pool_eth_wton_address = await createPool(token0.address, token1.address, deployedUniswapV3.nftPositionManager);
      //await mintPosition(token0.address, token1.address, 100, 300, deployedUniswapV3.nftPositionManager, defaultSender );

      console.log('pool_eth_wton_address', pool_eth_wton_address);
    });

    it("Create WETH-TOS Pool ", async function () {
      let [token0, token1] = [deployedUniswapV3.weth, tos];
      if (tos.address < deployedUniswapV3.weth.address) {
        [token0, token1] = [tos, deployedUniswapV3.weth];
      }
      await token0.approve(deployedUniswapV3.nftPositionManager.address, 100, { from: defaultSender });
      await token1.approve(deployedUniswapV3.nftPositionManager.address, 300, { from: defaultSender });
      pool_eth_tos_address = await createPool(token0.address, token1.address, deployedUniswapV3.nftPositionManager);
      await mintPosition(token0.address, token1.address, 100, 300, deployedUniswapV3.nftPositionManager, defaultSender );

      console.log('pool_eth_tos_address', pool_eth_tos_address);
    });

  });
  */

  describe('# 3. Phase 2 ', async function () {

    it("1. Create StakeUniswapV3  ", async function () {
        this.timeout(1000000);

        let balance  = await stakeEntry2.balanceOf(wton.address, defaultSender);

        console.log('Pharse2_ETHTOS_Staking', Pharse2_ETHTOS_Staking );
        console.log('Pharse2_REWARD_PERBLOCK', Pharse2_REWARD_PERBLOCK );

        const tx = await stakeEntry2.createVault2(
          utils.parseUnits(Pharse2_ETHTOS_Staking, 18),
          utils.parseUnits(Pharse2_REWARD_PERBLOCK, 18),
          utils.parseUnits("2",0),
          HASH_Pharse2_ETHTOS_Staking,
          utils.parseUnits("2",0),
          [ deployedUniswapV3.nftPositionManager.address,
            deployedUniswapV3.coreFactory.address,
            deployedUniswapV3.weth.address,
            tos.address,
          ],
          "UniswapV3"
        );


        console.log('tx.receipt.logs',tx.receipt.logs);
        // const vaultAddress = tx.receipt.logs[tx.receipt.logs.length - 1].args.vault;
        //   vault_phase1_ton = await Stake2Vault.at(vaultAddress, {
        //     from: defaultSender,
        //   });
        // await tos.mint(
        //   vault_phase1_ton.address,
        //   utils.parseUnits(Pharse1_TON_Staking, 18),
        //   { from: defaultSender }
        // );

    });
  });

});