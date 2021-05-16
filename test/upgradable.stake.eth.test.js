const { defaultSender, accounts, contract } = require("@openzeppelin/test-environment");
const { time } = require("@openzeppelin/test-helpers");
const { ICO20Contracts } = require("../utils/ico_test_deploy.js");
const { ethers } = require("ethers");
const { toBN, toWei, keccak256 } = require("web3-utils");
const Stake1Vault = contract.fromArtifact("Stake1Vault");
const StakeTON = contract.fromArtifact("StakeTON");
const Pharse1_ETH_Staking = "175000000." + "0".repeat(18);
const zeroAddress = "0x0000000000000000000000000000000000000000";

describe ("Upgradable Stake Contracts", function () {
  const usersInfo = [
    {
      name: "Bob",
      address: accounts[0],
      stakes: [{amount: 100}, {amount: 20}]
    },
    {
      name: "Alice",
      address: accounts[1],
      stakes: [{amount: 50}, {amount: 100}]
    },
  ];

  const ICO20Instances = {};
  let contractsInitializer;
  let Vault;
  let stakeEntry;
  let saleStartBlock, stakeStartBlock;
  
  const stakingContractInfo = [
    {name: "short staking", period: 50},
    {name: "long staking", period: 100}
  ];
  
  before(async function () {
    this.timeout(1000000);
    contractsInitializer = new ICO20Contracts();
  });

  it("Initialize contracts", async function () {
    this.timeout(1000000);

    await contractsInitializer.initializeICO20Contracts(defaultSender);
    await contractsInitializer.initializePlasmaEvmContracts(defaultSender);
    
    stakeEntry = await contractsInitializer.setEntry(defaultSender);
  
    const result = await contractsInitializer.getICOContracts();
    ICO20Instances.fld = result.fld;
    ICO20Instances.stakeRegister = result.stakeregister;
    ICO20Instances.stakeFactory = result.stakefactory;
    ICO20Instances.stake1proxy = result.stake1proxy;
    ICO20Instances.stake1logic = result.stake1logic;
  });

  it('should create a vault', async function () {
    const current = await time.latestBlock();
    saleStartBlock = parseInt(current + 4);
    stakeStartBlock = saleStartBlock + 20;
    const HASH_Pharse1_ETH_Staking = keccak256("PHASE1_ETH_STAKING");

    const tx = await stakeEntry.createVault(
      zeroAddress, // ethers
      ethers.utils.parseUnits(Pharse1_ETH_Staking, 18),
      toBN(saleStartBlock),
      toBN(stakeStartBlock),
      toBN('1'),
      HASH_Pharse1_ETH_Staking,
      toBN('0'),
      zeroAddress
      , { from: defaultSender });

    const stakeVaultAddress = tx.receipt.logs[tx.receipt.logs.length - 1].args.vault;
    Vault = await Stake1Vault.at(stakeVaultAddress, { from: defaultSender });
    await ICO20Instances.fld.mint(Vault.address, ethers.utils.parseUnits(Pharse1_ETH_Staking, 18), { from: defaultSender });
  });


  it("should create stake contracts", async function () {
    this.timeout(10000000);

    for (const { name, period } of stakingContractInfo) {
      await stakeEntry.createStakeContract(
        toBN("1"), // phase number
        Vault.address, // vault address
        ICO20Instances.fld.address, // fld address
        zeroAddress, // token address - ether
        toBN(period), // staking period
        name, // staking name
        { from: defaultSender }
      );
    }

    // Store stake addresses
    const stakeAddresses = await stakeEntry.stakeContractsOfVault(Vault.address);
    for (let i = 0; i < stakingContractInfo.length; ++i) {
      stakingContractInfo[i].stakeAddress = stakeAddresses[i];
    }
  });

  it("should stake ethers", async function () {
    this.timeout(10000000);
    const currentBlockTime = parseInt(saleStartBlock);
    await time.advanceBlockTo(currentBlockTime);
    for (let i = 0; i < stakingContractInfo.length; ++i) {
      const { stakeAddress } = stakingContractInfo[i];
      const stakeContract = await StakeTON.at(stakeAddress);
      for (const user of usersInfo) {
        const { name, address, stakes } = user;
        await stakeContract.sendTransaction({
          from: address,
          value: toWei(toBN(stakes[i].amount), "ether"),
        });
      }    
    }
  });

  it("should close sale", async function () {
    const current = parseInt(stakeStartBlock);
    await time.advanceBlockTo(current);
    await stakeEntry.closeSale(Vault.address, { from: defaultSender });
  });
});
