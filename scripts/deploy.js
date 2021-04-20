const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require('./save_deployed_file');

const { padLeft, toBN, toWei, fromWei , keccak256 , soliditySha3 , solidityKeccak256 } = require('web3-utils');

require('dotenv').config()


async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const FLD = await ethers.getContractFactory("FLD");
  const FLDVault = await ethers.getContractFactory("FLDVault");
  const Crowdsale = await ethers.getContractFactory("Crowdsale");
  console.log("FLD getContractFactory ",FLD.address);
  console.log("FLDVault getContractFactory ",FLDVault.address);
  console.log("Crowdsale getContractFactory ",Crowdsale.address);

  const initialTotal = process.env.initialTotal + '.' + '0'.repeat(18);
  const initialPharse1 = process.env.initialPharse1 + '.' + '0'.repeat(18);
  const salesWithETH = process.env.salesWithETH + '.' + '0'.repeat(18);
  const salesWithTON = process.env.salesWithTON + '.' + '0'.repeat(18);
  const salesWithETHTONLP = process.env.salesWithETHTONLP + '.' + '0'.repeat(18);


  let saleStartTime = parseInt(Date.now()/1000)-100;
  let saleEndTime = saleStartTime + (60*60*24*14);
  let zeroAddress = '0x0000000000000000000000000000000000000000';


  // If we had constructor arguments, they would be passed into deploy()
  const fld = await FLD.deploy();
  const fldVault = await FLDVault.deploy();
  await fldVault.setFLD(fld.address);
  await fld.mint(fldVault.address, utils.parseUnits(initialTotal, 18));
  console.log("fld:", fld.address);
  console.log("fldVault:", fldVault.address);

  const crowdsale = await upgrades.deployProxy(
          Crowdsale, [
            toBN(saleStartTime).toString(),
            toBN(saleEndTime).toString(),
            fld.address,
            utils.parseUnits(salesWithETH, 18),
            zeroAddress
          ], {initializer: 'initialize'})

  console.log("crowdsale:", crowdsale.address);

  // The address the Contract WILL have once mined
  const out = {};
  out.FLD = fld.address;
  out.FLDVault = fldVault.address;
  out.CrowdsaleEth = crowdsale.address;
  save(
     process.env.NETWORK,out
  );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
