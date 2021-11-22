const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const { printGasUsedOfUnits } = require("../log_tx");

const {
  toBN,
  keccak256,
} = require("web3-utils");

require("dotenv").config();

const loadDeployed = require("../load_deployed");

/*
// rinkeby
let ton="0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0";
let wton="0x709bef48982Bbfd6F2D4Be24660832665F53406C";
let tostoken="0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd";
let DepositManager="0x57F5CD759A5652A697D539F1D9333ba38C615FC2";
let SeigManager="0x957DaC3D3C4B82088A4939BE9A8063e20cB2efBE";
let layer2 ="0x1fa621d238f30f6651ddc8bd5f4be21c6b894426";
let addTons = ["0xbCB1886464826C2D1D3349d83e394eCC846CF230","0x7F04b39582812224d202c68Efdc069583aA89E80","0x571081455f688d38A063547210019402529BdEE8"];
*/
// mainnet

let ton="0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
let wton="0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
let tostoken="0x409c4D8cd5d2924b9bc5509230d16a61289c8153";
let DepositManager="0x56E465f654393fa48f007Ed7346105c7195CEe43";
let SeigManager="0x710936500aC59e8551331871Cbad3D33d5e0D909";
let layer2 ="0x42ccf0769e87cb2952634f607df1c7d62e0bbc52";
let addTons = ["0x9a8294566960Ab244d78D266FFe0f284cDf728F1","0x7da4E8Ab0bB29a6772b6231b01ea372994c2A49A","0xFC1fC3a05EcdF6B3845391aB5CF6a75aeDef7CeA"];

const StakeTONUnstaking = loadDeployed(process.env.NETWORK, "StakeTONUnstaking");
console.log('StakeTONUnstaking',StakeTONUnstaking);

async function deployMain(defaultSender) {
  const [deployer, user1] = await ethers.getSigners();

  const stakeTONUnstaking = await ethers.getContractAt("StakeTONUnstaking", StakeTONUnstaking);

  let tx1 = await stakeTONUnstaking.connect(deployer).addStakeTons(
    addTons
    );
  console.log("addStakeTons StakeTONUnstaking ", tx1.hash);

  printGasUsedOfUnits('addStakeTons StakeTONUnstaking',tx1);
  return null;
}

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  contracts = await deployMain(deployer);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
