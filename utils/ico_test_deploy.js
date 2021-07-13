const {
  defaultSender,
  accounts,
  contract,
  web3,
} = require("@openzeppelin/test-environment");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time,
  ether,
} = require("@openzeppelin/test-helpers");
const { ethers } = require("ethers");
const utils = ethers.utils;
const { marshalString, unmarshalString } = require("../test/helpers/marshal");

const { createCurrency, createCurrencyRatio } = require("@makerdao/currency");

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
const { expect } = chai;
chai.use(require("chai-bn")(BN)).should();

const name = "Fair Launchpad Dao";
const symbol = "TOS";
const version = "1";

// ico2.0 contracts
const StakeTONFactory = contract.fromArtifact("StakeTONFactory");

const StakeSimple = contract.fromArtifact("StakeSimple");
const StakeSimpleFactory = contract.fromArtifact("StakeSimpleFactory");
const StakeVaultFactory = contract.fromArtifact("StakeVaultFactory");

const StakeTONLogic = contract.fromArtifact("StakeTON");
const StakeTONProxyFactory = contract.fromArtifact("StakeTONProxyFactory");

const StakeFactory = contract.fromArtifact("StakeFactory");
const StakeRegistry = contract.fromArtifact("StakeRegistry");
const TOS = contract.fromArtifact("TOS");
//const STOS = contract.fromArtifact("STOS");
//const StakeForSTOS = contract.fromArtifact("StakeForSTOS");
const Stake1Vault = contract.fromArtifact("Stake1Vault");
const Stake1Logic = contract.fromArtifact("Stake1Logic");
const Stake1Proxy = contract.fromArtifact("Stake1Proxy");
const StakeTON = contract.fromArtifact("StakeTON");
const IERC20 = contract.fromArtifact("IERC20");

const LibTokenStake1 = contract.fromArtifact("LibTokenStake1");

//--- phase2
const StakeUniswapV3Factory = contract.fromArtifact("StakeUniswapV3Factory");

const Stake2Vault = contract.fromArtifact("Stake2Vault");
const Stake2VaultProxy = contract.fromArtifact("Stake2VaultProxy");

const Stake2Logic = contract.fromArtifact("Stake2Logic");
const StakeUniswapV3 = contract.fromArtifact("StakeUniswapV3");
const StakeUniswapV3Proxy = contract.fromArtifact("StakeUniswapV3Proxy");
const StakeCoinageFactory = contract.fromArtifact("StakeCoinageFactory");

/*
// dao-contracts
const DAOVault = contract.fromArtifact('DAOVault');
const DAOCommittee = contract.fromArtifact('DAOCommittee');
const DAOAgendaManager = contract.fromArtifact('DAOAgendaManager');
const CandidateFactory = contract.fromArtifact('CandidateFactory');
const DAOCommitteeProxy = contract.fromArtifact('DAOCommitteeProxy');
const Candidate = contract.fromArtifact('Candidate');
*/

// plasma-evm-contracts
const TON = contract.fromArtifact("TON");
const WTON = contract.fromArtifact("WTON");
const DepositManager = contract.fromArtifact("DepositManager");
const SeigManager = contract.fromArtifact("SeigManager");
const CoinageFactory = contract.fromArtifact("CoinageFactory");
const Layer2Registry = contract.fromArtifact("Layer2Registry");
const AutoRefactorCoinage = contract.fromArtifact("AutoRefactorCoinage");
const PowerTON = contract.fromArtifact("PowerTON");
// const OldDAOVaultMock = contract.fromArtifact('OldDAOVaultMock');
const DAOVault = contract.fromArtifact("DAOVault");
const SwapProxy = contract.fromArtifact("SwapProxy");

const EtherToken = contract.fromArtifact("EtherToken");
const EpochHandler = contract.fromArtifact("EpochHandler");
const SubmitHandler = contract.fromArtifact("SubmitHandler");
const Layer2 = contract.fromArtifact("Layer2");
const zeroAddress = "0x0000000000000000000000000000000000000000";
let o;
process.on("exit", function () {
  console.log(o);
});

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

