const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const {
  defaultSender,
  accounts,
  contract,
  web3,
  privateKeys,
} = require("@openzeppelin/test-environment");
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

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const weth9 = loadDeployed(process.env.NETWORK, "WETH9");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");

async function main() {

  const [deployer, user1] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const provider = ethers.provider;

  const stake1Proxy = await ethers.getContractAt("Stake1Proxy", proxy);
  console.log("stake1Proxy:", stake1Proxy.address);

  let _func1 = web3.eth.abi.encodeFunctionSignature("stakeContractsOfVault(address)") ;
  let _func2 = web3.eth.abi.encodeFunctionSignature("vaultsOfPhase(uint256)") ;
  let _func3 = web3.eth.abi.encodeFunctionSignature("createVault2(uint256,uint256,uint256,bytes32,uint256,address[4],string)") ;
  let _func4 = web3.eth.abi.encodeFunctionSignature("setVaultLogicByPhase(uint256,address)") ;


    let _func1_addr  = await stake1Proxy.getSelectorImplementation(_func1);
    console.log('_func1_addr',_func1_addr);
    let _func2_addr  = await stake1Proxy.getSelectorImplementation(_func2);
    console.log('_func2_addr',_func2_addr);
    let _func3_addr  = await stake1Proxy.getSelectorImplementation(_func3);
    console.log('_func3_addr',_func3_addr);
    let _func4_addr  = await stake1Proxy.getSelectorImplementation(_func4);
    console.log('_func4_addr',_func4_addr);

  const stakeEntry1 = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry1:", stakeEntry1.address);


  const stakeEntry2 = await ethers.getContractAt("Stake2Logic", proxy);
  console.log("stakeEntry2:", stakeEntry2.address);

  let vaults = await stakeEntry1.vaultsOfPhase(ethers.BigNumber.from("2"));
  console.log("vaults:", vaults);

  //0x890D0a432Cef5328d8BDD7B31D0dFAB908bFd261
  let stakeContractAddresses = await stakeEntry1.stakeContractsOfVault('0x890D0a432Cef5328d8BDD7B31D0dFAB908bFd261');
  console.log("stakeContractAddresses:",   stakeContractAddresses);
  // if(vaults!=null){
  //   for(let i=0; i< vaults.length; i++){
  //     let stakeContractAddresses = await stakeEntry1.stakeContractsOfVault(vaults[i]);
  //       console.log("stakeContractAddresses:", vaults[i], stakeContractAddresses);
  //   }
  // }


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
