// const { BigNumber, utils } = require("ethers")
// const { ethers, upgrades } = require("hardhat")

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
const Stake1Vault = contract.fromArtifact("Stake1Vault");
const Stake1 = contract.fromArtifact("Stake1");
const IERC20 = contract.fromArtifact("IERC20");
// ----------------------

const initialTotal = "10000000000." + "0".repeat(18);
const Pharse1_TON_Staking = "175000000." + "0".repeat(18);
const Pharse1_ETH_Staking = "175000000." + "0".repeat(18);
const Pharse1_FLDETHLP_Staking = "150000000." + "0".repeat(18);
const Pharse1_DEV_Mining = "150000000." + "0".repeat(18);

const HASH_Pharse1_TON_Staking = keccak256("PHASE1_TON_STAKING");
const HASH_Pharse1_ETH_Staking = keccak256("PHASE1_ETH_STAKING");
const HASH_Pharse1_FLDETHLP_Staking = keccak256("PHASE1_FLDETHLP_Staking");
const HASH_Pharse1_DEV_Mining = keccak256("PHASE1_DEV_Mining");

const saleStartBlock = 0;
let salePeriod = (60 * 60 * 24 * 14) / 13;
let stakePeriod = (60 * 60 * 24 * 30) / 13;
salePeriod = parseInt(salePeriod);
stakePeriod = parseInt(stakePeriod);

const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");

const logFlag = true;


