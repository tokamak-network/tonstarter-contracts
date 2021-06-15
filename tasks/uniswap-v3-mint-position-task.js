const {
  getMinTick,
  getMaxTick,
  FeeAmount,
  TICK_SPACINGS,
  findAccount,
} = require("./utils");
const {
  abi: NPM_ABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

task("mint-position", "Mint position")
  .addParam("minterAddress", "Minter address")
  .addParam("npmAddress")
  .addParam("token0", "Token0 address")
  .addParam("token1", "Token1 address")
  .addParam("amount0Desired", " ")
  .addParam("amount1Desired", " ")
  .addParam("amount0Min", " ")
  .addParam("amount1Min", " ")
  .addParam("deadline", " ")
  .addParam("recipient", " ")
  .setAction(
    async ({
      minterAddress,
      npmAddress,

      token0,
      token1,
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      deadline,
      recipient,
    }) => {
      const minter = await findAccount(minterAddress);
      const npm = new ethers.Contract(npmAddress, NPM_ABI);
      const mintParams = {
        token0,
        token1,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        deadline,
        recipient,

        fee: FeeAmount.MEDIUM,
        tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
        tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
      };

      console.log({ mintParams });

      const tx = await npm.connect(minter).mint(mintParams, {
        gasLimit: 10000000,
        gasPrice: 5000000000,
      });
      await tx.wait();
    }
  );

task("rinkeby-mint-position-wton-weth", "Mint position on rinkeby").setAction(
  async ({ amount0Desired, amount1Desired }) => {
    const {
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: minterAddress,
      RINKEBY_WTON_ADDRESS: token0,
      RINKEBY_WETH_ADDRESS: token1,
    } = process.env;

    const deadline = 1000000000;
    const recipient = minterAddress;

    await run("mint-position", {
      npmAddress,
      minterAddress,
      token0,
      token1,

      amount0Desired,
      amount1Desired,

      amount0Min: 0,
      amount1Min: 0,

      deadline,
      recipient,
    });
  }
);

task("rinkeby-mint-position-tos-weth", "Mint TOS-WETH position on rinkeby")
  .addParam("amount0", "amount0 desired")
  .addParam("amount1", "amount1 desired")
  .setAction(async ({ amount0, amount1 }) => {
    const {
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: minterAddress,
      RINKEBY_TOS_ADDRESS: token0,
      RINKEBY_WETH_ADDRESS: token1,
    } = process.env;

    const deadline = "1000000000000";
    const recipient = minterAddress;

    await run("mint-position", {
      npmAddress,
      minterAddress,
      token0,
      token1,

      amount0Desired: amount0,
      amount1Desired: amount1,

      amount0Min: "0",
      amount1Min: "0",

      deadline,
      recipient,
    });
  });
