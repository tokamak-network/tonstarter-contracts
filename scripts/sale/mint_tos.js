const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");
const WTONJson = require("../../abis_plasma/WTON.json");
const TONJson = require("../../abis_plasma/TON.json");
const TOSJson = require("../../build/contracts/TOS.json");
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
const wton = loadDeployed(process.env.NETWORK, "WTON");

const toAddress = "0x3d24e9E6fF7915f9353e2614050528b776D120eE";

async function main() {

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const TOS = await ethers.getContractAt(TOSJson.abi, tostoken);
  console.log("TOS:", TOS.address);
  /*
  await TOS.connect(deployer).transfer(
    toAddress,
    ethers.BigNumber.from('30000000000000000000000')
  );
  */
/*
  let tx = await TOS.connect(deployer).mint(
    toAddress,
    ethers.BigNumber.from('30000000000000000000000')
  );
  console.log('tx', tx.hash );

*/
  //================================================
  let bal = await TOS.balanceOf(toAddress);
  console.log(toAddress, utils.formatUnits(bal.toString(), 18) );

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
