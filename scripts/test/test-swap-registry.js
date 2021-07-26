const SwapRouterJson = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const WTON = require("../abis_plasma/WTON.json");

const {
  toBN,
  keccak256,
  soliditySha3,
} = require("web3-utils");

const loadDeployed = require("./load_deployed");
const { findAccount } = require("../tasks/utils");

require("dotenv").config();

const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");

async function main() {

  const user1 = await findAccount('0xE68c794871c7a43369CAB813A25F9C42f8195aC4');
  console.log('user1',user1.address);

  const uniswapRouter = "0xe592427a0aece92de3edee1f18e0157c05861564"; //0xe592427a0aece92de3edee1f18e0157c05861564
  const uniswapNPM = "0xC4E54951aE132778970bB5273b8e642B15D92911";
  const uniswapFee = 3000;
  const uniswapWeth = "0xc778417e063141139fce010982780140aa0cd5ab"; //0xc778417e063141139fce010982780140aa0cd5ab
  const uniswapRouter2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const wton = "0x709bef48982bbfd6f2d4be24660832665f53406c"; //0x709bef48982bbfd6f2d4be24660832665f53406c
  const tos = "0x73a54e5c054aa64c1ae7373c2b5474d8afea08bd"; //0x73a54e5c054aa64c1ae7373c2b5474d8afea08bd

  console.log('registry',registry);

  const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);


  let getUniswap = await stakeRegistry.connect(user1).getUniswap();

  console.log('getUniswap',getUniswap,getUniswap[3].toString());
  /*
  await stakeRegistry.addDefiInfo(
    "UNISWAP_V3",
    uniswapRouter,
    uniswapNPM,
    uniswapWeth,
    uniswapFee,
    uniswapRouter2
  );
  console.log("stakeRegistry addDefiInfo:");
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
