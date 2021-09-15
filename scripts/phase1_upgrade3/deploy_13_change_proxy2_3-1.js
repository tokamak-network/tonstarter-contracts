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

const StakeTONUpgrade2 = loadDeployed(process.env.NETWORK, "StakeTONUpgrade2");
const StakeTONProxy2 = loadDeployed(process.env.NETWORK, "StakeTONProxy2");

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();
  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);


  let ABI_CODE =  [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "role",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const proxyContract = new ethers.Contract(proxy,ABI_CODE,ethers.provider );
  let tx1 = await proxyContract.connect(deployer).grantRole(process.env.PHASE1_TON_3_ADDRESS, keccak256("ADMIN"), deployer.address );
  console.log("grantRole PHASE1_TON_3_ADDRESS", tx1.hash);
  printGasUsedOfUnits('grantRole PHASE1_TON_3_ADDRESS',tx1);

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:", stakeEntry.address);

  let tx2 = await stakeEntry.connect(deployer).upgradeStakeTo(process.env.PHASE1_TON_3_ADDRESS, StakeTONProxy2);
  console.log("upgradeStakeTo PHASE1_TON_3_ADDRESS StakeTONProxy2", tx2.hash);
  printGasUsedOfUnits('upgradeStakeTo PHASE1_TON_3_ADDRESS StakeTONProxy2',tx2);

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
