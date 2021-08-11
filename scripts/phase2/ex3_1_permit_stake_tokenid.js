const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const NonfungiblePositionManagerJson = require("../../abis_uniswap3_periphery/NonfungiblePositionManager.json");
const TOS_ABI = require('../../build/contracts/TOS.json').abi;

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
//const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

async function main() {

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // const {
  //   toBN,
  //   toWei,
  //   fromWei,
  //   keccak256,
  //   soliditySha3,
  //   solidityKeccak256,
  // } = require("web3-utils");

  let name = "Uniswap V3 Positions NFT-V1";
  let symbol = "UNI-V3-POS";
  let version = "1";
  const tokenId3476 = ethers.BigNumber.from("3476");
  const tokenId3484 = ethers.BigNumber.from("3484");
  const tokenId3690 = ethers.BigNumber.from("3690");


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

  let token = {
    id: tokenId3690,
    name: '3690',
    sender : user1
  }
 let sigInfo = {
   nonce: 1 ,
   deadline:1727661126,
   v: 27,
   r: '0xa8da231d85e40b39a08ce7557dcb05d0569fdf2bc62d0f49622f9f21c74b190e',
   s: '0x55efe8b840a1b6e4280a70afc000ed995418738d7f8db86ecf3e432ebe7373a4'
 }

  const NonfungiblePositionManagerAddress = process.env.NonfungiblePositionManager;
  const NPMContract = new ethers.Contract(
    NonfungiblePositionManagerAddress,
    NonfungiblePositionManagerJson.abi,  ethers.provider);


  let owner = await NPMContract.ownerOf(token.id);
  console.log("owner:", owner);
  console.log("token.sender:", token.sender.address);
  const stakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);

  let tx = await stakeUniswapV3.connect(token.sender).stakePermit(
      token.id, sigInfo.deadline, sigInfo.v, sigInfo.r, sigInfo.s);
  console.log("stakeUniswapV3 stake", tx.hash);

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
