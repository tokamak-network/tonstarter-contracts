const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const UniswapV3StakerJson = require("../../abis/UniswapV3Staker.json").abi;
const uniswapV3StakerAddress ="0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d";
const zeroAddress = "0x0000000000000000000000000000000000000000";

const tokenId0 = 11465; // DOC/TOS (0.3 %)  0x831a1f01ce17b6123a7d1ea65c26783539747d6d
const tokenId1 = 11461; // TOS/WTON 0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf


function getIncentive(rewardToken, pool, startTime, endTime, refundee) {
  return {
    rewardToken: rewardToken,
    pool: pool,
    startTime: startTime,
    endTime: endTime,
    refundee: refundee
  }
}

/*
async function stakes() {
  const [deployer, user1, user2] = await ethers.getSigners();

  const uniswapStaker = await ethers.getContractAt(UniswapV3StakerJson, uniswapV3StakerAddress);
  console.log("uniswapStaker:", uniswapStaker.address);

  const incentive0 = getIncentive("0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd","0x831a1f01cE17B6123A7d1eA65C26783539747D6d",1639404600,1639486800,"0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E");
  const incentive1 = getIncentive("0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0","0x516E1AF7303A94f81e91E4aC29e20F4319D4eCaf",1639397700,1639454400,"0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E");

  let data1 = uniswapStaker.interface.encodeFunctionData('stakeToken', [incentive0,tokenId0])
  let data2 = uniswapStaker.interface.encodeFunctionData('stakeToken', [incentive1,tokenId1])

  let tx = await  uniswapStaker.connect(user2).multicall([data1,data2])

  console.log(tx);
  return null;
}
*/

async function unstakeToken() {
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("user2:", user2.address);

  const uniswapStaker = await ethers.getContractAt(UniswapV3StakerJson, uniswapV3StakerAddress);
  console.log("uniswapStaker:", uniswapStaker.address);

  const incentive0 = getIncentive("0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd","0x831a1f01cE17B6123A7d1eA65C26783539747D6d",1639404600,1639486800,"0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E");
  const incentive1 = getIncentive("0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0","0x516E1AF7303A94f81e91E4aC29e20F4319D4eCaf",1639397700,1639454400,"0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E");

  let data1 = uniswapStaker.interface.encodeFunctionData('unstakeToken', [incentive0,tokenId0])
  let data2 = uniswapStaker.interface.encodeFunctionData('unstakeToken', [incentive1,tokenId1])

  let tx = await  uniswapStaker.connect(user2).multicall([data1,data2])

  console.log(tx);
  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let res1 = await unstakeToken();

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
