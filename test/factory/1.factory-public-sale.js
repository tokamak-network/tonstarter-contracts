const { expect } = require("chai");
const {
    BigNumber,
    FixedFormat,
    FixedNumber,
    formatFixed,
    parseFixed
} = require("@ethersproject/bignumber");

const TON1 = require("../../abis_plasma_ethers/contracts/stake/tokens/TON.sol/TON.json");
const WTON1 = require("../../abis_plasma_ethers/contracts/stake/tokens/WTON.sol/WTON.json");

const PublicSaleAbi = require("../../artifacts/contracts/sale/PublicSale.sol/PublicSale.json");

describe("PublicSaleFactory", function() {

  let ton, wton, tos , lockTos, lockTosProxy, projectToken;
  let logic, factory, provider;
  let deployer, user1, person1, person2, person3, person4,person5, person6 ;

  let tosInfo = { name: "TOS" , symbol: "TOS", version:"1.0" }
  let projectTokenInfo = { name: "ProjectA" , symbol: "PTA", version:"1.0" }

  let epochUnit = 60*60*24*7;
  let maxTime = 60*60*24*365*3;
  let stosInfo = {
    epochUnit: ethers.BigNumber.from(epochUnit+""),
    maxTime: ethers.BigNumber.from(maxTime+"")
  }


  let saleContracts = [
      {
       name : "Test1",
       owner : null,
       contractAddress: null,
       index : null,

      },
      {
       name : "Test2",
       owner : null,
       contractAddress: null,
       index : null
      },
      {
       name : "Test3",
       owner : null,
       contractAddress: null,
       index : null
      },
  ]


  before(async function () {
    let accounts = await ethers.getSigners();
    [deployer, user1, person1, person2, person3, person4, person5, person6 ] = accounts
    saleContracts[0].owner = user1;
    saleContracts[1].owner = person1;
    saleContracts[2].owner = person2;

    provider = ethers.provider;
  });

  it("deploy TON for test ", async function() {

    const TON = await ethers.getContractFactory(
      TON1.abi,
      TON1.bytecode
    )

    ton = await TON.connect(deployer).deploy();
    let code = await deployer.provider.getCode(ton.address);
    expect(code).to.not.eq("0x");

  });

  it("deploy WTON for test ", async function() {

    const WTON = await ethers.getContractFactory(WTON1.abi, WTON1.bytecode)

    wton = await WTON.connect(deployer).deploy(ton.address);

    let code = await deployer.provider.getCode(wton.address);
    expect(code).to.not.eq("0x");
  });

  it("deploy TOS for test ", async function() {

    const TOS = await ethers.getContractFactory("TOS")

    tos = await TOS.connect(deployer).deploy(tosInfo.name, tosInfo.symbol, tosInfo.version);

    let code = await deployer.provider.getCode(tos.address);
    expect(code).to.not.eq("0x");

    expect(await tos.name()).to.be.equal(tosInfo.name);
    expect(await tos.symbol()).to.be.equal(tosInfo.symbol);

  });

  it("deploy LockTOS for test ", async function() {

    const LockTOS = await ethers.getContractFactory("LockTOS")

    lockTos  = await LockTOS.connect(deployer).deploy();

    let code = await deployer.provider.getCode(lockTos.address);
    expect(code).to.not.eq("0x");

  });

  it("deploy ProjectToken for test ", async function() {

    const TOS = await ethers.getContractFactory("TOS")

    projectToken = await TOS.connect(deployer).deploy(projectTokenInfo.name, projectTokenInfo.symbol, projectTokenInfo.version);

    let code = await deployer.provider.getCode(projectToken.address);
    expect(code).to.not.eq("0x");

    expect(await projectToken.name()).to.be.equal(projectTokenInfo.name);
    expect(await projectToken.symbol()).to.be.equal(projectTokenInfo.symbol);

  });

  it("deploy LockTOS for test ", async function() {

    const LockTOSProxy = await ethers.getContractFactory("LockTOSProxy")

    lockTOSProxy  = await LockTOSProxy.connect(deployer).deploy(
      lockTos.address,
      deployer.address
    );

    let code = await deployer.provider.getCode(lockTOSProxy.address);
    expect(code).to.not.eq("0x");


    await lockTOSProxy.connect(deployer).initialize(
      tos.address,
      stosInfo.epochUnit,
      stosInfo.maxTime,
    );

    expect(await lockTOSProxy.tos()).to.be.equal(tos.address);
    expect(await lockTOSProxy.epochUnit()).to.be.equal(stosInfo.epochUnit);
    expect(await lockTOSProxy.maxTime()).to.be.equal(stosInfo.maxTime);

  });

  it("deploy PublicSale Logic for test ", async function() {
    const PublicSale = await ethers.getContractFactory("PublicSale");

    logic = await PublicSale.connect(deployer).deploy();

    let code = await deployer.provider.getCode(logic.address);
    expect(code).to.not.eq("0x");
  });

  it("deploy PublicSaleProxyFactory ", async function() {
    const PublicSaleProxyFactory = await ethers.getContractFactory("PublicSaleProxyFactory");

    factory = await PublicSaleProxyFactory.connect(deployer).deploy();

    let code = await deployer.provider.getCode(factory.address);
    expect(code).to.not.eq("0x");
  });


  it("deploy PublicSaleProxy ", async function() {

    for(let i=0; i< saleContracts.length; i++){
      let saleContract = saleContracts[i];
      let prevTotalCreatedContracts = await factory.totalCreatedContracts();

      await factory.connect(deployer).create(
          saleContract.name,
          logic.address,
          saleContract.owner.address,
          [
            projectToken.address,
            ton.address,
            saleContract.owner.address,
            lockTOSProxy.address,
            wton.address
          ]
      );

      let afterTotalCreatedContracts = await factory.totalCreatedContracts();

      saleContract.index = prevTotalCreatedContracts;
      expect(afterTotalCreatedContracts).to.be.equal(prevTotalCreatedContracts.add(1));

      let info = await factory.connect(deployer).getContracts(saleContract.index);
      expect(info.name).to.be.equal(saleContract.name);
      saleContract.contractAddress = info.contractAddress;

      const PublicSaleProxy = await ethers.getContractAt("PublicSaleProxy", saleContract.contractAddress);
      expect(await PublicSaleProxy.isAdmin(deployer.address)).to.be.equal(false);
      expect(await PublicSaleProxy.isAdmin(saleContract.owner.address)).to.be.equal(true);

      // console.log(i, saleContract.index.toString(), saleContract.name, saleContract.owner.address, saleContract.contractAddress )
    }

  });

});
