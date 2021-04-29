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

const fldtoken = '0x08F36b925467188830887A1b1abfcd9ad68621F3';
const registry = '0x3ddE16b82B92A40642A566aac9bc22b9e8023448';
const factory = '0x2f8D6E6D35728A82C003F1054eD9684aF1ce34Ac';
const logic = '0x4bEa5ead63d6eE25D9801E305B4D9dB378135af4';
const proxy = '0x340780f192fe554069431EA1f5F8848b48364E14';

async function deployMain(defaultSender) {

   const [deployer, user1 ] = await ethers.getSigners();
        /*
    const FLD = await ethers.getContractFactory("FLD");
    const fld = await FLD.deploy();
    console.log("fld:", fld.address);

    const StakeRegistry = await ethers.getContractFactory("StakeRegistry");
    const Stake1Logic = await ethers.getContractFactory("Stake1Logic");
    const Stake1Proxy = await ethers.getContractFactory("Stake1Proxy");
    const StakeFactory = await ethers.getContractFactory("StakeFactory");

    const stakeRegistry = await StakeRegistry.deploy();
    console.log("stakeRegistry:", stakeRegistry.address);
    const stakeFactory = await StakeFactory.deploy();
    console.log("stakeFactory:", stakeFactory.address);
    const stake1Logic = await Stake1Logic.deploy();
    console.log("stake1Logic:", stake1Logic.address);
    const stake1Proxy = await Stake1Proxy.deploy();
    console.log("stake1Proxy:", stake1Proxy.address);

    await stake1Proxy.upgradeTo(stake1Logic.address);
    console.log("upgradeTo:" );

    const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
    //const _logic = await stakeEntry.implementation();
    //console.log("_logic:" , _logic);

    console.log("stakeEntry:" , stakeEntry.address);

    await stakeEntry.setStore(fldtoken, registry, factory);
    console.log("setStore:"  );

    const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);
    await stakeRegistry.grantRole(ADMIN_ROLE, proxy);
    console.log("grantRole:"  );

    console.log("utils.parseUnits(initialTotal, 18):", utils.parseUnits(initialTotal, 18));
    const fld = await ethers.getContractAt("FLD", fldtoken);
    console.log("fld:", fld.address);
    console.log("deployer:", deployer.address);

    //await fld.grantRole(MINTER_ROLE, deployer.address);

    await fld.mint(deployer.address, utils.parseUnits(initialTotal, 18));
    console.log("fld mint:", fld.address);


    let out = {};
    out.FLD = fld;

    out.StakeRegistry = StakeRegistry;
    out.Stake1Logic = Stake1Logic;
    out.Stake1Proxy = Stake1Proxy;
    out.StakeFactory = StakeFactory;

    return out;
    */
    return null;
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
    /*
    // The address the Contract WILL have once mined
    const out = {};

    out.FLD = contracts.FLD.address;
    out.StakeRegistry = contracts.StakeRegistry.address;
    out.Stake1Logic = contracts.Stake1Logic.address;
    out.Stake1Proxy = contracts.Stake1Proxy.address;
    out.StakeFactory = contracts.StakeFactory.address;

    save(
      process.env.NETWORK,out
    );
    */

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
