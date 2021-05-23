const {
  abi: SWAP_ROUTER_ABI,
  bytecode: SWAP_ROUTER_BYTECODE,
} = require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');

const {
  nonfungibleTokenPositionManagerAddress,
  WTON: WTONAddress,
  FLD: FLDAddress,
  WETH: WETHAddress,
} = require("../deployed.rinkeby.json");


const bn = require("bignumber.js");

const FeeAmount = {
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
};

const encodePriceSqrt = (reserve1, reserve0) => {
  return new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy((new bn(2)).pow(96))
      .integerValue(3)
      .toFixed();
};

async function main() {
  const [recipient] = await ethers.getSigners();
  const token0 = WTONAddress;
  const token1 = WETHAddress;

  const npm = new ethers.Contract(nonfungibleTokenPositionManagerAddress, SWAP_ROUTER_ABI);
	const initParams = [
    token0,
    token1,
    FeeAmount.MEDIUM,
    encodePriceSqrt(1, 1),
  ];
  console.log({ initParams });
  const initTX = await npm.connect(recipient).createAndInitializePoolIfNecessary(...initParams, {
    gasLimit: 10000000, nonce: 37, gasPrice: 5000000000
  });
  await initTX.wait();

  console.log({ initTX });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
