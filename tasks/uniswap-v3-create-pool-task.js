const { FeeAmount, encodePriceSqrt, findAccount } = require("./utils");
const {
  abi: NPM_ABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

task("create-pool", "Create pool")
  .addParam("npmAddress", "NPM Address")
  .addParam("creatorAddress", "Creator address")
  .addParam("token0", "Token0 address")
  .addParam("token1", "Token1 address")
  .setAction(async ({ npmAddress, creatorAddress, token0, token1 }) => {
    console.log({ npmAddress, creatorAddress, token0, token1 });
    const creator = await findAccount(creatorAddress);
    const npm = new ethers.Contract(npmAddress, NPM_ABI);

    const initParams = [
      token0,
      token1,
      FeeAmount.MEDIUM,
      encodePriceSqrt(1, 1),
    ];
    console.log({ initParams });

    const tx = await npm
      .connect(creator)
      .createAndInitializePoolIfNecessary(...initParams, {
        gasLimit: 10000000,
        gasPrice: 5000000000,
      });

    await tx.wait();
  });

task("rinkeby-create-pool-wton-weth", "Create pool").setAction(async () => {
  const {
    RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
    RINKEBY_UNISWAP_V3_ACCOUNT: creatorAddress,
    RINKEBY_WTON_ADDRESS: token0,
    RINKEBY_WETH_ADDRESS: token1,
  } = process.env;

  await run("create-pool", {
    npmAddress,
    creatorAddress,
    token0,
    token1,
  });
});

task("rinkeby-create-pool-fld-weth", "Create pool").setAction(async () => {
  const {
    RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
    RINKEBY_UNISWAP_V3_ACCOUNT: creatorAddress,
    RINKEBY_FLD_ADDRESS: token0,
    RINKEBY_WETH_ADDRESS: token1,
  } = process.env;

  await run("create-pool", {
    npmAddress,
    creatorAddress,
    token0,
    token1,
  });
});
