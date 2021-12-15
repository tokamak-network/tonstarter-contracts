require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
//require("hardhat-gas-reporter");
require('dotenv/config');

require("dotenv").config();
require("./tasks/get-lock-tos-info-task");
require("./tasks/deploy-lock-tos-task");
require("./tasks/uniswap-v3-approve-erc20-task");
require("./tasks/uniswap-v3-create-pool-task");
require("./tasks/uniswap-v3-increase-liquidity-task");
require("./tasks/uniswap-v3-mint-position-task");
require("./tasks/uniswap-v3-swap-task");
require("./tasks/view-tasks");
require("./tasks/abi-retriever");

// require("./tasks-rewardprogram/testcase");

const {
  RINKEBY_UNISWAP_V3_ACCOUNT_PK1,
  RINKEBY_UNISWAP_V3_ACCOUNT_PK2,
  RINKEBY_UNISWAP_V3_ACCOUNT_PK3,
} = process.env;
const { ACCOUNT0_PK, ACCOUNT1_PK, TONSTARTER_DEPLOYER_PK } = process.env;

// const { ACCOUNT0_PK, ACCOUNT1_PK, ACCOUNT2_PK } = process.env;

// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();
//   // const prov = await ethers.getDefaultProvider();
//   const provider = new ethers.providers.JsonRpcProvider();

//   for (const account of accounts) {
//     console.log(account.address);
//     console.log((await provider.getBalance(account.address)).toString());
//   }
// });

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    rinkeby: {
      chainId: 4,
      url: "https://eth-rinkeby.alchemyapi.io/v2/5gNmfCGyn5VQ1IQ_V-NwBVbXG5jCbhLK",
      accounts: [`${ACCOUNT0_PK}`, `${ACCOUNT1_PK}`],
      gasMultiplier: 1.25,
      gasPrice: 20000000000,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.InfuraKey}`,
      accounts: [`${TONSTARTER_DEPLOYER_PK}`, `${ACCOUNT1_PK}`],
      gasMultiplier: 1.25,
      gasPrice: 140000000000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 10000000,
  },
};