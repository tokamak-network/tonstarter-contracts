const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const { printGasUsedOfUnits } = require("./log_tx");


const SimpleVault1 = require("../abis_vaults/vaults/SimpleVault.sol/SimpleVault.json");

const zeroAddress = "0x0000000000000000000000000000000000000000";

const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");


async function deployMain(defaultSender) {
  const [deployer, user1, user2 ] = await ethers.getSigners();

  const liquidityMiningVault = new ethers.Contract(process.env.LiquidityMiningVault, SimpleVault1.abi, ethers.provider);
  console.log("Deploying contracts with the account:", deployer.address);

  let _isAdmin = await liquidityMiningVault.isAdmin(deployer.address);
  console.log("liquidityMiningVault isAdmin:  ", deployer.address, _isAdmin );

  if(_isAdmin){
    let tx = await liquidityMiningVault.connect(deployer).claimTOS(
        process.env.PHASE1_TON_VAULT_ADDRESS,
        utils.parseUnits(process.env.PHASE1_TON_ALLOCATED + "." + "0".repeat(18))
    );
    console.log("LiquidityMiningVault claimTOS:  ", process.env.PHASE1_TON_VAULT_ADDRESS, utils.parseUnits(process.env.PHASE1_TON_ALLOCATED + "." + "0".repeat(18)) );
    console.log("liquidityMiningVault claimTOS tx.hash:  ", tx.hash );

    printGasUsedOfUnits('liquidityMiningVault claimTOS ',tx);

  }

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
