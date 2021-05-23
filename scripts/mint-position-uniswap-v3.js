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


const getMinTick = tickSpacing => Math.ceil(-887272 / tickSpacing) * tickSpacing;
const getMaxTick = tickSpacing => Math.floor(887272 / tickSpacing) * tickSpacing;

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

async function main() {
  const [recipient] = await ethers.getSigners();
  const token0 = WTONAddress;
  const token1 = WETHAddress;
  const amount0Desired = 2;
  const amount1Desired = 1;
  const deadline = 100000000000000;

  const npm = new ethers.Contract(nonfungibleTokenPositionManagerAddress, SWAP_ROUTER_ABI);

  const mintParams = {
    token0,
    token1,
    amount0Desired,
    amount1Desired,
    deadline,

    amount0Min: 0,
    amount1Min: 0,
    recipient: recipient.address,

    fee: FeeAmount.MEDIUM,
    tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
    tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
  };
  console.log({ mintParams });

  const tx = await npm.connect(recipient).mint(mintParams, {
    gasLimit: 10000000, gasPrice: 5000000000
  });
  await tx.wait();
  // console.log({ tx });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
