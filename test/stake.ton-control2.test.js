// const { BigNumber, utils } = require("ethers")
// const { ethers, upgrades } = require("hardhat")

const { time, expectEvent } = require("@openzeppelin/test-helpers");
//const { ethers } = require("ethers");
const { ethers } = require("hardhat");

const BigNumber = ethers.BigNumber; // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils;

const Web3EthAbi = require("web3-eth-abi");
const {
  defaultSender,
  accounts,
  contract,
  web3,
  privateKeys,
} = require("@openzeppelin/test-environment");

const [
  candidate1,
  candidate2,
  candidate3,
  user1,
  user2,
  user3,
  user4,
  user5,
  operator1,
  operator2,
] = accounts;
const candidates = [candidate1, candidate2, candidate3];
const users = [user1, user2, user3, user4, user5];
const operators = [operator1, operator2];
const {
  topic0TonWithdrawal,
  abiTonWithdrawal
  } = require("./stakeTONUpgrade3Constant");

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

const { getSignature, signatureValidTime, timeout } = require("./common");

// ------------------------
const {
  ICO20Contracts,
  initialTotal,
  PHASE1_TON_Staking,
  PHASE1_ETH_Staking,
  PHASE1_TOSETHLP_Staking,
  PHASE1_DEV_Mining,
  HASH_PHASE1_TON_Staking,
  HASH_PHASE1_ETH_Staking,
  HASH_PHASE1_TOSETHLP_Staking,
  HASH_PHASE1_DEV_Mining
  } = require("../utils/ico_test_deploy.js");

let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
let stakeTONUpgrade, stakeTONUpgrade2, stakeTONUpgrade3, stakeTONProxy2, stakeTONControl , stakeTONControl2;
// ------------------------
const StakeTONTotalAbi = require("../abis_stakeTONUpgrade/stakeTONTotal.json").abi;

const Stake1Vault = contract.fromArtifact("Stake1Vault");
const StakeTON = contract.fromArtifact("StakeTON");
const StakeTONUpgrade = contract.fromArtifact("StakeTONUpgrade");
const StakeTONUpgrade2 = contract.fromArtifact("StakeTONUpgrade2");
const StakeTONUpgrade3 = contract.fromArtifact("StakeTONUpgrade3");
const StakeTONProxy2 = contract.fromArtifact("StakeTONProxy2");
const StakeTONControl = contract.fromArtifact("StakeTONControl");
const StakeTONUnstaking = contract.fromArtifact("StakeTONUnstaking");
const IERC20 = contract.fromArtifact("IERC20");

const testStakingPeriodBlocks = [50, 100];
const testStakingUsers = [user1, user2];
const testUser1StakingAmount = ["100", "20"];
const testUser2StakingAmount = ["50", "100"];
const testClaimBlock = [20, 60];

let saleStartBlock = 100;
let salePeriod = 50;
let stakingPeriod = 100;
let totalStakedAmount = [];

const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");

const logFlag = false;

let tokamakStakedInfo = {
  stakedTotal:0,
  tonBalance:0,
  stakeOf:0,
  pendingOf:0,
  startBlock: 0
};

