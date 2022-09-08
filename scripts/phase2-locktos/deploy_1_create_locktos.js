const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

const zeroAddress = "0x0000000000000000000000000000000000000000";
// const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const tostoken = "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9";

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const TOS_Address = tostoken;
  const tos = await ethers.getContractAt("TOS", TOS_Address);
  console.log("tos:", tos.address);

  const LockTOS = await ethers.getContractFactory("LockTOS");
  const LockTOSProxy = await ethers.getContractFactory(
    "LockTOSProxy"
  );


  let deployInfo = {name:'', address:''};
  const lockTOS = await LockTOS.deploy();
  let tx = await lockTOS.deployed();
  console.log("LockTOS:", lockTOS.address);
  deployInfo = {
    name: "LockTOS",
    address: lockTOS.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('LockTOS  Deploy',tx);

  // ale: "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1"

  const lockTOSProxy = await LockTOSProxy.deploy(
    lockTOS.address, "0x5b6e72248b19F2c5b88A4511A6994AD101d0c287"
  );
  tx =  await lockTOSProxy.deployed();
  console.log("LockTOSProxy:", lockTOSProxy.address);
  deployInfo = {
    name: "LockTOSProxy",
    address: lockTOSProxy.address
  }

  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }

  printGasUsedOfUnits('LockTOSProxy Deploy',tx);


  return null;
}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
