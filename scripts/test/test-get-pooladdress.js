const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("./save_deployed_file");
const loadDeployed = require("./load_deployed");
//const loadDeployedInitVariable = require("./load_deployed_init");
const { printGasUsedOfUnits } = require("./log_tx");
const WTON1 = require("../abis_plasma_ethers/contracts/stake/tokens/WTON.sol/WTON.json");
const {POOL_BYTECODE_HASH, computePoolAddress } = require('../test/stake-uniswapv3/computePoolAddress.js');

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");

async function main() {

  const uniswapRouter = "0xe592427a0aece92de3edee1f18e0157c05861564";
  const uniswapNPM = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  const uniswapFee = 3000;
  const uniswapWeth = "0xc778417e063141139fce010982780140aa0cd5ab"; //0xc778417e063141139fce010982780140aa0cd5ab
  const uniswapRouter2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  //
  const NonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  const UniswapV3Factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

  const wton = "0x709bef48982bbfd6f2d4be24660832665f53406c"; //0x709bef48982bbfd6f2d4be24660832665f53406c
  const tos = "0x73a54e5c054aa64c1ae7373c2b5474d8afea08bd"; //0x73a54e5c054aa64c1ae7373c2b5474d8afea08bd

 // const WTON = await ethers.getContractAt("WTON", wton);
  const TOS = await ethers.getContractAt("TOS", tos);
  const WTON = await ethers.getContractAt(WTON1.abi, wton);

    // let pooladdr = computePoolAddress(
    //     UniswapV3Factory , [wton,tos],
    //     utils.parseUnits('3000',0)
    // );


    let pooladdr = computePoolAddress(
        UniswapV3Factory , [tos, wton],
        utils.parseUnits('3000',0)
    );

    console.log('pooladdr',pooladdr.toLowerCase() );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
