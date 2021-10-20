// const { ethers } = require("hardhat")

const findAccount = async (address) => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    if (account.address === address) {
      return account;
    }
  }
  throw Error("Address not found in Signers");
};


const blockTimestamp = async () => {
  const block = await ethers.provider.getBlock('latest')
  if (!block) {
    throw new Error('null block returned from provider')
  }
  return block.timestamp
}

const makeTimestamps = (n, duration) => ({
  startTime: n + 100,
  endTime: n + 100 + duration,
})


module.exports = {
  findAccount,
  blockTimestamp,
  makeTimestamps
};

