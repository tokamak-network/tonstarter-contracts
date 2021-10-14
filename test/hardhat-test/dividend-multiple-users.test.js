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
  let admin, user1, user2;
  let tos, ton;
  let lockTOS;
  let accounts;
  let redistributeInfo;
  const user1LockInfo = [];
  const user2LockInfo = [];
  const user3LockInfo = [];

  const tosAmount = 1000000000;
  const epochUnit = parseInt(time.duration.days(1));
  const maxTime = epochUnit * 156;

  // Helper functions
  before(async () => {
    const addresses = await getAddresses();
    admin = await findSigner(addresses[0]);
    user1 = await findSigner(addresses[1]);
    user2 = await findSigner(addresses[2]);
    user3 = await findSigner(addresses[3]);
    accounts = [
      { account: user1 },
      { account: user2 },
      { account: user3 }
    ];
    testerAddress = addresses[1];
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
    await (await tos.connect(admin).mint(user1.address, tosAmount)).wait();
    await (await tos.connect(admin).mint(user2.address, tosAmount)).wait();
    await (await tos.connect(admin).mint(user3.address, tosAmount)).wait();
    expect(await tos.balanceOf(user1.address)).to.be.equal(tosAmount);
    expect(await tos.balanceOf(user2.address)).to.be.equal(tosAmount);
    expect(await tos.balanceOf(user3.address)).to.be.equal(tosAmount);
  });

  it("transfer all tons from usrs", async function () {
    await (
      await ton
        .connect(user1)
        .transfer(admin.address, await ton.balanceOf(user1.address))
    ).wait();

    await (
      await ton
        .connect(user2)
        .transfer(admin.address, await ton.balanceOf(user2.address))
    ).wait();

    await (
      await ton
        .connect(user3)
        .transfer(admin.address, await ton.balanceOf(user3.address))
    ).wait();

    expect(await ton.balanceOf(user1.address)).to.be.equal(0);
    expect(await ton.balanceOf(user2.address)).to.be.equal(0);
    expect(await ton.balanceOf(user3.address)).to.be.equal(0);
  });

  const approveTON = async (account, amount) => {
    await (await ton.connect(account).approve(dividend.address, amount)).wait();
  };

  const distributeTON = async (account, amount) => {
    await (
      await dividend.connect(account).distribute(ton.address, amount)
    ).wait();
  };

  const redistributeTON = async (account, epoch) => {
    await (
      await dividend.connect(account).redistribute(ton.address, epoch)
    ).wait();
  };

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

    user1LockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user1,
        amount: 100000000,
        unlockWeeks: 5,
      }),
    });

    user1LockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user1,
        amount: 200000000,
        unlockWeeks: 10,
      }),
    });
    user2LockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user2,
        amount: 300000000,
        unlockWeeks: 5,
      }),
    });
    user2LockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user2,
        amount: 200000000,
        unlockWeeks: 155,
      }),
    });
    user3LockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user3,
        amount: 150000000,
        unlockWeeks: 6,
      }),
    });
    user3LockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user3,
        amount: 100000000,
        unlockWeeks: 100,
      }),
    });
  });

  it("should check withdrawable amount to be equal to total", async function () {
    const stakedAmount = parseInt(
      await lockTOS.totalLockedAmountOf(user1.address)
    );
    const withdrawableAmount = parseInt(
      await lockTOS.withdrawableAmountOf(user1.address)
    );
    expect(stakedAmount).to.be.greaterThan(withdrawableAmount);
    const locks = await lockTOS.locksOf(user1.address);
    const withdrawableLocks = await lockTOS.withdrawableLocksOf(user1.address);
    expect(locks.length).to.be.greaterThan(withdrawableLocks.length);
  });


  let initialTime;
  it("LockTOS stake TOS", async function () {
    await ethers.provider.send("evm_increaseTime", [
      parseInt(epochUnit),
    ]);
    await ethers.provider.send("evm_mine"); // mine the next block

    initialTime = parseInt(await lockTOS.getCurrentTime());
    const distributions = [
      { amount: 5000000, account: admin, weekIncrease: 0 },
      { amount: 6000000, account: admin, weekIncrease: 4 },
      { amount: 6000000, account: admin, weekIncrease: 3 },
      { amount: 4000000, account: admin, weekIncrease: 3 },
      { amount: 3000000, account: admin, weekIncrease: 4 },
    ];

    for (const { amount, account, weekIncrease } of distributions) {
      if (weekIncrease) {
        await ethers.provider.send("evm_increaseTime", [
          parseInt(epochUnit * (weekIncrease)),
        ]);
        await ethers.provider.send("evm_mine"); // mine the next block
      }
      await approveTON(account, amount);
      await distributeTON(account, amount);
    }
  });

  // it("should redistribtue first distribution", async function () {
  //   await redistributeTON(admin, redistributeInfo.weeklyEpoch);
  // });

  it("should check tokens per week", async function () {  
    const now = parseInt(await lockTOS.getCurrentTime());
    const expected = [
      { tokensPerWeek: 5000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 6000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 6000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 4000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 3000000 },
    ];

    for (
      let currentTime = initialTime, i = 0;
      currentTime <= now;
      currentTime += epochUnit, i += 1
    ) {
      if (await lockTOS.needCheckpoint()) {
        await (await lockTOS.connect(admin).globalCheckpoint()).wait(); // update history
      }

      const tokensPerWeek = parseInt(
        await dividend.tokensPerWeekAt(ton.address, currentTime)
      );
      // expect(tokensPerWeek).to.be.equal(expected[i].tokensPerWeek);

      let accum = 0;
      for (const { account } of accounts) {
        const claimable = parseInt(
          await dividend
            .connect(account)
            .claimableForPeriod(
              account.address,
              ton.address,
              currentTime - epochUnit,
              currentTime
            )
        );
        accum += claimable;
      }
      console.log({ tokensPerWeek, accum });

      // if (expected[i].tokensPerWeek > 0) {
        // expect(accum).to.be.closeTo(expected[i].tokensPerWeek, 1000);
      // }
    }

    let accum = 0;
    for (const { account } of accounts) {
      const claimable = parseInt(
        await dividend
          .connect(account)
          .claimable(
            account.address,
            ton.address
          )
      );
      accum += claimable;
    }    
    expect(accum).to.be.closeTo(24000000, 1000);
  });

  it("should claim", async function () {
    let totalTonBalance = 0;
    for (const { account } of accounts) {
      await (
        await dividend
        .connect(account)
        .claim(ton.address)
      ).wait();

      const tonBalance = parseInt(await ton.balanceOf(account.address));
      totalTonBalance += tonBalance;
    }
    expect(totalTonBalance).to.be.closeTo(24000000, 1000);

    for (const { account } of accounts) {
      const amount = parseInt(
        await dividend
          .connect(account)
          .claimable(account.address, ton.address)
      );
      expect(amount).to.be.equal(0);
    }

    const now = parseInt(await lockTOS.getCurrentTime());
    for (
      let currentTime = initialTime, i = 0;
      currentTime <= now;
      currentTime += epochUnit, i += 1
    ) {
      for (const { account } of accounts) {
        const claimable = parseInt(
          await dividend
            .connect(account)
            .claimableForPeriod(
              account.address,
              ton.address,
              currentTime - epochUnit,
              currentTime
            )
        );
        expect(claimable).to.be.equal(0);
      }
    }
  });
});