describe("Phase1. StakeContract with ETH", function () {
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
  const testClaimBlock = [10, 20, 50, 60];

  let salePeriod = 50;
  let stakingPeriod = 100;

  let saleStartBlock = 0;
  let stakeStartBlock = 0;
  let stakeAddresses;

  before(async function () {
    this.timeout(1000000);
    ico20Contracts = new ICO20Contracts();
  });

  describe('# Global Setting', async function () {
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

    it("Set StakeProxy  ", async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntry(defaultSender);
      if (logFlag) console.log("StakeProxy", stakeEntry.address);

      const cons = await ico20Contracts.getICOContracts();
      fld = cons.fld;
      stakeregister = cons.stakeregister;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;
    });
  });

  describe('# Vault & StakeContract Setting', async function () {
    it("Create Vault", async function () {
      const current = await time.latestBlock();
      saleStartBlock = current;
      saleStartBlock = parseInt(saleStartBlock.toString());
      saleStartBlock = saleStartBlock + salePeriod;
      stakeStartBlock = saleStartBlock + stakingPeriod;

      if (logFlag) {
        console.log(`\n\nCurrent block: ${current} `);
        console.log(" saleStartBlock ", saleStartBlock);
        console.log(" stakeStartBlock ", stakeStartBlock);
      }

      const tx = await stakeEntry.createVault(
        zeroAddress,
        utils.parseUnits(Pharse1_ETH_Staking, 18),
        toBN(saleStartBlock),
        toBN(stakeStartBlock),
        toBN("1"),
        HASH_Pharse1_ETH_Staking,
        toBN("0"),
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

    it("createStakeContract ", async function () {
      for (let i = 0; i < testStakingPeriodBlocks.length; i++) {
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

  describe('# Function Test For Sale ', async function () {
    it("If the sale period does not start, staking will fail.", async function () {
      const stakeContract = await Stake1.at(stakeAddresses[0]);
      await expect(
        stakeContract.sendTransaction({
          from: user1,
          value: toWei(testUser1StakingAmount[0], "ether"),
        })
      ).to.be.revertedWith("Stake1: period is unavailable");
    });

    it("If the sales period does not start, the sales closing function fails.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: closeSale init fail");
    });

    it("If during the sale period and staking has not started yet, then Ether is staked.", async function () {
      let currentBlockTime = parseInt(saleStartBlock);
      await time.advanceBlockTo(currentBlockTime);
      for (let i = 0; i < stakeAddresses.length; i++) {
        stakeContractAddress = stakeAddresses[i];
        if (stakeContractAddress != null) {
          const stakeContract = await Stake1.at(stakeContractAddress);
          console.log('Stake',i,' User1 :', testUser1StakingAmount[i] );
          console.log('Stake',i,' User2 :', testUser2StakingAmount[i] );

          await stakeContract.sendTransaction({
            from: user1,
            value: toWei(testUser1StakingAmount[i], "ether"),
          });

          await stakeContract.sendTransaction({
            from: user2,
            value: toWei(testUser2StakingAmount[i], "ether"),
          });
        }
      }
    });

    it("If the sales period is not over, the sales closing function will fail.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: closeSale init fail");
    });

  });

  describe('# Function Test For Staking ', async function () {
    it("Ether staking is not allowed after the sale period is over.", async function () {
      let currentBlockTime = parseInt(stakeStartBlock);
      await time.advanceBlockTo(currentBlockTime);
      const stakeContract = await Stake1.at(stakeAddresses[0]);
      await expect(
        stakeContract.sendTransaction({
          from: user1,
          value: toWei(testUser1StakingAmount[0], "ether"),
        })
      ).to.be.revertedWith("Stake1: period is unavailable");
    });

    it("If the sales closing function is not performed, the reward claim will fail.", async function () {
      const stakeContract = await Stake1.at(stakeAddresses[0]);
      await expect(
        stakeContract.claim({ from: testStakingUsers[0] })
      ).to.be.revertedWith("Stake1: The sale is not closed");
    });

    it("When the sales period is over, the sales closing function can be performed.", async function () {
      await stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 });
    });

    it("The sales closing function can be performed only once.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_eth.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: sale is already closed");
    });
  });

  describe('# Function Test For Claim ', async function () {
    it("You can claim a reward after the sales closing function is performed", async function () {

      for (let i = 0; i < 1; i++) {

        let testBlcok = stakeStartBlock + testClaimBlock[i] ;
        if (logFlag) console.log(`\n ------- testBlcok:`, testBlcok);
        await time.advanceBlockTo(testBlcok-1);
        let current = await time.latestBlock();
        if (logFlag) console.log(`\n\nCurrent block: ${current} `);

        if (stakeAddresses.length > 0) {
          for (let j = 0; j < 1; j++) {
            let stakeContract = await Stake1.at(stakeAddresses[j]);
            for (let u = 0; u < 1; u++) {
              if (logFlag)
              console.log("\n testStakingUsers[u]: ", u, testStakingUsers[u]);

              let reward = await stakeContract.canRewardAmount(
                testStakingUsers[u]
              );
              if (logFlag) console.log(` \n------- user`, u, testStakingUsers[u]);
              if (logFlag) console.log(` reward:  `, fromWei(reward.toString(), "ether"));

              if (reward.gt(toBN("0"))) {
                let fldBalance1 = await fld.balanceOf(testStakingUsers[u]);
                if (logFlag)
                  console.log(
                    ` pre claim -> fldBalance1 :  `,
                    fromWei(fldBalance1.toString(), "ether")
                  );

                let tx = await stakeContract.claim({ from: testStakingUsers[u] });
                if (logFlag)
                  console.log(
                    ` tx.receipt.logs :  `,
                    tx.receipt.logs[0].event,
                    //tx.receipt.logs[0].args.from,
                    tx.receipt.logs[0].args.amount.toString()
                   // tx.receipt.logs[0].args.currentBlcok.toString()
                  );

                let fldBalance2 = await fld.balanceOf(testStakingUsers[u]);
                if (logFlag)
                  console.log(
                    ` after claim -> fldBalance2 :  `,
                    fromWei(fldBalance2.toString(), "ether")
                  );

                let rewardClaimedTotal2 =
                  await stakeContract.rewardClaimedTotal();
                if (logFlag)
                  console.log(
                    `after claim -> stakeContract rewardClaimedTotal2 :  `,
                    fromWei(rewardClaimedTotal2.toString(), "ether")
                  );
                if (logFlag)
                  await logUserStaked(
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

  describe('# Staking Log', async function () {
    it('Stake Contracts List : Phase1 ', async function () {
      const phases1 = await stakeEntry.vaultsOfPhase(toBN('1'));
      for (let i = 0; i < phases1.length; i++) {
        const phaseVault = phases1[i];
        if (phaseVault != null) {
          console.log('phaseVault ', i, phaseVault);
          const contractsInVault = await stakeEntry.stakeContractsOfVault(phaseVault);
          console.log('contractsInVault ', contractsInVault);
          await logStakeContracts(1, phaseVault);
        }
      }
      const current = await time.latestBlock();
      if (logFlag) console.log(`Current block: ${current} `);
    });
  });
  /*
  describe('# Function Test For withdraw ', async function () {
    it('withdraw ', async function () {
      this.timeout(1000000);
      await timeout(20);
      const stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_eth.address);
      const latest = await time.latestBlock();
      await time.advanceBlockTo(parseInt(latest) + 15);
      let current = await time.latestBlock();
      if (logFlag) console.log(`\n\nCurrent block: ${current} `);

      for (let i = 0; i < stakeAddresses.length; i++) {
        console.log('\n\n ************* withdraw : ', i, stakeAddresses[i]);
        const stakeContract1 = await Stake1.at(stakeAddresses[i]);
        const endBlock = await stakeContract1.endBlock();
        while (endBlock.gt(current)) {
          await time.advanceBlockTo(parseInt(current) + 5);
          await timeout(13);
          current = await time.latestBlock();
          if (logFlag) console.log(`\n\nCurrent block: ${current} `);
        }

        const payTokenBalance1 = await web3.eth.getBalance(user1);
        console.log('\n payTokenBalance1:', fromWei(payTokenBalance1.toString(), 'ether'));

        await logUserStaked(stakeAddresses[i], user1, 'user1 pre withdraw');

        await stakeContract1.withdraw({ from: user1 });
        await timeout(2);

        const payTokenBalance2 = await web3.eth.getBalance(user1);
        console.log('\n payTokenBalance2:', fromWei(payTokenBalance2.toString(), 'ether'));
        await logUserStaked(stakeAddresses[i], user1, 'user1 after withdraw');
      }
    });
  });
  */

  async function logStakeContracts(_phase, _phaseVault) {
    console.log(
      "\n\n############### logStakeContracts [ PHASE",
      1,
      "]",
      _phaseVault
    );
    const vault = await Stake1Vault.at(_phaseVault);
    console.log("vault", vault.address);
    const paytoken = await vault.paytoken();
    const cap = await vault.cap();
    const saleStartBlock = await vault.saleStartBlock();
    const stakeStartBlock = await vault.stakeStartBlock();
    const stakeEndBlock = await vault.stakeEndBlock();
    const blockTotalReward = await vault.blockTotalReward();
    const saleClosed = await vault.saleClosed();
    const orderedEndBlocks = await vault.orderedEndBlocksAll();
    const stakeAddresses = await vault.stakeAddressesAll();

    console.log("cap", utils.formatUnits(cap.toString(), 18));
    console.log("paytoken", paytoken);
    console.log("saleStartBlock", saleStartBlock.toString());
    console.log("stakeStartBlock", stakeStartBlock.toString());
    console.log("stakeEndBlock", stakeEndBlock.toString());
    console.log(
      "blockTotalReward",
      utils.formatUnits(blockTotalReward.toString(), 18)
    );
    console.log("saleClosed", saleClosed);
    console.log("stakeAddresses", stakeAddresses);

    console.log("\n\n----------- stakeEndBlockTotal ");
    for (let i = 0; i < orderedEndBlocks.length; i++) {
      const stakeEndBlockTotal = await vault.stakeEndBlockTotal(
        orderedEndBlocks[i]
      );
      console.log(
        " stakeEndBlockTotal",
        orderedEndBlocks[i].toString(),
        utils.formatUnits(stakeEndBlockTotal.toString(), 18)
      );
    }
    for (let i = 0; i < stakeAddresses.length; i++) {
      const _contract = stakeAddresses[i];
      const stakeInfo = await vault.stakeInfos(_contract);

      console.log("\n\n----------- Stake Contract ", _contract);
      const stakeContract = await Stake1.at(_contract);
      const token = await stakeContract.token();
      const paytoken = await stakeContract.paytoken();
      const contractVault = await stakeContract.vault();
      const saleStartBlock = await stakeContract.saleStartBlock();
      const startBlock = await stakeContract.startBlock();
      const endBlock = await stakeContract.endBlock();
      const rewardClaimedTotal = await stakeContract.rewardClaimedTotal();
      const totalStakedAmount = await stakeContract.totalStakedAmount();

      let payTokenBalance = toBN("0");
      if (paytoken == zeroAddress) {
        payTokenBalance = await web3.eth.getBalance(_contract);
      } else {
        const ercTemp = IERC20.at(paytoken);
        payTokenBalance = ercTemp.balanceOf(_contract);
      }
      console.log(" token", token);
      console.log(" paytoken", paytoken);
      console.log(" contract-Vault", contractVault);
      console.log(" saleStartBlock", saleStartBlock.toString());
      console.log(" startBlock", startBlock.toString());
      console.log(" endBlock", endBlock.toString());
      console.log(
        " rewardClaimedTotal",
        utils.formatUnits(rewardClaimedTotal.toString(), 18)
      );
      console.log(
        " totalStakedAmount",
        utils.formatUnits(totalStakedAmount.toString(), 18)
      );
      console.log(
        " ** payTokenBalance",
        utils.formatUnits(payTokenBalance.toString(), 18)
      );

      console.log(" name", stakeInfo.name);
      console.log(" startBlcok", stakeInfo.startBlcok.toString());
      console.log(" endBlock", stakeInfo.endBlock.toString());
      console.log(
        " balance",
        utils.formatUnits(stakeInfo.balance.toString(), 18)
      );
      console.log(
        " totalRewardAmount",
        utils.formatUnits(stakeInfo.totalRewardAmount.toString(), 18)
      );
      console.log(
        " claimRewardAmount",
        utils.formatUnits(stakeInfo.claimRewardAmount.toString(), 18)
      );

      await logUserStaked(_contract, user1, "user1");
      await logUserStaked(_contract, user2, "user2");
    }
  }

  async function logUserStaked(_contract, _user, username) {
    console.log(
      "\n\n*********** logUserStaked [",
      _contract,
      "]",
      username,
      _user
    );
    const stakeContract = await Stake1.at(_contract);
    const userStaked = await stakeContract.userStaked(_user);
    console.log("amount", utils.formatUnits(userStaked.amount.toString(), 18));
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
    console.log("released", userStaked.released.toString());
  }
});
