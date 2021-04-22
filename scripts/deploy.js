const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require('./save_deployed_file');

const { padLeft, toBN, toWei, fromWei , keccak256 , soliditySha3 , solidityKeccak256 } = require('web3-utils');

require('dotenv').config()

const initialTotal = process.env.initialTotal + '.' + '0'.repeat(18);

const Pharse1_TOTAL = process.env.Pharse1_TOTAL + '.' + '0'.repeat(18);
const Pharse1_TON_Staking = process.env.Pharse1_TON_Staking + '.' + '0'.repeat(18);
const Pharse1_ETH_Staking = process.env.Pharse1_ETH_Staking + '.' + '0'.repeat(18);
const Pharse1_FLDETHLP_Staking = process.env.Pharse1_FLDETHLP_Staking + '.' + '0'.repeat(18);
const Pharse1_DEV_Mining = process.env.Pharse1_DEV_Mining + '.' + '0'.repeat(18);

const Pharse2_TOTAL = process.env.Pharse2_TOTAL + '.' + '0'.repeat(18);
const Pharse2_FLDETH_Staking = process.env.Pharse2_FLDETH_Staking + '.' + '0'.repeat(18);
const Pharse2_FLD_Staking = process.env.Pharse2_FLD_Staking + '.' + '0'.repeat(18);
const Pharse2_DEV_Mining = process.env.Pharse2_DEV_Mining + '.' + '0'.repeat(18);

const Pharse3_TOTAL = process.env.Pharse3_TOTAL + '.' + '0'.repeat(18);
const Pharse3_FLDETH_Staking = process.env.Pharse3_FLDETH_Staking + '.' + '0'.repeat(18);
const Pharse3_FLD_Staking = process.env.Pharse3_FLD_Staking + '.' + '0'.repeat(18);
const Pharse3_DEV_Mining = process.env.Pharse3_DEV_Mining + '.' + '0'.repeat(18);

let zeroAddress = '0x0000000000000000000000000000000000000000';
let sendAmountForTest = '10000' ;

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");


async function deployMain(defaultSender) {

   const [deployer, user1 ] = await ethers.getSigners();

    const FLD = await ethers.getContractFactory("FLD");
    const FLDVault = await ethers.getContractFactory("FLDVault");
    const TestToken = await ethers.getContractFactory("TestToken");

    const fld = await FLD.deploy();
    const fldVault = await FLDVault.deploy();
    const testToken = await TestToken.deploy();

    await fldVault.setFLD(fld.address);
    // add Vault Name
    await fldVault.addPhaseVault(PHASE2_VAULT_HASH, utils.parseUnits(Pharse2_TOTAL, 18) )

    await fld.mint(fldVault.address, utils.parseUnits(initialTotal, 18));
    console.log("fld:", fld.address);
    console.log("fldVault:", fldVault.address);
    console.log("user1:", user1.address);
    await testToken.mint(user1.address, utils.parseUnits(sendAmountForTest, 18) );

    let out = {};
    out.FLD = fld;
    out.FLDVault = fldVault;
    out.TestToken = testToken;
    return out;
}

async function deployPhase1(defaultSender, contracts ) {

    const PreMining1 = await ethers.getContractFactory("PreMining");
    const PreMining2 = await ethers.getContractFactory("PreMining");
    //let PreMiningETH = await PreMining.deploy();
    //let PreMiningTestToken = await PreMining.deploy();

    let saleStartTime = parseInt(Date.now()/1000)-100;
    let saleEndTime = saleStartTime + (60*60*24*60); // 60 days

    let preMiningByETH = await upgrades.deployProxy(
            PreMining1, [
              toBN(saleStartTime).toString(),
              toBN(saleEndTime).toString(),
              contracts.FLD.address,
              utils.parseUnits(Pharse1_ETH_Staking, 18),
              zeroAddress
            ], {initializer: 'initialize'})

    console.log("PreMiningETH:", preMiningByETH.address);

    contracts.PreMiningETH = preMiningByETH;
    await contracts.FLDVault.claimFLD(
        contracts.PreMiningETH.address,
        utils.parseUnits(Pharse1_ETH_Staking, 18));

    const preMiningByTestToken = await upgrades.deployProxy(
            PreMining2, [
              toBN(saleStartTime).toString(),
              toBN(saleEndTime).toString(),
              contracts.FLD.address,
              utils.parseUnits(Pharse1_TON_Staking, 18),
              contracts.TestToken.address
            ], {initializer: 'initialize'})

    console.log("PreMiningTestToken:", preMiningByTestToken.address);
    contracts.PreMiningTestToken = preMiningByTestToken;
    await contracts.FLDVault.claimFLD(
        contracts.PreMiningTestToken.address,
        utils.parseUnits(Pharse1_TON_Staking, 18));

    return contracts ;
}

async function deployPhase2(deployer, contracts) {

   const Mining1 = await ethers.getContractFactory("Mining");
   const Mining2 = await ethers.getContractFactory("Mining");

   // let miningFLD = await Mining.deploy();
   // let miningTestToken = await Mining.deploy();

    let saleStartTime = parseInt(Date.now()/1000)-100;
    let saleEndTime = saleStartTime + (60*60*24*14); // 2 weeks

    const MiningByFLD = await upgrades.deployProxy(
            Mining1, [
              toBN(saleStartTime).toString(),
              toBN(saleEndTime).toString(),
              contracts.FLD.address,
              contracts.FLDVault.address,
              contracts.FLD.address
            ], {initializer: 'initialize'})

    console.log("MiningFLD:", MiningByFLD.address);
    contracts.MiningFLD = MiningByFLD;
    await contracts.FLDVault.setContractVaultName(MiningByFLD.address, PHASE2_VAULT_HASH );


    const MiningByTestToken = await upgrades.deployProxy(
            Mining2, [
              toBN(saleStartTime).toString(),
              toBN(saleEndTime).toString(),
              contracts.FLD.address,
              contracts.FLDVault.address,
              contracts.TestToken.address
            ], {initializer: 'initialize'})

    console.log("MiningTestToken:", MiningByTestToken.address);
    contracts.MiningTestToken = MiningByTestToken;
    await contracts.FLDVault.setContractVaultName(MiningByTestToken.address, PHASE2_VAULT_HASH );

    return contracts ;

}

async function main() {

    const [deployer, user1 ] = await ethers.getSigners();
    const users = await ethers.getSigners();
    console.log(
      "Deploying contracts with the account:",
      deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    let contracts = await deployMain(deployer);
       contracts = await deployPhase1(deployer, contracts );
       contracts = await deployPhase2(deployer, contracts );


    // The address the Contract WILL have once mined
    const out = {};
    out.FLD = contracts.FLD.address;
    out.FLDVault = contracts.FLDVault.address;

    out.PreMiningETH = contracts.PreMiningETH.address;
    out.PreMiningTestToken = contracts.PreMiningTestToken.address;

    out.MiningFLD = contracts.MiningFLD.address;
    out.MiningTestToken = contracts.MiningTestToken.address;

    save(
      process.env.NETWORK,out
    );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
