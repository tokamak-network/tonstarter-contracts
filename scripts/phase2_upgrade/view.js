const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

const UniswapV3PoolJson = require("../../abis_uniswap3_core/UniswapV3Pool.json");
const requireWeb3 = require('web3')
const powerWeb3 = new requireWeb3(`${process.env.ARCHIVE_WHOST}`);

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

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("ADMIN_ROLE",ADMIN_ROLE);


  let _func1 = Web3EthAbi.encodeFunctionSignature("miningCoinage()") ;
  let _func2 = Web3EthAbi.encodeFunctionSignature("getMiningTokenId(uint256)") ;
  let _func3 = Web3EthAbi.encodeFunctionSignature("stake(uint256)") ;
  let _func4 = Web3EthAbi.encodeFunctionSignature("stakePermit(uint256,uint256,uint8,bytes32,bytes32)") ;
  let _func5 = Web3EthAbi.encodeFunctionSignature("mint(int24,int24,uint256,uint256,uint256,uint256,uint256)") ;
  console.log("miningCoinage()",_func1);
  console.log("getMiningTokenId(uint256)",_func2);
  console.log("stake(uint256)",_func3);
  console.log("stakePermit(uint256,uint256,uint8,bytes32,bytes32)",_func4);
  console.log("mint(int24,int24,uint256,uint256,uint256,uint256,uint256)",_func5);


  let _func11 = Web3EthAbi.encodeFunctionSignature("safeApproveAll(address[],uint256[])") ;
  let _func12 = Web3EthAbi.encodeFunctionSignature("increaseLiquidity(uint256,uint256,uint256,uint256,uint256,uint256)") ;
  let _func13 = Web3EthAbi.encodeFunctionSignature("collect(uint256,uint128,uint128)") ;
  let _func14 = Web3EthAbi.encodeFunctionSignature("decreaseLiquidity(uint256,uint128,uint256,uint256,uint256)") ;
  let _func15 = Web3EthAbi.encodeFunctionSignature("claim(uint256)") ;
  let _func16 = Web3EthAbi.encodeFunctionSignature("withdraw(uint256)") ;
  let _func17 = Web3EthAbi.encodeFunctionSignature("claimAndCollect(uint256,uint128,uint128)") ;

  console.log("safeApproveAll(address[],uint256[])",_func11);
  console.log("increaseLiquidity(uint256,uint256,uint256,uint256,uint256,uint256)",_func12);
  console.log("collect(uint256,uint128,uint128)",_func13);
  console.log("decreaseLiquidity(uint256,uint128,uint256,uint256,uint256)",_func14);
  console.log("claim(uint256)",_func15);
  console.log("withdraw(uint256)",_func16);
  console.log("claimAndCollect(uint256,uint128,uint128)",_func17);

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
