const { expect } = require("chai");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time,
  ether,
} = require("@openzeppelin/test-helpers");

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

const chai = require("chai");
chai.use(require("chai-bn")(BN)).should();

const { createCurrency, createCurrencyRatio } = require("@makerdao/currency");

const _TON = createCurrency("TON");
const _WTON = createCurrency("WTON");
const _WTON_TON = createCurrencyRatio(_WTON, _TON);

const TON_UNIT = "wei";
const WTON_UNIT = "ray";
const WTON_TON_RATIO = _WTON_TON("1");

const WITHDRAWAL_DELAY = 10;
const SEIG_PER_BLOCK = _WTON("3.92");
const ROUND_DURATION = time.duration.minutes(5);

const TON_INITIAL_SUPPLY = _TON("50000000");
const TON_INITIAL_HOLDERS = _TON("1000000");
const TON_VAULT_AMOUNT = _WTON("10000000");

const POWERTON_SEIG_RATE = _WTON("0.1");
const DAO_SEIG_RATE = _WTON("0.5");
const PSEIG_RATE = _WTON("0.4");

const TON_MINIMUM_STAKE_AMOUNT = _TON("1000");


// ico2.0 contracts
let StakeFactory,
  StakeRegistry,
  FLD,
  SFLD,
  StakeForSFLD,
  Stake1Vault,
  Stake1Logic,
  Stake1Proxy,
  StakeTON,
  IERC20;
let StakeTONFactory, StakeDefiFactory,
  StakeVaultFactory,
  StakeSimpleFactory;

// plasma-evm-contracts
let TON,
  WTON,
  DepositManager,
  SeigManager,
  CoinageFactory,
  Layer2Registry,
  AutoRefactorCoinage,
  PowerTON,
  DAOVault;
let EtherToken, EpochHandler, SubmitHandler, Layer2;

let o;
process.on("exit", function () {
  console.log(o);
});

// const [candidate1, candidate2, candidate3, user1, user2, user3, user4, user5, operator1, operator2] = await ethers.getSigners();
let candidates, users, operators;
let deployer;

class ICO20Contracts {
  constructor() {
    this.ton = null;
    this.wton = null;
    this.registry = null;
    this.depositManager = null;
    this.factory = null;
    // this.oldDaoVault = null;
    this.seigManager = null;
    this.powerton = null;

    this.layer2s = [];
    this.coinages = [];

    this.daoVault = null;
    this.agendaManager = null;
    this.candidateFactory = null;
    this.committee = null;
    this.committeeProxy = null;

    this.fld = null;
    this.sfld = null;
    this.stakeForSFLD = null;

    this.stakeVaultFactory = null;
    this.stakeSimpleFactory = null;

    this.stakeTONfactory = null;
    this.StakeDefiFactory = null;

    this.stakeregister = null;
    this.stakefactory = null;
    this.stake1proxy = null;
    this.stake1logic = null;
    this.vault_phase1_eth = null;
    this.vault_phase1_ton = null;
    this.vault_phase1_fldethlp = null;
    this.vault_phase1_dev = null;
    this.stakeEntry = null;

    this.AbiObject = {
      TON: null,
      WTON: null,
      DepositManager: null,
      SeigManager: null,
      Layer2Registry: null,
      PowerTON: null,
      DAOVault: null,
      Committee: null,
      Agenda: null,
      Candidate: null,
      CommitteeProxy: null,
      FLD: null,
      SFLD: null,
      StakeForSFLD: null,
      StakeFactory: null,
      StakeRegistry: null,
      Stake1Logic: null,
      Stake1Proxy: null,
      Stake1Vault: null,
      Stake1: null,
    };
  }

  initializeICO20Contracts = async function (owner) {
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
    ] = await ethers.getSigners();
    candidates = [candidate1, candidate2, candidate3];
    users = [user1, user2, user3, user4, user5];
    operators = [operator1, operator2];
    deployer = candidate1;

