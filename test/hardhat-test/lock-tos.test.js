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
  let admin, user1, user2;
  let tos;
  let lockTOS;
  const user1LockInfo = [];
  const user2LockInfo = [];

  const tosAmount = 1000000000;
  before(async () => {
    const addresses = await getAddresses();
    admin = await findSigner(addresses[0]);
    user1 = await findSigner(addresses[1]);
    user2 = await findSigner(addresses[2]);
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
    await (await tos.connect(admin).mint(user1.address, tosAmount)).wait();
    await (await tos.connect(admin).mint(user2.address, tosAmount)).wait();
    expect(await tos.balanceOf(user1.address)).to.be.equal(tosAmount);
    expect(await tos.balanceOf(user2.address)).to.be.equal(tosAmount);
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
    const startTime = await time.latest();
    const endTime = startTime + lockedDuration;
    await approve(user, lockedAmount);
    await createLock(user, lockedAmount, endTime);
    return { startTime, endTime, lockedAmount };
  };

  it("should create locks for user1", async function () {
    user1LockInfo.push(
      await generateCreateProcess({
        user: user1,
        lockedAmount: 300000000,
        lockedDuration: time.duration.weeks(20),
      })
    );
    user1LockInfo.push(
      await generateCreateProcess({
        user: user1,
        lockedAmount: 300000000,
        lockedDuration: time.duration.weeks(5),
      })
    );
    user1LockInfo.push(
      await generateCreateProcess({
        user: user1,
        lockedAmount: 300000000,
        lockedDuration: time.duration.weeks(30),
      })
    );
  });

  it("should create locks for user2", async function () {
    user2LockInfo.push(
      await generateCreateProcess({
        user: user2,
        lockedAmount: 300000000,
        lockedDuration: time.duration.weeks(25),
      })
    );
    user2LockInfo.push(
      await generateCreateProcess({
        user: user2,
        lockedAmount: 400000000,
        lockedDuration: time.duration.weeks(25),
      })
    );
  });

  it("should check vote weights now of user1", async function () {
    const totalVoteWeight = await lockTOS.voteWeightOf(user1.address);
    const locksOf = await lockTOS.locksOf(user1.address);
    for (let i = 0; i < locksOf.length; ++i) {
      user1LockInfo[i].lockId = locksOf[i];
    }

    console.log("Current time: ", (await time.latest()).toString());
    console.log("User1 total: ", totalVoteWeight.toString());
    for (const info of user1LockInfo) {
      const { lockId } = info;
      const voteWeight = await lockTOS.voteWeightOfLock(user1.address, lockId);
      console.log(`Vote Weight: ${voteWeight.toString()}, LockId: ${lockId}`);
    }
  });

  it("should check vote weights now of user2", async function () {
    const totalVoteWeight = await lockTOS.voteWeightOf(user2.address);
    const locksOf = await lockTOS.locksOf(user2.address);
    for (let i = 0; i < locksOf.length; ++i) {
      user2LockInfo[i].lockId = locksOf[i];
    }

    console.log("Current time: ", (await time.latest()).toString());
    console.log("User1 total: ", totalVoteWeight.toString());
    for (const info of user2LockInfo) {
      const { lockId } = info;
      const voteWeight = await lockTOS.voteWeightOfLock(user2.address, lockId);
      console.log(`Vote Weight: ${voteWeight.toString()}, LockId: ${lockId}`);
    }
  });

  it("should check total vote weights now", async function () {
    const totalVoteWeight = await lockTOS.totalVoteWeight();
    console.log("Total vote weight: ", totalVoteWeight);
  });

  it("should change time and check vote weights", async function () {
    for (const info of user1LockInfo) {
      const { lockId } = info;
      const voteWeight = await lockTOS.voteWeightOfLock(user1.address, lockId);
      await time.increaseTo();

      console.log(`Vote Weight: ${voteWeight.toString()}, LockId: ${lockId}`);
    }
  });
});
