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
  const token0 = WETHAddress;
  const amount = 5000;
  const tokenContract = await ethers.getContractFactory("WTON");
  const token = await tokenContract.attach(WETHAddress);

  const tx = await token.connect(recipient).approve(nonfungibleTokenPositionManagerAddress, amount, {
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
