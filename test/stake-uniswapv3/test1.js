const { time, expectEvent } = require("@openzeppelin/test-helpers");
// const { ethers } = require("ethers");
const { ethers } = require("hardhat");
const utils = ethers.utils;

  before(async () => {

  });

  describe("# test 1 ", async function () {
    it("test", async function () {

        let locks = [10,9,8,7,6,5];

        for (let i = 0; i < locks.length; ++i) {
            console.log('locks ', i, locks[i]);
        }

        for (let i = 0; i < locks.length; i++) {
            console.log('locks ', i, locks[i]);
        }
    });
  });