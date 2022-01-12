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

const PrivateSaleAbi = require("../../artifacts/contracts/sale/PrivateSale.sol/PrivateSale.json");

describe("PrivateSaleFactory", function() {

  let ton, wton , logic, factory, provider;
  let deployer, user1, person1, person2, person3, person4,person5, person6 ;

  let privateSaleContracts = [
      {
       name : "Test1",
       owner : null,
       contractAddress: null,
       index : null
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
    privateSaleContracts[0].owner = user1;
    privateSaleContracts[1].owner = person1;
    privateSaleContracts[2].owner = person2;

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

  it("deploy PrivateSale Logic for test ", async function() {
    const PrivateSale = await ethers.getContractFactory("PrivateSale");

    logic = await PrivateSale.connect(deployer).deploy();

    let code = await deployer.provider.getCode(logic.address);
    expect(code).to.not.eq("0x");
  });

  it("deploy PrivateSaleProxyFactory ", async function() {
    const PrivateSaleProxyFactory = await ethers.getContractFactory("PrivateSaleProxyFactory");

    factory = await PrivateSaleProxyFactory.connect(deployer).deploy();

    let code = await deployer.provider.getCode(factory.address);
    expect(code).to.not.eq("0x");
  });


  it("deploy PrivateSaleProxy ", async function() {

    for(let i=0; i< privateSaleContracts.length; i++){
      let privateSaleContract = privateSaleContracts[i];
      let prevTotalCreatedContracts = await factory.totalCreatedContracts();

      await factory.connect(deployer).create(privateSaleContract.name, logic.address, privateSaleContract.owner.address, wton.address);
      let afterTotalCreatedContracts = await factory.totalCreatedContracts();

      privateSaleContract.index = prevTotalCreatedContracts;
      expect(afterTotalCreatedContracts).to.be.equal(prevTotalCreatedContracts.add(1));

      let info = await factory.connect(deployer).getContracts(privateSaleContract.index);
      expect(info.name).to.be.equal(privateSaleContract.name);
      privateSaleContract.contractAddress = info.contractAddress;

      const PrivateSaleProxy = await ethers.getContractAt("PrivateSaleProxy", privateSaleContract.contractAddress);
      expect(await PrivateSaleProxy.isAdmin(deployer.address)).to.be.equal(false);
      expect(await PrivateSaleProxy.isAdmin(privateSaleContract.owner.address)).to.be.equal(true);

      // console.log(i, privateSaleContract.index.toString(), privateSaleContract.name, privateSaleContract.owner.address, privateSaleContract.contractAddress )
    }

  });

});
