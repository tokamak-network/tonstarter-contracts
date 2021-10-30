const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

const UniswapV3PoolJson = require("../../abis_uniswap3_core/UniswapV3Pool.json");
const NonfungiblePositionManagerJson = require("../../abis_uniswap3_periphery/NonfungiblePositionManager.json");

const UniswapV3PoolAddress = "0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4";
const NonfungiblePositionManageAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

// const requireWeb3 = require('web3')
// const powerWeb3 = new requireWeb3(`${process.env.ARCHIVE_WHOST}`);

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

    let poolContract ;
    let npmContract ;

  const tokenId146444 = ethers.BigNumber.from("146444");
  const tokenId146487 = ethers.BigNumber.from("146487");
    const tokenId146329 = ethers.BigNumber.from("146329");
    const tokenId146321 = ethers.BigNumber.from("146321");

/*
{
            name: "146444",
            id: tokenId146444
        },
        {
            name: "146487",
            id: tokenId146487
        },
        */
    let tokens = [
        {
            name: "146329",
            id: tokenId146329
        },
        {
            name: "146321",
            id: tokenId146321
        }
    ]

  try{
        poolContract = new ethers.Contract(UniswapV3PoolAddress, UniswapV3PoolJson.abi, ethers.provider);
        npmContract  = new ethers.Contract(NonfungiblePositionManageAddress, NonfungiblePositionManagerJson.abi,ethers.provider);


        let pollLiquidity = await poolContract.liquidity();
        console.log("\n pollLiquidity :", pollLiquidity.toString());

        let slot0 = await poolContract.slot0();
        console.log("\n slot0.tick :", slot0.tick);


        for(let i = 0; i< tokens.length; i++){

            let position = await npmContract.positions(tokens[i].id);
            console.log("\n -------------------------");
            console.log("\n token :", tokens[i].name);
            console.log("\n liquidity :", position.liquidity.toString());
            console.log("\n tickLower :", position.tickLower);
            console.log("\n tickUpper :", position.tickUpper);
            console.log("\n tickInterval :", position.tickUpper-position.tickLower);

            console.log("\n feeGrowthInside0LastX128 :", position.feeGrowthInside0LastX128.toString());
            console.log("\n feeGrowthInside1LastX128 :", position.feeGrowthInside1LastX128.toString());
            console.log("\n tokensOwed0 :", position.tokensOwed0.toString());
            console.log("\n tokensOwed1 :", position.tokensOwed1.toString());

        }


  }catch(error){
      console.log(' err :', error) ;
      process.exit();
  }

  if(npmContract ==null ){
        console.log('npmContract  is null ') ;
        process.exit();
  }

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });