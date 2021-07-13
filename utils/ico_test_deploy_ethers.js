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

const Web3EthAbi = require('web3-eth-abi');

const chai = require("chai");
chai.use(require("chai-bn")(BN)).should();

const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");

// const linkLibraries = require("../test/uniswap-v3-stake/linkLibraries");
const TON1 = require("../abis_plasma_ethers/contracts/stake/tokens/TON.sol/TON.json");
const WTON1 = require("../abis_plasma_ethers/contracts/stake/tokens/WTON.sol/WTON.json");
const Layer2Registry1 = require("../abis_plasma_ethers/contracts/stake/Layer2Registry.sol/Layer2Registry.json");
const DepositManager1 = require("../abis_plasma_ethers/contracts/stake/managers/DepositManager.sol/DepositManager.json");
const CoinageFactory1 = require("../abis_plasma_ethers/contracts/stake/factory/CoinageFactory.sol/CoinageFactory.json");
const DAOVault1 = require("../abis_plasma_ethers/contracts/stake/dao/DAOVault.sol/DAOVault.json");
const SeigManager1 = require("../abis_plasma_ethers/contracts/stake/managers/SeigManager.sol/SeigManager.json");
const PowerTON1 = require("../abis_plasma_ethers/contracts/stake/powerton/PowerTON.sol/PowerTON.json");

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

const name = "Fair Launchpad Dao";
const symbol = "TOS";
const version = "1";

// ico2.0 contracts
let StakeFactory,
  StakeRegistry,
  TOS,
  STOS,
  StakeForSTOS,
  Stake1Vault,
  Stake1Logic,
  Stake1Proxy,
  StakeTON,
  IERC20;
let StakeTONFactory, StakeDefiFactory,
  StakeVaultFactory,
  StakeSimpleFactory, StakeTONProxyFactory ,
  StakeUniswapV3, StakeCoinageFactory, StakeUniswapV3Factory,
  Stake2Logic, Stake2VaultLogic ,
  StakeTONLogic, StakeSimple ;

// plasma-evm-contracts
let TON, WTON,
  DepositManager,
  SeigManager,
  CoinageFactory,
  Layer2Registry,
  AutoRefactorCoinage,
  PowerTON,
  DAOVault,
  SwapProxy;
let EtherToken, EpochHandler, SubmitHandler, Layer2;

let o;
process.on("exit", function () {
  console.log(o);
});

// const [candidate1, candidate2, candidate3, user1, user2, user3, user4, user5, operator1, operator2] = await ethers.getSigners();
let candidates, users, operators;
let deployer;

const initialTotal = "10000000000." + "0".repeat(18);
const Pharse1_TON_Staking = "175000000." + "0".repeat(18);
const Pharse1_ETH_Staking = "175000000." + "0".repeat(18);
const Pharse1_TOSETHLP_Staking = "150000000." + "0".repeat(18);
const Pharse1_DEV_Mining = "150000000." + "0".repeat(18);
const Pharse2_ETHTOS_Staking = "150000000." + "0".repeat(18);
const Pharse2_REWARD_PERBLOCK = "1.5" + "0".repeat(17);

const HASH_Pharse2_ETHTOS_Staking = keccak256("PHASE2_ETHTOS_STAKING");
const HASH_Pharse1_TON_Staking = keccak256("PHASE1_TON_STAKING");
const HASH_Pharse1_ETH_Staking = keccak256("PHASE1_ETH_STAKING");
const HASH_Pharse1_TOSETHLP_Staking = keccak256("PHASE1_TOSETHLP_Staking");
const HASH_Pharse1_DEV_Mining = keccak256("PHASE1_DEV_Mining");


// const deployTON = async () => {
//   const contract = await (
//     await ethers.getContractFactory(
//       TON.abi,
//       TON.bytecode
//     )
//   ).deploy();
//   const deployed = await contract.deployed();
//   return deployed;
// };

