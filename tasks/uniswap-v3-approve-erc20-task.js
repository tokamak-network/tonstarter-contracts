const { findAccount } = require("./utils");

const approveABI = [
  {
    "constant": false,
    "inputs": [
        {
            "name": "_spender",
            "type": "address"
        },
        {
            "name": "_value",
            "type": "uint256"
        }
    ],
    "name": "approve",
    "outputs": [
        {
            "name": "",
            "type": "bool"
        }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
];

task("approve-erc20", "Approves amount to WTON")
  .addParam("account", "Approver")
  .addParam("tokenAddress", "Token address")
  .addParam("amount", "Amount to approve")
  .addParam("npmAddress", "NPM Address")
  .setAction(async ({ tokenAddress, account, npmAddress, amount }) => {
    const approver = await findAccount(account);
    const token = new ethers.Contract(tokenAddress, approveABI);

    const tx = await token.connect(approver).approve(npmAddress, amount, {
      gasLimit: 10000000, gasPrice: 6000000000
    });
    await tx.wait();
  });

task("rinkeby-approve-wton", "Approves amount to WTON")
  .addParam("amount", "Amount")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_UNISWAP_V3_ACCOUNT2: account,
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_WTON_ADDRESS: tokenAddress,
    } = process.env;
    await run("approve-erc20", {
      account,
      tokenAddress,
      amount,
      npmAddress
    });
  });


task("rinkeby-approve-fld", "Approves amount to FLD")
  .addParam("amount", "Amount")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_UNISWAP_V3_ACCOUNT: account,
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_FLD_ADDRESS: tokenAddress,
    } = process.env;
    await run("approve-erc20", {
      account,
      tokenAddress,
      amount,
      npmAddress
    });
  });
  
task("rinkeby-approve-weth", "Approves amount to WETH")
  .addParam("amount", "Amount")
  .setAction(async ({ amount }) => {
    const {
      RINKEBY_UNISWAP_V3_ACCOUNT2: account,
      RINKEBY_NONFUNGIBLE_POSITION_MANAGER_ADDRESS: npmAddress,
      RINKEBY_SWAP_ROUTER_ADDRESS: swapRouter,
      RINKEBY_WETH_ADDRESS: tokenAddress,
    } = process.env;
    await run("approve-erc20", {
      account,
      tokenAddress,
      amount,
      npmAddress
    });
  });