/* eslint-disable no-undef */
const chai = require("chai");
const { expect } = require("chai");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { time } = require("@openzeppelin/test-helpers");
const { toBN, toWei, keccak256, fromWei } = require("web3-utils");

const {
  getAddresses,
  findSigner,
  setupContracts,
  mineBlocks,
} = require("../hardhat-test/utils");
const { network } = require("hardhat");

const PHASE1_ETH_Staking = "175000000." + "0".repeat(18);
const zeroAddress = "0x0000000000000000000000000000000000000000";
const {
  deployedUniswapV3Contracts,
  FeeAmount,
  TICK_SPACINGS,
  getMinTick,
  getMaxTick,
  encodePriceSqrt,
  // getMaxLiquidityPerTick,
} = require("./uniswap-v3-contracts");
const { provider } = require("@openzeppelin/test-environment");

// const Stake1Vault = contract.fromArtifact("Stake1Vault");
// const StakeTON = contract.fromArtifact("StakeTON");
// const StakeTONProxy = contract.fromArtifact("StakeTONProxy");
// const StakeTONModified = contract.fromArtifact("StakeTONModified");

describe("Stake 2", function () {
  let sender;
  let usersInfo;
  let stakingContractInfo;
  const stakeType = "2"; // stake type for uniswapV3 stake
  let Vault;
  let stakeEntry;
  let saleStartBlock, stakeStartBlock;
  let setup;
  let nftPositionManager, weth;

  before(async () => {
    const addresses = await getAddresses();
    sender = await findSigner(addresses[0]);

    usersInfo = [
      {
        name: "Bob",
        address: addresses[1],
        stakes: [{ amount: 100 }, { amount: 20 }],
      },
      {
        name: "Alice",
        address: addresses[2],
        stakes: [{ amount: 50 }, { amount: 100 }],
      },
    ];

    stakingContractInfo = [
      { name: "short staking", period: 5 },
      // { name: "long staking", period: 100 },
    ];
  });

  it("Initialize contracts", async function () {
    this.timeout(1000000);
    console.log("Initialize contracts");

    setup = await setupContracts(sender.address);
    stakeEntry = await setup.initEntry();
    console.log("finally");
    ({ nftPositionManager, weth, swapRouter, coreFactory } =
      await deployedUniswapV3Contracts(sender));
    await setup.stakeRegistry
      .connect(sender)
      .addDefiInfo(
        "UNISWAP_V3",
        swapRouter.address,
        nftPositionManager.address,
        coreFactory.address,
        FeeAmount.MEDIUM,
        sender.address
      );
  });

  const createPool = async (token0, token1) => {
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
    amount1Desired
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
/*
  it("Initialize NFTManager", async function () {
    const tos = setup.tos;
    const ton = setup.ton;
    let [token0, token1] = [tos, ton];
    if (ton.address < tos.address) {
      [token0, token1] = [ton, tos];
    }
    await token0.connect(sender).approve(nftPositionManager.address, 100);
    await token1.connect(sender).approve(nftPositionManager.address, 300);
    await createPool(token0.address, token1.address);
    await mintPosition(token0.address, token1.address, 100, 300);
  });

  it("should create a vault", async function () {
    const current = await ethers.provider.getBlockNumber();
    console.log({ current });
    saleStartBlock = parseInt(current + 1);
    stakeStartBlock = saleStartBlock + 6;
    console.log({ current, saleStartBlock, stakeStartBlock });
    const HASH_PHASE1_ETH_Staking = keccak256("PHASE1_ETH_STAKING");
    const tx = await stakeEntry.connect(sender).createVault(
      setup.ton.address, // ton
      ethers.utils.parseUnits(PHASE1_ETH_Staking, 18),
      saleStartBlock,
      stakeStartBlock,
      "1",
      HASH_PHASE1_ETH_Staking,
      stakeType,
      zeroAddress
    );
    await tx.wait();

    const vaults = await stakeEntry.connect(sender).vaultsOfPhase("1");
    console.log({ vaults });
    const stakeVaultAddress = vaults[vaults.length - 1];
    console.log(stakeVaultAddress);

    Vault = await (
      await ethers.getContractFactory("Stake1Vault")
    ).attach(stakeVaultAddress);
    await setup.tos
      .connect(sender)
      .mint(Vault.address, ethers.utils.parseUnits(PHASE1_ETH_Staking, 18));
  });

  it("should create stake contracts", async function () {
    this.timeout(10000000);

    for (const { name, period } of stakingContractInfo) {
      const tx = await stakeEntry.connect(sender).createStakeContract(
        "1", // phase number
        Vault.address, // vault address
        setup.tos.address, // reward tos address
        setup.ton.address, // ton address
        period, // staking period
        name // staking name
      );
      await tx.wait();
    }

    // Store stake addresses
    const stakeAddresses = await stakeEntry
      .connect(sender)
      .stakeContractsOfVault(Vault.address);
    console.log({ stakeAddresses });
    for (let i = 0; i < stakingContractInfo.length; ++i) {
      stakingContractInfo[i].address = stakeAddresses[i];
    }
  });

  it("should stake", async function () {
    this.timeout(10000000);
    const currentBlockTime = parseInt(saleStartBlock);
    await mineBlocks(currentBlockTime);

    for (let i = 0; i < stakingContractInfo.length; ++i) {
      const { address: stakeAddress } = stakingContractInfo[i];
      const stakeContract = await (
        await ethers.getContractFactory("StakeUniswapV3")
      ).attach(stakeAddress);

      console.log({ stakeAddress });
      const txApprove = await nftPositionManager.approve(
        stakeContract.address,
        1
      );
      await txApprove.wait();

      const txStake = await stakeContract.stakeLiquidity(1);
      await txStake.wait();

      const txMint = await setup.ton
        .connect(sender)
        .mint(stakeContract.address, toWei("1000000000", "ether"));
      await txMint.wait();

      if (true) break;
      / *
      for (const user of usersInfo) {
        const { name, address, stakes } = user;
        const signer = await findSigner(address);
        await stakeContract.connect(signer).stakeLiquidity();
      }
      * /
    }
  });

  it("should close sale", async function () {
    const current = parseInt(stakeStartBlock);
    await mineBlocks(current);
    await stakeEntry.connect(sender).closeSale(Vault.address);
  });

  it("should claim rewards", async function () {
    this.timeout(10000000);
    const tos = setup.tos;

    for (const { claimBlock } of [{ claimBlock: 10 }]) {
      const block = stakeStartBlock + claimBlock;
      await mineBlocks(block - 1);
      for (const {
        name: stakeName,
        address: stakeAddress,
        period: stakePeriod,
      } of stakingContractInfo) {
        const stakeContract = await (
          await ethers.getContractFactory("StakeUniswapV3")
        ).attach(stakeAddress);
        const reward = await stakeContract.canRewardAmount(sender.address, 1);
        console.log({ reward: reward.toString() });

        const tosBalance = await tos.balanceOf(sender.address);
        await stakeContract.connect(sender).claim(1);
        console.log({ tosBalance: tosBalance.toString() });

        const newTosBalance = await tos.balanceOf(sender.address);
        await expect(newTosBalance).to.be.above(tosBalance);
        console.log({ newTosBalance: newTosBalance.toString() });

        const rewardClaimedTotal = await stakeContract.rewardClaimedTotal();
        console.log({
          rewardClaimedTotal: fromWei(rewardClaimedTotal.toString(), "ether"),
        });

        const result = await stakeContract.getUserStaked(
          sender.address,
          1 // tokenId
        );
        console.log({
          liquidity: result.liquidity.toString(),
          perSecond: result.secondsPerLiquidityInsideX128Last.toString(),
        });
        console.log({ claimedAmount: result.claimedAmount.toString() });
        console.log({ result });
      }
    }
  });
  */
});
