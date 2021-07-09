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

// const Stake1Vault = contract.fromArtifact("Stake1Vault");
// const StakeTON = contract.fromArtifact("StakeTON");
// const StakeTONProxy = contract.fromArtifact("StakeTONProxy");
// const StakeTONModified = contract.fromArtifact("StakeTONModified");

describe("Stake", function () {
  let admin, user1, user2;
  let tos;
  let lockTOS;

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
    lockTOS = await (
      await ethers.getContractFactory("LockTOS")
    ).deploy(tos.address);
    await lockTOS.deployed();
  });

  it("mint TOS to users", async function () {
    await (await tos.connect(admin).mint(user1.address, 1000000000)).wait();
    await (await tos.connect(admin).mint(user2.address, 1000000000)).wait();
    expect(await tos.balanceOf(user1.address)).to.be.equal(1000000000);
    expect(await tos.balanceOf(user2.address)).to.be.equal(1000000000);
  });

  it("should create locks", async function () {
    const currentTime = await time.latest();
    await (
      await tos.connect(user1).approve(lockTOS.address, 1000000000)
    ).wait();
    await (
      await lockTOS.connect(user1).createLock(1000000000, currentTime + 10000)
    ).wait();
  });

  it("should check vote weights", async function () {
    for (let i = 0; i < 5; ++i) {
      const voteWeight = await lockTOS.voteWeightOf(user1.address);
      console.log(`Number: ${i} -- Vote Weight: ${voteWeight}`);
      await ethers.provider.send("evm_mine");
    }
  });
});
