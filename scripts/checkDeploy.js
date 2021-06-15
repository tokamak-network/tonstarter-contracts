const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

require("dotenv").config();

const initialTotal = process.env.initialTotal + "." + "0".repeat(18);

const zeroAddress = "0x0000000000000000000000000000000000000000";
const sendAmountForTest = "10000";

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");

/*
const tostoken = '0x08F36b925467188830887A1b1abfcd9ad68621F3';
const registry = '0x3ddE16b82B92A40642A566aac9bc22b9e8023448';
const factory = '0x2f8D6E6D35728A82C003F1054eD9684aF1ce34Ac';
const logic = '0x4bEa5ead63d6eE25D9801E305B4D9dB378135af4';
const proxy = '0x340780f192fe554069431EA1f5F8848b48364E14';

const tostoken = '0x3E9B83166f5B83454ACE140f8dc6580cdFdf74E4';
const registry = '0xbB4CD62E85eb9558BBC1b7b2cBFb15A55b347FbA';
const factory = '0xb292DCb384ead40E1E5D902413172196dEf8B3E9';
const logic = '0x5775A4d306dD45Deb93AaFDA3597F1C780a837a8';
const proxy = '0xb5032fA7Eb52b9d21b97449a31c37167636018d8';


let tostoken = '0xf5286e574B3a1e369Ffe8f0c258ee4481bEF0DD0';
let registry = '0x82F59eF5D5CA7d228914876f5F5206Be2DD740f6';
let factory = '0x0e07C3213ED88F1f8005b570BB209593Dc85aBeb';
let logic = '0x848192a9757509e36254a4C757793FA25844F004';
let proxy = '0x74d7Ec44ECDCd21Adf4Ed6264A4E0A5E6A9F3f89';
*/

let tostoken = "0xE6C0e049f5b07D84b68299A7297fB9DaB90E7a85";
let registry = "0x12A1493B5aB990244eb9bEB807b96215e420E393";
let factory = "0x313013b0Bd5B29e821866d25630F2F324dCbe4dc";
let logic = "0x298822574dECAA886cbb5429902d2694571a78b0";
let proxy = "0xd352BfD614efdCBCAC5915263be4b42eB148837e";

let ton = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0";
let wton = "0x709bef48982Bbfd6F2D4Be24660832665F53406C";
let depositManager = "0x57F5CD759A5652A697D539F1D9333ba38C615FC2";
let seigManager = "0x957DaC3D3C4B82088A4939BE9A8063e20cB2efBE";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const stake1Proxy = await ethers.getContractAt("Stake1Proxy", proxy);
  const _logic = await stake1Proxy.implementation();
  console.log("_logic:", _logic);

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  // const _logic = await stakeEntry.implementation();
  // console.log("_logic:" , _logic);

  console.log("stakeEntry:", stakeEntry.address);

  await stakeEntry.setStore(
    tostoken,
    registry,
    factory,
    ton,
    wton,
    depositManager,
    seigManager
  );
  console.log("setStore:");

  const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);
  await stakeRegistry.grantRole(ADMIN_ROLE, proxy);
  console.log("grantRole:");

  console.log(
    "utils.parseUnits(initialTotal, 18):",
    utils.parseUnits(initialTotal, 18)
  );
  const tos = await ethers.getContractAt("TOS", tostoken);
  console.log("tos:", tos.address);
  console.log("deployer:", deployer.address);

  //await tos.grantRole(MINTER_ROLE, deployer.address);

  await tos.mint(deployer.address, utils.parseUnits(initialTotal, 18));
  console.log("tos mint:", tos.address);

  let out = {};
  out.TOS = tostoken;

  out.StakeRegistry = registry;
  out.Stake1Logic = logic;
  out.Stake1Proxy = proxy;
  out.StakeFactory = factory;

  out.TON = ton;
  out.WTON = wton;
  out.DepositManager = depositManager;
  out.SeigManager = seigManager;

  return out;

  //return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contracts = await deployMain(deployer);
  console.log("contracts:", contracts);

  save(process.env.NETWORK, contracts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
