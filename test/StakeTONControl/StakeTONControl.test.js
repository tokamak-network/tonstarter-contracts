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
  } = require("../stakeTONUpgrade3Constant");

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

const { getSignature, signatureValidTime, timeout } = require("../common");

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
  } = require("../../utils/ico_test_deploy.js");

let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
let stakeTONUpgrade, stakeTONUpgrade2, stakeTONUpgrade3, stakeTONProxy2, stakeTONControl ;
// ------------------------
const StakeTONTotalAbi = require("../../abis_stakeTONUpgrade/stakeTONTotal.json").abi;

const Stake1Vault = contract.fromArtifact("Stake1Vault");
const StakeTON = contract.fromArtifact("StakeTON");
const StakeTONUpgrade = contract.fromArtifact("StakeTONUpgrade");
const StakeTONUpgrade2 = contract.fromArtifact("StakeTONUpgrade2");
const StakeTONUpgrade3 = contract.fromArtifact("StakeTONUpgrade3");
const StakeTONProxy2 = contract.fromArtifact("StakeTONProxy2");
const StakeTONControl = contract.fromArtifact("StakeTONControl");
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
  pendingOf:0
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
describe("StakeTONControl ", function () {
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

  describe('*** # 8. multi control that withdrawAll and swap ', async function () {

    it("1. StakeTONControl deploy ", async function () {
      stakeTONControl = await StakeTONControl.new({ from: defaultSender });
      expect(stakeTONControl.address).to.not.eq(zeroAddress);
    });

    it("2. setInfo  ", async function () {
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

    it("2. addStakeTons ", async function () {

      await stakeTONControl.addStakeTons(
        stakeAddresses,
        {from: defaultSender }
      );
      for(let i=0; i< stakeAddresses.length; i++){
          expect(await stakeTONControl.stakeTons(i+1)).to.be.eq(stakeAddresses[i]);
      }
    });

    it("3. deleteStakeTon ", async function () {
      let index = 0;
      await stakeTONControl.deleteStakeTon(
        index+1,
        {from: defaultSender }
      );
      expect(await stakeTONControl.stakeTons(index+1)).to.be.eq(zeroAddress);
    });

    it("4. addStakeTon ", async function () {
      let index = 0;
      await stakeTONControl.addStakeTon(
        index+1,
        stakeAddresses[index],
        {from: defaultSender }
      );
      expect(await stakeTONControl.stakeTons(index+1)).to.be.eq(stakeAddresses[index]);
    });

  });

});