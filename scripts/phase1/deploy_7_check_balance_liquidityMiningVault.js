const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed_file");
const loadDeployed = require("../load_deployed");
//const loadDeployedInitVariable = require("./load_deployed_init");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const { printGasUsedOfUnits } = require("../log_tx");


const SimpleVault1 = require("../../abis_vaults/vaults/SimpleVault.sol/SimpleVault.json");

const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");


async function deployMain(defaultSender) {
  const [deployer, user1, user2 ] = await ethers.getSigners();


  const tos = await ethers.getContractAt("TOS", tostoken);
  let _balanceTOS = await tos.balanceOf(process.env.PHASE1_TON_VAULT_ADDRESS);
  console.log("TOS balanceof PHASE1_TON_VAULT:  ", utils.formatUnits(_balanceTOS.toString(), 18) , 'TOS' );


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
