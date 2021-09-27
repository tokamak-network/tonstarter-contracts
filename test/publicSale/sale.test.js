/* eslint-disable no-undef */
const chai = require("chai");
const { expect } = require("chai");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { time, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { toBN, toWei, keccak256, fromWei } = require("web3-utils");

const { getAddresses, findSigner, setupContracts } = require("./utils");
const { ethers, network } = require("hardhat");

const zeroAddress = "0x0000000000000000000000000000000000000000";


describe("Sale", () => {
    //mockERC20으로 doc, ton, tos까지 배포해야함
    //saleTokenPrice(DOC) = 12원
    //payTokenPrice(TON) = 12,000원
    //TON 10개 = DOC 10,000개
    //티어1 : 100 sTOS, 6%
    //티어2 : 200 sTOS, 12%
    //티어3 : 1,000 sTOS, 22%
    //티어4 : 4,000 sTOS, 60%

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
    // let account3 = accounts[6];   
    // let account4 = accounts[7];
    let balance1, balance2, balance3;
    
    let erc20token, erc20snapToken, saleToken, getToken, tosToken, deploySale, saleContract;

    // let BN = toBN("1");
    // let basicAmount = toBN("1000");

    let basicAmount = 100000;

    before(async () => {
        const addresses = await getAddresses();
        saleTokenOwner = await findSigner(addresses[0]);
        getTokenOwner = await findSigner(addresses[1]);
        tosTokenOwner = await findSigner(addresses[2]);
        saleOwner = await findSigner(addresses[3]);
        account1 = await findSigner(addresses[4]);
        account2 = await findSigner(addresses[5]);
        account3 = await findSigner(addresses[6]);
        account4 = await findSigner(addresses[7]);
        
        erc20token = await ethers.getContractFactory("ERC20Mock");
        saleToken = await erc20token.connect(saleTokenOwner).deploy("testDOC", "DOC");
        getToken = await erc20token.connect(getTokenOwner).deploy("testTON", "TON");

        erc20snapToken = await ethers.getContractFactory("ERC20SnapshotMock");
        tosToken = await erc20snapToken.connect(tosTokenOwner).deploy("testsTOS", "sTOS");

        deploySale = await ethers.getContractFactory("PublicSale");
        saleContract = await deploySale.connect(saleOwner).deploy(
            saleToken.address, 
            getToken.address, 
            getTokenOwner.address, 
            tosToken.address
        )
        // console.log(saleContract)
        
        await saleToken.connect(saleTokenOwner).transfer(saleContract.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(saleContract.address, basicAmount)
        await tosToken.connect(tosTokenOwner).transfer(saleContract.address, basicAmount)

        // balance1 = Number(await saleToken.balanceOf(saleContract.address))
        // balance2 = Number(await getToken.balanceOf(saleContract.address))
        // balance3 = Number(await tosToken.balanceOf(saleContract.address))

        // console.log(balance1)
        // console.log(balance2)
        // console.log(balance3)
    });

    describe("exclusiveSale", () => {
        it("check the balance", async () => {
            balance1 = Number(await saleToken.balanceOf(saleContract.address))
            balance2 = Number(await getToken.balanceOf(saleContract.address))
            balance3 = Number(await tosToken.balanceOf(saleContract.address))

            expect(balance1).to.be.equal(basicAmount)
            expect(balance2).to.be.equal(basicAmount)
            expect(balance3).to.be.equal(basicAmount)
        })

        it("check snapshot", async () => {
            let tx = await tosToken.connect(tosTokenOwner).snapshot()

            await expect(tx).to.emit(tosToken, 'Snapshot').withArgs(
                1
            )

            balance1 = Number(await tosToken.balanceOf(account1.address))
            expect(balance1).to.be.equal(0)

            await tosToken.connect(tosTokenOwner).transfer(account1.address, 100)

            balance1 = Number(await tosToken.balanceOf(account1.address))
            expect(balance1).to.be.equal(100)

            let tx2 = await tosToken.connect(tosTokenOwner).snapshot()

            await expect(tx2).to.emit(tosToken, 'Snapshot').withArgs(
                2
            )
        })

        it('snapshot balanceOf test', async () => {
            let tx = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account1.address, 1))
            expect(tx).to.be.equal(0)
            let tx2 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account1.address, 2))
            expect(tx2).to.be.equal(100)
        });

        it('tier setting is not owner', async () => {
            let tx = saleContract.connect(account1).setTier(100, 200, 1000, 4000)
            await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
        })

        it('tier setting is owner', async () => {
            await tosToken.connect(tosTokenOwner).transfer(account2.address, 200)
            await tosToken.connect(tosTokenOwner).transfer(account3.address, 1000)
            await tosToken.connect(tosTokenOwner).transfer(account4.address, 4000)

            await saleContract.connect(saleOwner).setTier(100, 200, 1000, 4000)

            let tx = Number(await saleContract.connect(saleOwner).tiers(1))
            expect(tx).to.be.equal(100)
            let tx2 = Number(await saleContract.connect(saleOwner).tiers(2))
            expect(tx2).to.be.equal(200)
            let tx3 = Number(await saleContract.connect(saleOwner).tiers(3))
            expect(tx3).to.be.equal(1000)
            let tx4 = Number(await saleContract.connect(saleOwner).tiers(4))
            expect(tx4).to.be.equal(4000)
        })
    })
    
    describe("openSale", () => {

    })
})
