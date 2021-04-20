require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

require('dotenv').config()

module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    /*hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC_HARDHAT,
        count: 30,
        initialIndex: 0,
        accountsBalance: '10000000000000000000000',
      },
      chainId: 31337,
    }, */
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.InfuraKey}`,
      accounts: ['0x30bfca3986e777d023144fb9db4f9f1cf9dbfb6b6f0b9479d6a9276f168c733c'],
      gasMultiplier: 1.25
    },/*
    localhost: {
      url: "http://127.0.0.1:9545"
    }, */
  },
  etherscan: {
    apiKey: `${process.env.APIKey}`
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 10000000
  }
};
