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

describe("LockTOS", function () {
  let admin, user;
  let tos;
  let lockTOS;
  let phase3StartTime;
  const userLockInfo = [];
  const tosAmount = 1000000000;

  // Helper functions
  before(async () => {
    const addresses = await getAddresses();
    admin = await findSigner(addresses[0]);
    user = await findSigner(addresses[1]);
  });

  it("Initialize contracts", async function () {
    this.timeout(1000000);
    ({ tos } = await setupContracts(admin.address));
  });

  it("Deploy LockTOS", async function () {
    phase3StartTime =
      parseInt(await time.latest()) + parseInt(time.duration.weeks(10));
    const lockTOSImpl = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy();
    await lockTOSImpl.deployed();

    const lockTOSProxy = await (
      await ethers.getContractFactory("LockTOSProxy")
    ).deploy(lockTOSImpl.address, admin.address);
    await lockTOSProxy.deployed();

    await (
      await lockTOSProxy.initialize(
        tos.address,
        parseInt(time.duration.weeks(1)),
        parseInt(time.duration.weeks(156)),
        phase3StartTime
      )
    ).wait();

    const lockTOSArtifact = await hre.artifacts.readArtifact("LockTOS");
    lockTOS = new ethers.Contract(
      lockTOSProxy.address,
      lockTOSArtifact.abi,
      ethers.provider
    );
  });

  it("mint TOS to users", async function () {
    await (await tos.connect(admin).mint(user.address, tosAmount)).wait();
    expect(await tos.balanceOf(user.address)).to.be.equal(tosAmount);
  });

  it("should create locks for user", async function () {
    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user,
        amount: 100000000,
        unlockWeeks: 1,
      }),
      updates: [{}], // empty object for record
    });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user,
        amount: 300000000,
        unlockWeeks: 20,
      }),
      updates: [
        {},
        { amount: 20000 },
        { amount: 10000 },
        { amount: 30000 },
        { unlockWeeks: 3 }, // 3 weeks
      ],
    });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user,
        amount: 300000000,
        unlockWeeks: 5,
      }),
      updates: [{}, { amount: 10000 }],
    });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user,
        amount: 200000000,
        unlockWeeks: 155,
      }),
      updates: [
        {},
        { unlockWeeks: 4 }, // 4 weeks
        { amount: 20000 },
        { amount: 4000 },
        { unlockWeeks: 2 }, // 2 weeks
      ],
    });
  });

  it("should check balances of user at now", async function () {
    const totalBalance = parseInt(await lockTOS.balanceOf(user.address));
    const estimatedTotalBalance = parseInt(
      await calculateBalanceOfUser({
        user,
        lockTOS,
        timestamp: parseInt(await time.latest()),
      })
    );
    expect(totalBalance).to.equal(estimatedTotalBalance);

    for (const info of userLockInfo) {
      const currentTime = parseInt(await time.latest());
      const { lockId } = info;
      const balance = parseInt(await lockTOS.balanceOfLock(lockId));
      const estimate = await calculateBalanceOfLock({
        lockId,
        tos,
        lockTOS,
        timestamp: currentTime,
      });
      expect(balance).to.equal(estimate);
    }
  });

  it("should check of balances at the start", async function () {
    for (const info of userLockInfo) {
      const { lockId } = info;
      const lock = await lockTOS.lockedBalances(user.address, lockId);
      const balance = parseInt(
        await lockTOS.balanceOfLockAt(lockId, lock.start)
      );
      const estimate = await calculateBalanceOfLock({
        user,
        lockId,
        lockTOS,
        timestamp: lock.start,
      });
      expect(balance).to.equal(estimate);
    }
  });

  let startTime;
  it("should check history changes", async function () {
    const changes = [];
    startTime = parseInt(await time.latest());
    const ONE_WEEK = parseInt(time.duration.weeks(1));

    for (let it = 0; it < 10; ++it) {
      for (const info of userLockInfo) {
        const { lockId, updates } = info;

        for (const { amount, unlockWeeks } of updates) {
          const lock = await lockTOS.lockedBalances(user.address, lockId);
          expect(lock.boostValue).to.be.equal(2); // Boost Value should stay the same

          const lockStart = parseInt(lock.start);
          const lockEnd = parseInt(lock.end);
          const threeYears = parseInt(time.duration.weeks(155));

          if (amount) {
            if (parseInt(await time.latest()) < lockEnd) {
              await (
                await tos.connect(user).approve(lockTOS.address, amount)
              ).wait();
              await (
                await lockTOS.connect(user).increaseAmount(lockId, amount)
              ).wait();
            }
          }
          if (unlockWeeks) {
            const newTime =
              Math.floor(
                (lockEnd + unlockWeeks * 7 * 24 * 60 * 60) / ONE_WEEK
              ) * ONE_WEEK;
            if (parseInt(await time.latest()) < lockEnd && lockEnd < newTime) {
              if (newTime - lockStart < threeYears) {
                await (
                  await lockTOS
                    .connect(user)
                    .increaseUnlockTime(lockId, unlockWeeks)
                ).wait();
              }
            }
          }

          await time.increase(time.duration.weeks(1));
          changes.push({
            lockId,
            capturedBalance: parseInt(await lockTOS.balanceOfLock(lockId)),
            captureTimestamp: parseInt(await time.latest()),
          });
        }
      }
    }

    for (const change of changes) {
      const { lockId, captureTimestamp, capturedBalance } = change;
      const lockBalance = parseInt(
        await lockTOS.balanceOfLockAt(lockId, captureTimestamp)
      );
      expect(lockBalance).to.be.equal(capturedBalance);
    }
  });

  it("should check if boost value is 1", async function () {
    if (parseInt(await time.latest()) < phase3StartTime) {
      await time.increaseTo(phase3StartTime);
    }
    const lockId = await createLockWithPermit({
      tos,
      lockTOS,
      user,
      amount: 1000000,
      unlockWeeks: 1,
    });
    const lock = await lockTOS.lockedBalances(user.address, lockId);
    expect(lock.boostValue).to.be.equal(1);

    const balance = parseInt(await lockTOS.balanceOfLockAt(lockId, lock.start));
    const estimate = parseInt(
      await calculateBalanceOfLock({
        user,
        lockId,
        lockTOS,
        timestamp: lock.start,
      })
    );
    expect(balance).to.equal(estimate);

    const MAXTIME = 94348800;
    const MULTIPLIER = Math.pow(10, 18);
    const slope = Math.floor((parseInt(lock.amount) * MULTIPLIER) / MAXTIME);
    const deltaTime = parseInt(lock.end) - parseInt(lock.start);
    const bias = Math.floor((slope * deltaTime) / MULTIPLIER); // no boost value
    expect(balance).to.be.equal(bias);
  });

  it("should check total supply now", async function () {
    const now = parseInt(await time.latest());
    for (
      let cur = startTime;
      cur <= now;
      cur += parseInt(time.duration.weeks(1))
    ) {
      const totalSupplyAt = parseInt(await lockTOS.totalSupplyAt(cur));
      expect(totalSupplyAt).to.greaterThan(0);
    }
  });

  it("should withdraw for user", async function () {
    let accTos = 0;
    const initialBalance = parseInt(await tos.balanceOf(user.address));
    for (const info of userLockInfo) {
      const { lockId } = info;

      const lock = await lockTOS.lockedBalances(user.address, lockId);
      if (parseInt(lock.end) > parseInt(await time.latest())) {
        await time.increaseTo(parseInt(lock.end));
      }

      accTos += parseInt(lock.amount);
      await (await lockTOS.connect(user).withdraw(lockId)).wait();
      expect((await tos.balanceOf(user.address)) - initialBalance).to.be.equal(
        accTos
      );
      const newLock = await lockTOS.lockedBalances(user.address, lockId);
      expect(newLock.start).to.be.equal(0);
      expect(newLock.end).to.be.equal(0);
      expect(newLock.amount).to.be.equal(0);
      expect(newLock.boostValue).to.be.equal(0);
    }
  });

  it("should withdraw all leftover locks", async function () {
    await (await lockTOS.connect(user).withdrawAll()).wait();
  });
});
