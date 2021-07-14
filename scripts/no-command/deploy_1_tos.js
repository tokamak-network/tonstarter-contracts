const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed");

const {
  // padLeft,
  // toBN,
  // toWei,
  // fromWei,
  keccak256,
  // soliditySha3,
  // solidityKeccak256,
} = require("web3-utils");

require("dotenv").config();

const ADMIN_ROLE = keccak256("ADMIN");
//const PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
// const PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
// const EIP712Domain =  keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

let inputInfo = {
  name: 'TONStarter',
  symbol: 'TOS',
  version: '1.0',
}

let deployInfo = {
    name : "TOS",
    address : ""
  }

async function deployTOS() {
  const [deployer, user1] = await ethers.getSigners();

  const TOS = await ethers.getContractFactory("TOS");
  const tos = await TOS.deploy(inputInfo.name, inputInfo.symbol, inputInfo.version);
  await tos.deployed();

  deployInfo.address = tos.address;
  console.log("deployed to:", deployInfo);

  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  await deployTOS();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
