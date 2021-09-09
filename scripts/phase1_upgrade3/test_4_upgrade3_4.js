const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const Web3EthAbi = require("web3-eth-abi");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");
const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONUpgrade3 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade3");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  const TOS_Address = tostoken;

  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);
  let tosbalance = await tos.balanceOf(process.env.PHASE1_TON_4_ADDRESS);
  console.log("tosbalance:", tosbalance.toString());



  const stakeTON2 = await ethers.getContractAt("StakeTONUpgrade2", process.env.PHASE1_TON_4_ADDRESS);
  let totalStakedAmount = await stakeTON2.totalStakedAmount();
  console.log("totalStakedAmount", totalStakedAmount.toString());
  let token1 = await stakeTON2.token();
  console.log("token", token1);
  let wton1 = await stakeTON2.wton();
  console.log("wton", wton1);
  let ton1 = await stakeTON2.ton();
  console.log("ton", ton1);
  let depositManager = await stakeTON2.depositManager();
  console.log("depositManager", depositManager);
  let seigManager = await stakeTON2.seigManager();
  console.log("seigManager", seigManager);
  let tokamakLayer2 = await stakeTON2.tokamakLayer2();
  console.log("tokamakLayer2", tokamakLayer2);

  const stakeTON = await ethers.getContractAt("StakeTONUpgrade3", process.env.PHASE1_TON_4_ADDRESS);

  let version = await stakeTON.connect(user1).version();
  console.log("version", version);

  // let tx1 = await stakeTON.connect(user1).withdraw();
  // console.log("withdraw", tx1);


  let tx1 = await stakeTON.withdrawData('0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9');
  console.log("withdrawData", tx1);

  console.log("PHASE1.SWAPTOS.BURNPERCENT: ", keccak256("PHASE1.SWAPTOS.BURNPERCENT"));
  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
