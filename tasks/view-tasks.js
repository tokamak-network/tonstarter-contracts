
const {
  abi: NPM_ABI,
} = require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');

task("positions", "Positions")
  .addParam("npmAddress")
  .addParam("tokenId")
  .setAction(async({ npmAddress, tokenId }) => {
    console.log({npmAddress});
    const npm = new ethers.Contract(npmAddress, NPM_ABI);
    const { liquidity } = await npm.positions(tokenId);
    console.log({ liquidity });
  });


task("rinkeby-positions", "Positions")
  .setAction(async() => {
    const {
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
    } = process.env;
    const tokenId = "785";
    await run("positions", {
      npmAddress,
      tokenId
    })
  });
