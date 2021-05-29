const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
const loadDeployedInitVariable = require("./load_deployed_init");

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
const Pharse1_TOTAL = process.env.Pharse1_TOTAL + "." + "0".repeat(18);
const Pharse1_TON_Staking =
  process.env.Pharse1_TON_Staking + "." + "0".repeat(18);
const Pharse1_ETH_Staking =
  process.env.Pharse1_ETH_Staking + "." + "0".repeat(18);
const Pharse1_FLDETHLP_Staking =
  process.env.Pharse1_FLDETHLP_Staking + "." + "0".repeat(18);
const Pharse1_DEV_Mining =
  process.env.Pharse1_DEV_Mining + "." + "0".repeat(18);

const zeroAddress = "0x0000000000000000000000000000000000000000";
const sendAmountForTest = "10000";

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");

let fldtoken = loadDeployed(process.env.NETWORK,"FLD");
let registry = loadDeployed(process.env.NETWORK,"StakeRegistry");
let factory = loadDeployed(process.env.NETWORK,"StakeFactory");
let vaultfactory = loadDeployed(process.env.NETWORK,"StakeVaultFactory");
let logic = loadDeployed(process.env.NETWORK,"Stake1Logic");
let proxy = loadDeployed(process.env.NETWORK,"Stake1Proxy");

let ton = loadDeployed(process.env.NETWORK,"TON");
let wton = loadDeployed(process.env.NETWORK,"WTON");
let depositManager = loadDeployed(process.env.NETWORK,"DepositManager");
let seigManager = loadDeployed(process.env.NETWORK,"SeigManager");
console.log("proxy:", proxy);
console.log("ton:", ton);
console.log("wton:", wton);

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  let uniswapRouter = loadDeployedInitVariable(process.env.NETWORK,"UniswapRouter");
  let uniswapNPM = loadDeployedInitVariable(process.env.NETWORK,"NonfungiblePositionManager");
  let uniswapFee = loadDeployedInitVariable(process.env.NETWORK,"UniswapFee");
  let uniswapWeth = loadDeployedInitVariable(process.env.NETWORK,"WethAddress");

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:" , stakeEntry.address);

  console.log("fldtoken:", fldtoken);
  console.log("registry:", registry);
  console.log("factory:", factory);
  console.log("vaultfactory:", wton);
  console.log("ton:", ton);
  console.log("wton:", vaultfactory);
  console.log("depositManager:", depositManager);
  console.log("seigManager:", seigManager);

  await stakeEntry.setStore(
    fldtoken,
    registry,
    factory,
    vaultfactory,
    ton,
    wton,
    depositManager,
    seigManager
  );
  console.log("stakeEntry setStore:");

  const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);

  await stakeRegistry.setTokamak(
    ton,
    wton,
    depositManager,
    seigManager);
  console.log("stakeRegistry setTokamak:");

  await stakeRegistry.addDefiInfo(
    "UNISWAP_V3",
    uniswapRouter,
    uniswapNPM,
    uniswapWeth,
    uniswapFee);
  console.log("stakeRegistry addDefiInfo:");


  await stakeRegistry.grantRole(ADMIN_ROLE, proxy);
  console.log("stakeRegistry grantRole: proxy");

  const stakeFactory = await ethers.getContractAt("StakeFactory", factory);
  await stakeFactory.grantRole(ADMIN_ROLE, proxy);
  console.log("stakeFactory grantRole: proxy");

  console.log(
    "utils.parseUnits(initialTotal, 18):",
    utils.parseUnits(initialTotal, 18)
  );

  const fld = await ethers.getContractAt("FLD", fldtoken);
  console.log("fld:", fld.address);
  console.log("deployer:", deployer.address);

  //await fld.grantRole(MINTER_ROLE, deployer.address);
  await fld.mint(deployer.address, utils.parseUnits(initialTotal, 18));
  console.log("fld mint:", fld.address);

  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
