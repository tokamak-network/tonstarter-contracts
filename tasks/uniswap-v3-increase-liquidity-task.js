const { FeeAmount, encodePriceSqrt, findAccount } = require("./utils");
const {
  abi: NPM_ABI,
} = require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json');

task("increase-liquidity", "Create pool")
  .addParam("npmAddress", "NPM Address")
  .addParam("tokenId", "Token0 address")
  .addParam("amount0Desired", "Token1 address")
  .addParam("amount1Desired", "Token1 address")
  .addParam("amount0Min", "Token1 address")
  .addParam("amount1Min", "Token1 address")
  .addParam("deadline", "Deadline")
  .addParam("account", "Account")
  .setAction(async ({
    account,
    npmAddress,
    tokenId,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
    deadline
  }) => {
    const creator = await findAccount(account);
    const npm = new ethers.Contract(npmAddress, NPM_ABI);

    const params = {
      tokenId,
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      deadline
    };
    console.log({ params });

    const tx = await npm.connect(creator).increaseLiquidity(params, {
      gasLimit: 10000000, gasPrice: 5000000000
    });
    await tx.wait();
  });

task("rinkeby-create-pool-wton-weth", "Create pool")
  .setAction(async () => {
    const {
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: creatorAddress,
      RINKEBY_WTON_ADDRESS: token0,
      RINKEBY_WETH_ADDRESS: token1,
    } = process.env;

    await run("increase-liquidity", {
      npmAddress,
      creatorAddress,
      token0,
      token1
    });
  });

task("rinkeby-increase-liquidity-fld-weth", "Create pool")
  .addParam("amount0", "Amount0")
  .addParam("amount1", "Amount1")
  .setAction(async ({ amount0, amount1 }) => {
    const {
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: account,
    } = process.env;
    const tokenId = "785";
    const deadline = "1000000000000";

    await run("increase-liquidity", {
      account,
      npmAddress,

      tokenId,
      amount0Desired: amount0,
      amount1Desired: amount1,
      amount0Min: "0",
      amount1Min: "0",
      deadline
    });
  });