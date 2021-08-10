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

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const tos = await ethers.getContractAt("TOS", tostoken);
  console.log("tos:", tos.address);

  //================================================

  const StakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);

  const tokenId3476 = ethers.BigNumber.from("3476");
  const tokenId3484 = ethers.BigNumber.from("3484");

  // let token = {
  //   id: tokenId3476,
  //   name: '3476',
  //   sender : user1
  // }

  // let token = {
  //   id: tokenId3484,
  //   name: '3484',
  //   sender : user2
  // }

  // wton-tos
  const tokenId3690 = ethers.BigNumber.from("3690");
  const tokenId3880 = ethers.BigNumber.from("3880");

  // let token = {
  //   id: tokenId3880,
  //   name: '3880',
  //   sender : user2
  // }

  let token = {
    id: tokenId3690,
    name: '3690',
    sender : user1
  }

   let res0 =  await StakeUniswapV3.currentliquidityTokenId(token.id, ethers.BigNumber.from("0"));
    console.log("\n currentliquidityTokenId:",  token.id.toString(),
    '\n secondsAbsolute:',res0.secondsAbsolute.toString(),
    '\n secondsInsideDiff256:',res0.secondsInsideDiff256.toString(),
    '\n liquidity:',res0.liquidity.toString(),
    '\n expectTime:',res0.expectTime.toString()
    );

   let res1 =  await StakeUniswapV3.currentCoinageBalanceTokenId(token.id, ethers.BigNumber.from("0"));
    console.log("\n currentCoinageBalanceTokenId:",  token.id.toString(),
    '\n currentTotalCoinage:',res1.currentTotalCoinage.toString(),
    '\n afterTotalCoinage:',res1.afterTotalCoinage.toString(),
    '\n afterBalanceTokenId:',res1.afterBalanceTokenId.toString(),
    '\n expectTime:',res1.expectTime.toString()
    );


   let res2 =  await StakeUniswapV3.expectedPlusClaimableAmount(token.id, ethers.BigNumber.from("0"));
    console.log("\n expectedPlusClaimableAmount:",  token.id.toString(),
    '\n miningAmount:',res2.miningAmount.toString(),
    '\n nonMiningAmount:',res2.nonMiningAmount.toString(),
    '\n minableAmount:',res2.minableAmount.toString(),
    '\n minableAmountRay:',res2.minableAmountRay.toString(),
    '\n expectTime:',res2.expectTime.toString()
    );

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
