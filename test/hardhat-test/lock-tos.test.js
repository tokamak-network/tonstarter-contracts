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
const { ethers } = require("hardhat");

describe("LockTOS", function () {
  let admin, user, user2;
  let tos;
  let lockTOS;
  const userLockInfo = [];
  const MAXTIME = 94608000;

  const tosAmount = 1000000000;
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
    const phase3StartTime = (await time.latest()) + time.duration.weeks(10);
    lockTOS = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy(tos.address, phase3StartTime);
    await lockTOS.deployed();
  });

  it("mint TOS to users", async function () {
    await (await tos.connect(admin).mint(user.address, tosAmount)).wait();
    expect(await tos.balanceOf(user.address)).to.be.equal(tosAmount);
  });

  const approve = async (user, amount) => {
    await (await tos.connect(user).approve(lockTOS.address, amount)).wait();
  };

  const createLock = async (user, amount, time) => {
    await (await lockTOS.connect(user).createLock(amount, time)).wait();
  };

  const generateCreateProcess = async ({
    user,
    lockedAmount,
    lockedDuration,
  }) => {
    const startTime = parseInt(await time.latest());
    const endTime = startTime + lockedDuration;
    const slope = lockedAmount / MAXTIME;
    const bias = slope * lockedDuration;
    await approve(user, lockedAmount);
    await createLock(user, lockedAmount, endTime);
    return { startTime, endTime, lockedAmount, bias, slope };
  };

  it("should create locks for user", async function () {
    userLockInfo.push(
      await generateCreateProcess({
        user,
        lockedAmount: 300000000,
        lockedDuration: parseInt(time.duration.weeks(20)),
      })
    );
    userLockInfo.push(
      await generateCreateProcess({
        user,
        lockedAmount: 300000000,
        lockedDuration: parseInt(time.duration.weeks(5)),
      })
    );
    userLockInfo.push(
      await generateCreateProcess({
        user,
        lockedAmount: 300000000,
        lockedDuration: parseInt(time.duration.years(3)),
      })
    );
  });

  it("should check balances now of ", async function () {
    const totalBalance = await lockTOS.balanceOf(user.address);
    const locksOf = await lockTOS.locksOf(user.address);
    for (let i = 0; i < locksOf.length; ++i) {
      userLockInfo[i].lockId = locksOf[i];
    }

    console.log("Current time: ", (await time.latest()).toString());
    console.log("user total: ", totalBalance.toString());
    for (const info of userLockInfo) {
      const currentTime = parseInt(await time.latest());
      const { lockId, slope, bias, startTime } = info;
      const balance = await lockTOS.balanceOfLock(user.address, lockId);
      console.log(`Vote Weight: ${balance.toString()}, LockId: ${lockId}`);
      console.log(
        `Estimated bias: ${bias - slope * (currentTime - startTime)}`
      );
    }
  });

  it("should check history changes", async function () {
    const changes = [];
    for (let it = 0; it < 5; ++it) {
      for (const info of userLockInfo) {
        await time.increase(time.duration.days(1));
        const { lockId } = info;
        const currentTime = parseInt(await time.latest());
        const lockBalance = (
          await lockTOS.balanceOfLock(user.address, lockId)
        ).toString();
        changes.push({
          lockId,
          captureBalance: lockBalance,
          captureTimestamp: currentTime,
        });
      }
    }

    for (const change of changes) {
      const { lockId, captureTimestamp, captureBalance } = change;
      const lockBalance = (
        await lockTOS.balanceOfLock(user.address, lockId, captureTimestamp)
      ).toString();
      console.log({ lockBalance, captureBalance });
    }
  });

  it("should check total supply now", async function () {
    const totalSupply = await lockTOS.totalSupply();
    console.log("Total supply: ", totalSupply.toString());
  });

  it("should change time and check vote weights", async function () {
    for (const info of userLockInfo) {
      const { lockId } = info;
      const lockBalance = await lockTOS.balanceOfLock(user.address, lockId);
      await time.increaseTo();

      console.log(`Vote Weight: ${lockBalance.toString()}, LockId: ${lockId}`);
    }
  });

  it("should withdraw for user", async function () {
    let accTos = 0;
    for (const info of userLockInfo) {
      const { lockId, lockedAmount } = info;
      accTos += lockedAmount;
      await (await lockTOS.withdraw(lockId)).wait();
      expect(await lockTOS.balanceOf(user.address)).to.be.equal(accTos);
    }
  });
});
