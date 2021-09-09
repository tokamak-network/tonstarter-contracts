
const { ethers } = require("hardhat");

let topic0TonWithdrawal = ethers.utils.id("TonWithdrawal(address,uint256,uint256,uint256,uint256)");

let abiTonWithdrawal = [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tonAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "wtonAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tosAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tosBurnAmount",
          "type": "uint256"
        }
      ];

module.exports = {
  topic0TonWithdrawal,
  abiTonWithdrawal
  };