let stakeContractTokamak = [];
let unstakingBlock ;
let stakeTONStoragelist = [];
let stakeTONStorage = {
  token:'',
  stakeRegistry:'',
  paytoken:'',
  vault:'',
  saleStartBlock:'',
  startBlock:'',
  endBlock:'',
  rewardClaimedTotal:'',
  totalStakedAmount:'',
  totalStakers:'',
  pauseProxy:'',
  defiAddr:'',
  migratedL2:'',
  ton:'',
  wton:'',
  seigManager:'',
  depositManager:'',
  swapProxy:'',
  tokamakLayer2:'',
  toTokamak:'',
  fromTokamak:'',
  toUniswapWTON:'',
  swappedAmountTOS:'',
  finalBalanceTON:'',
  finalBalanceWTON:'',
  defiStatus:'',
  requestNum:'',
  withdrawFlag:''
}
//
describe("TokamakStaker ", function () {
  let weth, tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth,
    vault_phase1_ton,
    vault_phase1_tosethlp,
    vault_phase1_dev;
  let ton, wton, depositManager, seigManager;
  let stakeEntry, layer2;

  let a1, a2, tokenInfo;
  const sendAmount = "1";

  const testStakingPeriodBlocks = [1000, 1500];
  const testStakingUsers = [user1, user2];
  const testUser1StakingAmount = ["10", "5"];
  const testUser2StakingAmount = ["10", "20"];
  const testClaimBlock = [5, 10, 5, 5];

  const sendAmountForTest = "1";
  const sendAmountForTest2 = "5";
  const buyTokensEtehrs = ["10", "5", "20", "2"];
  const buyTokensDurations = ["10", "60", "120", "150"];
  let stakeStartBlock = 0;
  let globalWithdrawalDelay = 0;
  let stakeAddresses;
  let requestBlock = 0;

  before(async function () {
    this.timeout(1000000);
    ico20Contracts = new ICO20Contracts();
  });

  describe('# 1. Pre-requisite Setting', async function () {

    it("1. ico20Contracts init  ", async function () {
      this.timeout(1000000);
      ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
        defaultSender
      );
    });
    it("2. tokamakContracts init  ", async function () {
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

    it("3. Set StakeProxy  ", async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntry(defaultSender);

      const cons = await ico20Contracts.getICOContracts();
      tos = cons.tos;
      stakeregister = cons.stakeregister;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;
    });

    it("4. addOperator on TOKAMAK ", async function () {
      layer2 = await ico20Contracts.addOperator(operator1);
    });

    it("5. Create TON Vault", async function () {
      const current = await time.latestBlock();
      saleStartBlock = parseInt(saleStartBlock.toString());
      saleStartBlock = saleStartBlock + salePeriod;
      stakeStartBlock = saleStartBlock + stakingPeriod;

      const tx = await stakeEntry.createVault(
        ton.address,
        utils.parseUnits(PHASE1_TON_Staking, 18),
        toBN(saleStartBlock),
        toBN(stakeStartBlock),
        toBN("1"),
        HASH_PHASE1_TON_Staking,
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
        utils.parseUnits(PHASE1_TON_Staking, 18),
        { from: defaultSender }
      );
    });

    it("6. createStakeContract with TON ", async function () {
      for (let i = 0; i < testStakingPeriodBlocks.length; i++) {
        await stakeEntry.createStakeContract(
          toBN("1"),
          vault_phase1_ton.address,
          tos.address,
          ton.address,
          toBN(testStakingPeriodBlocks[i] + ""),
          "PHASE1_TON_" + testStakingPeriodBlocks[i] + "_BLOCKS",
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

    it("7. Stake TON ", async function () {
      this.timeout(1000000);
      let currentBlockTime = parseInt(saleStartBlock);
      await time.advanceBlockTo(currentBlockTime);

      for (let i = 0; i < stakeAddresses.length; i++) {
        if (stakeAddresses[i] != null) {
          const stakeContract = await StakeTON.at(stakeAddresses[i]);

          await ico20Contracts.stake(
            stakeAddresses[i],
            user1,
            toWei(testUser1StakingAmount[i], "ether")
          );
          await ico20Contracts.stake(
            stakeAddresses[i],
            user2,
            toWei(testUser2StakingAmount[i], "ether")
          );

          let contract = await StakeTON.at(stakeAddresses[i]);
          let amount = await contract.totalStakedAmount();
          totalStakedAmount.push(amount);
        }
      }
    });
    it("8. StakeTONUpgrade Deploy", async function () {
      stakeTONUpgrade = await StakeTONUpgrade.new({ from: defaultSender });
      expect(stakeTONUpgrade.address).to.not.eq(zeroAddress);
    });

    it("9. StakeTON upgradeStakeTo ", async function () {
      this.timeout(1000000);

      for (let i = 0; i < stakeAddresses.length; i++) {
        if (stakeAddresses[i] != null) {

          await stakeEntry.upgradeStakeTo(stakeAddresses[i],stakeTONUpgrade.address);

          let contract = await StakeTONUpgrade.at(stakeAddresses[i]);
          let amount = await contract.totalStakedAmount();

          expect(totalStakedAmount[i].toString()).to.be.equal(amount.toString());
        }
      }
    });

    it("10. StakeTONUpgrade stake ", async function () {
      this.timeout(1000000);

      for (let i = 0; i < stakeAddresses.length; i++) {
        if (stakeAddresses[i] != null) {
          let sum = toBN('0');

          await ico20Contracts.stake(
            stakeAddresses[i],
            user1,
            toWei(testUser1StakingAmount[i], "ether")
          );
          await ico20Contracts.stake(
            stakeAddresses[i],
            user2,
            toWei(testUser2StakingAmount[i], "ether")
          );
          sum = sum.add(toBN(toWei(testUser1StakingAmount[i], "ether"))).add(toBN(toWei(testUser2StakingAmount[i], "ether")));

          let contract = await StakeTONUpgrade.at(stakeAddresses[i]);
          let amount = await contract.totalStakedAmount();

          expect(toBN(totalStakedAmount[i]).toString()).to.be.equal(
            toBN(amount).sub(sum).toString());

          totalStakedAmount[i] = amount;
        }
      }
    });

  });

  describe('# 2. Function test : fails when closeSale is not excuted ', async function () {
    it("1. tokamakStaking fails", async function () {

      let testStakeContract = stakeAddresses[0];
      const tonAmount = await ton.balanceOf(testStakeContract);

      await expect(
        stakeEntry.tokamakStaking(
              testStakeContract,
              layer2.address,
              tonAmount,
              { from: defaultSender }
            )
      ).to.be.revertedWith("TokamakStaker: not closed");

    });

    it("2. tokamakRequestUnStaking fails", async function () {
      let wtonAmount = utils.parseUnits('1', 27);
      await expect(
        stakeEntry.tokamakRequestUnStaking(
          stakeAddresses[0],
          layer2.address,
          wtonAmount,
          { from: user1 }
        )
      ).to.be.revertedWith("TokamakStaker: not closed");
    });

    it("3. tokamakProcessUnStaking fails ", async function () {
      await expect(
        stakeEntry.tokamakProcessUnStaking(
          stakeAddresses[0],
          layer2.address,
          { from: user1 }
        )
      ).to.be.revertedWith("TokamakStaker: not closed");
    });
  });

  describe('# 3. Function test after closeSale is excuted ', async function () {

    it("1. closeSale TON Vault ", async function () {
      this.timeout(1000000);
      let currentBlockTime = parseInt(stakeStartBlock);
      await time.advanceBlockTo(currentBlockTime);
      await stakeEntry.closeSale(vault_phase1_ton.address, { from: user1 });
    });

    it("2. tokamakStaking ", async function () {
      this.timeout(1000000);

      for (let i = 0; i < stakeAddresses.length; i++) {
        stakeContractTokamak[i].stakedTotal = await ton.balanceOf(stakeAddresses[i]);

        if (stakeContractTokamak[i].stakedTotal.gt(toBN("0"))) {
          await stakeEntry.tokamakStaking(
            stakeAddresses[i],
            layer2.address,
            stakeContractTokamak[i].stakedTotal,
            { from: defaultSender }
          );

          stakeContractTokamak[i].stakeOf = await seigManager.stakeOf(
            layer2.address,
            stakeAddresses[i]
          );

          await expect(toBN(stakeContractTokamak[i].stakeOf).div(toBN(10**9)).toString())
            .to.be.bignumber.equal(
              toBN(stakeContractTokamak[i].stakedTotal.toString()));
        }
      }
    });

    it("3. updateReward in Tokamak (1) ", async function () {
      this.timeout(1000000);
      let currentBlockTime = parseInt(stakeStartBlock)+100;
      await time.advanceBlockTo(currentBlockTime);
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

  });

  describe('# 4. StakeTONUpgrade2 in StakeTONUpgrade', async function () {


    it("1. StakeTONUpgrade2 Deploy", async function () {
      stakeTONUpgrade2 = await StakeTONUpgrade2.new({ from: defaultSender });
      expect(stakeTONUpgrade2.address).to.not.eq(zeroAddress);
    });

    it("2. StakeTONUpgrade upgradeStakeTo ", async function () {
      this.timeout(1000000);

      for (let i = 0; i < stakeAddresses.length; i++) {
        if (stakeAddresses[i] != null) {

          let tx = await stakeEntry.upgradeStakeTo(stakeAddresses[i], stakeTONUpgrade2.address);

          let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
          let amount = await contract.totalStakedAmount();

          expect(totalStakedAmount[i].toString()).to.be.equal(amount.toString());

          expect(await contract.version()).to.be.equal("phase1.upgrade.v2");

          let stakeTONStorageNew = JSON.parse(JSON.stringify(stakeTONStorage));

          stakeTONStorageNew.token = await contract.token();
          stakeTONStorageNew.stakeRegistry = await contract.stakeRegistry();
          stakeTONStorageNew.paytoken = await contract.paytoken();
          stakeTONStorageNew.vault = await contract.vault();
          stakeTONStorageNew.saleStartBlock = await contract.saleStartBlock();
          stakeTONStorageNew.startBlock = await contract.startBlock();
          stakeTONStorageNew.endBlock = await contract.endBlock();
          stakeTONStorageNew.rewardClaimedTotal = await contract.rewardClaimedTotal();
          stakeTONStorageNew.totalStakedAmount = await contract.totalStakedAmount();
          stakeTONStorageNew.totalStakers = await contract.totalStakers();
          stakeTONStorageNew.pauseProxy = await contract.pauseProxy();
          stakeTONStorageNew.defiAddr = await contract.defiAddr();
          stakeTONStorageNew.migratedL2 = await contract.migratedL2();
          stakeTONStorageNew.ton = await contract.ton();
          stakeTONStorageNew.wton = await contract.wton();
          stakeTONStorageNew.seigManager = await contract.seigManager();
          stakeTONStorageNew.depositManager = await contract.depositManager();
          stakeTONStorageNew.swapProxy = await contract.swapProxy();
          stakeTONStorageNew.tokamakLayer2 = await contract.tokamakLayer2();
          stakeTONStorageNew.toTokamak = await contract.toTokamak();
          stakeTONStorageNew.fromTokamak = await contract.fromTokamak();
          stakeTONStorageNew.toUniswapWTON = await contract.toUniswapWTON();
          stakeTONStorageNew.swappedAmountTOS = await contract.swappedAmountTOS();
          stakeTONStorageNew.finalBalanceTON = await contract.finalBalanceTON();
          stakeTONStorageNew.finalBalanceWTON = await contract.finalBalanceWTON();
          stakeTONStorageNew.defiStatus = await contract.defiStatus();
          stakeTONStorageNew.requestNum = await contract.requestNum();
          stakeTONStorageNew.withdrawFlag = await contract.withdrawFlag();
          stakeTONStoragelist.push(stakeTONStorageNew);
        }
      }
    });
  });

  describe('# 5. StakeTONUpgrade3, StakeProxy2 in StakeTONUpgrade', async function () {

    it("1. StakeTONUpgrade3 Deploy", async function () {
      stakeTONUpgrade3 = await StakeTONUpgrade3.new({ from: defaultSender });
      expect(stakeTONUpgrade3.address).to.not.eq(zeroAddress);
    });

    it("2. StakeTONProxy2 Deploy", async function () {
      stakeTONProxy2 = await StakeTONProxy2.new({ from: defaultSender });
      expect(stakeTONProxy2.address).to.not.eq(zeroAddress);
    });

    it("3. add burn percantage of swapped tos in phase1 to registry ", async function () {
        this.timeout(1000000);
        const cons = await ico20Contracts.getICOContracts();
        stakeregister = cons.stakeregister;

        await stakeregister.addDefiInfo(
          "PHASE1.SWAPTOS.BURNPERCENT",
          stakeTONUpgrade3.address,
          zeroAddress,
          zeroAddress,
          0,
          zeroAddress
          ,{ from: defaultSender }
        );
    });

    it("4. add tos burner autority to StakeTON Contracts  ", async function () {
        this.timeout(1000000);
        const cons = await ico20Contracts.getICOContracts();

        for (let i = 0; i < stakeAddresses.length; i++) {
          if (stakeAddresses[i] != null) {
            await tos.addBurner(stakeAddresses[i], { from: defaultSender });
          }
        }
    });

    it("5. StakeTONProxy upgradeStakeTo StakeTONProxy2", async function () {
      this.timeout(1000000);

      let ABI_CODE =  [
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
          "inputs": [
            {
              "internalType": "address",
              "name": "target",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "role",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "grantRole",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      const cons = await ico20Contracts.getICOContracts();
      const proxyContract = new web3.eth.Contract(ABI_CODE, cons.stake1proxy.address );

      for (let i = 0; i < stakeAddresses.length; i++) {
        if (stakeAddresses[i] != null) {

          await proxyContract.methods.grantRole(stakeAddresses[i], keccak256("ADMIN"), defaultSender).send({ from: defaultSender });

          await stakeEntry.upgradeStakeTo(stakeAddresses[i], stakeTONProxy2.address, { from: defaultSender });

          let contract = await StakeTONProxy2.at(stakeAddresses[i], { from: defaultSender });

          expect(await contract.isAdmin(defaultSender)).to.be.equal(true);

          await contract.setImplementation2(stakeTONUpgrade2.address, 0, true, { from: defaultSender });
          expect(await contract.implementation2(0)).to.be.equal(stakeTONUpgrade2.address);

          let amount = await contract.totalStakedAmount();
          expect(totalStakedAmount[i].toString()).to.be.equal(amount.toString());

          let stakeTONStorageSnapshot = stakeTONStoragelist[i];
          expect(await contract.token()).to.be.equal(stakeTONStorageSnapshot.token);
          expect(await contract.stakeRegistry()).to.be.equal(stakeTONStorageSnapshot.stakeRegistry);
          expect(await contract.paytoken()).to.be.equal(stakeTONStorageSnapshot.paytoken);
          expect(await contract.vault()).to.be.equal(stakeTONStorageSnapshot.vault);
          expect(await contract.saleStartBlock()).to.be.bignumber.equal(stakeTONStorageSnapshot.saleStartBlock);
          expect(await contract.startBlock()).to.be.bignumber.equal(stakeTONStorageSnapshot.startBlock);
          expect(await contract.endBlock()).to.be.bignumber.equal(stakeTONStorageSnapshot.endBlock);
          expect(await contract.rewardClaimedTotal()).to.be.bignumber.equal(stakeTONStorageSnapshot.rewardClaimedTotal);
          expect(await contract.totalStakedAmount()).to.be.bignumber.equal(stakeTONStorageSnapshot.totalStakedAmount);
          expect(await contract.totalStakers()).to.be.bignumber.equal(stakeTONStorageSnapshot.totalStakers);
          expect(await contract.pauseProxy()).to.be.equal(stakeTONStorageSnapshot.pauseProxy);
          expect(await contract.defiAddr()).to.be.equal(stakeTONStorageSnapshot.defiAddr);
          expect(await contract.migratedL2()).to.be.equal(stakeTONStorageSnapshot.migratedL2);
          expect(await contract.ton()).to.be.equal(stakeTONStorageSnapshot.ton);
          expect(await contract.wton()).to.be.equal(stakeTONStorageSnapshot.wton);
          expect(await contract.seigManager()).to.be.equal(stakeTONStorageSnapshot.seigManager);
          expect(await contract.depositManager()).to.be.equal(stakeTONStorageSnapshot.depositManager);
          expect(await contract.swapProxy()).to.be.equal(stakeTONStorageSnapshot.swapProxy);
          expect(await contract.tokamakLayer2()).to.be.equal(stakeTONStorageSnapshot.tokamakLayer2);
          expect(await contract.toTokamak()).to.be.bignumber.equal(stakeTONStorageSnapshot.toTokamak);
          expect(await contract.fromTokamak()).to.be.bignumber.equal(stakeTONStorageSnapshot.fromTokamak);
          expect(await contract.toUniswapWTON()).to.be.bignumber.equal(stakeTONStorageSnapshot.toUniswapWTON);
          expect(await contract.swappedAmountTOS()).to.be.bignumber.equal(stakeTONStorageSnapshot.swappedAmountTOS);
          expect(await contract.finalBalanceTON()).to.be.bignumber.equal(stakeTONStorageSnapshot.finalBalanceTON);
          expect(await contract.finalBalanceWTON()).to.be.bignumber.equal(stakeTONStorageSnapshot.finalBalanceWTON);
          expect((await contract.defiStatus()).toString()).to.be.equal(stakeTONStorageSnapshot.defiStatus.toString());
          expect(await contract.requestNum()).to.be.bignumber.equal(stakeTONStorageSnapshot.requestNum);
          expect(await contract.withdrawFlag()).to.be.equal(stakeTONStorageSnapshot.withdrawFlag);
        }
      }
    });

    it("6. change withdraw function logic to StakeTONUpgrade3", async function () {
      this.timeout(1000000);
      const cons = await ico20Contracts.getICOContracts();

      let _func1 = Web3EthAbi.encodeFunctionSignature("withdraw()") ;
      for (let i = 0; i < stakeAddresses.length; i++) {
        if (stakeAddresses[i] != null) {
          let contract = await StakeTONProxy2.at(stakeAddresses[i], { from: defaultSender });
          await contract.setImplementation2(stakeTONUpgrade3.address, 1, true, { from: defaultSender });
          expect(await contract.implementation2(1)).to.be.equal(stakeTONUpgrade3.address);
          await contract.setSelectorImplementations2([_func1], stakeTONUpgrade3.address, { from: defaultSender });
          expect(await contract.getSelectorImplementation2(_func1)).to.be.equal(stakeTONUpgrade3.address);
        }
      }
    });

  });

  describe('*** # 6. tokamakProcessUnStaking ', async function () {

    it("1. StakeTONUnstaking deploy ", async function () {
      stakeTONControl2 = await StakeTONUnstaking.new({ from: defaultSender });
      expect(stakeTONControl2.address).to.not.eq(zeroAddress);

    });

    it("2. setInfo of StakeTONUnstaking ", async function () {
      await stakeTONControl2.setInfo(
        ton.address, wton.address, tos.address,
        depositManager.address , seigManager.address, layer2.address,
        stakeAddresses.length  , {from: defaultSender }
      );

      expect(await stakeTONControl2.ton()).to.be.equal(ton.address);
      expect(await stakeTONControl2.wton()).to.be.equal(wton.address);
      expect(await stakeTONControl2.tos()).to.be.equal(tos.address);
      expect(await stakeTONControl2.depositManager()).to.be.equal(depositManager.address);
      expect(await stakeTONControl2.seigManager()).to.be.equal(seigManager.address);
      expect(await stakeTONControl2.layer2()).to.be.equal(layer2.address);
      expect(await stakeTONControl2.countStakeTons()).to.be.bignumber.equal(toBN(stakeAddresses.length));

    });

    it("3. addStakeTons of StakeTONControl ", async function () {
      await stakeTONControl2.addStakeTons(
        stakeAddresses,
        {from: defaultSender }
      );
      for(let i=0; i< stakeAddresses.length; i++){
          expect(await stakeTONControl2.stakeTons(i+1)).to.be.eq(stakeAddresses[i]);
      }
    });


    it("4. StakeTONUnstaking.requestUnstakingLayer2All", async function () {
      this.timeout(1000000);
      let stakeInfos = [];
      let remainAmount = toBN('100000000000000000');
      for (let i = 0; i < stakeAddresses.length; i++) {

        const stakeOfPrev = await seigManager.stakeOf(
          layer2.address,
          stakeAddresses[i]
        );

        let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
        let toTokamak = await contract.toTokamak();
        let totalStakedAmount = await contract.totalStakedAmount();
        //console.log('totalStakedAmount',totalStakedAmount.toString());

        let amountOfStake1 = stakeOfPrev.sub(remainAmount);
        let amountOfStake = stakeOfPrev.sub(toTokamak);
        stakeInfos.push({
          num: i,
          totalStakedAmount: totalStakedAmount,
          amountOfStake1: amountOfStake1,
          amountOfStake:amountOfStake
        });
      }

      let can= await stakeTONControl2.canRequestUnstakingLayer2All();
      //console.log('can',can);
      expect(can.can).to.be.eq(true);
      await stakeTONControl2.requestUnstakingLayer2All();

      for (let i = 0; i < stakeAddresses.length; i++) {

        const stakeOf = await seigManager.stakeOf(
          layer2.address,
          stakeAddresses[i]
        );

        await expect(toBN(stakeOf).div(toBN(10**9)).toString())
            .to.be.bignumber.equal(toBN(stakeInfos[i].totalStakedAmount).toString());

        stakeContractTokamak[i].stakeOf = stakeOf;
        //console.log('stakeOf',stakeOf.toString());

        const pendingOf = await depositManager.pendingUnstaked(
          layer2.address,
          stakeAddresses[i]
        );

        //console.log('pendingOf',i, pendingOf.toString());

        stakeContractTokamak[i].pendingOf = pendingOf;

        await expect(toBN(stakeInfos[i].totalStakedAmount).toString())
            .to.be.bignumber.lt(toBN(pendingOf).add(toBN(stakeOf)).div(toBN(10**9)).toString());

      }

      unstakingBlock = await time.latestBlock();

    });

    it("5. tokamakProcessUnStaking : Only those past the delayed block can be processed  ", async function () {
      this.timeout(1000000);
      let curLatestBlock = await time.latestBlock();
      //console.log('curLatestBlock',parseInt(curLatestBlock));

      const delayBlocks = await depositManager.globalWithdrawalDelay();
      //console.log('delayBlocks',parseInt(delayBlocks));
      await time.advanceBlockTo(parseInt(curLatestBlock) + parseInt(delayBlocks) + 3 );

      for (let i = 0; i < stakeAddresses.length; i++) {

        stakeContractTokamak[i].tonBalance = await ton.balanceOf(stakeAddresses[i]);

        let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
        // let totalStakedAmount = await contract.totalStakedAmount();
        // console.log('totalStakedAmount',i, totalStakedAmount.toString());

        let canTokamakProcessUnStakingCount = await contract.canTokamakProcessUnStakingCount(layer2.address);
        // console.log('canTokamakProcessUnStakingCount.count',i, canTokamakProcessUnStakingCount.count.toString());
        // console.log('canTokamakProcessUnStakingCount.amount',i, canTokamakProcessUnStakingCount.amount.toString());

        stakeContractTokamak[i].tonBalance = toBN(stakeContractTokamak[i].tonBalance).add(toBN(canTokamakProcessUnStakingCount.amount).div(toBN(10**9)));

        await stakeEntry.tokamakProcessUnStaking(
          stakeAddresses[i],
          layer2.address,
          { from: defaultSender }
        );

        let currentTONAmount = await ton.balanceOf(stakeAddresses[i]);

        await expect(stakeContractTokamak[i].tonBalance.toString())
            .to.be.bignumber.equal(toBN(currentTONAmount).toString());

      }

    });


    it("6. tokamakRequestUnStakingAll fail when has not passed The executable block ", async function () {
      this.timeout(1000000);

      for (let i = 0; i < stakeAddresses.length; i++) {

         await expect(
           stakeEntry.tokamakRequestUnStakingAll(
            stakeAddresses[i],
            layer2.address,
            { from: defaultSender }
          )
         ).to.be.revertedWith("TokamakStaker:The executable block has not passed");

      }

    });

    it("7. tokamakProcessUnStaking fail when there is nothing that can be withdrawn", async function () {
      this.timeout(1000000);
      const delayBlocks = await depositManager.globalWithdrawalDelay();
      let latest = await time.latestBlock();
      await time.advanceBlockTo(parseInt(latest) + parseInt(delayBlocks)+1);

      latest = await time.latestBlock();


      for (let i = 0; i < stakeAddresses.length; i++) {

        let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
        let canTokamakProcessUnStakingCount = await contract.canTokamakProcessUnStakingCount(layer2.address);

        expect(canTokamakProcessUnStakingCount.count).to.be.bignumber.equal(toBN('0'));
        expect(canTokamakProcessUnStakingCount.amount).to.be.bignumber.equal(toBN('0'));

        await expect(
           stakeEntry.tokamakProcessUnStaking(
            stakeAddresses[i],
            layer2.address,
            { from: defaultSender }
          )
         ).to.be.revertedWith("TokamakStaker: no able request.");
      }
    });

  });


  describe('# 7. Function Test2 For Claim after passed blocks ', async function () {

    it("1. claim", async function () {
      this.timeout(1000000);
      let passBlocks = 10;
      let latest = await time.latestBlock();

      let i = 1;
      //for (let i = 0; i < 2; i++) {
        let testBlcok = parseInt(latest) + passBlocks ;
        await time.advanceBlockTo(testBlcok-1);
        requestBlock = await time.latestBlock();
        requestBlock = parseInt(requestBlock)+1;

        if (logFlag){
          console.log(`\n ====== current block :`, requestBlock);
        }
        if (stakeAddresses.length > 0) {
          for (let j = 0; j < stakeAddresses.length; j++) {
            if (logFlag) console.log(`\n ----  StakeContract:`, j);
            let stakeContract = await StakeTONUpgrade2.at(stakeAddresses[j]);
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

  describe('*** # 8. multi control that withdrawAll and swap ', async function () {

    it("1. StakeTONControl deploy ", async function () {
      stakeTONControl = await StakeTONControl.new({ from: defaultSender });
      expect(stakeTONControl.address).to.not.eq(zeroAddress);
    });

    it("2. setInfo of StakeTONControl ", async function () {
      await stakeTONControl.setInfo(
        ton.address, wton.address, tos.address,
        depositManager.address , seigManager.address, layer2.address,
        stakeAddresses.length  , {from: defaultSender }
      );
      expect(await stakeTONControl.ton()).to.be.equal(ton.address);
      expect(await stakeTONControl.wton()).to.be.equal(wton.address);
      expect(await stakeTONControl.tos()).to.be.equal(tos.address);
      expect(await stakeTONControl.depositManager()).to.be.equal(depositManager.address);
      expect(await stakeTONControl.seigManager()).to.be.equal(seigManager.address);
      expect(await stakeTONControl.layer2()).to.be.equal(layer2.address);
      expect(await stakeTONControl.countStakeTons()).to.be.bignumber.equal(toBN(stakeAddresses.length));

    });

    it("3. addStakeTons of StakeTONControl ", async function () {
      await stakeTONControl.addStakeTons(
        stakeAddresses,
        {from: defaultSender }
      );
      for(let i=0; i< stakeAddresses.length; i++){
          expect(await stakeTONControl.stakeTons(i+1)).to.be.eq(stakeAddresses[i]);
      }
    });

    it("4. updateReward in Tokamak ", async function () {
      this.timeout(1000000);
      let stakeOfs = [];
      for (let i = 0; i < stakeAddresses.length; i++) {
        let stakeOf = await seigManager.stakeOf(
            layer2.address,
            stakeAddresses[i]
          );
        stakeOfs.push(stakeOf);
      }

      // unstakingBlock = await time.latestBlock();
      // let currentBlockTime = parseInt(unstakingBlock)+50;
      // await time.advanceBlockTo(currentBlockTime);
      await time.increase(1000);

      await ico20Contracts.updateRewardTokamak(layer2, operator1);

      for (let i = 0; i < stakeAddresses.length; i++) {
        let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
        let totalStakedAmount = await contract.totalStakedAmount();

        let stakeOf = await seigManager.stakeOf(
            layer2.address,
            stakeAddresses[i]
          );

        expect(stakeOf)
            .to.be.bignumber.above(
              toBN(stakeOfs[i]));

        expect(toBN(stakeOf).div(toBN(10**9)))
            .to.be.bignumber.gt(totalStakedAmount);

      }
    });

    it("5. StakeTONUnstaking.requestUnstakingLayer2All ", async function () {
      this.timeout(1000000);

      let stakeInfos = [];
      let remainAmount = toBN('100000000000000000');

      for (let i = 0; i < stakeAddresses.length; i++) {
        const stakeOfPrev = await seigManager.stakeOf(
          layer2.address,
          stakeAddresses[i]
        );

        let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
        let toTokamak = await contract.toTokamak();
        let totalStakedAmount = await contract.totalStakedAmount();
        //console.log('totalStakedAmount',totalStakedAmount.toString());

        let amountOfStake1 = stakeOfPrev.sub(remainAmount);
        let amountOfStake = stakeOfPrev.sub(toTokamak);
        stakeInfos.push({
          num: i,
          totalStakedAmount: totalStakedAmount,
          amountOfStake1: amountOfStake1,
          amountOfStake:amountOfStake
        });
      }

      let contract = await StakeTONUpgrade2.at(stakeAddresses[1]);
      let endBlock = await contract.endBlock();
      const delayBlocks = await depositManager.globalWithdrawalDelay();
      let latest = await time.latestBlock();

      let pass = parseInt(endBlock.toString()) - delayBlocks+1;
      pass = parseInt(pass);
      await time.advanceBlockTo(pass);

      let can= await stakeTONControl2.canRequestUnstakingLayer2All();

      expect(can.can).to.be.eq(true);
      await stakeTONControl2.requestUnstakingLayer2All();


      for (let i = 0; i < stakeAddresses.length; i++) {

        const stakeOf = await seigManager.stakeOf(
          layer2.address,
          stakeAddresses[i]
        );

        if(can.canRequestUnStakingAll[i]){
            await expect(toBN(stakeOf).toString())
            .to.be.bignumber.equal(toBN('0').toString());
        } else if(can.canRequestUnStaking[i]){
           await expect(toBN(stakeOf).div(toBN(10**9)).toString())
            .to.be.bignumber.equal(toBN(stakeInfos[i].totalStakedAmount).toString());
        }

        stakeContractTokamak[i].stakeOf = stakeOf;
        //console.log('stakeOf',stakeOf.toString());

        const pendingOf = await depositManager.pendingUnstaked(
          layer2.address,
          stakeAddresses[i]
        );

        //console.log('pendingOf',i, pendingOf.toString());

        stakeContractTokamak[i].pendingOf = pendingOf;

        await expect(toBN(stakeInfos[i].totalStakedAmount).toString())
            .to.be.bignumber.lt(toBN(pendingOf).add(toBN(stakeOf)).div(toBN(10**9)).toString());

      }

      unstakingBlock = await time.latestBlock();

    });

    it("6. withdrawLayer2All fail when there is nothing withdrwable ", async function () {
      this.timeout(1000000);

      let can = await stakeTONControl.canWithdrawLayer2All();
      expect(can.can).to.be.eq(false);

      await expect(
           stakeTONControl.withdrawLayer2All({ from: defaultSender } )
        ).to.be.revertedWith("StakeTONControl: no available withdraw from layer2");

    });

    it("7. withdrawLayer2All ", async function () {
      this.timeout(1000000);

      let stakeOfs = [];
      const delayBlocks = await depositManager.globalWithdrawalDelay();


      let currentBlock = await time.latestBlock();

      let goBlock = parseInt(unstakingBlock) + parseInt(delayBlocks) ;

      if(goBlock > parseInt(currentBlock) ) {
          await time.advanceBlockTo(goBlock+1);
          currentBlock = await time.latestBlock();
      }

      for (let i = 0; i < stakeAddresses.length; i++) {
        stakeContractTokamak[i].tonBalance = await ton.balanceOf(stakeAddresses[i]);

        let contract = await StakeTONUpgrade2.at(stakeAddresses[i]);
        let canTokamakProcessUnStakingCount = await contract.canTokamakProcessUnStakingCount(layer2.address);

        let total = toBN(stakeContractTokamak[i].tonBalance).add(toBN(canTokamakProcessUnStakingCount.amount).div(toBN(10**9)));
        stakeOfs.push(total);

      }

      let can = await stakeTONControl.canWithdrawLayer2All();

      expect(can.can).to.be.eq(true);

      await stakeTONControl.withdrawLayer2All({ from: defaultSender } );

      for (let i = 0; i < stakeAddresses.length; i++) {
        let pendingOf = await depositManager.pendingUnstaked(
              layer2.address,
              stakeAddresses[i]
            );

        let currentTONAmount = await ton.balanceOf(stakeAddresses[i]);

        if(can.canProcessUnStaking[i] == true){
            expect(pendingOf).to.be.bignumber.equal(toBN('0'));
        }else{
            expect(pendingOf).to.be.bignumber.above(toBN('0'));
        }
        expect(stakeOfs[i]).to.be.bignumber.equal(currentTONAmount);
      }

    });

  });

});