const { expect } = require("chai");
const { time, expectEvent } = require("@openzeppelin/test-helpers");

// ------------------------
const ICO20Contracts = require("../utils/ico_test_deploy_ethers.js");
let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;

describe("ProjectManager", function () {
  let deployer, admin, dev1, dev2, dev3;
  let projectManagerProxy, projectManagerLogic1, projectManager;
  let stake1Vault;
  let fld;
  let contracts;
  let ton, wton, depositManager, seigManager;
  let cap, rewardPeriod, startRewardBlock, claimsNumberMax, developers, amounts;

  // Init
  before(async function () {
    this.timeout(1000000);
    [deployer, admin, dev1, dev2, dev3, unregisteredDev] =
      await ethers.getSigners();

    const ProjectManagerLogic1 = await ethers.getContractFactory(
      "ProjectManagerLogic1"
    );
    const ProjectManagerProxy = await ethers.getContractFactory(
      "ProjectManagerProxy"
    );
    const Stake1Vault = await ethers.getContractFactory("Stake1Vault");
    const Stake1 = await ethers.getContractFactory("Stake1");

    projectManagerProxy = await ProjectManagerProxy.connect(deployer).deploy();
    projectManagerLogic1 = await ProjectManagerLogic1.connect(
      deployer
    ).deploy();
  });
  it("ico20Contracts init  ", async function () {
    this.timeout(1000000);
    ico20Contracts = new ICO20Contracts();
    ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
      deployer
    );
    fld = ICOContractsDeployed.fld;
  });

  it("tokamakContracts init  ", async function () {
    this.timeout(1000000);
    TokamakContractsDeployed =
      await ico20Contracts.initializePlasmaEvmContracts(deployer);

    const cons = await ico20Contracts.getPlasamContracts();
    ton = cons.ton;
    wton = cons.wton;
    depositManager = cons.depositManager;
    seigManager = cons.seigManager;
  });
  /*
  it('Set StakeEntry  ', async function () {
    this.timeout(1000000);
    stakeEntry = await ico20Contracts.setEntry(deployer);
    console.log('stakeEntry', stakeEntry.address);

    const cons = await ico20Contracts.getICOContracts();
    fld = cons.fld;
    stakeregister = cons.stakeregister;
    stakefactory = cons.stakefactory;
    stake1proxy = cons.stake1proxy;
    stake1logic = cons.stake1logic;
  });

  it("upgradeTo", async function () {
    await projectManagerProxy.connect(deployer).upgradeTo(projectManagerLogic1.address);
    expect(await projectManagerProxy.implementation()).to.equal(projectManagerLogic1.address);

    projectManager = await ethers.getContractAt("ProjectManagerLogic1", projectManagerProxy.address);

  });
  it("setAirdropVault", async function () {

    await projectManager.connect(deployer).setAirdropVault( );
    expect(await projectManagerProxy.airdropVault()).to.equal(projectManagerLogic1.address);
  });
  it("setAirdropVault", async function () {
    let logic = await projectManagerProxy.connect(deployer).implementation();
    console.log('logic', logic) ;
    expect(await FLD.balanceOf(dev1.address)).to.equal(0);
  });

  it("setDefaultAirdrop", async function () {

  });
  it("setFLDRewardVault", async function () {

  });
  it("setDefaultStakingPeriod", async function () {

  });

  it("cretaeProject", async function () {

  });
  */
});
