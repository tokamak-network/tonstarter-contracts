const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

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
const wton = loadDeployed(process.env.NETWORK, "WTON");
const DepositManager = loadDeployed(process.env.NETWORK, "DepositManager");
const SeigManager = loadDeployed(process.env.NETWORK, "SeigManager");


const StakeTONControl = loadDeployed(process.env.NETWORK, "StakeTONControl");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);
  const stakeTONControl = await ethers.getContractAt("StakeTONControl", StakeTONControl);

  // 26번
  let addrs =[
      "0x0A0A31d7527625DB10A925cB6FB56828f4c41BA1",
      "0xeeef7BEEde89E936A825d2f8eB298493C5ea7291",
      "0x900528d125B93857B95AeB2c40F50625c791FAe3",
      "0xbcCF13971EE5e4f2F731afD092b04E1Fe7556272",
      "0x25051073D26a504184de2a64016f9B7a0fc386B5"
  ];
  // 27번
  // let addrs =[
  //     "0xF30c9F6c4a966BC856dd4408e03aaE147cfC9e26",
  //     "0x2FDe694851d4a369bc76E3c6424F1f8Ee798F30b",
  //     "0xD3E4f3B9D2957025B76d47fe8713C78C142432D7",
  //     "0x2960923d7047bc35490D02975A7Fb1A40a456FA8",
  //     "0x12F95a23786E2B2C7C8448427b0fe246f4419596"
  // ]

  let tx1 = await stakeTONControl.connect(deployer).addStakeTons(
    addrs
    );
  console.log("addStakeTons StakeTONControl ", tx1.hash);
  printGasUsedOfUnits('addStakeTons StakeTONControl',tx1);

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
