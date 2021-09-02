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
  let tos;
  let lockTOS;
  const user1LockInfo = [];
  const user2LockInfo = [];
  const tosAmount = 1000000000;
  const epochUnit = parseInt(time.duration.weeks(1));
  const maxTime = epochUnit * 156;

  // Helper functions
  before(async () => {
    const addresses = await getAddresses();
    admin = await findSigner(addresses[0]);
    user1 = await findSigner(addresses[1]);
    user2 = await findSigner(addresses[2]);
    testerAddress = addresses[1];
  });

  it("Initialize TOS", async function () {
    this.timeout(1000000);
    const TOS = await ethers.getContractFactory("TOS");
    tos = await TOS.deploy(name, symbol, version);
    await tos.deployed();
  });

  it("Deploy LockTOS", async function () {
    const now = parseInt(Date.now() / 1000);
    console.log("now", now);

    const lockTOSImpl = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy();
    await lockTOSImpl.deployed();

    const lockTOSProxy = await (
      await ethers.getContractFactory("LockTOSProxy")
    ).deploy(lockTOSImpl.address, admin.address);
    await lockTOSProxy.deployed();
    console.log("here");
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

  it("mint TOS to users", async function () {
    await (await tos.connect(admin).mint(user1.address, tosAmount)).wait();
    await (await tos.connect(admin).mint(user2.address, tosAmount)).wait();
    expect(await tos.balanceOf(user1.address)).to.be.equal(tosAmount);
    expect(await tos.balanceOf(user2.address)).to.be.equal(tosAmount);
  });

  it("should create locks for users", async function () {
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
  });

  it("should check total supply now", async function () {
    const now =
      Math.floor(parseInt(await lockTOS.getCurrentTime()) / epochUnit) *
      epochUnit;
    ethers.provider.send("evm_increaseTime", [epochUnit * 20]); // add 60 seconds
    ethers.provider.send("evm_mine"); // mine the next block

    await (await lockTOS.connect(admin).globalCheckpoint()).wait();

    const lastTime = now + epochUnit * 15;
    for (let cur = now; cur <= lastTime; cur += epochUnit) {
      const totalSupplyAt = parseInt(await lockTOS.totalSupplyAt(cur));
      let user1BalanceSum = 0;
      for (const { lockId } of user1LockInfo) {
        const lockBalance = parseInt(
          await lockTOS.balanceOfLockAt(lockId, cur)
        );
        user1BalanceSum += lockBalance;
      }
      expect(user1BalanceSum).to.be.equal(
        parseInt(await lockTOS.balanceOfAt(user1.address, cur))
      );

      let user2BalanceSum = 0;
      for (const { lockId } of user2LockInfo) {
        const lockBalance = parseInt(
          await lockTOS.balanceOfLockAt(lockId, cur)
        );
        user2BalanceSum += lockBalance;
      }
      expect(user2BalanceSum).to.be.equal(
        parseInt(await lockTOS.balanceOfAt(user2.address, cur))
      );

      expect(totalSupplyAt).to.be.closeTo(
        user1BalanceSum + user2BalanceSum,
        10
      );
    }

    // const makeInt = (arr) => {
    //   const newArr = [];
    //   for (const obj of arr) {
    //     const newObj = {};
    //     for (const key of Object.keys(obj)) {
    //       newObj[key] = parseInt(obj[key]);
    //     }
    //     newArr.push(newObj);
    //   }
    //   return newArr;
    // };
    // const pointHistory = makeInt(await lockTOS.allPointHistory());
    // console.log({ pointHistory });
  });
});