// const deployWTON = async () => {
//   const contract = await (
//     await ethers.getContractFactory(
//       WTON.abi,
//       WTON.bytecode
//     )
//   ).deploy();
//   const deployed = await contract.deployed();
//   return deployed;
// };


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
    this.swapProxy = null;

    this.layer2s = [];
    this.coinages = [];

    this.daoVault = null;
    this.agendaManager = null;
    this.candidateFactory = null;
    this.committee = null;
    this.committeeProxy = null;

    this.tos = null;
    this.stos = null;
    this.stakeForSTOS = null;


    this.stakeregister = null;
    this.stakefactory = null;
    this.stake1proxy = null;
    this.stake1logic = null;
    this.vault_phase1_eth = null;
    this.vault_phase1_ton = null;
    this.vault_phase1_tosethlp = null;
    this.vault_phase1_dev = null;
    this.stakeEntry = null;
    this.stakeEntry2 = null;

    this.stakeVaultFactory = null;
    this.stakeSimpleFactory = null;

    this.stakeTONfactory = null;
    //this.StakeDefiFactory = null;

    this.stakeregister = null;
    this.stakefactory = null;
    this.stake1proxy = null;
    this.stake1logic = null;
    this.vault_phase1_eth = null;
    this.vault_phase1_ton = null;
    this.vault_phase1_tosethlp = null;
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
      TOS: null,
      STOS: null,
      StakeForSTOS: null,
      StakeFactory: null,
      StakeRegistry: null,
      Stake1Logic: null,
      Stake1Proxy: null,
      Stake1Vault: null,
      StakeTON: null,
    };
  }


  findSigner = async function (address) {
    const signers = await ethers.getSigners();
    for (const signer of signers) {
      if (signer.address === address) {
        return signer;
      }
    }
    throw Error("Address not found in Signers");
  }

  timeout = async function(sec) {
    return new Promise((resolve) => {
      setTimeout(resolve, sec * 1000);
    });
  }

  initializeICO20Contracts = async function (owner1) {
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
    deployer = candidate1.address ;


    let owner = await this.findSigner(owner1);

    // this = self;
    // console.log(' initializeICO20Contracts owner:',owner );
    this.tos = null;
    //this.stos = null;
    //this.stakeForSTOS = null;


    this.stakeVaultFactory = null;
    this.stakeSimpleFactory = null;

    this.stakeTONfactory = null;
    this.stakeUniswapV3Factory = null;

    this.stakeregister = null;
    this.stakefactory = null;
    this.stake1proxy = null;
    this.stake1logic = null;
    this.vault_phase1_eth = null;
    this.vault_phase1_ton = null;
    this.vault_phase1_tosethlp = null;
    this.vault_phase1_dev = null;

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
    TOS = await ethers.getContractFactory("TOS");
    //STOS = await ethers.getContractFactory("STOS");
    //StakeForSTOS = await ethers.getContractFactory("StakeForSTOS");
    Stake1Vault = await ethers.getContractFactory("Stake1Vault");
    Stake1Logic = await ethers.getContractFactory("Stake1Logic");
    Stake1Proxy = await ethers.getContractFactory("Stake1Proxy");

    StakeTONFactory = await ethers.getContractFactory("StakeTONFactory");
    //StakeDefiFactory = await ethers.getContractFactory("StakeDefiFactory");
    //SwapProxy = await ethers.getContractFactory("SwapProxy");

    StakeUniswapV3 = await ethers.getContractFactory("StakeUniswapV3");
    StakeCoinageFactory = await ethers.getContractFactory("StakeCoinageFactory");
    StakeUniswapV3Factory = await ethers.getContractFactory("StakeUniswapV3Factory");

    Stake2Logic = await ethers.getContractFactory("Stake2Logic");
    Stake2VaultLogic = await ethers.getContractFactory("Stake2Vault");

    //this.swapProxy = await SwapProxy.connect(owner).deploy();

    this.tos = await TOS.connect(owner).deploy(name, symbol, version);
    //this.stos = await STOS.connect(owner).deploy();

    this.stakeregister = await StakeRegistry.connect(owner).deploy(this.tos.address);

    this.stakeSimple = await StakeSimple.connect(owner).deploy();
    this.stakeSimpleFactory = await StakeSimpleFactory.connect(owner).deploy(this.stakeSimple.address);

    this.stake1Vault = await Stake1Vault.connect(owner).deploy();
    this.stakeVaultFactory = await StakeVaultFactory.connect(owner).deploy(this.stake1Vault.address);

    this.stakeTONLogic = await StakeTONLogic.connect(owner).deploy();
    this.stakeTONProxyFactory = await StakeTONProxyFactory.connect(owner).deploy();

    this.stakeTONfactory = await StakeTONFactory.connect(owner).deploy(
      this.stakeTONProxyFactory.address,
      this.stakeTONLogic.address
    );

    //--for phase2
    //--set stakeUniswapV3
    this.stakeUniswapV3Logic = await StakeUniswapV3.connect(owner).deploy();
    this.stakeCoinageFactory = await StakeCoinageFactory.connect(owner).deploy()

    this.stakeUniswapV3Factory = await StakeUniswapV3Factory.connect(owner).deploy(this.stakeUniswapV3Logic.address,
        this.stakeCoinageFactory.address);


    // this.stakeDefiFactory = await stakeDefiFactory.connect(
    //   owner
    // ).deploy(this.stakeSimple.address);

    this.stakefactory = await StakeFactory.connect(owner).deploy(
      this.stakeSimpleFactory.address,
      this.stakeTONfactory.address,
      this.stakeUniswapV3Factory.address
    );
    this.stake1logic = await Stake1Logic.connect(owner).deploy();
    this.stake1proxy = await Stake1Proxy.connect(owner).deploy(this.stake1logic.address);

    // await this.stake1proxy.connect(owner).upgradeTo(this.stake1logic.address);

    this.stakeEntry = await ethers.getContractAt(
      "Stake1Logic",
      this.stake1proxy.address
    );

    this.stake2logic = await Stake2Logic.connect(owner).deploy();
    this.stake2vaultlogic = await Stake2VaultLogic.connect(owner).deploy();

    this.stakeEntry2 = await ethers.getContractAt(
      "Stake2Logic",
      this.stake1proxy.address
    );


    const returnData = {
      tos: this.tos,
      stos: this.stos,
      // stakeregister: this.stakeregister,
      // stakefactory: this.stakefactory,
      // stake1logic: this.stake1logic,
      // stake1proxy: this.stake1proxy,
      // stakeEntry: this.stakeEntry,
      swapProxy: this.swapProxy,
      stakeSimpleFactory: this.stakeSimpleFactory,
      stakeUniswapV3Factory: this.stakeUniswapV3Factory,
      stakeTONfactory: this.stakeTONfactory,
      stakeregister: this.stakeregister,
      stakefactory: this.stakefactory,
      stake1logic: this.stake1logic,
      stake1proxy: this.stake1proxy,
      stakeEntry: this.stakeEntry,
      stakeUniswapV3Logic: this.stakeUniswapV3Logic,
      stakeCoinageFactory: this.stakeCoinageFactory,
      stakeUniswapV3Factory: this.stakeUniswapV3Factory,
      stakeCoinageFactory: this.stakeUniswapV3Logic,
      stake2logic: this.stake2logic,
      stake2vaultlogic: this.stake2vaultlogic,
      stakeEntry2 : this.stakeEntry2,
      stakeVaultFactory: this.stakeVaultFactory

    };
    // console.log(' initializeICO20Contracts  :',returnData );

    return returnData;
  };

  initializePlasmaEvmContracts = async function (owner1) {


    let owner = await this.findSigner(owner1);

    // this = self;
    // console.log(' initializePlasmaEvmContracts owner:',owner );
    //TON = await ethers.getContractFactory("TON");
    TON = await ethers.getContractFactory(
      TON1.abi,
      TON1.bytecode
    )

    //WTON = await ethers.getContractFactory("WTON");
    WTON = await ethers.getContractFactory(
      WTON1.abi,
      WTON1.bytecode
    )
    // Layer2Registry = await ethers.getContractFactory("Layer2Registry");
    Layer2Registry = await ethers.getContractFactory(
      Layer2Registry1.abi,
      Layer2Registry1.bytecode
    )
    // DepositManager = await ethers.getContractFactory("DepositManager");
    DepositManager = await ethers.getContractFactory(
      DepositManager1.abi,
      DepositManager1.bytecode
    )
    // CoinageFactory = await ethers.getContractFactory("CoinageFactory");
    CoinageFactory = await ethers.getContractFactory(
      CoinageFactory1.abi,
      CoinageFactory1.bytecode
    )
    // DAOVault = await ethers.getContractFactory("DAOVault");
    DAOVault = await ethers.getContractFactory(
      DAOVault1.abi,
      DAOVault1.bytecode
    )
    // SeigManager = await ethers.getContractFactory("SeigManager");
    SeigManager = await ethers.getContractFactory(
      SeigManager1.abi,
      SeigManager1.bytecode
    )
    // PowerTON = await ethers.getContractFactory("PowerTON");
    PowerTON = await ethers.getContractFactory(
      PowerTON1.abi,
      PowerTON1.bytecode
    )
   // console.log("HI1");

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
    //console.log("HI2");

    this.seigManager = await SeigManager.connect(owner).deploy(
      this.ton.address,
      this.wton.address,
      this.registry.address,
      this.depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      this.factory.address
    );
    //console.log("HI3,ROUND_DURATION",ROUND_DURATION.toString(), this.seigManager.address, this.wton.address);

    // this.powerton = await PowerTON.connect(owner).deploy(
    //   this.seigManager.address,
    //   this.wton.address,
    //   ROUND_DURATION
    // );
     this.powerton = await PowerTON.connect(owner).deploy(
      this.seigManager.address,
      this.wton.address,
      300
    );
    await this.timeout(2);

    //console.log("HI3-0");
    await this.powerton.connect(owner).init();
    //console.logå("HI3-1");
    await this.seigManager.connect(owner).setPowerTON(this.powerton.address);
    await this.powerton.connect(owner).start();
    await this.seigManager.connect(owner).setDao(this.daoVault.address);
    await this.wton.connect(owner).addMinter(this.seigManager.address);
    await this.ton.connect(owner).addMinter(this.wton.address);

    //console.log("HI3-2" , this.depositManager.address, this.wton.address , this.seigManager.address);
     await this.timeout(2);
    // await Promise.all(
    //   [this.depositManager, this.wton].map((contract) =>
    //     contract.connect(owner).setSeigManager(this.seigManager.address)
    //   )
    // );

    await this.depositManager.connect(owner).setSeigManager(this.seigManager.address);
    await this.wton.connect(owner).setSeigManager(this.seigManager.address);

    //console.log("HI4");
    await this.timeout(2);
    /*
    // ton setting
    await this.ton.connect(owner).mint(deployer, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));
    await this.ton
      .connect(owner)
      .approve(this.wton.address, TON_INITIAL_SUPPLY.toFixed(TON_UNIT));


    await this.timeout(2);
    this.seigManager
      .connect(owner)
      .setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
    this.seigManager
      .connect(owner)
      .setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
    this.seigManager.connect(owner).setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));
    console.log("HI5");

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

    await this.timeout(2);
    await this.wton
      .connect(owner)
      .mint(this.daoVault.address, TON_VAULT_AMOUNT.toFixed(WTON_UNIT));
    */

    await this.seigManager
      .connect(owner)
      .setMinimumAmount(
        TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT)
      );

    //console.log("HI6");

    await this.timeout(2);
    const returnData = {
      ton: this.ton,
      wton: this.wton,
      registry: this.registry,
      depositManager: this.depositManager,
      coinageFactory: this.factory,
      daoVault: this.daoVault,
      seigManager: this.seigManager,
      powerton: this.powerton
    };
    return returnData;
  };


  getPlasamContracts = function () {
    return {
      ton: this.ton,
      wton: this.wton,
      registry: this.registry,
      depositManager: this.depositManager,
      coinageFactory: this.coinageFactory,
      daoVault: this.daoVault,
      seigManager: this.seigManager,
      powerton: this.powerton,
    };
  };

  getICOContracts = function () {
    return {
      tos: this.tos,
      stakeregister: this.stakeregister,
      stakefactory: this.stakefactory,
      stake1logic: this.stake1logic,
      stake1proxy: this.stake1proxy,
      stakeEntry: this.stakeEntry,
      stakeEntry2: this.stakeEntry2,
      stakeUniswapV3Factory: this.stakeUniswapV3Factory,
      stakeTONfactory: this.stakeTONfactory,
      stakeSimpleFactory: this.stakeSimpleFactory,
      stakeVaultFactory : this.stakeVaultFactory
    };
  };

  setEntry = async function (owner) {
    const uniswapRouter = "0xe592427a0aece92de3edee1f18e0157c05861564";
    const uniswapNPM ="0xd1e1C3995695650ABc3Ea3c68ae5d365b35174ED";
    const uniswapWeth ="0xe592427a0aece92de3edee1f18e0157c05861564";
    const uniswapFee ="3000";
    const uniswapRouter2 ="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";


    await this.stakeEntry.connect(owner).setStore(
      this.tos.address,
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
        this.seigManager.address,
        this.swapProxy.address
      );

    await this.stakeregister
      .connect(owner)
      .addDefiInfo(
        "UNISWAP_V3",
        uniswapRouter,
        uniswapNPM,
        uniswapWeth,
        uniswapFee,
        uniswapRouter2
      );

    await this.stakeregister
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);

    await this.stakefactory
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);

    return this.stakeEntry;
  };

  setEntryExceptUniswap = async function (owner1) {

    let owner = await this.findSigner(owner1);
    await this.stakeEntry.connect(owner).setStore(
      this.tos.address,
      this.stakeregister.address,
      this.stakefactory.address,
      this.stakeVaultFactory.address,
      this.ton.address,
      this.wton.address,
      this.depositManager.address,
      this.seigManager.address
    );

    await this.stakeregister
      .connect(owner)
      .setTokamak(
        this.ton.address,
        this.wton.address,
        this.depositManager.address,
        this.seigManager.address,
        this.ton.address
      );

    // await this.stakeregister
    //   .connect(owner)
    //   .addDefiInfo(
    //     "UNISWAP_V3",
    //     uniswapRouter,
    //     uniswapNPM,
    //     uniswapWeth,
    //     uniswapFee,
    //     uniswapRouter2
    //   );

    await this.stakeregister
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);

    await this.stakefactory
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);

    await this.stakeVaultFactory
      .connect(owner)
      .grantRole(ADMIN_ROLE, this.stake1proxy.address);


    // attach stake2logic
    let _func1 = Web3EthAbi.encodeFunctionSignature("balanceOf(address,address)") ;
    let _func2 = Web3EthAbi.encodeFunctionSignature("balanceOfTOS(address)") ;
    let _func3 = Web3EthAbi.encodeFunctionSignature("createVault2(uint256,uint256,uint256,bytes32,uint256,address[4],string)") ;
    let _func4 = Web3EthAbi.encodeFunctionSignature("setVaultLogicByPhase(uint256,address)") ;

    await this.stake1proxy.connect(owner).setImplementation(
      this.stake2logic.address,
      ethers.BigNumber.from("1"), true);


    await this.stake1proxy
      .connect(owner)
      .setSelectorImplementations([_func1, _func2, _func3, _func4], this.stake2logic.address);

    await this.stakeEntry2
      .connect(owner)
      .setVaultLogicByPhase(ethers.BigNumber.from("2"), this.stake2vaultlogic.address);


    return this.stakeEntry;
  };

}

module.exports = {
  ICO20Contracts,
  initialTotal,
  Pharse1_TON_Staking,
  Pharse1_ETH_Staking,
  Pharse1_TOSETHLP_Staking,
  Pharse1_DEV_Mining,
  Pharse2_ETHTOS_Staking,
  Pharse2_REWARD_PERBLOCK,
  HASH_Pharse1_TON_Staking,
  HASH_Pharse1_ETH_Staking,
  HASH_Pharse1_TOSETHLP_Staking,
  HASH_Pharse1_DEV_Mining,
  HASH_Pharse2_ETHTOS_Staking
  };