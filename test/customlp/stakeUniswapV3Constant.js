const { ethers } = require("hardhat");

let topic0Collected = ethers.utils.id("Collected(address,uint256,uint256,uint256)");
let topic0IncreasedLiquidity = ethers.utils.id("IncreasedLiquidity(address,uint256,uint128,uint256,uint256)");
let topic0DecreasedLiquidity = ethers.utils.id("DecreasedLiquidity(address,uint256,uint128,uint256,uint256)");
let topic0WithdrawalToken = ethers.utils.id("WithdrawalToken(address,uint256,uint256,uint256)");
let topic0Claimed = ethers.utils.id("Claimed(address,uint256,address,uint256,uint256)");
let topic0MintAndStaked = ethers.utils.id("MintAndStaked(address,address,uint256,uint256,uint256,uint256)");

let abiCollected = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount0",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount1",
      "type": "uint256"
    }
  ];

let abiIncreasedLiquidity = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint128",
      "name": "liquidity",
      "type": "uint128"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount0",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount1",
      "type": "uint256"
    }
  ];

let abiDecreasedLiquidity = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint128",
      "name": "liquidity",
      "type": "uint128"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount0",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount1",
      "type": "uint256"
    }
  ];


let abiWithdrawalToken = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "miningAmount",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "nonMiningAmount",
      "type": "uint256"
    }
  ];


let abiClaimed = [
    {
      "indexed": true,
      "internalType": "address",
      "name": "sender",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "poolAddress",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "miningAmount",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "nonMiningAmount",
      "type": "uint256"
    }
  ];

let abiMintAndStaked = [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "poolAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "liquidity",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount0",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount1",
          "type": "uint256"
        }
      ];

module.exports = {
  topic0Collected,
  topic0IncreasedLiquidity,
  topic0DecreasedLiquidity,
  topic0WithdrawalToken,
  topic0Claimed,
  topic0MintAndStaked,
  abiCollected,
  abiIncreasedLiquidity,
  abiDecreasedLiquidity,
  abiWithdrawalToken,
  abiClaimed,
  abiMintAndStaked
  };