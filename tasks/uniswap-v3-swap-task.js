const { FeeAmount, encodePath, findAccount } = require("./utils");
const {
  abi: ROUTER_ABI,
} = require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json');

task("swap-task", "Create pool")
  .addParam("account", "Account address")
  .addParam("routerAddress", "Router Address")
  .addParam("amountIn", " ")
  .addParam("amountOutMinimum", " ")
  .addParam("deadline")
  .addParam("path")
  .addParam("tokenOut")
  .setAction(async ({ tokenOut, amountIn, account, routerAddress, deadline, path }) => {
    const swapper = await findAccount(account);
    const router = new ethers.Contract(routerAddress, ROUTER_ABI);
    const amountOutMinimum = 10;
    const feeRecipient = "0xfEE0000000000000000000000000000000000000";

    const params = {
      recipient: swapper.address,
      path,
      amountIn,
      amountOutMinimum,
      deadline
    };
    console.log({ params });
    const sweepParams = [
      tokenOut,
      amountOutMinimum,
      swapper.address,
      // 100,
      // feeRecipient,
    ];
    console.log({ sweepParams })
    const data = [
      router.interface.encodeFunctionData('exactInput', [params]),
      router.interface.encodeFunctionData('sweepToken', sweepParams),
    ];
    const tx = await router.connect(swapper).multicall(data, {
      gasLimit: 10000000, gasPrice: 5000000000
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
      path: encodePath([weth, wton], [FeeAmount.MEDIUM]),
      amountIn: amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-fld-weth", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: account,
      RINKEBY_FLD_ADDRESS: fld,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([fld, weth], [FeeAmount.MEDIUM]),
      amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-weth-fld", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT2: account,
      RINKEBY_FLD_ADDRESS: fld,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([weth, fld], [FeeAmount.MEDIUM]),
      amountIn: amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });

task("rinkeby-swap-task-fld-wton", "Create pool")
  .addParam("amount", " ")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_SWAP_ROUTER_ADDRESS: routerAddress,
      RINKEBY_UNISWAP_V3_ACCOUNT: account,
      RINKEBY_FLD_ADDRESS: fld,
      RINKEBY_WTON_ADDRESS: wton,
      RINKEBY_WETH_ADDRESS: weth,
    } = process.env;

    await run("swap-task", {
      routerAddress,
      account,
      path: encodePath([fld, weth, wton], [FeeAmount.MEDIUM, FeeAmount.MEDIUM]),
      amount,
      amountOutMinimum: "0",
      deadline: "1000000000000",
    });
  });