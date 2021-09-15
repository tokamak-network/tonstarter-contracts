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
// ------------------------
const Stake1Vault = contract.fromArtifact("Stake1Vault");
const StakeTON = contract.fromArtifact("StakeTON");
const StakeTONUpgrade = contract.fromArtifact("StakeTONUpgrade");
const StakeTONProxy = contract.fromArtifact("StakeTONProxy");
const IERC20 = contract.fromArtifact("IERC20");
// ----------------------

saleStartBlock = 100;
let salePeriod = 50;
let stakingPeriod = 100;

const zeroAddress = "0x0000000000000000000000000000000000000000";

let logFlag = false;

describe("StakeTON: Upgrade", function () {
  let weth, tos, stakeregister, stakefactory, stake1proxy, stake1logic, stakeTONLogic;
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
  let stakeTonNew;

  const ADMIN_ROLE = keccak256("ADMIN");

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
      stakeTONLogic = cons.stakeTONLogic;
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
        console.log(" PHASE1_TON_Staking ", PHASE1_TON_Staking);
      }

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

  describe('# 3. Upgrade StakeTON to StakeTONUpgrade on particular stakeContract', async function () {
    it("1. Create StakeTONUpgrade", async function () {
        this.timeout(1000000);
        stakeTonNew = await StakeTONUpgrade.new({ from: defaultSender });

    });

    it("2. Upgrade StakeTON to StakeTONUpgrade of particular StakeContract", async function () {
        this.timeout(1000000);
        let i=0;
        await stakeEntry.upgradeStakeTo(stakeAddresses[i], stakeTonNew.address, { from: defaultSender });

        let stakeTonProxy = await StakeTONProxy.at(stakeAddresses[i]);

        let imp = await stakeTonProxy.implementation();
        expect(imp).to.be.equal(stakeTonNew.address);

        let stakeContract0 = await StakeTONUpgrade.at(stakeAddresses[i]);
        let version = await stakeContract0.version();

        expect(version).to.be.equal("upgrade.20210803");

    });

    it("3. Not Change StakeTON Of other StakeContract", async function () {
        this.timeout(1000000);
        let i=1;

        let stakeTonProxy = await StakeTONProxy.at(stakeAddresses[i]);
        let imp = await stakeTonProxy.implementation();
        expect(imp).to.be.equal(stakeTONLogic.address);

        let stakeContract1 = await StakeTONUpgrade.at(stakeAddresses[i]);
        await expect(
          stakeContract1.version()
        ).to.be.reverted;

    });


  });

});
