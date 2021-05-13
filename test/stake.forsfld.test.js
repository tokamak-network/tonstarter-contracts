const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require("ethers");
const BigNumber = ethers.BigNumber; // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils;

const {
  defaultSender,
  accounts,
  contract,
  web3,
  privateKeys,
} = require("@openzeppelin/test-environment");

// const { expectEvent } = require('openzeppelin-test-helpers');

const BN = require("bn.js");

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { expect } = chai;
chai.use(require("chai-bn")(BN));
chai.use(solidity);
require("chai").should();

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

const { getSignature, signatureVaildTime, timeout } = require("./common");

// ------------------------
const ICO20Contracts = require("../utils/ico_test_deploy.js");
let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
// ------------------------
const StakeForSFLD = contract.fromArtifact("StakeForSFLD");
// ----------------------

const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");

const logFlag = true;

describe("StakeForSFLD ", function () {
  let fld, sfld, stakeFroSFLD;

  const testStakingUsers = [accounts[0], accounts[1]];
  const testStakingUserPrivateKeys = [privateKeys[0], privateKeys[1]];
  const testStakingUserNames = ["user1", "user2"];

  const testUser1StakingAmount = ["10", "5"];
  const testUser2StakingAmount = ["10", "20"];
  const testClaimBlock = [5, 10, 5, 5];

  let testStartBlock = 0;
  let test1Blocks = 60 * 60 * 24 * 14; // 2 weeks
  test1Blocks = parseInt(test1Blocks / 13);
  let test2Blocks = 60 * 60 * 24 * 30; // 2 weeks
  test2Blocks = parseInt(test2Blocks / 13);
  test1Blocks = 20;
  test2Blocks = 40;
  const testPeriodBlocks = [test1Blocks + "", test2Blocks + ""];
  const testRewardRatio = [2, 4];

  //stakeForSFLDs
  let stakeForSFLDs = null;

  const sendAmountForTest = "100";

  before(async function () {
    ico20Contracts = new ICO20Contracts();
  });

  it("ico20Contracts init  ", async function () {
    this.timeout(1000000);
    ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
      defaultSender
    );

    //get ICOContracts
    const cons = await ico20Contracts.getICOContracts();
    fld = cons.fld;
    sfld = cons.sfld;
  });

  it("mint fld to tester for testing  ", async function () {
    testStakingUsers.forEach(async (user) => {
      await fld.mint(user, utils.parseUnits(sendAmountForTest, 18), {
        from: defaultSender,
      });
    });
  });

  it("create StakeForSFLD  ", async function () {
    const current = await time.latestBlock();
    let testStartBlock = current;
    testStartBlock = parseInt(testStartBlock.toString()) + 4;
    // console.log('testStartBlock',testStartBlock);
    stakeForSFLDs = await ico20Contracts.createStaekForSFLD(
      toBN(testStartBlock),
      defaultSender
    );

    for (let i = 0; i < testPeriodBlocks.length; i++) {
      await stakeForSFLDs.addRewardRatio(
        toBN(testPeriodBlocks[i]),
        toBN(testRewardRatio[i]),
        { from: defaultSender }
      );
      //let rewardRatio= await stakeForSFLDs.rewardRatio(toBN(testPeriodBlocks[i]));
      expect(
        await stakeForSFLDs.rewardRatio(toBN(testPeriodBlocks[i]))
      ).to.be.bignumber.equal(toBN(testRewardRatio[i]));
    }
  });

  it("stake  ", async function () {
    this.timeout(1000000);
    for (let index = 0; index < testStakingUsers.length; index++) {
      let user = testStakingUsers[index];
      let userName = testStakingUserNames[index];
      let rewardBlocks0 = await stakeForSFLDs.rewardRatio(
        toBN(testPeriodBlocks[0])
      );
      console.log(
        "rewardBlocks: ",
        testPeriodBlocks[0],
        rewardBlocks0.toString()
      );
      let rewardBlocks1 = await stakeForSFLDs.rewardRatio(
        toBN(testPeriodBlocks[1])
      );
      console.log(
        "rewardBlocks: ",
        testPeriodBlocks[1],
        rewardBlocks1.toString()
      );

      for (let i = 0; i < testPeriodBlocks.length; i++) {
        let nowCurrent = await time.latestBlock();

        let startBlock = await stakeForSFLDs.startBlock();

        while (startBlock.gt(nowCurrent)) {
          nowCurrent = parseInt(nowCurrent.toString());
          await time.advanceBlockTo(nowCurrent + 3);
          nowCurrent = await time.latestBlock();
          if (logFlag) console.log(`\n\nCurrent block: ${nowCurrent} `);
          await timeout(13);
        }

        let stakeAmount = testUser1StakingAmount[index];
        if (index == 2) stakeAmount = testUser2StakingAmount[index];

        let value = toWei(stakeAmount, "ether");
        let deadline = Date.now() / 1000 + signatureVaildTime;
        deadline = parseInt(deadline);
        let owner = user;
        let ownerPrivate = testStakingUserPrivateKeys[index];
        let spender = stakeForSFLDs.address;
        let sig = await getSignature(
          ownerPrivate,
          owner,
          spender,
          value,
          deadline
        );

        console.log("value ", value.toString());
        //console.log('testPeriodBlocks[i] ', i, testPeriodBlocks[i]);
        // console.log('deadline ', deadline);
        // console.log('sig ', sig);
        let tx = await stakeForSFLDs.stake(
          value,
          toBN(testPeriodBlocks[i]),
          toBN(deadline),
          sig,
          { from: owner }
        );

        // staking amount of user
        if (logFlag) await logUserStaked(stakeForSFLDs.address, user, userName);
      }
    }
  });

  it("claim ", async function () {
    this.timeout(1000000);
    await timeout(13);
    let nowCurrent = await time.latestBlock();
    nowCurrent = parseInt(nowCurrent.toString());
    await time.advanceBlockTo(nowCurrent + 5);

    for (let index = 0; index < testStakingUsers.length; index++) {
      let user = testStakingUsers[index];
      let userName = testStakingUserNames[index];

      for (let i = 0; i < testPeriodBlocks.length; i++) {
        if (logFlag) console.log(`\n\nClaim Current block: ${nowCurrent} `);

        if (logFlag) console.log("\n ---- StakingForSFLD: ", i, user);

        let sfldBalance = await sfld.balanceOf(user);
        if (logFlag)
          console.log(
            `\sfldBalance Pre claim:`,
            utils.formatUnits(sfldBalance.toString(), 18)
          );

        await stakeForSFLDs.claim({ from: user });

        sfldBalance = await sfld.balanceOf(user);
        if (logFlag)
          console.log(
            `\sfldBalance After claim:`,
            utils.formatUnits(sfldBalance.toString(), 18)
          );

        if (logFlag) await logUserStaked(stakeForSFLDs.address, user, userName);
      }
    }
  });

  it("claim after end period", async function () {
    this.timeout(1000000);
    await timeout(13);
    let nowCurrent = await time.latestBlock();
    nowCurrent = parseInt(nowCurrent.toString());
    await time.advanceBlockTo(nowCurrent + 5);

    for (let index = 0; index < testStakingUsers.length; index++) {
      let user = testStakingUsers[index];
      let userName = testStakingUserNames[index];

      let userStaked = await stakeForSFLDs.userStaked(user, { from: user });
      let endBlock = userStaked.startBlock.add(userStaked.periodBlock);

      nowCurrent = await time.latestBlock();
      while (endBlock.gt(nowCurrent)) {
        nowCurrent = parseInt(nowCurrent.toString());
        await time.advanceBlockTo(nowCurrent + 6);
        nowCurrent = await time.latestBlock();
        if (logFlag) console.log(`\n\nCurrent block: ${nowCurrent} `);
        await timeout(13);
      }

      if (logFlag)
        console.log(
          `\n\n Claim Current block After end period : ${nowCurrent} `
        );

      if (logFlag) console.log("\n ---- StakingForSFLD: ", user);

      let sfldBalance = await sfld.balanceOf(user);
      if (logFlag)
        console.log(
          `\sfldBalance Pre claim:`,
          utils.formatUnits(sfldBalance.toString(), 18)
        );

      await stakeForSFLDs.claim({ from: user });

      sfldBalance = await sfld.balanceOf(user);
      if (logFlag)
        console.log(
          `\sfldBalance After claim:`,
          utils.formatUnits(sfldBalance.toString(), 18)
        );

      if (logFlag) await logUserStaked(stakeForSFLDs.address, user, userName);
    }
  });

  it("withdraw  ", async function () {
    this.timeout(1000000);
    await timeout(13);
    let nowCurrent = await time.latestBlock();
    nowCurrent = parseInt(nowCurrent.toString());
    await time.advanceBlockTo(nowCurrent + 5);

    for (let index = 0; index < testStakingUsers.length; index++) {
      let user = testStakingUsers[index];
      let userName = testStakingUserNames[index];

      let userStaked = await stakeForSFLDs.userStaked(user, { from: user });
      let endBlock = userStaked.startBlock.add(userStaked.periodBlock);

      nowCurrent = await time.latestBlock();
      while (endBlock.gt(nowCurrent)) {
        nowCurrent = parseInt(nowCurrent.toString());
        await time.advanceBlockTo(nowCurrent + 6);
        nowCurrent = await time.latestBlock();
        if (logFlag) console.log(`\n\nCurrent block: ${nowCurrent} `);
        await timeout(13);
      }

      if (logFlag)
        console.log(`\n\n ---- Withdraw Current Block: ${nowCurrent} `);

      if (logFlag) console.log("\n ---- StakingForSFLD: ", user);

      let fldBalance = await fld.balanceOf(user);
      if (logFlag)
        console.log(
          `\n fldBalance :`,
          utils.formatUnits(fldBalance.toString(), 18)
        );

      let sfldBalance = await sfld.balanceOf(user);
      if (logFlag)
        console.log(
          `\n sfldBalance :`,
          utils.formatUnits(sfldBalance.toString(), 18)
        );

      let value = toWei(sfldBalance.toString(), "ether");
      let deadline = Date.now() / 1000 + signatureVaildTime;
      deadline = parseInt(deadline);
      let owner = user;
      let ownerPrivate = testStakingUserPrivateKeys[index];
      let spender = stakeForSFLDs.address;
      let sig = await getSignature(
        ownerPrivate,
        owner,
        spender,
        sfldBalance,
        deadline
      );

      await stakeForSFLDs.withdraw(sfldBalance, toBN(deadline), sig, {
        from: user,
      });

      fldBalance = await fld.balanceOf(user);
      if (logFlag)
        console.log(
          `\n fldBalance After claim:`,
          utils.formatUnits(fldBalance.toString(), 18)
        );
    }
  });

  async function logUserStaked(_contract, _user, username) {
    console.log(
      "\n\n*********** logUserStaked [",
      _contract,
      "]",
      username,
      _user
    );
    const stakeContract = await StakeForSFLD.at(_contract);
    let userStaked = await stakeContract.userStaked(_user);
    console.log("amount", utils.formatUnits(userStaked.amount.toString(), 18));
    console.log("startBlock", userStaked.startBlock.toString());
    console.log("periodBlock", userStaked.periodBlock.toString());
    console.log(
      "rewardPerBlock",
      utils.formatUnits(userStaked.rewardPerBlock.toString(), 18)
    );
    console.log("claimedBlock", userStaked.claimedBlock.toString());
    console.log(
      "claimedAmount",
      utils.formatUnits(userStaked.claimedAmount.toString(), 18)
    );
    console.log("releasedBlock", userStaked.releasedBlock.toString());
    console.log(
      "releasedAmount",
      utils.formatUnits(userStaked.releasedAmount.toString(), 18)
    );
  }
});