    // this = self;
    // console.log(' initializeICO20Contracts owner:',owner );
    this.fld = null;
    this.sfld = null;
    //this.stakeForSFLD = null;
    this.stakeregister = null;
    this.stakefactory = null;
    this.stake1proxy = null;
    this.stake1logic = null;
    this.vault_phase1_eth = null;
    this.vault_phase1_ton = null;
    this.vault_phase1_fldethlp = null;
    this.vault_phase1_dev = null;

    this.stakeTONfactory = null;
    this.StakeDefiFactory = null;

    this.stakeVaultFactory = null;
    this.stakeSimpleFactory = null;

    StakeTONProxyFactory = await ethers.getContractFactory("StakeTONProxyFactory");
    StakeTONLogic = await ethers.getContractFactory(
      "StakeTON"
    );
    StakeVaultFactory = await ethers.getContractFactory("StakeVaultFactory");

    StakeSimple = await ethers.getContractFactory("StakeSimple");
    StakeSimpleFactory = await ethers.getContractFactory("StakeSimpleFactory");

    StakeFactory = await ethers.getContractFactory("StakeFactory");
    StakeRegistry = await ethers.getContractFactory("StakeRegistry");
    FLD = await ethers.getContractFactory("FLD");
    SFLD = await ethers.getContractFactory("SFLD");
    StakeForSFLD = await ethers.getContractFactory("StakeForSFLD");
    Stake1Vault = await ethers.getContractFactory("Stake1Vault");
    Stake1Logic = await ethers.getContractFactory("Stake1Logic");
    Stake1Proxy = await ethers.getContractFactory("Stake1Proxy");

    StakeTONFactory = await ethers.getContractFactory("StakeTONFactory");
    StakeDefiFactory = await ethers.getContractFactory("StakeDefiFactory");

    this.fld = await FLD.connect(owner).deploy();
    this.sfld = await SFLD.connect(owner).deploy();

    this.stakeregister = await StakeRegistry.connect(owner).deploy(this.fld.address);

    this.stake1Vault = await Stake1Vault.new({ from: owner });
    this.stakeVaultFactory = await StakeVaultFactory.connect(owner).deploy(this.stake1Vault.address);

    this.stakeSimple = await StakeSimple.connect(owner).deploy();
    this.stakeSimpleFactory = await StakeSimpleFactory.connect(owner).deploy(this.stakeSimple.address);

    this.stakeTONProxyFactory = await StakeTONProxyFactory.connect(owner).deploy();
    this.stakeTONLogic = await StakeTONLogic.connect(owner).deploy();

    this.stakeTONfactory = await StakeTONFactory.connect(owner).deploy(
      this.stakeTONProxyFactory.address,
      this.stakeTONLogic.address
    );

    this.stakeDefiFactory = await stakeDefiFactory.connect(
      owner
    ).deploy(this.stakeSimple.address);

    this.stakefactory = await StakeFactory.connect(owner).deploy(
      this.stakeSimpleFactory.address,
      this.stakeTONfactory.address,
      this.stakeDefiFactory.address
    );
    this.stake1logic = await Stake1Logic.connect(owner).deploy();
    this.stake1proxy = await Stake1Proxy.connect(owner).deploy();

    await this.stake1proxy.connect(owner).upgradeTo(this.stake1logic.address);

    this.stakeEntry = await ethers.getContractAt(
      "Stake1Logic",
      this.stake1proxy.address
    );

    const returnData = {
      fld: this.fld,
      sfld: this.sfld,
      // stakeForSFLD: this.stakeForSFLD,
      stakeregister: this.stakeregister,
      stakefactory: this.stakefactory,
      stake1logic: this.stake1logic,
      stake1proxy: this.stake1proxy,
      stakeEntry: this.stakeEntry,
    };
    // console.log(' initializeICO20Contracts  :',returnData );

