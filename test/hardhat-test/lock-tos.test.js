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

  const lockedAmount = 1000000000;
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
    const currentTime = await time.latest();
    lockTOS = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy(tos.address, currentTime + 10000);
    await lockTOS.deployed();
  });

  it("mint TOS to users", async function () {
    await (await tos.connect(admin).mint(user1.address, lockedAmount)).wait();
    await (await tos.connect(admin).mint(user2.address, lockedAmount)).wait();
    expect(await tos.balanceOf(user1.address)).to.be.equal(lockedAmount);
    expect(await tos.balanceOf(user2.address)).to.be.equal(lockedAmount);
  });

  it("should create locks", async function () {
    const currentTime = await time.latest();
    await (
      await tos.connect(user1).approve(lockTOS.address, lockedAmount)
    ).wait();
    await (
      await lockTOS.connect(user1).createLock(lockedAmount, currentTime + 10000)
    ).wait();
  });

  it("should check vote weights", async function () {
    for (let i = 0; i < 5; ++i) {
      const voteWeight = await lockTOS.voteWeightOf(user1.address);
      const currentTime = await time.latest();
      console.log(
        `Number: ${i} -- Vote Weight: ${voteWeight} -- Time: ${currentTime}`
      );
      await ethers.provider.send("evm_mine");
    }
  });
});
