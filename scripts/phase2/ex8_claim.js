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


  const Stake2Vault = await ethers.getContractAt("Stake2Vault", process.env.PHASE2_LP_VAULT_ADDRESS);
  const StakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);

  const tokenId3476 = ethers.BigNumber.from("3476");
  const tokenId3484 = ethers.BigNumber.from("3484");

  let token = {
    id: tokenId3476,
    name: '3476',
    sender : user1
  }

  // let token = {
  //   id: tokenId3484,
  //   name: '3484',
  //   sender : user2
  // }

   //=====================================
  let res2 =  await StakeUniswapV3.totalSupplyCoinage();
  console.log("\n StakeUniswapV3 totalSupplyCoinage:", utils.formatUnits(res2.toString(), 27)  );

  let res3 =  await StakeUniswapV3.balanceOfCoinage(token.id);
  console.log("\n StakeUniswapV3 balanceOfCoinage token:", token.name,  utils.formatUnits(res3.toString(), 27)  );

  let tosbalance = await tos.balanceOf(token.sender.address);
  console.log("\n tosbalance:", token.sender.address,  utils.formatUnits(tosbalance.toString(), 18)  );


  console.log("\n =========== claim ");
  let tx = await StakeUniswapV3.connect(token.sender).claim(token.id);

  console.log("\n =========== tx ",tx);

  if(tx.receipt!=null){
    let logs = tx.receipt.logs ;
    let events = tx.receipt.events ;
    if(events!=null && events.length > 0 ){
      for(let i=0; i< events.length ; i++){
        console.log("\n events ",i, events[i]);
      }
    }
  }
  /*
  res2 =  await StakeUniswapV3.totalSupplyCoinage();
  console.log("\n StakeUniswapV3 totalSupplyCoinage:", utils.formatUnits(res2.toString(), 27)  );


  res3 =  await StakeUniswapV3.balanceOfCoinage(token.id);
  console.log("\n StakeUniswapV3 balanceOfCoinage token:", token.name,  utils.formatUnits(res3.toString(), 27)  );

  tosbalance = await tos.balanceOf(token.sender.address);
  console.log("\n tosbalance:", token.sender.address,  utils.formatUnits(tosbalance.toString(), 18)  );
  */
 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
