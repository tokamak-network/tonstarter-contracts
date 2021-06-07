const { ether, wei, time, expectEvent } = require("@openzeppelin/test-helpers");
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
const {
  ICO20Contracts,
  initialTotal,
  Pharse1_TON_Staking,
  Pharse1_ETH_Staking,
  Pharse1_FLDETHLP_Staking,
  Pharse1_DEV_Mining,
  HASH_Pharse1_TON_Staking,
  HASH_Pharse1_ETH_Staking,
  HASH_Pharse1_FLDETHLP_Staking,
  HASH_Pharse1_DEV_Mining
  } = require("../utils/ico_test_deploy.js");

let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
// ------------------------
const Stake1Vault = contract.fromArtifact("Stake1Vault");
const StakeTON = contract.fromArtifact("StakeTON");
const IERC20 = contract.fromArtifact("IERC20");
// ----------------------

const saleStartBlock = 0;
let salePeriod = (60 * 60 * 24 * 14) / 13;
let stakePeriod = (60 * 60 * 24 * 30) / 13;
salePeriod = parseInt(salePeriod);
stakePeriod = parseInt(stakePeriod);

const zeroAddress = "0x0000000000000000000000000000000000000000";

const logFlag = 0;

describe("StakeSimple : Stake with ETH", function () {
  let weth, fld, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth,
    vault_phase1_ton,
    vault_phase1_fldethlp,
    vault_phase1_dev;

  let stakeEntry;

  let a1, a2, tokenInfo;
  const sendAmount = "1";
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const userPrivate2 = privateKeys[2];

  const testStakingPeriodBlocks = [50, 100];
  const testStakingUsers = [user1, user2];
  const testUser1StakingAmount = ["100", "20"];
  const testUser2StakingAmount = ["50", "100"];
  const testClaimBlock = [10, 60];

  let salePeriod = 50;
  let stakingPeriod = 100;

  let saleStartBlock = 0;
  let stakeStartBlock = 0;
  let stakeEndBlock = 0;
  let stakeAddresses;

  before(async function () {
    this.timeout(1000000);
    ico20Contracts = new ICO20Contracts();
  });

  describe('# 1. Pre-requisite Setting', async function () {
    it("ico20Contracts init  ", async function () {
      this.timeout(1000000);
      ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
        defaultSender
      );
    });
    it("tokamakContracts init  ", async function () {
      this.timeout(1000000);
      TokamakContractsDeployed =
        await ico20Contracts.initializePlasmaEvmContracts(defaultSender);
    });

    it('Set StakeProxy  ', async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntry(defaultSender);
      if (logFlag) console.log('StakeProxy', stakeEntry.address);

      const cons = await ico20Contracts.getICOContracts();
      fld = cons.fld;
      stakeregister = cons.stakeregister;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;
    });

  });

  describe('# 2. Vault & StakeContract Setting', async function () {
    it("1. Create Vault", async function () {
      const current = await time.latestBlock();
      saleStartBlock = 100;
      saleStartBlock = parseInt(saleStartBlock.toString());
      saleStartBlock = saleStartBlock + salePeriod;
      stakeStartBlock = saleStartBlock + stakingPeriod;

      if (logFlag) {
        console.log(`\n\nCurrent block: ${current} `);
        console.log(" saleStartBlock ", saleStartBlock);
        console.log(" stakeStartBlock ", stakeStartBlock);
        console.log(" Pharse1_ETH_Staking ", Pharse1_ETH_Staking);
      }

      const tx = await stakeEntry.createVault(
        zeroAddress,
        utils.parseUnits(Pharse1_ETH_Staking, 18),
        toBN(saleStartBlock),
        toBN(stakeStartBlock),
        toBN("1"),
        HASH_Pharse1_ETH_Staking,
        toBN("1"),
        zeroAddress,
        { from: defaultSender }
      );

      const vaultAddress = tx.receipt.logs[tx.receipt.logs.length - 1].args.vault;
      vault_phase1_eth = await Stake1Vault.at(vaultAddress, {
        from: defaultSender,
      });
      await fld.mint(
        vault_phase1_eth.address,
        utils.parseUnits(Pharse1_ETH_Staking, 18),
        { from: defaultSender }
      );
    });

    it("2. createStakeContract ", async function () {
      for (let i = 0; i < testStakingPeriodBlocks.length; i++) {
        //console.log('createStakeContract period ',i,testStakingPeriodBlocks[i]);

        await stakeEntry.createStakeContract(
          toBN("1"),
          vault_phase1_eth.address,
          fld.address,
          zeroAddress,
          toBN(testStakingPeriodBlocks[i] + ""),
          "PHASE1_ETH_" + testStakingPeriodBlocks[i] + "_BLOCKS",
          { from: defaultSender }
        );
      }
      stakeAddresses = await stakeEntry.stakeContractsOfVault(
        vault_phase1_eth.address
      );
    });
  });

  describe('# 3. Function Test For Sale ', async function () {
    it("1. If the sale period does not start, staking will fail.", async function () {
      const stakeContract = await StakeTON.at(stakeAddresses[0]);
      await expect(
        stakeContract.sendTransaction({
          from: user1,
          value: toWei(testUser1StakingAmount[0], "ether"),
        })
      ).to.be.revertedWith("StakeSimple: period is not allowed");
    });

    it("2. If the sales period does not start, the sales closing function fails.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: Before stakeStartBlock");
    });

  });

  describe('# 4. Function Test For Staking ', async function () {
    it("1. If during the sale period and staking has not started yet, then Ether is staked.", async function () {

      this.timeout(1000000);

      let currentBlockTime = parseInt(saleStartBlock);
      await time.advanceBlockTo(currentBlockTime);
      for (let i = 0; i < stakeAddresses.length; i++) {
        stakeContractAddress = stakeAddresses[i];
        if (stakeContractAddress != null) {
          const stakeContract = await StakeTON.at(stakeContractAddress);
          if (logFlag) {
            console.log('\n ---- Stake ETH ',i );
            console.log('Stake',i,' User1 :', testUser1StakingAmount[i] );
            console.log('Stake',i,' User2 :', testUser2StakingAmount[i] );
          }

          await stakeContract.sendTransaction({
            from: user1,
            value: toWei(testUser1StakingAmount[i], "ether"),
          });

          let stakedInfo = await stakeContract.getUserStaked(user1);

          await expect(toBN(stakedInfo.amount)).to.be.bignumber.equal(toBN(testUser1StakingAmount[i]).mul(toBN(10**18)));

          await stakeContract.sendTransaction({
            from: user2,
            value: toWei(testUser2StakingAmount[i], "ether"),
          });
          stakedInfo = await stakeContract.getUserStaked(user2);

          await expect(toBN(stakedInfo.amount)).to.be.bignumber.equal(toBN(testUser2StakingAmount[i]).mul(toBN(10**18)));

          if (logFlag)
          await ico20Contracts.logStake(stakeContractAddress, user1, user2);
        }
      }
    });

    it("2. If the sales period is not over, the sales closing function will fail.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: Before stakeStartBlock");
    });

    it("3. Ether staking is not allowed after the sale period is over.", async function () {
      this.timeout(1000000);
      let currentBlockTime = parseInt(stakeStartBlock);
      await time.advanceBlockTo(currentBlockTime);
      const stakeContract = await StakeTON.at(stakeAddresses[0]);
      await expect(
        stakeContract.sendTransaction({
          from: user1,
          value: toWei(testUser1StakingAmount[0], "ether"),
        })
      ).to.be.revertedWith("StakeSimple: period is not allowed");
    });

    it("4. If the sales closing function is not performed, the reward claim will fail.", async function () {
      const stakeContract = await StakeTON.at(stakeAddresses[0]);
      await expect(
        stakeContract.claim({ from: testStakingUsers[0] })
      ).to.be.revertedWith("StakeSimple: not closed");
    });

    it("5. When the sales period is over, the sales closing function can be performed.", async function () {
      await stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 });

      if (logFlag) {
        await ico20Contracts.logVault(vault_phase1_eth.address);
      }
    });


    it("6. The sales closing function can be performed only once.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: already closed");
    });

  });

  describe('# 5. Function Test1 For Withdraw ', async function () {
    it("1. cannot withdraw unless the staking deadline has passed.", async function () {
      let current = await time.latestBlock();
      if (logFlag)
      console.log(`\n\n Current block: ${current} `);
      let i = 0;
      const stakeContract1 = await StakeTON.at(stakeAddresses[i]);
      await expect(
        stakeContract1.withdraw({ from: user1 })
      ).to.be.revertedWith("StakeSimple: not end");
    });
  });

  describe('# 6. Function Test For Claim ', async function () {
    it("1. You can claim a reward after the sales closing function is performed", async function () {
      this.timeout(1000000);
      for (let i = 0; i < 2; i++) {
        let block = stakeStartBlock + testClaimBlock[i] ;
        await time.advanceBlockTo(block-1);

        if (logFlag) console.log(`\n ====== delay blocks for test :`);
        if (stakeAddresses.length > 0) {
          for (let j = 0; j < stakeAddresses.length; j++) {
            if (logFlag) console.log(`\n ----  StakeContract:`, j);
            let stakeContract = await StakeTON.at(stakeAddresses[j]);
            const prevRewardClaimedTotal = await stakeContract.rewardClaimedTotal();
            let sum = toBN(prevRewardClaimedTotal.toString());

            for (let u = 0; u < 2; u++) {
              if (logFlag){
                console.log(`\n ------- ClaimBlcok:`, block);
                console.log("\n testStakingUsers : ", u, testStakingUsers[u]);
              }

              let reward = await stakeContract.canRewardAmount(
                testStakingUsers[u], block
              );

              if (reward.gt(toBN("0"))) {
                let fldBalance1 = await fld.balanceOf(testStakingUsers[u]);
                if (logFlag)
                  console.log(
                    ` pre claim -> fldBalance1 :  `,
                    fromWei(fldBalance1.toString(), "ether")
                  );

                let tx = await stakeContract.claim({ from: testStakingUsers[u] });
                block++;
                sum = sum.add(toBN(reward.toString()));

                if (logFlag)
                  console.log(
                    ` tx.receipt.logs :  `,
                    tx.receipt.logs[0].event,
                    //tx.receipt.logs[0].args.from,
                    fromWei(tx.receipt.logs[0].args.amount.toString(),'ether'),
                    tx.receipt.logs[0].args.claimBlock.toString()
                  );

                let fldBalance2 = await fld.balanceOf(testStakingUsers[u]);
                if (logFlag)
                  console.log(
                    ` after claim -> fldBalance2 :  `,
                    fromWei(fldBalance2.toString(), "ether")
                  );
                await expect(reward.add(fldBalance1)).to.be.bignumber.equal(fldBalance2);

                let rewardClaimedTotal =
                  await stakeContract.rewardClaimedTotal();

                await expect(sum.toString()).to.be.bignumber.equal(toBN(rewardClaimedTotal).toString());

                if (logFlag)
                  console.log(
                    `after claim -> stakeContract rewardClaimedTotal :  `,
                    fromWei(rewardClaimedTotal.toString(), "ether")
                  );
                if (logFlag)
                  await ico20Contracts.logUserStaked(
                    stakeAddresses[j],
                    testStakingUsers[u],
                    "user1"
                  );
              }
            }
          }
        }
      }
    });
  });

  describe('# 7. Function Test2 For withdraw ', async function () {
    it('1. can withdraw after the staking end block is passed. ', async function () {
      this.timeout(1000000);
      stakeEndBlock = await vault_phase1_eth.stakeEndBlock();
      stakeEndBlock = parseInt(stakeEndBlock.toString())+1;
      await time.advanceBlockTo(stakeEndBlock-1);
      if(logFlag) console.log(`\n Withdrawal block: ${stakeEndBlock} `);

      for (let i = 0; i < stakeAddresses.length; i++) {
        //if (logFlag) console.log('\n  ************* withdraw : ', i, stakeAddresses[i]);
        const stakeContract1 = await StakeTON.at(stakeAddresses[i]);
        let payTokenBalance1 = await web3.eth.getBalance(user1);
        if (logFlag){
          console.log('\n user1\'s payTokenBalance1:', fromWei(payTokenBalance1.toString(), 'ether'));
          await ico20Contracts.logUserStaked(stakeAddresses[i], user1, 'user1 pre withdraw');
        }

        await stakeContract1.withdraw({ from: user1 });
        stakeEndBlock++;

        const payTokenBalance2 = await web3.eth.getBalance(user1);

        let userStaked = await stakeContract1.getUserStaked(user1);
        await expect(toBN(userStaked.amount).add(toBN(payTokenBalance1))).to.be.bignumber.above(toBN(payTokenBalance2));
        await expect(payTokenBalance2).to.be.bignumber.above(payTokenBalance1);

        if (logFlag){
          console.log('\n user1\'s payTokenBalance2:', fromWei(payTokenBalance2.toString(), 'ether'));
          await ico20Contracts.logUserStaked(stakeAddresses[i], user1, 'user1 after withdraw');
        }

      }
    });
  });

});
