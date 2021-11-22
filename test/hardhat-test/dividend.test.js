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

const {
  calculateBalanceOfLock,
  calculateBalanceOfUser,
  createLockWithPermit,
} = require("./helpers/lock-tos-helper");

describe("LockTOSDividend", function () {
  const ONE_WEEK = parseInt(time.duration.weeks(1));
  let lockTOS, dividend; // contracts
  let admin, user1, user2; // users
  let tos, ton; // coins
  const userLockInfo = [];
  const tosAmount = 1000000000;
  const epochUnit = parseInt(time.duration.weeks(1));
  const maxTime = epochUnit * 156; // 3 years

  before(async () => {
    const addresses = await getAddresses();
    admin = await findSigner(addresses[0]);
    user1 = await findSigner(addresses[1]);
    user2 = await findSigner(addresses[2]);
  });

  it("Initialize contracts", async function () {
    this.timeout(1000000);
    ({ tos, ton } = await setupContracts(admin.address));
  });

  it("Deploy LockTOS", async function () {
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
    console.log(parseInt(await ton.balanceOf(admin.address)));

    expect(await tos.balanceOf(user1.address)).to.be.equal(tosAmount);
    expect(await tos.balanceOf(user2.address)).to.be.equal(tosAmount);
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

    expect(await ton.balanceOf(user1.address)).to.be.equal(0);
    expect(await ton.balanceOf(user2.address)).to.be.equal(0);
  });

  it("should create locks for user", async function () {
    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user1,
        amount: 100000000,
        unlockWeeks: 5,
      }),
    });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user1,
        amount: 500000000,
        unlockWeeks: 7,
      }),
    });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user2,
        amount: 300000000,
        unlockWeeks: 4,
      }),
    });

    userLockInfo.push({
      lockId: await createLockWithPermit({
        tos,
        lockTOS,
        user: user2,
        amount: 10000000,
        unlockWeeks: 156,
      }),
    });
  });

  const approveTON = async (account, amount) => {
    await (await ton.connect(account).approve(dividend.address, amount)).wait();
  };

  const distributeTON = async (account, amount) => {
    await (
      await dividend.connect(account).distribute(ton.address, amount)
    ).wait();
  };

  let initialTime;
  it("LockTOS stake TOS", async function () {
    initialTime = parseInt(await lockTOS.getCurrentTime());
    console.log({ initialTime });

    const distributions = [
      { amount: 5000000, account: admin, weekIncrease: 0 },
      { amount: 6000000, account: admin, weekIncrease: 2 },
      { amount: 4000000, account: admin, weekIncrease: 3 },
      { amount: 3000000, account: admin, weekIncrease: 5 },
    ];
    for (const { amount, account, weekIncrease } of distributions) {
      if (weekIncrease) {
        // await time.increase(time.duration.weeks(weekIncrease));
        await ethers.provider.send("evm_increaseTime", [
          parseInt(time.duration.weeks(weekIncrease)),
        ]);
        await ethers.provider.send("evm_mine"); // mine the next block
      }
      await approveTON(account, amount);
      await distributeTON(account, amount);
    }
  });

  it("should check tokens per week", async function () {
    const now = parseInt(await lockTOS.getCurrentTime());
    const expected = [
      { tokensPerWeek: 5000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 6000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 4000000 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 0 },
      { tokensPerWeek: 3000000 },
    ];
    const accounts = [{ account: user1 }, { account: user2 }];

    for (
      let currentTime = initialTime, i = 0;
      currentTime <= now;
      currentTime += ONE_WEEK, i += 1
    ) {
      if (await lockTOS.needCheckpoint()) {
        await (await lockTOS.connect(admin).globalCheckpoint()).wait(); // update history
      }

      const tokensPerWeek = parseInt(
        await dividend.tokensPerWeekAt(ton.address, currentTime)
      );
      expect(tokensPerWeek).to.be.equal(expected[i].tokensPerWeek);

      let accum = 0;
      for (const { account } of accounts) {
        const claimable = parseInt(
          await dividend
            .connect(account)
            .claimableForPeriod(
              account.address,
              ton.address,
              currentTime,
              currentTime + ONE_WEEK
            )
        );
        accum += claimable;
      }
      if (expected[i].tokensPerWeek > 0) {
        expect(accum).to.be.closeTo(expected[i].tokensPerWeek, 1000);
      }
    }
  });

  it("should claim for a user", async function () {
    await (await dividend.connect(user1).claim(ton.address)).wait();
    const balance1 = parseInt(await ton.balanceOf(user1.address));

    await (await dividend.connect(user2).claim(ton.address)).wait();
    const balance2 = parseInt(await ton.balanceOf(user2.address));

    const totalAmountDistributed = 5000000 + 6000000 + 4000000 + 3000000;
    expect(balance1 + balance2).to.be.closeTo(totalAmountDistributed, 1000);
  });
});
