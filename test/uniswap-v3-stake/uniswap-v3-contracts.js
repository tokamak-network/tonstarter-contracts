const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const UniswapV3FactoryJson = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
const NFTDescriptorLibraryJson = require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json");
const NonfungiblePositionManagerJson = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const NonfungibleTokenPositionDescriptor = require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json");
const SwapRouterJson = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const WETH9 = require("./weth/weth.json");
const bn = require("bignumber.js");
const linkLibraries = require("./linkLibraries");

const deployWETH = async () => {
  const contract = await (
    await ethers.getContractFactory(WETH9.abi, WETH9.bytecode)
  ).deploy();
  return contract.deployed();
};

const deployCoreFactory = async () => {
  const contract = await (
    await ethers.getContractFactory(
      UniswapV3FactoryJson.abi,
      UniswapV3FactoryJson.bytecode
    )
  ).deploy();
  const deployed = await contract.deployed();
  return deployed;
};

const deploySwapRouter = async () => {
  const { coreFactoryDeployed, wethDeployed } = await getUniswapV3Contracts;
  const coreFactory = await coreFactoryDeployed();
  const WETH = await wethDeployed();

  const contract = await (
    await ethers.getContractFactory(SwapRouterJson.abi, SwapRouterJson.bytecode)
  ).deploy(coreFactory.address, WETH.address);
  const deployed = await contract.deployed();
  return deployed;
};

const deployNFTDescriptor = async () => {
  const { wethDeployed } = await getUniswapV3Contracts;
  const weth = await wethDeployed();

  const library = await (
    await ethers.getContractFactory(
      NFTDescriptorLibraryJson.abi,
      NFTDescriptorLibraryJson.bytecode
    )
  ).deploy();
  await library.deployed();

  const linkedBytecode = linkLibraries(
    {
      bytecode: NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: NonfungibleTokenPositionDescriptor.linkReferences,
    },
    {
      NFTDescriptor: library.address,
    }
  );

  const contract = await (
    await ethers.getContractFactory(
      NonfungibleTokenPositionDescriptor.abi,
      linkedBytecode
    )
  ).deploy(weth.address);
  const deployed = await contract.deployed();
  return deployed;
};

const deployNFTPositionManager = async () => {
  const { coreFactoryDeployed, wethDeployed, nftDescriptorDeployed } =
    await getUniswapV3Contracts;
  const coreFactory = await coreFactoryDeployed();
  const weth = await wethDeployed();
  const nftDescriptor = await nftDescriptorDeployed();
  const contract = await (
    await ethers.getContractFactory(
      NonfungiblePositionManagerJson.abi,
      NonfungiblePositionManagerJson.bytecode
    )
  ).deploy(coreFactory.address, weth.address, nftDescriptor.address);
  const deployed = await contract.deployed();
  return deployed;
};

const getUniswapV3Contracts = (async () => {
  let coreFactoryContract = null;
  let swapRouterContract = null;
  let wethContract = null;
  let nftDescriptorContract = null;
  let nftPositionManager = null;
  return {
    coreFactoryDeployed: async () => {
      if (!coreFactoryContract) coreFactoryContract = await deployCoreFactory();
      return coreFactoryContract;
    },
    swapRouterDeployed: async () => {
      if (!swapRouterContract) swapRouterContract = await deploySwapRouter();
      return swapRouterContract;
    },
    wethDeployed: async () => {
      if (!wethContract) wethContract = await deployWETH();
      return wethContract;
    },
    nftDescriptorDeployed: async () => {
      if (!nftDescriptorContract)
        nftDescriptorContract = await deployNFTDescriptor();
      return nftDescriptorContract;
    },
    nftPositionManagerDeployed: async () => {
      if (!nftPositionManager)
        nftPositionManager = await deployNFTPositionManager();
      return nftPositionManager;
    },
  };
})();

const deployedUniswapV3Contracts = async (deployer) => {
  console.log({ getUniswapV3Contracts });
  const {
    coreFactoryDeployed,
    swapRouterDeployed,
    wethDeployed,
    nftDescriptorDeployed,
    nftPositionManagerDeployed,
  } = await getUniswapV3Contracts;
  const coreFactory = await coreFactoryDeployed();
  const swapRouter = await swapRouterDeployed();
  const weth = await wethDeployed();
  const nftDescriptor = await nftDescriptorDeployed();
  const nftPositionManager = await nftPositionManagerDeployed();
  return { coreFactory, swapRouter, weth, nftDescriptor, nftPositionManager };
};

const getMinTick = (tickSpacing) =>
  Math.ceil(-887272 / tickSpacing) * tickSpacing;

const getMaxTick = (tickSpacing) =>
  Math.floor(887272 / tickSpacing) * tickSpacing;

const encodePriceSqrt = (reserve1, reserve0) => {
  return new bn(reserve1.toString())
    .div(reserve0.toString())
    .sqrt()
    .multipliedBy(new bn(2).pow(96))
    .integerValue(3)
    .toFixed();
};

const getMaxLiquidityPerTick = (tickSpacing) =>
  ethers.BigNumber.from(2)
    .pow(128)
    .sub(1)
    .div((getMaxTick(tickSpacing) - getMinTick(tickSpacing)) / tickSpacing + 1);

const FeeAmount = {
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
};

const TICK_SPACINGS = {
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200,
};

module.exports = {
  deployedUniswapV3Contracts,
  getMinTick,
  getMaxTick,
  getMaxLiquidityPerTick,
  encodePriceSqrt,
  FeeAmount,
  TICK_SPACINGS,
};