const deployer = defaultSender;

const _TON = createCurrency("TON");
const _WTON = createCurrency("WTON");
const _WTON_TON = createCurrencyRatio(_WTON, _TON);

const TON_UNIT = "wei";
const WTON_UNIT = "ray";
const WTON_TON_RATIO = _WTON_TON("1");

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");

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


const initialTotal = "10000000000." + "0".repeat(18);
const Pharse1_TON_Staking = "175000000." + "0".repeat(18);
const Pharse1_ETH_Staking = "175000000." + "0".repeat(18);
const Pharse1_TOSETHLP_Staking = "150000000." + "0".repeat(18);
const Pharse1_DEV_Mining = "150000000." + "0".repeat(18);
const Pharse2_ETHTOS_Staking = "150000000." + "0".repeat(18);
const Pharse2_REWARD_PERBLOCK = "1.5" + "0".repeat(18);

const HASH_Pharse2_ETHTOS_Staking = keccak256("PHASE2_ETHTOS_STAKING");
const HASH_Pharse1_TON_Staking = keccak256("PHASE1_TON_STAKING");
const HASH_Pharse1_ETH_Staking = keccak256("PHASE1_ETH_STAKING");
const HASH_Pharse1_TOSETHLP_Staking = keccak256("PHASE1_TOSETHLP_Staking");
const HASH_Pharse1_DEV_Mining = keccak256("PHASE1_DEV_Mining");


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



  initializeICO20Contracts = async function (owner) {
    // this = self;
    // console.log(' initializeICO20Contracts owner:',owner );
    this.tos = null;
    this.stos = null;

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
    this.swapProxy = await SwapProxy.new({ from: owner });

    this.tos = await TOS.new(name, symbol, version, { from: owner });
    this.stakeregister = await StakeRegistry.new(this.tos.address,  { from: owner });

    this.stakeSimple = await StakeSimple.new({ from: owner });
    this.stakeSimpleFactory = await StakeSimpleFactory.new(
      this.stakeSimple.address,
      { from: owner });

    this.stake1Vault = await Stake1Vault.new({ from: owner });
    this.stakeVaultFactory = await StakeVaultFactory.new(
      this.stake1Vault.address,
      { from: owner });

    this.stakeTONLogic = await StakeTONLogic.new({ from: owner });
    this.stakeTONProxyFactory = await StakeTONProxyFactory.new({ from: owner });

    this.stakeTONfactory = await StakeTONFactory.new(
      this.stakeTONProxyFactory.address,
      this.stakeTONLogic.address,
      { from: owner });


    //--set stakeUniswapV3
    this.stakeUniswapV3Logic = await StakeUniswapV3.new({ from: owner });
    this.stakeCoinageFactory = await StakeCoinageFactory.new({ from: owner });

    this.stakeUniswapV3Factory = await StakeUniswapV3Factory.new(
        this.stakeUniswapV3Logic.address,
        this.stakeCoinageFactory.address,
        {
          from: owner,
        }
    );

    this.stakefactory = await StakeFactory.new(
      this.stakeSimpleFactory.address,
      this.stakeTONfactory.address,
      this.stakeUniswapV3Factory.address,
      { from: owner }
    );
    this.stake1logic = await Stake1Logic.new({ from: owner });
    this.stake1proxy = await Stake1Proxy.new(this.stake1logic.address, { from: owner });

    this.stakeEntry = await Stake1Logic.at(this.stake1proxy.address, {
      from: owner,
    });

    // attach phase2
    let _func1 = web3.eth.abi.encodeFunctionSignature("balanceOf(address,address)") ;
    let _func2 = web3.eth.abi.encodeFunctionSignature("balanceOfTOS(address)") ;
    let _func3 = web3.eth.abi.encodeFunctionSignature("createVault2(uint256,uint256,uint256,bytes32,uint256,address[4],string)") ;

    this.stake2logic = await Stake2Logic.new({ from: owner });
    await this.stake1proxy.setImplementation(this.stake2logic.address, 1, true, { from: owner });
    await this.stake1proxy.setSelectorImplementations([_func1, _func2, _func3], this.stake2logic.address, { from: owner });
    this.stakeEntry2 = await Stake2Logic.at(this.stake1proxy.address, {
      from: owner,
    });

    const returnData = {
      tos: this.tos,
      stos: this.stos,
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
      stakeEntry2: this.stakeEntry2
    };
    // console.log(' initializeICO20Contracts  :',returnData );

    return returnData;
  };

  // createStaekForSTOS = async function (startB, owner) {
  //   let stakeForSTOS = await StakeForSTOS.new({ from: owner });

  //   await stakeForSTOS.initialize(this.tos.address, this.stos.address, startB, {
  //     from: owner,
  //   });

  //   this.tos.grantRole(MINTER_ROLE, stakeForSTOS.address, { from: owner });
  //   this.tos.grantRole(BURNER_ROLE, stakeForSTOS.address, { from: owner });
  //   this.stos.grantRole(MINTER_ROLE, stakeForSTOS.address, { from: owner });
  //   this.stos.grantRole(BURNER_ROLE, stakeForSTOS.address, { from: owner });

  //   return stakeForSTOS;
  // };

  initializePlasmaEvmContracts = async function (owner) {
    // this = self;
    // console.log(' initializePlasmaEvmContracts owner:',owner );

    this.ton = await TON.new({ from: owner });
    this.wton = await WTON.new(this.ton.address, { from: owner });
    this.registry = await Layer2Registry.new({ from: owner });
    this.depositManager = await DepositManager.new(
      this.wton.address,
      this.registry.address,
      WITHDRAWAL_DELAY,
      { from: owner }
    );
    this.factory = await CoinageFactory.new({ from: owner });

    const currentTime = await time.latest();
    this.daoVault = await DAOVault.new(this.wton.address, currentTime, {
      from: owner,
    });
    // this.oldDaoVault = await OldDAOVaultMock.new(this.wton.address, currentTime,{from:owner});

    this.seigManager = await SeigManager.new(
      this.ton.address,
      this.wton.address,
      this.registry.address,
      this.depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      this.factory.address,
      { from: owner }
    );
    this.powerton = await PowerTON.new(
      this.seigManager.address,
      this.wton.address,
      ROUND_DURATION,
      { from: owner }
    );
    await this.powerton.init({ from: owner });

    await this.seigManager.setPowerTON(this.powerton.address, { from: owner });
    await this.powerton.start({ from: owner });
    await this.seigManager.setDao(this.daoVault.address, { from: owner });
    await this.wton.addMinter(this.seigManager.address, { from: owner });
    await this.ton.addMinter(this.wton.address, { from: owner });

    await Promise.all(
      [this.depositManager, this.wton].map((contract) =>
        contract.setSeigManager(this.seigManager.address, { from: owner })
      )
    );

    // ton setting
    await this.ton.mint(deployer, TON_INITIAL_SUPPLY.toFixed(TON_UNIT), {
      from: owner,
    });
    await this.ton.approve(
      this.wton.address,
      TON_INITIAL_SUPPLY.toFixed(TON_UNIT),
      { from: owner }
    );

    this.seigManager.setPowerTONSeigRate(
      POWERTON_SEIG_RATE.toFixed(WTON_UNIT),
      { from: owner }
    );
    this.seigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT), {
      from: owner,
    });
    this.seigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT), {
      from: owner,
    });
    await candidates.map(
      (account) =>
        this.ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),
      { from: owner }
    );
    await users.map(
      (account) =>
        this.ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),
      { from: owner }
    );
    await operators.map(
      (account) =>
        this.ton.transfer(account, TON_INITIAL_HOLDERS.toFixed(TON_UNIT)),
      { from: owner }
    );

    await this.wton.mint(
      this.daoVault.address,
      TON_VAULT_AMOUNT.toFixed(WTON_UNIT),
      { from: owner }
    );

    await this.seigManager.setMinimumAmount(
      TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT),
      { from: owner }
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
      stos: this.stos,
      stakeregister: this.stakeregister,
      stakefactory: this.stakefactory,
      stake1logic: this.stake1logic,
      stake1proxy: this.stake1proxy,
      stakeEntry: this.stakeEntry,
      stakeUniswapV3Factory: this.stakeUniswapV3Factory,
      stakeTONfactory: this.stakeTONfactory,
      stakeSimpleFactory: this.stakeSimpleFactory
    };
  };

  setEntry = async function (owner) {

    const uniswapRouter = "0xe592427a0aece92de3edee1f18e0157c05861564";
    const uniswapNPM ="0xd1e1C3995695650ABc3Ea3c68ae5d365b35174ED";
    const uniswapWeth ="0xe592427a0aece92de3edee1f18e0157c05861564";
    const uniswapFee ="3000";
    const uniswapRouter2 ="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    await this.stakeEntry.setStore(
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

    await this.stakeregister.setTokamak(
      this.ton.address,
      this.wton.address,
      this.depositManager.address,
      this.seigManager.address,
      this.swapProxy.address
      );

    await this.stakeregister.addDefiInfo(
        "UNISWAP_V3",
        uniswapRouter,
        uniswapNPM,
        uniswapWeth,
        uniswapFee,
        uniswapRouter2
      );

    await this.stakeregister.grantRole(ADMIN_ROLE, this.stake1proxy.address, {
      from: owner,
    });

    await this.stakefactory.grantRole(ADMIN_ROLE, this.stake1proxy.address);

    return this.stakeEntry;
  };

  setEntryExceptUniswap = async function (owner) {

    await this.stakeEntry.setStore(
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

    await this.stakeregister.setTokamak(
      this.ton.address,
      this.wton.address,
      this.depositManager.address,
      this.seigManager.address,
      this.swapProxy.address
      );

    // await this.stakeregister.addDefiInfo(
    //     "UNISWAP_V3",
    //     uniswapRouter,
    //     uniswapNPM,
    //     uniswapWeth,
    //     uniswapFee,
    //     uniswapRouter2
    //   );

    await this.stakeregister.grantRole(ADMIN_ROLE, this.stake1proxy.address, {
      from: owner,
    });

    await this.stakefactory.grantRole(ADMIN_ROLE, this.stake1proxy.address);

    return this.stakeEntry;
  };



  addOperator = async function (operator) {
    const etherToken = await EtherToken.new(true, this.ton.address, true, {
      from: operator,
    });

    const epochHandler = await EpochHandler.new({ from: operator });
    const submitHandler = await SubmitHandler.new(epochHandler.address, {
      from: operator,
    });

    const dummyStatesRoot =
      "0xdb431b544b2f5468e3f771d7843d9c5df3b4edcf8bc1c599f18f0b4ea8709bc3";
    const dummyTransactionsRoot =
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";
    const dummyReceiptsRoot =
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";

    const layer2 = await Layer2.new(
      epochHandler.address,
      submitHandler.address,
      etherToken.address,
      true,
      1,
      dummyStatesRoot,
      dummyTransactionsRoot,
      dummyReceiptsRoot,
      { from: operator }
    );

    await layer2.setSeigManager(this.seigManager.address, { from: operator });
    await this.registry.registerAndDeployCoinage(
      layer2.address,
      this.seigManager.address,
      { from: operator }
    );

    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON =
      TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);

    const minimum = await this.seigManager.minimumAmount();
    const beforeTonBalance = await this.ton.balanceOf(operator);
    await this.deposit(layer2.address, operator, stakeAmountTON);

    const afterTonBalance = await this.ton.balanceOf(operator);
    beforeTonBalance
      .sub(afterTonBalance)
      .should.be.bignumber.equal(stakeAmountTON);

    const coinageAddress = await this.seigManager.coinages(layer2.address);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmount = await coinage.balanceOf(operator);
    stakedAmount.should.be.bignumber.equal(stakeAmountWTON);

    if (this.layer2s == null) this.layer2s = [];
    this.layer2s.push(layer2);

    if (this.coinages == null) this.coinages = [];
    this.coinages.push(coinage);

    return layer2;
  };

  makePos = (v1, v2) => {
    v1 = toBN(v1);
    v2 = toBN(v2);

    const a = v1.mul(toBN(2).pow(toBN(128)));
    return a.add(v2).toString();
  };

  updateRewardTokamak = async function (layer2Contract, _operator) {
    const [costNRB, NRELength, currentForkNumber] = await Promise.all([
      layer2Contract.COST_NRB(),
      layer2Contract.NRELength(),
      layer2Contract.currentFork(),
    ]);
    const fork = await layer2Contract.forks(currentForkNumber);
    const epochNumber = parseInt(fork.lastEpoch) + 1;
    const startBlockNumber = parseInt(fork.lastBlock) + 1;
    const endBlockNumber = parseInt(startBlockNumber) + parseInt(NRELength) - 1;

    // pos1 = fork number * 2^128 + epoch number
    // pos2 = start block number * 2^128 + end block number
    const pos1 = this.makePos(currentForkNumber, epochNumber);
    const pos2 = this.makePos(startBlockNumber, endBlockNumber);
    const dummyBytes =
      "0xdb431b544b2f5468e3f771d7843d9c5df3b4edcf8bc1c599f18f0b4ea8709bc3";
    // console.log('pos1', pos1, 'pos2', pos2, 'dummyBytes', dummyBytes, 'costNRB', costNRB) ;

    await layer2Contract.submitNRE(
      pos1,
      pos2,
      dummyBytes,
      dummyBytes,
      dummyBytes,
      { from: _operator }
    );
  };

  /*
  addCandidate = async function (candidate) {
    const minimum = await this.seigManager.minimumAmount();
    const beforeTonBalance = await this.ton.balanceOf(candidate);
    const stakeAmountTON = TON_MINIMUM_STAKE_AMOUNT.toFixed(TON_UNIT);
    const stakeAmountWTON = TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT);
    const testMemo = candidate + " memo string";
    await this.committeeProxy.createCandidate(testMemo, {from: candidate});
    const candidateContractAddress = await this.committeeProxy.candidateContract(candidate);
    (await this.registry.layer2s(candidateContractAddress)).should.be.equal(true);
    await this.deposit(candidateContractAddress, candidate, stakeAmountTON);
    const afterTonBalance = await this.ton.balanceOf(candidate);
    beforeTonBalance.sub(afterTonBalance).should.be.bignumber.equal(stakeAmountTON);
    const coinageAddress = await this.seigManager.coinages(candidateContractAddress);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    if (this.layer2s == null) this.layer2s = [];
    let layer2 = await Candidate.at(candidateContractAddress);
    this.layer2s.push(layer2);
    if (this.coinages == null) this.coinages = [];
    this.coinages.push(coinage);
    const stakedAmount = await coinage.balanceOf(candidate);
    stakedAmount.should.be.bignumber.equal(stakeAmountWTON);
    const candidatesLength = await this.committeeProxy.candidatesLength();
    let foundCandidate = false;
    for (let i = 0; i < candidatesLength; i++) {
      const address = await this.committeeProxy.candidates(i);
      if (address === candidate) {
        foundCandidate = true;
        break;
      }
    }
    foundCandidate.should.be.equal(true);
  }
  */

  deposit = async function (candidateContractAddress, account, tonAmount) {
    const beforeBalance = await this.ton.balanceOf(account);
    beforeBalance.should.be.bignumber.gte(tonAmount);
    const data = marshalString(
      [this.depositManager.address, candidateContractAddress]
        .map(unmarshalString)
        .map((str) => padLeft(str, 64))
        .join("")
    );
    await this.ton.approveAndCall(this.wton.address, tonAmount, data, {
      from: account,
    });
    const afterBalance = await this.ton.balanceOf(account);
    beforeBalance.sub(afterBalance).should.be.bignumber.equal(tonAmount);
    return true;
  };

  stake = async function (stakeContractAddress, account, tonAmount) {
    const beforeBalance = await this.ton.balanceOf(account);
    beforeBalance.should.be.bignumber.gte(tonAmount);

    const param = web3.eth.abi.encodeParameters(
      ["address", "uint256"],
      [stakeContractAddress, tonAmount.toString()]
    );

    await this.ton.approveAndCall(stakeContractAddress, tonAmount, param, {
      from: account,
    });
    const afterBalance = await this.ton.balanceOf(account);
    beforeBalance.sub(afterBalance).should.be.bignumber.equal(tonAmount);
    return true;
  };

  newSeigManager = async function () {
    const newSeigManager = await SeigManager.new(
      this.ton.address,
      this.wton.address,
      this.registry.address,
      this.depositManager.address,
      SEIG_PER_BLOCK.toFixed(WTON_UNIT),
      this.factory.address
    );

    await newSeigManager.setPowerTON(this.powerton.address);
    await newSeigManager.setDao(this.daoVault.address);
    // await this.wton.addMinter(newSeigManager.address);
    // await ton.addMinter(wton.address);

    /*
    await Promise.all([
      depositManager,
      wton,
    ].map(contract => contract.setSeigManager(newSeigManager.address)));
    */

    newSeigManager.setPowerTONSeigRate(POWERTON_SEIG_RATE.toFixed(WTON_UNIT));
    newSeigManager.setDaoSeigRate(DAO_SEIG_RATE.toFixed(WTON_UNIT));
    newSeigManager.setPseigRate(PSEIG_RATE.toFixed(WTON_UNIT));
    await newSeigManager.setMinimumAmount(
      TON_MINIMUM_STAKE_AMOUNT.times(WTON_TON_RATIO).toFixed(WTON_UNIT)
    );

    return newSeigManager;
  };

  balanceOfAccountByLayer2 = async function (_layer2, _account) {
    const coinageAddress = await this.seigManager.coinages(_layer2);
    const coinage = await AutoRefactorCoinage.at(coinageAddress);
    const stakedAmountWTON = await coinage.balanceOf(_account);

    return stakedAmountWTON;
  };

  objectMapping = async (abi) => {
    const objects = {};
    if (abi != null && abi.length > 0) {
      for (let i = 0; i < abi.length; i++) {
        // let inputs = abi[i].inputs;

        if (abi[i].type == "function") {
          /*
          if(abi[i].name=='transferOwnership' || abi[i].name=='renouncePauser'
          || abi[i].name=='renounceOwnership' ) {
            console.log('abi[i].name' , abi[i].name, abi[i].inputs  ) ;
            console.log('objects[abi[i].name]' , objects[abi[i].name]  ) ;
          } */

          if (objects[abi[i].name] == undefined) objects[abi[i].name] = abi[i];
          else objects[abi[i].name + "2"] = abi[i];
        }
      }
    }
    return objects;
  };

  getLayer2s = function () {
    return this.layer2s;
  };

  getCoinages = function () {
    return this.coinages;
  };

  setAbiObject = async function () {
    this.AbiObject.TON = await this.objectMapping(TONAbi);
    this.AbiObject.WTON = await this.objectMapping(WTONAbi);
    this.AbiObject.DepositManager = await this.objectMapping(DepositManagerAbi);
    this.AbiObject.SeigManager = await this.objectMapping(SeigManagerAbi);
    this.AbiObject.Layer2Registry = await this.objectMapping(Layer2RegistryAbi);
    this.AbiObject.PowerTON = await this.objectMapping(PowerTONAbi);

    return this.AbiObject;
  };

  clearLayers = async function () {
    this.layers = [];
    this.coinages = [];
  };


  logVault = async function (_phaseVault) {
     console.log(
      "\n\n############### logVault [ PHASE",
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
    const realEndBlock = await vault.realEndBlock();
    const blockTotalReward = await vault.blockTotalReward();
    const saleClosed = await vault.saleClosed();
    const orderedEndBlocks = await vault.orderedEndBlocksAll();
    const stakeAddresses = await vault.stakeAddressesAll();

    console.log("cap", utils.formatUnits(cap.toString(), 18));
    console.log("paytoken", paytoken);
    console.log("saleStartBlock", saleStartBlock.toString());
    console.log("stakeStartBlock", stakeStartBlock.toString());
    console.log("stakeEndBlock", stakeEndBlock.toString());
    console.log("realEndBlock", realEndBlock.toString());
    console.log(
      "global reward per block",
      utils.formatUnits(blockTotalReward.toString(), 18)
    );
    console.log("saleClosed", saleClosed);
    console.log("stakeAddresses", stakeAddresses);
    // console.log("orderedEndBlocks", orderedEndBlocks);

    for(let i = 0; i < orderedEndBlocks.length; i++){
       let stakeEndBlockTotal = await vault.stakeEndBlockTotal(toBN(orderedEndBlocks[i].toString()));
       console.log("Total Staked Amount :", orderedEndBlocks[i].toString(),' block, ' , fromWei(stakeEndBlockTotal.toString(),'ether'), 'ETH');
    }
  }

  logStake = async function (_contract, user1, user2) {
      console.log("\n\n----------- Stake Contract ", _contract);
      const stakeContract = await StakeTON.at(_contract);
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

      await this.logUserStaked(_contract, user1, "user1");
      await this.logUserStaked(_contract, user2, "user2");
  }

  logStakeContracts = async function(_phase, _phaseVault) {
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
    const realEndBlock = await vault.realEndBlock();
    console.log("cap", utils.formatUnits(cap.toString(), 18));
    console.log("paytoken", paytoken);
    console.log("saleStartBlock", saleStartBlock.toString());
    console.log("stakeStartBlock", stakeStartBlock.toString());
    console.log("realEndBlock", realEndBlock.toString());

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
      const stakeContract = await StakeTON.at(_contract);
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
      console.log(" startBlock", stakeInfo.startBlock.toString());
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

      await this.logUserStaked(_contract, user1, "user1");
      await this.logUserStaked(_contract, user2, "user2");
    }
  }

  logUserStaked = async function (_contract, _user, username) {
    console.log(
      "\n\n*********** logUserStaked [",
      _contract,
      "]",
      username,
      _user
    );
    const stakeContract = await StakeTON.at(_contract);
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

  logTONBalance = async function (_layer2, stakerAddress, logFlag){
    console.log('TON BALANCE -- user : ',stakerAddress );
    const tonAmount = await this.ton.balanceOf(stakerAddress);
    console.log(
      "tonAmount:",
      utils.formatUnits(tonAmount.toString(), 18),
      "TON"
    );
    const wtonAmount = await this.wton.balanceOf(stakerAddress);
    console.log(
      "wtonAmount:",
      utils.formatUnits(wtonAmount.toString(), 27),
      "WTON"
    );

    return tonAmount;
  }

  logTokamakLayerBalance = async function (_layer2, stakerAddress){
    console.log('\n ------ TON Staked Amount - stakeContract: ', stakerAddress );
    const accStakedAccount = await this.depositManager.accStakedAccount(
            stakerAddress
    );
    console.log(
      " - depositManager accStakedAccount:",
      utils.formatUnits(accStakedAccount.toString(), 27),
      "WTON "
    );
    const stakeOf = await this.seigManager.stakeOf(
      _layer2,
      stakerAddress
    );

    console.log(
      " - seigManager stakeOf in layer2:",
      utils.formatUnits(stakeOf.toString(), 27),
      "WTON "
    );

    const pendingUnstaked = await this.depositManager.pendingUnstaked(
      _layer2,
      stakerAddress
    );
    console.log(
        " - pendingUnstaked:",
        utils.formatUnits(pendingUnstaked.toString(), 27),
        "WTON "
    );

    let stakeContract = await StakeTON.at(stakerAddress);
    let fromTokamak = await stakeContract.fromTokamak();
    console.log(' - fromTokamak In StakeContract:',utils.formatUnits(fromTokamak.toString(), 27) ,' WTON\n');

  }

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