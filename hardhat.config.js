require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
//require("hardhat-gas-reporter");

require("dotenv").config();

require("./tasks/uniswap-v3-approve-erc20-task");
require("./tasks/uniswap-v3-create-pool-task");
require("./tasks/uniswap-v3-increase-liquidity-task");
require("./tasks/uniswap-v3-mint-position-task");
require("./tasks/uniswap-v3-swap-task");
require("./tasks/view-tasks");

const {
  RINKEBY_UNISWAP_V3_ACCOUNT_PK1,
  RINKEBY_UNISWAP_V3_ACCOUNT_PK2,
  RINKEBY_UNISWAP_V3_ACCOUNT_PK3,
} = process.env;
const { ACCOUNT0_PK, ACCOUNT1_PK, ACCOUNT2_PK, TONSTARTER_DEPLOYER_PK } = process.env;

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  // const prov = await ethers.getDefaultProvider();
  const provider = new ethers.providers.JsonRpcProvider();

  for (const account of accounts) {
    console.log(account.address);
    console.log((await provider.getBalance(account.address)).toString());
  }
});
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    zenalocal: {
      url: "http://localhost:8546",
      gas: 9500000,
      gasMultiplier: 100,
      blockGasLimit: 124500000,
      accounts: {
        mnemonic: process.env.MNEMONIC_HARDHAT,
        count: 30,
        initialIndex: 0,
        accountsBalance: "1000000000000000000000",
      },
      chainId: 1337,
    },
    localhost: {
      gas: 9500000,
      gasMultiplier: 100,
      blockGasLimit: 124500000,
      accounts: {
        mnemonic: process.env.MNEMONIC_HARDHAT,
        count: 30,
        initialIndex: 0,
        accountsBalance: "10000000000000000000000",
      },
    },
    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC_HARDHAT,
        count: 30,
        initialIndex: 0,
        accountsBalance: "10000000000000000000000",
      },
      chainId: 31337,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.InfuraKey}`,
      accounts: [`${ACCOUNT0_PK}`, `${ACCOUNT1_PK}`, `${ACCOUNT2_PK}`],
      gasMultiplier: 1.25 //,
      //gasPrice: 20000000000,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.InfuraKey}`,
      accounts: [`${TONSTARTER_DEPLOYER_PK}`],
      gasMultiplier: 1.25 ,
      gasPrice: 40000000000,
    },
  },
  etherscan: {
    apiKey: `${process.env.APIKey}`,
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
