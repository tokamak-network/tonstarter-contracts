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

const wETH9 = loadDeployed(process.env.NETWORK, "WETH9");
const uniswapV3Factory = loadDeployed(process.env.NETWORK, "UniswapV3Factory");
const swapRouter = loadDeployed(process.env.NETWORK, "SwapRouter");
const nFTDescriptor = loadDeployed(process.env.NETWORK, "NFTDescriptor");
const nonfungibleTokenPositionDescriptor = loadDeployed(process.env.NETWORK, "NonfungibleTokenPositionDescriptor");
const nonfungiblePositionManager = loadDeployed(process.env.NETWORK, "NonfungiblePositionManager");


async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const _nonfungiblePositionManager = await ethers.getContractAt("NonfungiblePositionManager", nonfungiblePositionManager);
  console.log("_nonfungiblePositionManager:", _nonfungiblePositionManager.address);

  const tx = await _nonfungiblePositionManager.connect(deployer).createAndInitializePoolIfNecessary(
    token0,
    token1,
    FeeAmount.MEDIUM,
    encodePriceSqrt(1, 1)
  );

  return await tx.wait();

}

async function main() {
  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain();

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
