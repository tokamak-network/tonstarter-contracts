const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

const {
  // padLeft,
  // toBN,
  // toWei,
  // fromWei,
  keccak256,
  // soliditySha3,
  // solidityKeccak256,
} = require("web3-utils");
const Web3EthAbi = require('web3-eth-abi');

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const vaultFactory = loadDeployed(process.env.NETWORK, "StakeVaultFactory");

const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");
  /*
const {
  createValue,
  createStakeContract,
  timeout,
  getPeriodBlockByTimes
  } = require("../../utils/deploy_common.js");
*/

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const stakeEntry2 = await ethers.getContractAt("Stake2Logic", proxy);
  console.log("stakeEntry2:", stakeEntry2.address);

   /// @dev create vault2
    /// @param _cap  allocated reward amount
    /// @param _miningPerSecond  the mining per second
    /// @param _phase  phase of TOS platform
    /// @param _vaultName  vault's name's hash
    /// @param _stakeType  it's 2, StakeUniswapV3 staking type
    /// @param _uniswapInfo  npm, poolFactory, token0, token1
    /// @param _name   name
  const vault = {
    allocatedTOS: process.env.PHASE2_UNISWAPV3_ALLOCATED,
    miningPerSecond: process.env.PHASE2_MINING_PER_SECOND,
    phase: "2",
    name: process.env.PHASE2_LP_NAME,
    stakeType: "2",
  }
  console.log('pahse2 vault : ', vault);

  let tx = await stakeEntry2.createVault2(
    utils.parseUnits(vault.allocatedTOS, 18),
    utils.parseUnits(vault.miningPerSecond, 0),
    ethers.BigNumber.from(vault.phase),
    keccak256(vault.name),
    ethers.BigNumber.from(vault.stakeType),
    [ process.env.NonfungiblePositionManager,
      process.env.coreFactory,
      process.env.PHASE2_UNISWAPV3_POOL_TOKEN0,
      process.env.PHASE2_UNISWAPV3_POOL_TOKEN1,
    ],
    vault.name
  );

  console.log("Phase2 CreateVault2 & Create StakeUniswapV3  ", tx.hash );
  printGasUsedOfUnits('Phase2 CreateVault2 & Create StakeUniswapV3', tx.hash);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
