// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

let proxyL2;
let logic;
let tos = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
let epochUnit = 604800;
let maxtime = 94348800;

let lockTOSL2proxy = require('../../../artifacts/contracts/L2/LockTOSL2Proxy.sol/LockTOSL2Proxy.json');

async function deployProxyL2() {
    const [deployer] = await ethers.getSigners();
    const LockTOSL2Proxy = await ethers.getContractFactory("LockTOSL2Proxy");

    proxyL2 = await LockTOSL2Proxy.deploy();
    await proxyL2.deployed();

    console.log("LockTOSproxyV1 Deploy : ", proxyL2.address);

    await proxyL2.connect(deployer).upgradeTo(logic.address);
    console.log("ProxyV2 upgradeTo finish");

    await proxyL2.connect(deployer).initialize(
        tos,
        epochUnit,
        maxtime
    );
    console.log("finish initailize");

    
    let tosaddress = await proxyL2.tos()
    console.log("check tosAddress : ", tosaddress);
}

async function deployLogic() {
    const LockTOSv2Logic0 = await ethers.getContractFactory("LockTOSv2L2Logic");

    logic = await LockTOSv2Logic0.deploy();
    await logic.deployed();

    console.log("LockTOSv2L2Logic Deploy : ", logic.address);
}

async function initailize() {
  await proxyV1.initialize(
    tos,
    epochUnit,
    maxtime
  );

  let tosaddress = await proxyV1.tos()
  console.log("tosAddress : ", tosaddress);
  console.log("finish initailize");
}

const main = async () => {
    await deployLogic()
    await deployProxyL2()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
