/*
const { BigNumber, utils } = require("ethers")
const { ethers, upgrades } = require("hardhat")
*/
//const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { ethers } = require('ethers')

const BigNumber = ethers.BigNumber // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils
const { padLeft, toBN, toWei, fromWei , keccak256 , soliditySha3 , solidityKeccak256 } = require('web3-utils');
const {
    defaultSender, accounts, contract, web3, provider , privateKeys
} = require('@openzeppelin/test-environment');

// keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
const PERMIT_TYPEHASH = '0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9';
const signatureVaildTime =  60*2;
async function getSignature(_private, owner, spender, value, deadline) {
        let _data = web3.utils.soliditySha3(
            { t: "bytes32", v: PERMIT_TYPEHASH },
            { t: "address", v: owner },
            { t: "address", v: spender },
            { t: "uint256", v: value  },
            { t: "uint256", v: deadline },
          );
          let signTx  = await web3.eth.accounts.sign(_data, _private);
          return signTx.signature;
    }


function timeout (sec) {
  return new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
}


module.exports ={
    getSignature,
    signatureVaildTime,
    timeout
}