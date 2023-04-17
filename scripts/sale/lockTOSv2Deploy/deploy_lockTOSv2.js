// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

let proxyV1;
let proxyV1V2proxy;
let proxyV2;
let logic;
let admin = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea";
let tos = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
let epochUnit = 604800;
let maxtime = 94348800;

let lockTOSproxyV2logic = require('../../../artifacts/contracts/stake/LockTOSv2Proxy.sol/LockTOSv2Proxy.json');

async function deployProxyV1() {
    const [deployer] = await ethers.getSigners();
    const LockTOSProxy = await ethers.getContractFactory("LockTOSProxy");

    proxyV1 = await LockTOSProxy.deploy(
        proxyV2.address,
        deployer.address
    );
    await proxyV1.deployed();

    console.log("LockTOSproxyV1 Deploy : ", proxyV1.address);

    proxyV1V2proxy = new ethers.Contract( proxyV1.address, lockTOSproxyV2logic.abi, ethers.provider );
    // console.log(proxyV1V2proxy);
    let check1 = await proxyV1.isAdmin(deployer.address);
    let check2 = await proxyV1V2proxy.isAdmin(deployer.address);
    console.log("check1 : ", check1);
    console.log("check2 : ", check2);

    await proxyV1V2proxy.connect(deployer).setImplementation2(logic.address, 0, true);
    console.log("ProxyV2 implementation finish");

    await proxyV1.connect(deployer).initialize(
        tos,
        epochUnit,
        maxtime
      );
    
    let tosaddress = await proxyV1.tos()
    console.log("tosAddress : ", tosaddress);
    console.log("finish initailize");
}

async function deployProxyV2() {
    const LockTOSv2Proxy = await ethers.getContractFactory("LockTOSv2Proxy");

    proxyV2 = await LockTOSv2Proxy.deploy();
    await proxyV2.deployed();

    console.log("lockTOSproxyV2 Deploy : ", proxyV2.address);
}

async function deployLogic() {
    const LockTOSv2Logic0 = await ethers.getContractFactory("LockTOSv2Logic0");

    logic = await LockTOSv2Logic0.deploy();
    await logic.deployed();

    console.log("LockTOSv2Logic0 Deploy : ", logic.address);
}

async function implementation2() {
    await proxyV2.setImplementation2(logic.address, 0, true);
    console.log("ProxyV2 implementation finish");
}

async function upgradeTo() {
    await proxyV1.upgradeTo(proxyV2.address);
    console.log("proxyV1 upgradeTo finish");
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

async function verifyV1() {
    await hre.run("verify:verify", {
        address: proxyV1.address,
        constructorArguments: [
            proxyV2.address,
            admin,
        ],
    });
}

const main = async () => {
    await deployProxyV2()
    await deployLogic()
    await deployProxyV1()
    // await upgradeTo()
    // await implementation2()
    // await initailize()
    await verifyV1()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
