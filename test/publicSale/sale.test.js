/* eslint-disable no-undef */
const chai = require("chai");
const { expect } = require("chai");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { time } = require("@openzeppelin/test-helpers");
const { toBN, toWei, keccak256, fromWei } = require("web3-utils");

const { getAddresses, findSigner, setupContracts } = require("./utils");
const { ethers, network } = require("hardhat");

// const PHASE1_ETH_Staking = "175000000." + "0".repeat(18);
const zeroAddress = "0x0000000000000000000000000000000000000000";

console.log("1")

describe("Sale", () => {
    console.log("2")
    //mockERC20으로 doc, ton, tos까지 배포해야함
    let saleTokenOwner;         //doc
    let getTokenOwner;         //ton
    let tosTokenOwner;          //sTOS
    let saleOwner;              //publicContract

    let account1;
    let account2;
    // let account3 = accounts[6];   
    // let account4 = accounts[7];
    let balance1, balance2, balance3;
    
    let erc20token, saleToken, getToken, tosToken, deploySale, saleContract;

    before(async () => {
        console.log("3")
        const addresses = await getAddresses();
        saleTokenOwner = await findSigner(addresses[0]);
        getTokenOwner = await findSigner(addresses[1]);
        tosTokenOwner = await findSigner(addresses[2]);
        saleOwner = await findSigner(addresses[3]);
        account1 = await findSigner(addresses[4]);
        account2 = await findSigner(addresses[5]);
        
        erc20token = await ethers.getContractFactory("ERC20Mock");
        saleToken = await erc20token.connect(saleTokenOwner).deploy("testDOC", "DOC");
        getToken = await erc20token.connect(getTokenOwner).deploy("testTON", "TON");
        tosToken = await erc20token.connect(tosTokenOwner).deploy("testsTOS", "sTOS");

        deploySale = await ethers.getContractFactory("publicSale");
        saleContract = await deploySale.connect(saleOwner).deploy(
            saleToken.address, 
            getToken.address, 
            getTokenOwner.address, 
            tosToken.address
        )
        
        balance1 = Number(await saleToken.balanceOf(saleTokenOwner.address))
        balance2 = Number(await getToken.balanceOf(getTokenOwner.address))
        balance3 = Number(await tosToken.balanceOf(tosTokenOwner.address))

        console.log(balance1)
        console.log(balance2)
        console.log(balance3)
    });

    describe("exclusiveSale", () => {
        console.log("4")
        it("check the balance", async () => {

        })
    })
    
    describe("openSale", () => {
        console.log("5")
    })
})