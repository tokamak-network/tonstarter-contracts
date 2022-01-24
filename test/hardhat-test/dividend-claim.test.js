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
} = require("./utils");
const { ethers, network } = require("hardhat");

const {
  calculateBalanceOfLock,
  calculateBalanceOfUser,
  createLockWithPermit,
} = require("./helpers/lock-tos-helper");

const name = "TONStarter";
const symbol = "TOS";
const version = "1.0";

describe("LockTOS", function () {
  let admin, user;
  let tos, ton;
  let lockTOS;
  let accounts;
  let redistributeInfo;
  const userLockInfo = [];

  const tosAmount = 1000000000;
  const oneDay = parseInt(time.duration.days(1));
  const epochUnit = parseInt(time.duration.days(7));
  const maxTime = epochUnit * 156;

  // Helper functions
  before(async () => {
    const addresses = await getAddresses();
    admin = await findSigner(addresses[0]);
    user = await findSigner(addresses[1]);
  });

  it("Initialize TOS", async function () {
    this.timeout(1000000);
    ({ tos, ton } = await setupContracts(admin.address));
  });

  it("Deploy LockTOS", async function () {
    const now = parseInt(Date.now() / 1000);

    const lockTOSImpl = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy();
    await lockTOSImpl.deployed();

    const lockTOSProxy = await (
      await ethers.getContractFactory("LockTOSProxy")
    ).deploy(lockTOSImpl.address, admin.address);
    await lockTOSProxy.deployed();
    await (
      await lockTOSProxy.initialize(tos.address, epochUnit, maxTime)
    ).wait();
    const lockTOSArtifact = await hre.artifacts.readArtifact("LockTOS");
    lockTOS = new ethers.Contract(
      lockTOSProxy.address,
      lockTOSArtifact.abi,
      ethers.provider
    );
  });

  it("Deploy LockTOS & LockTOSDividen", async function () {
    const dividendImpl = await (
      await ethers.getContractFactory("LockTOSDividend")
    ).deploy();
    await dividendImpl.deployed();

    const dividendProxy = await (
      await ethers.getContractFactory("LockTOSDividendProxy")
    ).deploy(dividendImpl.address, admin.address);
    await dividendProxy.deployed();

    await (await dividendProxy.initialize(lockTOS.address, epochUnit)).wait();

    const dividendArtifact = await hre.artifacts.readArtifact(
      "LockTOSDividend"
    );
    dividend = new ethers.Contract(
      dividendProxy.address,
      dividendArtifact.abi,
      ethers.provider
    );
  });

  it("mint TOS to users", async function () {
    await (await tos.connect(admin).mint(user.address, tosAmount)).wait();
    expect(await tos.balanceOf(user.address)).to.be.equal(tosAmount);
  });

  it("transfer all tons from usrs", async function () {
    await (
      await ton
        .connect(user)
        .transfer(admin.address, await ton.balanceOf(user.address))
    ).wait();

    expect(await ton.balanceOf(user.address)).to.be.equal(0);
  });

  const approveTON = async (account, amount) => {
    await (await ton.connect(account).approve(dividend.address, amount)).wait();
  };

  const distributeTON = async (account, amount) => {
    await (
      await dividend.connect(account).distribute(ton.address, amount)
    ).wait();
  };

  // const redistributeTON = async (account, epoch) => {
  //   await (
  //     await dividend.connect(account).redistribute(ton.address, epoch)
  //   ).wait();
  // };

  // it("should create distribute redistributable amount", async function () {
  //   const amount = 1000000;
  //   await approveTON(admin, amount);
  //   await distributeTON(admin, amount);
  //   const currentTime = parseInt(await lockTOS.getCurrentTime());
  //   redistributeInfo = {
  //     timestamp: currentTime,
  //     weeklyEpoch: parseInt(await dividend.getWeeklyEpoch(currentTime))
  //   }

  //   const tokens = parseInt(await dividend.tokensPerWeekAt(ton.address, currentTime));
  //   expect(tokens).to.be.equal(amount);
  // });

  it("should create locks for users", async function () {
    await ethers.provider.send("evm_increaseTime", [
      parseInt(epochUnit * 2),
    ]);
    await ethers.provider.send("evm_mine"); // mine the next block

    // userLockInfo.push({
    //   lockId: await createLockWithPermit({
    //     tos,
    //     lockTOS,
    //     user: user,
    //     amount: 100000000,
    //     unlockWeeks: 100,
    //   }),
    // });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user,
        amount: 200000000,
        unlockWeeks: 155,
      }),
    });
  });

  let initialTime;
  it("Distribute, claim, and distribute", async function () {
    initialTime = parseInt(await lockTOS.getCurrentTime());
    // await ethers.provider.send("evm_increaseTime", [1 * epochUnit]);
    // await ethers.provider.send("evm_mine");

    // const firstDistributionAmount = 5000000;
    // await approveTON(admin, firstDistributionAmount);
    // await distributeTON(admin, firstDistributionAmount);
    
    // await ethers.provider.send("evm_increaseTime", [1 * epochUnit]);
    // await ethers.provider.send("evm_mine");

    // const firstClaimable = parseInt(await dividend.claimable(user.address, ton.address));
    // console.log({ firstClaimable });
    // await (await dividend.connect(user).claim(ton.address)).wait();
    
    await ethers.provider.send("evm_increaseTime", [1 * epochUnit]);
    await ethers.provider.send("evm_mine");

    const secondDistributionAmount = 3000000;
    await approveTON(admin, secondDistributionAmount);
    await distributeTON(admin, secondDistributionAmount);

    await ethers.provider.send("evm_increaseTime", [100 * epochUnit]);
    await ethers.provider.send("evm_mine");

    await (await lockTOS.connect(admin).globalCheckpoint()).wait();
    const secondClaimable = parseInt(await dividend.claimable(user.address, ton.address));
    console.log({ secondClaimable });
    await (await dividend.connect(user).claim(ton.address)).wait();
  });
});
