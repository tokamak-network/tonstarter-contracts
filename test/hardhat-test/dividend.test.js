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
  let lockTOS, dividend; // contracts
  let admin, user1, user2; // users
  let tos, ton; // coins
  const userLockInfo = [];
  const tosAmount = 1000000000;

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

  it("Deploy LockTOS & LockTOSDividen", async function () {
    phase3StartTime = (await time.latest()) + time.duration.weeks(10);
    lockTOS = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy(tos.address, phase3StartTime);
    await lockTOS.deployed();

    dividend = await (
      await ethers.getContractFactory("LockTOSDividend")
    ).deploy(lockTOS.address);
    await dividend.deployed();
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
    initialTime = parseInt(await time.latest());
    console.log({ initialTime });

    const distributions = [
      { amount: 5000000, account: admin, weekIncrease: 0 },
      { amount: 6000000, account: admin, weekIncrease: 2 },
      { amount: 4000000, account: admin, weekIncrease: 3 },
      { amount: 3000000, account: admin, weekIncrease: 5 },
    ];
    for (const { amount, account, weekIncrease } of distributions) {
      if (weekIncrease) {
        await time.increase(time.duration.weeks(weekIncrease));
      }
      await approveTON(account, amount);

      const timestamp = parseInt(await time.latest());
      await distributeTON(account, amount);
    }
  });

  it("should check tokens per week", async function () {
    const now = parseInt(await time.latest());
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
      currentTime += parseInt(time.duration.weeks(1)), i += 1
    ) {
      const tokensPerWeek = parseInt(
        await dividend.tokensPerWeekAt(ton.address, currentTime)
      );
      //  console.log({ tokensPerWeek });
      expect(tokensPerWeek).to.be.equal(expected[i].tokensPerWeek);
      const acc = 0;
      for (const { account } of accounts) {
        const claimable = parseInt(
          await dividend
            .connect(account)
            .claimableForPeriod(
              ton.address,
              currentTime - parseInt(time.duration.days(5)),
              currentTime + parseInt(time.duration.days(5))
            )
        );
        // console.log({ currentTime });
        console.log({ claimable });
      }
      console.log("");
    }
  });

  it("should claim for a user", async function () {
    await dividend.connect(user1).claim(ton.address);
    console.log(parseInt(await ton.balanceOf(user1.address)));

    await dividend.connect(user2).claim(ton.address);
    console.log(parseInt(await ton.balanceOf(user2.address)));
  });
});
