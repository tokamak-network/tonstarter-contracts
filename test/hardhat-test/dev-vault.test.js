const { expect } = require("chai");
const { time, expectEvent } = require('@openzeppelin/test-helpers');

describe("DeveloperVault", function () {
  let deployer, admin, dev1, dev2, dev3;
  let DeveloperVault;
  let TOS;

  let cap, rewardPeriod, startRewardBlock, claimsNumberMax, developers, amounts;


  // Init
  before(async function () {
    [deployer, admin, dev1, dev2, dev3, unregisteredDev] = await ethers.getSigners();
    const DeveloperVaultContract = await ethers.getContractFactory("DeveloperVault");
    DeveloperVault = await DeveloperVaultContract.connect(deployer).deploy(admin.address);
    await DeveloperVault.deployed();

    const TOSContract = await ethers.getContractFactory("TOS");
    TOS = await TOSContract.connect(deployer).deploy();
    await TOS.deployed();
    await TOS.connect(deployer).mint(DeveloperVault.address, "10000000");
  });

  it("should initialize vault", async function () {
    cap = "10000000";
    rewardPeriod = "10"; // 10 blocks
    startRewardBlock = (parseInt(await time.latestBlock()) + 10).toString();
    claimsNumberMax = "3";
    developers = [dev1.address, dev2.address, dev3.address];
    amounts = ["10", "3", "5"];
    await DeveloperVault.connect(admin).initialize(
      TOS.address,
      cap,
      rewardPeriod,
      startRewardBlock,
      claimsNumberMax,
      developers,
      amounts,
    );
  });

  it("should claim and fail 1", async function () {
    await expect(
      DeveloperVault.connect(dev1).claimReward()
    ).to.be.revertedWith("Period for reward has not been reached");
    expect(await TOS.balanceOf(dev1.address)).to.equal(0);

    await expect(
      DeveloperVault.connect(dev2).claimReward()
    ).to.be.revertedWith("Period for reward has not been reached");
    expect(await TOS.balanceOf(dev2.address)).to.equal(0);

    await expect(
      DeveloperVault.connect(dev3).claimReward()
    ).to.be.revertedWith("Period for reward has not been reached");
    expect(await TOS.balanceOf(dev3.address)).to.equal(0);
  });

  it("should claim and succeed 1", async function () {
    const currentBlockTime = parseInt(startRewardBlock); // too early to claim reward for second round
    await time.advanceBlockTo(currentBlockTime);

    await DeveloperVault.connect(dev1).claimReward()
    expect(await TOS.balanceOf(dev1.address)).to.equal(10);

    await DeveloperVault.connect(dev2).claimReward()
    expect(await TOS.balanceOf(dev2.address)).to.equal(3);

    await DeveloperVault.connect(dev3).claimReward()
    expect(await TOS.balanceOf(dev3.address)).to.equal(5);
  });

  it("should fail for unregistered account", async function () {
    await expect(
      DeveloperVault.connect(unregisteredDev).claimReward()
    ).to.be.revertedWith("DeveloperVault: developer is not registered");
  });

  it("should claim and fail 2", async function () {
    const currentBlockTime = parseInt(startRewardBlock) + parseInt(rewardPeriod) - 2; // too early to claim reward for second round
    await time.advanceBlockTo(currentBlockTime);

    await expect(
      DeveloperVault.connect(dev1).claimReward()
    ).to.be.revertedWith("Period for reward has not been reached");
    expect(await TOS.balanceOf(dev1.address)).to.equal(10);

    await expect(
      DeveloperVault.connect(dev2).claimReward()
    ).to.be.revertedWith("Period for reward has not been reached");
    expect(await TOS.balanceOf(dev2.address)).to.equal(3);

    await expect(
      DeveloperVault.connect(dev3).claimReward()
    ).to.be.revertedWith("Period for reward has not been reached");
    expect(await TOS.balanceOf(dev3.address)).to.equal(5);
  });

  it("should claim and succeed 2", async function () {
    await time.advanceBlockTo(parseInt(startRewardBlock) + parseInt(rewardPeriod));

    await DeveloperVault.connect(dev1).claimReward()
    expect(await TOS.balanceOf(dev1.address)).to.equal(20);

    await DeveloperVault.connect(dev2).claimReward()
    expect(await TOS.balanceOf(dev2.address)).to.equal(6);
  });

  it("should claim and succeed 3", async function () {
    await time.advanceBlockTo(parseInt(startRewardBlock) + 2 * parseInt(rewardPeriod));

    await DeveloperVault.connect(dev1).claimReward();
    expect(await TOS.balanceOf(dev1.address)).to.equal(30);

    await DeveloperVault.connect(dev2).claimReward();
    expect(await TOS.balanceOf(dev2.address)).to.equal(9);

    await DeveloperVault.connect(dev3).claimReward(); // receive last 2 periods rewards at once
    expect(await TOS.balanceOf(dev3.address)).to.equal(15);
  });

  it("should claim and fail 3", async function () {
    const currentBlockTime = parseInt(startRewardBlock) + 3 * parseInt(rewardPeriod);
    await time.advanceBlockTo(currentBlockTime);

    await expect(
      DeveloperVault.connect(dev1).claimReward()
    ).to.be.revertedWith("DeveloperVault: number of claims exceeds max");
    expect(await TOS.balanceOf(dev1.address)).to.equal(30);

    await expect(
      DeveloperVault.connect(dev2).claimReward()
    ).to.be.revertedWith("DeveloperVault: number of claims exceeds max");
    expect(await TOS.balanceOf(dev2.address)).to.equal(9);

    await expect(
      DeveloperVault.connect(dev3).claimReward()
    ).to.be.revertedWith("DeveloperVault: number of claims exceeds max");
    expect(await TOS.balanceOf(dev3.address)).to.equal(15);
  });
});
