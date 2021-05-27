const bn = require("bignumber.js");

const findAccount = async (address) => {
  const accounts = await hre.ethers.getSigners();
  for (account of accounts) {
    if (account.address === address) {
      return account;
    }
  }
  throw Error("Address not found in Signers");
};


const FEE_SIZE = 3;
const encodePath = (path, fees) => {
  if (path.length != fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }
  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    encoded += path[i].slice(2)
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  encoded += path[path.length - 1].slice(2)
  return encoded.toLowerCase()
}


const FeeAmount = {
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
};

const TICK_SPACINGS = {
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200,
};

const getMinTick = tickSpacing => Math.ceil(-887272 / tickSpacing) * tickSpacing;
const getMaxTick = tickSpacing => Math.floor(887272 / tickSpacing) * tickSpacing;

const encodePriceSqrt = (reserve1, reserve0) => {
  return new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy((new bn(2)).pow(96))
      .integerValue(3)
      .toFixed();
};


module.exports = {
  findAccount,
  encodePriceSqrt,
  FeeAmount,
  TICK_SPACINGS,
  getMinTick,
  getMaxTick,
  encodePath
};