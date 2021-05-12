const { expect } = require("chai");
const { time, expectEvent } = require('@openzeppelin/test-helpers');

describe("DAO", function () {
  let deployer, user1, user2, user3;
  let SFLD;
  let DAO;
  let DAORecipient;

  // Init
  before(async function () {
    [deployer, user1, user2, user3, user4] = await ethers.getSigners();

    const SFLDContract = await ethers.getContractFactory("SFLD");
    SFLD = await SFLDContract.connect(deployer).deploy();
    await SFLD.deployed();

    const DAOContract = await ethers.getContractFactory("DAO");
    DAO = await DAOContract.connect(deployer).deploy(SFLD.address);
    await DAO.deployed();
    await SFLD.connect(deployer).mint(DAO.address, "10000000");

    const DAORecipientContract = await ethers.getContractFactory("DAORecipientExample");
    DAORecipient = await DAORecipientContract.connect(deployer).deploy(DAO.address);
    await DAORecipient.deployed();    
  });

  it("should create new agenda", async function () {
    await DAO.connect(user1).newAgenda(
      DAORecipient.address,
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("generateNextFib()")),
    );
  });

  it("should check current fib", async function () {
    expect(await DAORecipient.getFib()).to.be.equal(5);
  });

  it("should vote yes from user1", async function () {
    await DAO.connect(user1).vote(
      "1",
      true
    );
  });

  it("should vote yes from user1", async function () {
    await DAO.connect(user2).vote(
      "1",
      false
    );
  });

  it("should vote yes from user1", async function () {
    await DAO.connect(user3).vote(
      "1",
      true
    );
  });

  it("should execute function", async function () {
    await time.increase(time.duration.weeks(2));
    await DAO.connect(user4).executeAgenda(
      "1",
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("generateNextFib()")),
    );
  });

  it("should check current fib", async function () {
    expect(await DAORecipient.getFib()).to.be.equal(8);
  });
});
