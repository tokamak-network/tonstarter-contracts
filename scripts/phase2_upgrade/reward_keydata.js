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

  // let key =  {
  //   rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
  //   pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
  //   startTime: 1634880600,
  //   endTime: 1634884200,
  //   refundee: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E'
  // }

  let key =  {
    rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
    pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
    startTime: 1635231600,
    endTime: 1635233400,
    refundee: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E'
  }

  const incentiveKeyAbi =
  'tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'

  let data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

  console.log("encode",data);

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