    return returnData;
  };

  initializePlasmaEvmContracts = async function (owner) {
    // this = self;
    // console.log(' initializePlasmaEvmContracts owner:',owner );
    TON = await ethers.getContractFactory("TON");
    WTON = await ethers.getContractFactory("WTON");
    Layer2Registry = await ethers.getContractFactory("Layer2Registry");
    DepositManager = await ethers.getContractFactory("DepositManager");
    CoinageFactory = await ethers.getContractFactory("CoinageFactory");
    DAOVault = await ethers.getContractFactory("DAOVault");
    SeigManager = await ethers.getContractFactory("SeigManager");
    PowerTON = await ethers.getContractFactory("PowerTON");
    console.log("HI1");

    this.ton = await TON.connect(owner).deploy();
    this.wton = await WTON.connect(owner).deploy(this.ton.address);
    this.registry = await Layer2Registry.connect(owner).deploy();
    this.depositManager = await DepositManager.connect(owner).deploy(
      this.wton.address,
      this.registry.address,
      WITHDRAWAL_DELAY
    );
    this.factory = await CoinageFactory.connect(owner).deploy();

    const currentTime = await time.latest();
    this.daoVault = await DAOVault.connect(owner).deploy(
      this.wton.address,
      currentTime.toString()
    );
    console.log("HI2");

    this.seigManager = await SeigManager.connect(owner).deploy(
      this.ton.address,
      this.wton.address,
      this.registry.address,
      this.depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      this.factory.address
    );
    console.log("HI3");

    this.powerton = await PowerTON.connect(owner).deploy(
      this.seigManager.address,
      this.wton.address,
      ROUND_DURATION
    );
    await this.powerton.connect(owner).init();

    await this.seigManager.connect(owner).setPowerTON(this.powerton.address);
    await this.powerton.connect(owner).start();
    await this.seigManager.connect(owner).setDao(this.daoVault.address);
    await this.wton.connect(owner).addMinter(this.seigManager.address);
    await this.ton.connect(owner).addMinter(this.wton.address);

    await Promise.all(
      [this.depositManager, this.wton].map((contract) =>
        contract.connect(owner).setSeigManager(this.seigManager.address)
      )
    );
    console.log("HI4");

    // ton setting
    await this.ton
      .connect(owner)
      .mint(deployer, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));
    await this.ton
      .connect(owner)
      .approve(this.wton.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));

    this.seigManager
      .connect(owner)
      .setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
    this.seigManager
      .connect(owner)
      .setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
    this.seigManager.connect(owner).setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));
    await candidates.map((account) =>
      this.ton
        .connect(owner)
        .transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT))
    );
    await users.map((account) =>
      this.ton
        .connect(owner)
        .transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT))
    );
    await operators.map((account) =>
      this.ton
        .connect(owner)
        .transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT))
    );

    await this.wton
      .connect(owner)
      .mint(this.daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));

    await this.seigManager
      .connect(owner)
      .setMinimumAmount(
        TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT)
      );

    const returnData = {
      ton: this.ton,
      wton: this.wton,
      registry: this.registry,
      depositManager: this.depositManager,
      coinageFactory: this.factory,
      daoVault: this.daoVault,
      seigManager: this.seigManager,
      powerton: this.powerton,
    };
    return returnData;
  };

  getICOContracts = function () {
    return {
      fld: this.fld,
      sfld: this.sfld,
      // stakeFroSFLD: this.stakeFroSFLD,
      stakeregister: this.stakeregister,
      stakefactory: this.stakefactory,
      stake1logic: this.stake1logic,
      stake1proxy: this.stake1proxy,
      stakeEntry: this.stakeEntry,
    };
  };

  setEntry = async function (owner) {
    await this.stakeEntry.connect(owner).setStore(
      this.fld.address,
      this.stakeregister.address,
      this.stakefactory.address,
      this.stakeVaultFactory.address,
      this.ton.address,
      this.wton.address,
      this.depositManager.address,
      this.seigManager.address,
      { from: owner }
    );

    await this.stakeregister
      .connect(owner)
      .setTokamak(
        this.ton.address,
        this.wton.address,
        this.depositManager.address,
        this.seigManager.address
      );

    await this.stakeregister
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);

    await this.stakefactory
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);

    return this.stakeEntry;
  };
}

module.exports = ICO20Contracts;
