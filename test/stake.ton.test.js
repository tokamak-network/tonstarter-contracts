const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require("ethers");
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
  Pharse1_TOSETHLP_Staking,
  Pharse1_DEV_Mining,
  HASH_Pharse1_TON_Staking,
  HASH_Pharse1_ETH_Staking,
  HASH_Pharse1_TOSETHLP_Staking,
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

saleStartBlock = 100;
let salePeriod = 50;
let stakingPeriod = 100;

const zeroAddress = "0x0000000000000000000000000000000000000000";

let logFlag = false;

describe("StakeTON: Stake with TON", function () {
  let weth, tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth,
    vault_phase1_ton,
    vault_phase1_tosethlp,
    vault_phase1_dev;
  let ton, wton, depositManager, seigManager;
  let stakeEntry, layer2;

  let a1, a2, tokenInfo;
  const sendAmount = "1";
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const operator1 = accounts[3];
  const userPrivate2 = privateKeys[2];

  const testStakingPeriodBlocks = [50, 100];
  const testStakingUsers = [user1, user2];
  const testUser1StakingAmount = ["100", "20"];
  const testUser2StakingAmount = ["50", "100"];
  const testClaimBlock = [20, 60];

  const sendAmountForTest = "1";
  const sendAmountForTest2 = "5";
  const buyTokensEtehrs = ["10", "5", "20", "2"];
  const buyTokensDurations = ["10", "60", "120", "150"];

  //let saleStartBlock = 0;
  let stakeStartBlock = 0;
  let stakeEndBlock = 0;
  let stakeAddresses;
  let requestBlock = 0;
  let globalWithdrawalDelay = 0;

let tokamakStakedInfo = {
  stakedTotal:0,
  tonBalance:0,
  stakeOf:0,
  pendingOf:0
};

let stakeContractTokamak = [];

  before(async function () {
    this.timeout(1000000);
    ico20Contracts = new ICO20Contracts();
  });

  describe('# 1. Global Setting', async function () {
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

      const cons = await ico20Contracts.getPlasamContracts();
      ton = cons.ton;
      wton = cons.wton;
      depositManager = cons.depositManager;
      seigManager = cons.seigManager;
      globalWithdrawalDelay = await depositManager.globalWithdrawalDelay();
    });

    it("Set StakeProxy  ", async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntry(defaultSender);
      if (logFlag) console.log("StakeProxy", stakeEntry.address);

      const cons = await ico20Contracts.getICOContracts();
      tos = cons.tos;
      stakeregister = cons.stakeregister;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;
    });
  });

  describe('# 2. Vault & StakeContract Setting', async function () {
    it("1. Create Vault", async function () {
      const current = await time.latestBlock();
      saleStartBlock = parseInt(saleStartBlock.toString());
      saleStartBlock = saleStartBlock + salePeriod;
      stakeStartBlock = saleStartBlock + stakingPeriod;

      if (logFlag) {
        console.log(`\n\nCurrent block: ${current} `);
        console.log(" saleStartBlock ", saleStartBlock);
        console.log(" stakeStartBlock ", stakeStartBlock);
        console.log(" Pharse1_TON_Staking ", Pharse1_TON_Staking);
      }

      const tx = await stakeEntry.createVault(
        ton.address,
        utils.parseUnits(Pharse1_TON_Staking, 18),
        toBN(saleStartBlock),
        toBN(stakeStartBlock),
        toBN("1"),
        HASH_Pharse1_TON_Staking,
        toBN("0"),
        zeroAddress,
        { from: defaultSender }
      );

      const vaultAddress = tx.receipt.logs[tx.receipt.logs.length - 1].args.vault;
      vault_phase1_ton = await Stake1Vault.at(vaultAddress, {
        from: defaultSender,
      });
      await tos.mint(
        vault_phase1_ton.address,
        utils.parseUnits(Pharse1_TON_Staking, 18),
        { from: defaultSender }
      );
    });

    it("2. createStakeContract TON ", async function () {
      for (let i = 0; i < testStakingPeriodBlocks.length; i++) {
        await stakeEntry.createStakeContract(
          toBN("1"),
          vault_phase1_ton.address,
          tos.address,
          ton.address,
          toBN(testStakingPeriodBlocks[i] + ""),
          "PHASE1_ETH_" + testStakingPeriodBlocks[i] + "_BLOCKS",
          { from: defaultSender }
        );
      }
      stakeAddresses = await stakeEntry.stakeContractsOfVault(
        vault_phase1_ton.address
      );

      for(let i = 0; i< stakeAddresses.length; i++){
        stakeContractTokamak.push(tokamakStakedInfo);
      }

    });
  });

  describe('# 3. Function Test For Sale ', async function () {
    it("1. If the sale period does not start, staking will fail.", async function () {

      let tonAmount = testUser1StakingAmount[0];
      let account = user1;

      const param = web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [stakeAddresses[0], tonAmount.toString()]
      );
      await expect(
        ton.approveAndCall(stakeAddresses[0], tonAmount, param, {
          from: account,
        })
      ).to.be.revertedWith("StakeTONProxy: period not allowed");

    });

    it("2. If the sales period does not start, the sales closing function fails.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_ton.address, { from: user1 })
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
          // ton
          await ico20Contracts.stake(
            stakeContractAddress,
            user1,
            toWei(testUser1StakingAmount[i], "ether")
          );

          let stakedInfo = await stakeContract.getUserStaked(user1);

          await expect(toBN(stakedInfo.amount)).to.be.bignumber.equal(toBN(testUser1StakingAmount[i]).mul(toBN(10**18)));

          await ico20Contracts.stake(
            stakeContractAddress,
            user2,
            toWei(testUser2StakingAmount[i], "ether")
          );

          stakedInfo = await stakeContract.getUserStaked(user2);

          await expect(toBN(stakedInfo.amount)).to.be.bignumber.equal(toBN(testUser2StakingAmount[i]).mul(toBN(10**18)));

          if (logFlag) await ico20Contracts.logStake(stakeContractAddress, user1, user2);
        }
      }
    });

    it("2. If the sales period is not over, the sales closing function will fail.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_ton.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: Before stakeStartBlock");
    });

    it("3. Ether staking is not allowed after the sale period is over.", async function () {
      this.timeout(1000000);
      let currentBlockTime = parseInt(stakeStartBlock);
      await time.advanceBlockTo(currentBlockTime);

      let tonAmount = testUser1StakingAmount[0];
      let account = user1;

      const param = web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [stakeAddresses[0], tonAmount.toString()]
      );

      await expect(
        ton.approveAndCall(stakeAddresses[0], tonAmount, param, {
          from: account,
        })
      ).to.be.revertedWith("StakeTONProxy: period not allowed");

    });

    it("4. If the sales closing function is not performed, the reward claim will fail.", async function () {
      const stakeContract = await StakeTON.at(stakeAddresses[0]);
      await expect(
        stakeContract.claim({ from: testStakingUsers[0] })
      ).to.be.revertedWith("StakeTON: not closed");
    });

  });

  describe('# 5. Function Test1 For Tokamak Interface ', async function () {

    it("1. addOperator on TOKAMAK ", async function () {
      layer2 = await ico20Contracts.addOperator(operator1);
    });

    it("2. If the sales closing function is not performed, cannot stake to Tokamak.", async function () {
      let i = 0;
      let stakeAmount = toWei('5','ether');
      await expect(
        stakeEntry.tokamakStaking(
            stakeAddresses[i],
            layer2.address,
            stakeAmount,
            { from: user1 }
          )
      ).to.be.revertedWith("TokamakStaker:not closed");

    });

    it("3. If the sales closing function is not performed, cannot requestWithdraw to Tokamak.", async function () {
      let wtonAmount = utils.parseUnits('1', 27);
      await expect(
        stakeEntry.tokamakRequestUnStaking(
          stakeAddresses[0],
          layer2.address,
          wtonAmount,
          { from: user1 }
        )
      ).to.be.revertedWith("TokamakStaker:different layer");
    });

    it("4. If the sales closing function is not performed, cannot processWithdraw to Tokamak.", async function () {
      await expect(
        stakeEntry.tokamakProcessUnStaking(
          stakeAddresses[0],
          layer2.address,
          { from: user1 }
        )
      ).to.be.revertedWith("TokamakStaker:different layer");
    });
  });

  describe('# 6. Function Test For CloseSale', async function () {
    it("1. When the sales period is over, the sales closing function can be performed.", async function () {
      await stakeEntry.closeSale(vault_phase1_ton.address, { from: user1 });
      if (logFlag) {
        await ico20Contracts.logVault(vault_phase1_ton.address);
      }
    });

    it("2. The sales closing function can be performed only once.", async function () {
      await expect(
        stakeEntry.closeSale(vault_phase1_ton.address, { from: user1 })
      ).to.be.revertedWith("Stake1Vault: already closed");
    });

  });

  describe('# 7. Function Test1 For Withdraw ', async function () {
    it("1. cannot withdraw unless the staking deadline has passed.", async function () {
      let current = await time.latestBlock();
      if (logFlag) console.log(`\n\n Current block: ${current} `);
      let i = 0;
      const stakeContract1 = await StakeTON.at(stakeAddresses[i]);
      await expect(
        stakeContract1.withdraw({ from: user1 })
      ).to.be.revertedWith("StakeTON: not end");
    });
  });

  describe('# 8. Function Test2 For Tokamak Interface ', async function () {

    it("1. can staking total staked amount in Tokamak after the staking closeSale is performed.", async function () {

      let stakeAmount = toWei('5','ether');
      for (let i = 0; i < 2; i++) {

        await stakeEntry.tokamakStaking(
          stakeAddresses[i],
          layer2.address,
          stakeAmount,
          { from: user1 }
        );

        stakeContractTokamak[i].stakeOf = await seigManager.stakeOf(
          layer2.address,
          stakeAddresses[i]
        );

        await expect(toBN(stakeContractTokamak[i].stakeOf).div(toBN(10**9)).toString())
            .to.be.bignumber.equal(
              toBN(stakeAmount));

        if (logFlag) {
          await ico20Contracts.logTokamakLayerBalance(layer2.address, stakeAddresses[i]);
          let stakeContract = await StakeTON.at(stakeAddresses[i]);
          let totalStakedAmount = await stakeContract.totalStakedAmount();
          console.log('totalStakedAmount',i,utils.formatUnits(totalStakedAmount.toString(), 18) ,' TON');
        }
      }

    });
  });

  describe('# 9. Function Test1 For Claim ', async function () {
    it("1. You can claim a reward after the sales closing function is performed", async function () {
      this.timeout(1000000);

      let i = 0;
      //for (let i = 0; i < 2; i++) {
        let testBlcok = stakeStartBlock + testClaimBlock[i] ;
        // if (logFlag)
        if (logFlag) console.log(`\n ====== delay blocks for test :`, testBlcok);

        await time.advanceBlockTo(testBlcok-1);
        requestBlock = await time.latestBlock();
        requestBlock = parseInt(requestBlock)+1;
        if (logFlag) console.log(`\n ====== current block :`, requestBlock);


        if (stakeAddresses.length > 0) {
          for (let j = 0; j < stakeAddresses.length; j++) {
            if (logFlag) console.log(`\n ----  StakeContract:`, j);
            let stakeContract = await StakeTON.at(stakeAddresses[j]);
            const prevRewardClaimedTotal = await stakeContract.rewardClaimedTotal();
            let sum = toBN(prevRewardClaimedTotal.toString());

            for (let u = 0; u < 2; u++) {
              if (logFlag){
                console.log(`\n ------- ClaimBlcok:`, testBlcok);
                console.log("\n testStakingUsers : ", u, testStakingUsers[u]);
              }

              let reward = await stakeContract.canRewardAmount(
                testStakingUsers[u], testBlcok
              );
              if (reward.gt(toBN("0"))) {
                let tosBalance1 = await tos.balanceOf(testStakingUsers[u]);
                if (logFlag)
                  console.log(
                    ` pre claim -> tosBalance1 :  `,
                    fromWei(tosBalance1.toString(), "ether")
                  );

                let tx = await stakeContract.claim({ from: testStakingUsers[u] });
                testBlcok++;
                sum = sum.add(toBN(reward.toString()));

                if (logFlag)
                  console.log(
                    ` tx.receipt.logs :  `,
                    tx.receipt.logs[0].event,
                    //tx.receipt.logs[0].args.from,
                    fromWei(tx.receipt.logs[0].args.amount.toString(),'ether'),
                    tx.receipt.logs[0].args.claimBlock.toString()
                  );

                let tosBalance2 = await tos.balanceOf(testStakingUsers[u]);
                await expect(reward.add(tosBalance1)).to.be.bignumber.equal(tosBalance2);

                if (logFlag)
                  console.log(
                    ` after claim -> tosBalance2 :  `,
                    fromWei(tosBalance2.toString(), "ether")
                  );

                //await expect(tosBalance2).to.be.bignumber.above(tosBalance1);

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
      //}
    });
  });

  describe('# 10. Function Test3 For Tokamak Interface ', async function () {

    it("1. updateReward ", async function () {
      this.timeout(1000000);

      await ico20Contracts.updateRewardTokamak(layer2, operator1);
      for (let i = 0; i < stakeAddresses.length; i++) {
        let stakeOf = await seigManager.stakeOf(
            layer2.address,
            stakeAddresses[i]
          );

        await expect(toBN(stakeOf).toString())
            .to.be.bignumber.above(
              toBN(stakeContractTokamak[i].stakeOf.toString()));
      }

    });

    it("2. can request withdrawal of a reward TON in tokamak.", async function () {
      let i = 0;
      let wtonAmount = '1'+'0'.repeat(27);
      requestBlock = await time.latestBlock();
      requestBlock = parseInt(requestBlock)+1;
      const pendingUnstaked1 = await depositManager.pendingUnstaked(
        layer2.address,
        stakeAddresses[i]
      );
      await stakeEntry.tokamakRequestUnStaking(
            stakeAddresses[i],
            layer2.address,
            toBN(wtonAmount),
            { from: user1 }
        );
      const pendingUnstaked2 = await depositManager.pendingUnstaked(
        layer2.address,
        stakeAddresses[i]
      );

      await expect(toBN(pendingUnstaked2)).to.be.bignumber.equal(
        toBN(pendingUnstaked1).add(toBN(wtonAmount)));

      if (logFlag) await ico20Contracts.logTokamakLayerBalance(layer2.address, stakeAddresses[i]);

    });

    it("3. can\'t process withdrawal of a reward TON in tokamak unless pass the delay blocks", async function () {

      await expect(
        stakeEntry.tokamakProcessUnStaking(
            stakeAddresses[0],
            layer2.address,
            { from: user1 }
        )
      ).to.be.revertedWith("DepositManager: wait for withdrawal delay.");

    });

    it("4. can process withdrawal of a reward TON in tokamak after passing the delay blocks", async function () {

      let delayBlocks = requestBlock + parseInt(globalWithdrawalDelay.toString()) ;
      await time.advanceBlockTo(delayBlocks-1);

      let i = 0;
      stakeContractTokamak[i].tonBalance = await ton.balanceOf(stakeAddresses[i] );
      stakeContractTokamak[i].pendingOf = await depositManager.pendingUnstaked(
          layer2.address,
          stakeAddresses[i]
      );
      stakeContractTokamak[i].tonBalance = toBN(stakeContractTokamak[i].tonBalance).add(toBN(stakeContractTokamak[i].pendingOf).div(toBN(10**9)));

      if (logFlag) {
        console.log(i, ',Prev tokamakProcessUnStaking ' );
        await ico20Contracts.logTONBalance(layer2.address, stakeAddresses[i], true);
      }
      await stakeEntry.tokamakProcessUnStaking(
            stakeAddresses[i],
            layer2.address,
            { from: user1 }
        );
      const currentTONAmount = await ton.balanceOf(stakeAddresses[i] );
      await expect(stakeContractTokamak[i].tonBalance.toString())
            .to.be.bignumber.equal(toBN(currentTONAmount).toString());

      if (logFlag) {
        console.log(i, ',After tokamakProcessUnStaking ' );
        await ico20Contracts.logTONBalance(layer2.address, stakeAddresses[i], true);
      }
    });

    it("5. can request/process withdrawal of a whole amount staked in Tokamak.", async function () {
      let delayBlocks = requestBlock + parseInt(globalWithdrawalDelay.toString()) + 5;
      await time.advanceBlockTo(delayBlocks);
      await ico20Contracts.updateRewardTokamak(layer2, operator1);

      // --- tokamakRequestUnStakingAll
      let i = 1;
      requestBlock = await time.latestBlock();
      requestBlock = parseInt(requestBlock)+1;

      if (logFlag) {
        console.log(i, ',Prev tokamakRequestUnStakingAll ' );
        await ico20Contracts.logTokamakLayerBalance(layer2.address,stakeAddresses[i]);
      }
      const pendingUnstaked1 = await depositManager.pendingUnstaked(
        layer2.address,
        stakeAddresses[i]
      );

      let wtonAmount = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);

      await stakeEntry.tokamakRequestUnStaking(
            stakeAddresses[i],
            layer2.address,
            wtonAmount,
            { from: user1 }
        );
      const pendingUnstaked2 = await depositManager.pendingUnstaked(
        layer2.address,
        stakeAddresses[i]
      );
      await expect(toBN(pendingUnstaked2).toString()).to.be.bignumber.equal(toBN(pendingUnstaked1).add(toBN(wtonAmount)).toString());

      if (logFlag) {
        console.log(i, ',After tokamakRequestUnStakingAll ' );
        await ico20Contracts.logTokamakLayerBalance(layer2.address, stakeAddresses[i]);
      }

      // --- tokamakProcessUnStaking
      delayBlocks = requestBlock + parseInt(globalWithdrawalDelay.toString()) ;
      await time.advanceBlockTo(delayBlocks-1);

      const tonBalance1 = await ton.balanceOf(stakeAddresses[i]);
      if (logFlag) {
        console.log(i, ',Prev tokamakProcessUnStaking ' );
        await ico20Contracts.logTONBalance(layer2.address, stakeAddresses[i], true);
      }

      stakeContractTokamak[i].pendingOf = await depositManager.pendingUnstaked(
          layer2.address,
          stakeAddresses[i]
        );

      await stakeEntry.tokamakProcessUnStaking(
            stakeAddresses[i],
            layer2.address,
            { from: user1 }
        );
      const tonBalance2 = await ton.balanceOf(stakeAddresses[i] );
      await expect(toBN(tonBalance2).toString())
        .to.be.bignumber.equal(toBN(tonBalance1).add(toBN(stakeContractTokamak[i].pendingOf).div(toBN(10**9))).toString());

      if (logFlag) {
        console.log(i, ',After tokamakProcessUnStaking ' );
        await ico20Contracts.logTONBalance(layer2.address, stakeAddresses[i], true);
     }
    });
  });

  describe('# 11. Function Test2 For Claim after passed blocks ', async function () {

    it("1. You can claim a reward after the sales closing function is performed", async function () {
      this.timeout(1000000);

      let i = 1;
      //for (let i = 0; i < 2; i++) {
        let testBlcok = stakeStartBlock + testClaimBlock[i] ;
        await time.advanceBlockTo(testBlcok-1);
        requestBlock = await time.latestBlock();
        requestBlock = parseInt(requestBlock)+1;

        if (logFlag){
          console.log(`\n ====== current block :`, requestBlock);
        }
        if (stakeAddresses.length > 0) {
          for (let j = 0; j < stakeAddresses.length; j++) {
            if (logFlag) console.log(`\n ----  StakeContract:`, j);
            let stakeContract = await StakeTON.at(stakeAddresses[j]);
            const prevRewardClaimedTotal = await stakeContract.rewardClaimedTotal();
            let sum = toBN(prevRewardClaimedTotal.toString());

            for (let u = 0; u < 2; u++) {
              if (logFlag){
                console.log(`\n ------- ClaimBlcok:`, testBlcok);
                console.log("\n testStakingUsers : ", u, testStakingUsers[u]);
              }

              let reward = await stakeContract.canRewardAmount(
                testStakingUsers[u], testBlcok
              );

              if (reward.gt(toBN("0"))) {
                let tosBalance1 = await tos.balanceOf(testStakingUsers[u]);
                if (logFlag)
                  console.log(
                    ` pre claim -> tosBalance1 :  `,
                    fromWei(tosBalance1.toString(), "ether")
                  );

                let tx = await stakeContract.claim({ from: testStakingUsers[u] });
                testBlcok++;
                sum = sum.add(toBN(reward.toString()));

                if (logFlag)
                  console.log(
                    ` tx.receipt.logs :  `,
                    tx.receipt.logs[0].event,
                    //tx.receipt.logs[0].args.from,
                    fromWei(tx.receipt.logs[0].args.amount.toString(),'ether'),
                    tx.receipt.logs[0].args.claimBlock.toString()
                  );

                let tosBalance2 = await tos.balanceOf(testStakingUsers[u]);
                await expect(reward.add(tosBalance1)).to.be.bignumber.equal(tosBalance2);


                if (logFlag)
                  console.log(
                    ` after claim -> tosBalance2 :  `,
                    fromWei(tosBalance2.toString(), "ether")
                  );

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
      //}
    });
  });

  describe('# 12. Function Test2 For Withdraw ', async function () {

    it('1. you cannot withdraw if don\'t unstaking a whole amount in tokamak.', async function () {
      let i = 0;
      await ico20Contracts.updateRewardTokamak(layer2, operator1);
      const stakeContract1 = await StakeTON.at(stakeAddresses[i]);
      await expect(
        stakeContract1.withdraw({ from: user1 })
      ).to.be.revertedWith("StakeTON: remain amount in tokamak");
    });

    it('2. unstaking a whole amount in tokamak.', async function () {

      //-- tokamakRequestUnStakingAll
      stakeEndBlock = await vault_phase1_ton.stakeEndBlock();
      stakeEndBlock = parseInt(stakeEndBlock.toString())+1;
      await time.advanceBlockTo(stakeEndBlock-1);
      if (logFlag) console.log(`\n unstaking block: ${stakeEndBlock} `);
      for (let i = 0; i < stakeAddresses.length; i++) {
        let stakeOf = await seigManager.stakeOf(
          layer2.address,
          stakeAddresses[i]
        );

        if(stakeOf.gt(toBN(0))){
           await stakeEntry.tokamakRequestUnStaking(
              stakeAddresses[i],
              layer2.address,
              stakeOf,
              { from: user1 }
          );

          const pendingOf = await depositManager.pendingUnstaked(
            layer2.address,
            stakeAddresses[i]
          );
          stakeContractTokamak[i].pendingOf = pendingOf;

          await expect(toBN(pendingOf).toString())
              .to.be.bignumber.equal(toBN(stakeOf).toString());
        }
      }

      //-- tokamakProcessUnStaking
      let delayBlocks = stakeEndBlock + parseInt(globalWithdrawalDelay.toString()) + 5;
      await time.advanceBlockTo(delayBlocks);

      for (let i = 0; i < stakeAddresses.length; i++) {

        stakeContractTokamak[i].tonBalance = await ton.balanceOf(stakeAddresses[i]);
        let pendingUnstaked = await depositManager.pendingUnstaked(
          layer2.address,
          stakeAddresses[i]
        );
        stakeContractTokamak[i].tonBalance = toBN(stakeContractTokamak[i].tonBalance).add(toBN(stakeContractTokamak[i].pendingOf).div(toBN(10**9)));

        if(pendingUnstaked.gt(toBN(0))){
          await stakeEntry.tokamakProcessUnStaking(
            stakeAddresses[i],
            layer2.address,
            { from: user1 }
          );

          let currentTONAmount = await ton.balanceOf(stakeAddresses[i]);

          await expect(stakeContractTokamak[i].tonBalance.toString())
              .to.be.bignumber.equal(toBN(currentTONAmount).toString());

        }
      }

      if (logFlag)
        for (let i = 0; i < stakeAddresses.length; i++) {
          console.log(`\n i: `, i, stakeAddresses[i]);
          await ico20Contracts.logTokamakLayerBalance(layer2.address, stakeAddresses[i]);
          let payTokenBalanceContract1 =  await ton.balanceOf(stakeAddresses[i]);
          console.log(' ton balance of contract', utils.formatUnits(payTokenBalanceContract1.toString(), 27), ' WTON');
        }

    });

    it('3. can withdraw after the staking end block is passed. ', async function () {
      this.timeout(1000000);

      if(logFlag) {
        requestBlock = await time.latestBlock();
        console.log(`\n Withdrawal block: ${requestBlock} `);
      }

      for (let i = 0; i < stakeAddresses.length; i++) {
        if (logFlag)
          console.log('\n  ************* withdraw : ', i, stakeAddresses[i]);
        const stakeContract1 = await StakeTON.at(stakeAddresses[i]);
        let payTokenBalanceContract1 = await ton.balanceOf(stakeAddresses[i]);
        let payTokenBalance1 = await ton.balanceOf(user1);
        let userStakedInfo1 = await stakeContract1.getUserStaked(user1);


        let fromTokamak = await stakeContract1.fromTokamak();
        let toTokamak = await stakeContract1.toTokamak();
        let totalStakedAmount = await stakeContract1.totalStakedAmount();
        let withdrawStakedAmount = totalStakedAmount.sub(toTokamak).add(fromTokamak.div(toBN(10**9)));

        const userStaked = await stakeContract1.userStaked(user1);
        let userAmount = userStaked.amount;
        let amount = withdrawStakedAmount.mul(userAmount).div(totalStakedAmount);

       if (logFlag){
          console.log('\n stakeContract\'s payTokenBalance1:', fromWei(payTokenBalanceContract1.toString(), 'ether'));
          console.log('\n user1\'s payTokenBalance1:', fromWei(payTokenBalance1.toString(), 'ether'));
          await ico20Contracts.logTokamakLayerBalance(layer2.address, stakeAddresses[i]);
          await ico20Contracts.logUserStaked(stakeAddresses[i], user1, 'user1 pre withdraw');
       }

        await stakeContract1.withdraw({ from: user1 });
        stakeEndBlock++;

        let userStakedInfo2 = await stakeContract1.getUserStaked(user1);
        let expectedWithdrawAmount = toBN(userStakedInfo2.releasedAmount);

        let payTokenBalance2 = await ton.balanceOf(user1);
        await expect(expectedWithdrawAmount.add(toBN(payTokenBalance1))).to.be.bignumber.equal(toBN(payTokenBalance2));

        let payTokenBalanceContract2 =  await ton.balanceOf(stakeAddresses[i]);
        await expect(toBN(payTokenBalanceContract1).sub(expectedWithdrawAmount))
          .to.be.bignumber.equal(toBN(payTokenBalanceContract2));

        if (logFlag){
          console.log('\n stakeContract\'s payTokenBalance1:', fromWei(payTokenBalanceContract2.toString(), 'ether'));
          console.log('\n user1\'s payTokenBalance2:', fromWei(payTokenBalance2.toString(), 'ether'));
          await ico20Contracts.logUserStaked(stakeAddresses[i], user1, 'user1 after withdraw');
        }

      }
    });

  });

});