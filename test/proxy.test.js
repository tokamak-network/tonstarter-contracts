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
const { expect, assert} = chai;
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
// ---------------------
const logFlag = 0;

const zeroAddress = "0x0000000000000000000000000000000000000000";

describe("Stake1Proxy : Change Implementation", function () {
  let weth, tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth,
    vault_phase1_ton,
    vault_phase1_tosethlp,
    vault_phase1_dev;

  let stakeEntry;

  let a1, a2, tokenInfo;
  const sendAmount = "1";
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const userPrivate2 = privateKeys[2];
  let salePeriod = 50;
  let stakingPeriod = 100;
  let saleStartBlock = 0;
  let stakeStartBlock = 0;
  let stakeEndBlock = 0;
  let stakeAddresses;

  const Stake2Logic = contract.fromArtifact("Stake2Logic");
  const Stake1Proxy = contract.fromArtifact("Stake1Proxy");

  let stake2Logic, vaultAddress, stake2proxy;
  let _func1 = web3.eth.abi.encodeFunctionSignature("balanceOf(address,address)") ;
  let _func2 = web3.eth.abi.encodeFunctionSignature("balanceOfTOS(address)") ;

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
      tos = cons.tos;
      stakeregister = cons.stakeregister;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;
    });

  });

  describe('# 2. Set Stake2Logic', async function () {
    it("1. create Stake2Logic ", async function () {
      this.timeout(1000000);
      stake2Logic = await Stake2Logic.new({ from: defaultSender });
    });

    it("2. Check onlyOwner Function : Revert when running by non-admin", async function() {
      let _index = 1;
      await expect(
        stake1proxy.setImplementation(stake2Logic.address, _index, true, { from: user1 })
      ).to.be.revertedWith("Accessible: Caller is not an admin");

      await expect(
        stake1proxy.setAliveImplementation(stake2Logic.address, true, { from: user1 })
      ).to.be.revertedWith("Accessible: Caller is not an admin");

      await expect(
        stake1proxy.setSelectorImplementations([_func1, _func2], stake2Logic.address, { from: user1 })
      ).to.be.revertedWith("Accessible: Caller is not an admin");

    });

    it("3. setImplementation ", async function () {
      this.timeout(1000000);
      let _index = 1;
      await stake1proxy.setImplementation(stake2Logic.address, _index, true, { from: defaultSender });

      expect(await stake1proxy.implementation(_index)).to.be.equal(stake2Logic.address);

    });

    it('4. setSelectorImplementations ', async function () {
      await stake1proxy.setSelectorImplementations([_func1, _func2], stake2Logic.address, { from: defaultSender });
      expect(await stake1proxy.getSelectorImplementation(_func1)).to.be.equal(stake2Logic.address);
      expect(await stake1proxy.getSelectorImplementation(_func2)).to.be.equal(stake2Logic.address);
    });
  });

  describe('# 3. Vault & StakeContract Setting', async function () {
    it("1. Create Vault", async function () {
      const current = await time.latestBlock();
      saleStartBlock = 100;
      saleStartBlock = parseInt(saleStartBlock.toString());
      saleStartBlock = saleStartBlock + salePeriod;
      stakeStartBlock = saleStartBlock + stakingPeriod;

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

      vaultAddress = tx.receipt.logs[tx.receipt.logs.length - 1].args.vault;

      vault_phase1_eth = await Stake1Vault.at(vaultAddress, {
        from: defaultSender,
      });
      await tos.mint(
        vault_phase1_eth.address,
        utils.parseUnits(Pharse1_ETH_Staking, 18),
        { from: defaultSender }
      );
    });

  });

  describe('# 4. Call Stake2Logic ', async function () {
    it('1. call balanceOf(address, address)', async function () {
      stake2proxy = await Stake2Logic.at(stake1proxy.address, {
        from: defaultSender,
      });

      let balanceAmount = await stake2proxy.balanceOf(tos.address, vaultAddress);
      expect(toBN(balanceAmount).toString()).to.be.equal(utils.parseUnits(Pharse1_ETH_Staking, 18).toString());
    });

    it('2. call balanceOfTOS(address)', async function () {

      let balanceTOSAmount = await stake2proxy.balanceOfTOS(vaultAddress);
      expect(toBN(balanceTOSAmount).toString()).to.be.equal(utils.parseUnits(Pharse1_ETH_Staking, 18).toString());

    });

  });


  describe('# 5. setAliveImplementation(logic2, false)', async function () {
    it('1. setAliveImplementation(logic2, false)', async function () {
        await stake1proxy.setAliveImplementation(stake2Logic.address, false, { from: defaultSender })
        expect(
          await stake1proxy.getSelectorImplementation(_func1, { from: user1 })
        ).to.be.equal(stake1logic.address);
    });

    it('2. error balanceOf(address, address)', async function () {
      try {
        await stake1proxy.balanceOf(tos.address, vaultAddress, { from: user1 });
      } catch (err) {
        expect(err.toString()).to.be.equal('TypeError: stake1proxy.balanceOf is not a function');
      }

    });

    it('3. error balanceOfTOS(address)', async function () {
        try {
          await stake1proxy.balanceOfTOS(vaultAddress, { from: user1 });
        } catch (err) {
          expect(err.toString()).to.be.equal('TypeError: stake1proxy.balanceOfTOS is not a function');
        }
    });

  });

  describe('# 6. upgradeTo(impl, _index)', async function () {
    it('1. upgradeTo ', async function () {
        await stake1proxy.upgradeTo(stake2Logic.address, 0, { from: defaultSender })
        expect(
          await stake1proxy.getSelectorImplementation(_func1, { from: user1 })
        ).to.be.equal(stake2Logic.address);
    });

    it('2. call balanceOf(address, address)', async function () {
      stake2proxy = await Stake2Logic.at(stake1proxy.address, {
        from: defaultSender,
      });
      let balanceAmount = await stake2proxy.balanceOf(tos.address, vaultAddress);
      expect(toBN(balanceAmount).toString()).to.be.equal(utils.parseUnits(Pharse1_ETH_Staking, 18).toString());
    });

    it('3. call balanceOfTOS(address)', async function () {
      let balanceTOSAmount = await stake2proxy.balanceOfTOS(vaultAddress);
      expect(toBN(balanceTOSAmount).toString()).to.be.equal(utils.parseUnits(Pharse1_ETH_Staking, 18).toString());

    });

    it("4. error Create Vault", async function () {
      const current = await time.latestBlock();
      saleStartBlock = 100;
      saleStartBlock = parseInt(saleStartBlock.toString());
      saleStartBlock = saleStartBlock + salePeriod;
      stakeStartBlock = saleStartBlock + stakingPeriod;

      await expect(
        stakeEntry.createVault(
            zeroAddress,
            utils.parseUnits(Pharse1_ETH_Staking, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            toBN("1"),
            HASH_Pharse1_ETH_Staking,
            toBN("1"),
            zeroAddress,
            { from: defaultSender }
          )
      ).to.be.reverted;
    });
  });
});