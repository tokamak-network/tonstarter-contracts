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

  // it("Initialize contracts", async function () {
  //   this.timeout(1000000);
  //   ({ tos } = await setupContracts(admin.address));
  // });


  it("Initialize TOS", async function () {
    this.timeout(1000000);
    const TOS = await ethers.getContractFactory("TOS");
    tos = await TOS.deploy(name, symbol, version);
    await tos.deployed();
  });

  it("Deploy LockTOS", async function () {
    let now = parseInt(Date.now()/1000);
    console.log('now',now) ;

    // phase3StartTime =
    //   parseInt(await time.latest()) + parseInt(time.duration.weeks(10));
    phase3StartTime = now + 60*10*10;

    const lockTOSImpl = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy();
    await lockTOSImpl.deployed();

    const lockTOSProxy = await (
      await ethers.getContractFactory("LockTOSProxy")
    ).deploy(lockTOSImpl.address, admin.address);
    await lockTOSProxy.deployed();

    /*
    await (
      await lockTOSProxy.initialize(
        tos.address,
        parseInt(time.duration.weeks(1)),
        parseInt(time.duration.weeks(156)),
        phase3StartTime
      )
    ).wait();
    */
    await (
      await lockTOSProxy.initialize(
        tos.address,
        600,
        600 * 156,
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
        amount: 200000000,
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
    let lastestTime = parseInt(await time.latest());
  });

  it("check boost", async function () {
    let lastestTime = await lockTOS.getCurrentTime();
    let lockId =  await createLockWithPermit({
        user,
        amount: 100000000,
        unlockWeeks: 156,
        tos,
        lockTOS
      });

    console.log('lockId',lockId.toString(), lastestTime.toString());

    const balanceOfLock = await lockTOS.balanceOfLock(lockId);
    console.log('balanceOfLock',balanceOfLock.toString());

    const locksInfo = await lockTOS.locksInfo(lockId);
    console.log('locksInfo start',locksInfo.start.toString());
    console.log('locksInfo end',locksInfo.end.toString());
    console.log('locksInfo amount',locksInfo.amount.toString());
    console.log('locksInfoboostValue',locksInfo.boostValue.toString());

    const balance = await lockTOS.balanceOfLockAt(lockId, locksInfo.start);
    console.log('balanceOfLockAt',balance.toString());
    /*
    const balanceOfLockTest = await lockTOS.balanceOfLockTest(lockId);
    console.log('balanceOfLockTest _balance',balanceOfLockTest._balance.toString() );
    console.log('balanceOfLockTest _blocktime',balanceOfLockTest._blocktime.toString() );
    console.log('balanceOfLockTest _currentBias',balanceOfLockTest._currentBias.toString() );
    console.log('balanceOfLockTest _slope',balanceOfLockTest._slope.toString() );
    console.log('balanceOfLockTest _bias',balanceOfLockTest._bias.toString() );
    console.log('balanceOfLockTest _timestamp',balanceOfLockTest._timestamp.toString() );
    */
  });


  it("should check balances of user at now", async function () {
    //let lastestTime =parseInt(await time.latest());
    let lastestTime = await lockTOS.getCurrentTime();
    //console.log('lastestTime ',  lastestTime );

    const totalBalance = parseInt(await lockTOS.balanceOf(user.address));
    const estimatedTotalBalance = parseInt(
      await calculateBalanceOfUser({
        user,
        timestamp: lastestTime,
        lockTOS,
      })
    );

    expect(totalBalance).to.equal(estimatedTotalBalance);

    for (const info of userLockInfo) {
     // const currentTime = parseInt(await time.latest());
      let currentTime = await lockTOS.getCurrentTime();

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
    //startTime = parseInt(await time.latest());
    startTime = await lockTOS.getCurrentTime();

    //const ONE_WEEK = parseInt(time.duration.weeks(1));
    const ONE_WEEK = 60*10;

    for (let it = 0; it < 10; ++it) {
      for (const info of userLockInfo) {
        const { lockId, updates } = info;

        for (const { amount, unlockWeeks } of updates) {
          const lock = await lockTOS.lockedBalances(user.address, lockId);
          expect(lock.boostValue).to.be.equal(2); // Boost Value should stay the same

          const lockStart = parseInt(lock.start);
          const lockEnd = parseInt(lock.end);
          //const threeYears = parseInt(time.duration.weeks(155));
          const threeYears = ONE_WEEK * 155;

          if (amount) {
            if (parseInt(await lockTOS.getCurrentTime()) < lockEnd) {
            //if (parseInt(await time.latest()) < lockEnd) {
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
            //if (parseInt(await time.latest()) < lockEnd && lockEnd < newTime) {
            if (parseInt(await lockTOS.getCurrentTime()) < lockEnd && lockEnd < newTime) {
              if (newTime - lockStart < threeYears) {
                await (
                  await lockTOS
                    .connect(user)
                    .increaseUnlockTime(lockId, unlockWeeks)
                ).wait();
              }
            }
          }

          //await time.increase(time.duration.weeks(1));
          await time.increase(60*10);
          changes.push({
            lockId,
            capturedBalance: parseInt(await lockTOS.balanceOfLock(lockId)),
            //captureTimestamp: parseInt(await time.latest()),
            captureTimestamp: parseInt(await lockTOS.getCurrentTime()),
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
    // if (parseInt(await time.latest()) < phase3StartTime) {
    //   await time.increaseTo(phase3StartTime);
    // }
    let current1 = parseInt( await lockTOS.getCurrentTime());
    let phase3StartTime = parseInt(await lockTOS.phase3StartTime());

    let period = phase3StartTime - current1;
    period = period+600;
    //await time.increase( period );
    ethers.provider.send("evm_increaseTime", [period])   // add 60 seconds
    ethers.provider.send("evm_mine")      // mine the next block

    //let current = parseInt( await lockTOS.getCurrentTime());

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

    //const MAXTIME = 94348800;
    const MAXTIME = 60 * 10 * 156;
    const MULTIPLIER = Math.pow(10, 18);
    const slope = Math.floor((parseInt(lock.amount) * MULTIPLIER) / MAXTIME);
    const deltaTime = parseInt(lock.end) - parseInt(lock.start);
    const bias = Math.floor((slope * deltaTime) / MULTIPLIER); // no boost value
    expect(balance).to.be.equal(bias);
  });

  it("should check total supply now", async function () {
    //const now = parseInt(await time.latest());
    const now = parseInt(await lockTOS.getCurrentTime());
    for (
      let cur = startTime;
      cur <= now;
      //cur += parseInt(time.duration.weeks(1))
      cur += 60*10
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

      let cur = parseInt(await lockTOS.getCurrentTime());
      let end = parseInt(lock.end);
      //if (parseInt(lock.end) > parseInt(await time.latest())) {
      if (end > cur) {
        //await time.increaseTo(parseInt(lock.end));
        let diff = end - cur;
        ethers.provider.send("evm_increaseTime", [diff])   // add 60 seconds
        ethers.provider.send("evm_mine")      // mine the next block
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
