require('dotenv').config();
const path = require('path');
// const HDWalletProvider = require("@truffle/hdwallet-provider");
//const PrivateKeyProvider = require('truffle-privatekey-provider');
require('dotenv').config()

module.exports = {
  contracts_build_directory : path.join(__dirname, "build/contracts"),

  networks: {
    localhost: {
      host: 'localhost',
      port: 9545,
      gas: 6721975,
      network_id: '*', // eslint-disable-line camelcase,
    },
    rinkeby: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC_HARDHAT, `https://rinkeby.infura.io/v3/${process.env.InfuraKey}`
      ),
      network_id: 4,
      gasPrice: 10e9,
      skipDryRun: true
    },
  //   ropsten: {
  //     provider: ropstenProvider,
  //     network_id: 3, // eslint-disable-line camelcase
  //   },
  //   coverage: {
  //     host: 'localhost',
  //     network_id: '*', // eslint-disable-line camelcase
  //     port: 8555,
  //     gas: 0xfffffffffff,
  //     gasPrice: 0x01,
  //   },
  //   ganache: {
  //     host: 'localhost',
  //     port: 8545,
  //     network_id: '*', // eslint-disable-line camelcase
  //   },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD',
      gasPrice: 21,
    },
    useColors: true,
    before_timeout: 520000 ,
    enableTimeouts: false,
    bail: true,
    // Here is 2min but can be whatever timeout is suitable for you.
  },
  compilers: {
    solc: {
      version: '0.7.6',
      settings: {
        optimizer: {
          enabled: true,
          runs: 100,
        },
      },
    },
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: `${process.env.APIKey}`
  }
};
