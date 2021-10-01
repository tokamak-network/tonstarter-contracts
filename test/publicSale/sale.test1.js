/* eslint-disable no-undef */
const chai = require("chai");
const { expect } = require("chai");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { time } = require("@openzeppelin/test-helpers");
const { toBN, toWei, keccak256, fromWei } = require("web3-utils");

const { getAddresses, findSigner, setupContracts } = require("./utils");
const { ethers, network } = require("hardhat");

const {
    calculateBalanceOfLock,
    calculateBalanceOfUser,
    createLockWithPermit,
  } = require("./helpers/lock-tos-helper");


const zeroAddress = "0x0000000000000000000000000000000000000000";


describe("Sale", () => {
    //mockERC20으로 doc, ton, tos까지 배포해야함
    //saleTokenPrice(DOC) = 12원
    //payTokenPrice(TON) = 12,000원
    //TON 10개 = DOC 10,000개  1: 1000
    //티어1 : 100 sTOS, 6%(600)     /60,000 DOC -> TON 60개
    //티어2 : 200 sTOS, 12%(1200)   /120,000 DOC -> TON 120개
    //티어3 : 1,000 sTOS, 22%(2200) /220,000 DOC -> TON 220개
    //티어4 : 4,000 sTOS, 60%(6000) /600,000 DOC -> TON 600개

    let saleTokenPrice = 12;
    let payTokenPrice = 12000;

    let saleTokenOwner;         //doc
    let getTokenOwner;         //ton
    let tosTokenOwner;          //sTOS
    let saleOwner;              //publicContract

    let account1;
    let account2;
    let account3;
    let account4;
    let account5;
    // let account3 = accounts[6];
    // let account4 = accounts[7];
    let balance1, balance2, balance3;

    let erc20token, erc20snapToken, saleToken, getToken, tosToken, deploySale, saleContract;

    // let BN = toBN("1");
    // let basicAmount = toBN("1000");

    let basicAmount = 1000000;          //exclusiveSale 판매량
    let totalSaleAmount = 1000000;

    let blocktime;
    let whitelistStartTime;
    let whitelistEndTime;
    let exclusiveStartTime;
    let exclusiveEndTime;
    let depositStartTime;
    let depositEndTime;
    let openSaleStartTime;
    let openSaleEndTime;
    let claimStartTime;

    let claimInterval = 86400;
    let claimPeriod = 6;
    let claimTestTime;

    let tos, lockTOS, lockTOSImpl, lockTOSProxy, deployer ;
    let epochUnit, maxTime;
    const name = "TONStarter";
    const symbol = "TOS";
    const version = "1.0";

    before(async () => {
        const addresses = await getAddresses();

        saleTokenOwner = await findSigner(addresses[0]);
        getTokenOwner = await findSigner(addresses[1]);
        tosTokenOwner = await findSigner(addresses[2]);
        saleOwner = await findSigner(addresses[3]);

        deployer = saleTokenOwner;

        /*
        erc20token = await ethers.getContractFactory("ERC20Mock");
        saleToken = await erc20token.connect(saleTokenOwner).deploy("testDOC", "DOC");
        getToken = await erc20token.connect(getTokenOwner).deploy("testTON", "TON");

        erc20snapToken = await ethers.getContractFactory("ERC20SnapshotMock");
        tosToken = await erc20snapToken.connect(tosTokenOwner).deploy("testsTOS", "sTOS");

        deploySale = await ethers.getContractFactory("publicSale");
        saleContract = await deploySale.connect(saleOwner).deploy(
            saleToken.address,
            getToken.address,
            account5.address,
            tosToken.address
        )
        // console.log(saleContract)

        await saleToken.connect(saleTokenOwner).transfer(saleContract.address, (basicAmount*2))

        await getToken.connect(getTokenOwner).transfer(account1.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(account2.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(account3.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(account4.address, basicAmount)
        */
        // for sTOS
        epochUnit = 60*60*1;  // 1시간
        maxTime = epochUnit * 156;

    });

    describe("Initialize", () => {
        it("Initialize TOS", async function () {
            const TOS = await ethers.getContractFactory("TOS");
            tos = await TOS.deploy(name, symbol, version);
            await tos.deployed();
        });
        it("Deploy LockTOS", async function () {
            const now = parseInt(Date.now() / 1000);
            console.log("now", now);

            const LockTOS = await ethers.getContractFactory("LockTOS");

            lockTOSImpl = await LockTOS.deploy();
            await lockTOSImpl.deployed();

            lockTOSProxy = await (
                await ethers.getContractFactory("LockTOSProxy")
            ).deploy(lockTOSImpl.address, deployer.address);
            await lockTOSProxy.deployed();

            /*
            await (
                await lockTOSProxy.initialize(tos.address, epochUnit, maxTime)
            ).wait();
            const lockTOSArtifact = await hre.artifacts.readArtifact("LockTOS");

            lockTOS = new ethers.Contract( lockTOSProxy.address, lockTOSArtifact.abi, ethers.provider );
            */
        });
    });

})