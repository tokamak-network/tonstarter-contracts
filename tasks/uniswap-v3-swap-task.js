const { FeeAmount, encodePath, findAccount } = require("./utils");
const {
  abi: ROUTER_ABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");

task("swap-task", "Create pool")
  .addParam("account", "Account address")
  .addParam("routerAddress", "Router Address")
  .addParam("amountIn", " ")
  .addParam("amountOutMinimum", " ")
  .addParam("deadline")
  .addParam("path")
  .setAction(async ({ amountIn, account, routerAddress, deadline, path }) => {
    const swapper = await findAccount(account);
    const router = new ethers.Contract(routerAddress, ROUTER_ABI);
    const amountOutMinimum = 10;

    const params = {
      recipient: swapper.address,
      path,
      amountIn,
      amountOutMinimum,
      deadline,
    };

    const tx = await router.connect(swapper).exactInput(params, {
      gasLimit: 10000000,
      gasPrice: 5000000000,
    });
    await tx.wait();
  });

task("rinkeby-swap-task-wton-weth", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: account,
      RINKEBY_WTON_ADDRESS: wton,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([wton, weth], [FeeAmount.MEDIUM]),
      amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-weth-wton", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_WTON_ADDRESS: wton,
      RINKEBY_WETH_ADDRESS: weth,
      RINKEBY_UNISWAP_V3_ACCOUNT2: account,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      tokenOut: wton,
      path: encodePath([weth, wton], [FeeAmount.LOW]),
      amountIn: amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-tos-weth", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: account,
      RINKEBY_TOS_ADDRESS: tos,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([tos, weth], [FeeAmount.LOW]),
      amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-weth-tos", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT2: account,
      RINKEBY_TOS_ADDRESS: tos,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([weth, tos], [FeeAmount.LOW]),
      amountIn: amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-tos-wton", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT2: account,
      RINKEBY_TOS_ADDRESS: tos,
      RINKEBY_WTON_ADDRESS: wton,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([tos, weth, wton], [FeeAmount.LOW, FeeAmount.LOW]),
      amountIn: amount,
      tokenOut: wton,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });
