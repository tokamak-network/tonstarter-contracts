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

const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());


  //================================================

  // const Stake2LogicAddress = loadDeployed(process.env.NETWORK, "Stake2Logic");
  let stake2logic = await ethers.getContractAt("Stake2Logic", "0x5263DB227aA8e5d4E417b8594e9624A210b6fEda");
  const Stake1Proxy = await ethers.getContractAt("Stake1Proxy", proxy);
  console.log("Stake1Proxy:", Stake1Proxy.address);

  tx =  await Stake1Proxy.setAliveImplementation(
    stake2logic.address,
    true);
  console.log("Stake2Logic setAliveImplementation: " );
  printGasUsedOfUnits('Stake2Logic setAliveImplementation',tx.hash );

  // attach stake2logic
  let _func1 = Web3EthAbi.encodeFunctionSignature("setPool(address,address[4])") ;

  tx =  await Stake1Proxy.setImplementation(
    stake2logic.address,
    ethers.BigNumber.from("2"),
    true);
  console.log("Stake2Logic setImplementation: " );
  printGasUsedOfUnits('Stake2Logic setImplementation',tx.hash );
  //=====================================

  tx =  await Stake1Proxy.setSelectorImplementations(
        [_func1 ],
        stake2logic.address);
  console.log("Stake2Logic setPool setSelectorImplementations: " );
  printGasUsedOfUnits('Stake2Logic setPool setSelectorImplementations', tx.hash);

  /*
  const stakeUniswapV3Proxy = await ethers.getContractAt("StakeUniswapV3Proxy", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);
  console.log("stakeUniswapV3Proxy:", stakeUniswapV3Proxy.address);

  /// @dev set pool information
  /// @uniswapInfo [NonfungiblePositionManager,UniswapV3Factory,token0,token1]
  const poolinfo = [
    process.env.NonfungiblePositionManager,
    process.env.coreFactory,
    process.env.PHASE2_UNISWAPV3_POOL_TOKEN0,
    process.env.PHASE2_UNISWAPV3_POOL_TOKEN1
  ]
  console.log('poolinfo: ', poolinfo);

  let tx = await stakeUniswapV3Proxy.setPool(poolinfo);

  console.log("stakeUniswapV3Proxy setPool", tx.hash );
  printGasUsedOfUnits('stakeUniswapV3Proxy setPool', tx.hash);
  console.log("stakeUniswapV3Proxy tx", tx );
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
