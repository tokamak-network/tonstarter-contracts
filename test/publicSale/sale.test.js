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
    let claimEndTime;

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

        deploySale = await ethers.getContractFactory("publicSale");
        saleContract = await deploySale.connect(saleOwner).deploy(
            saleToken.address, 
            getToken.address, 
            getTokenOwner.address, 
            tosToken.address
        )
        // console.log(saleContract)
        
        await saleToken.connect(saleTokenOwner).transfer(saleContract.address, basicAmount)
        // await getToken.connect(getTokenOwner).transfer(saleContract.address, basicAmount)
        // await tosToken.connect(tosTokenOwner).transfer(saleContract.address, basicAmount)

        // balance1 = Number(await saleToken.balanceOf(saleContract.address))
        // balance2 = Number(await getToken.balanceOf(saleContract.address))
        // balance3 = Number(await tosToken.balanceOf(saleContract.address))

        // console.log(balance1)
        // console.log(balance2)
        // console.log(balance3)

        await getToken.connect(getTokenOwner).transfer(account1.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(account2.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(account3.address, basicAmount)
        await getToken.connect(getTokenOwner).transfer(account4.address, basicAmount)
    });

    describe("exclusiveSale", () => {
        describe("snapshot test", () => {
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
        })
        describe("exclusiveSale setting", () => {
            it("check the balance (contract have the saleToken) ", async () => {
                balance1 = Number(await saleToken.balanceOf(saleContract.address))
    
                expect(balance1).to.be.equal(basicAmount)
            })

            it('setting the price caller not owner', async () => {
                let tx = saleContract.connect(account1).setTokenPrice(saleTokenPrice, payTokenPrice)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the price caller owner', async () => {
                await saleContract.connect(saleOwner).setTokenPrice(saleTokenPrice, payTokenPrice)
                let tx = await saleContract.connect(saleOwner).saleTokenPrice()
                let tx2 = await saleContract.connect(saleOwner).payTokenPrice()
                expect(tx).to.be.equal(saleTokenPrice)
                expect(tx2).to.be.equal(payTokenPrice)
            })
    
            it('tier setting caller not owner', async () => {
                let tx = saleContract.connect(account1).setTier(100, 200, 1000, 4000)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })
    
            it('tier setting caller owner', async () => {
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
    
            it('setting tierPercents caller not owner', async () => {
                let tx = saleContract.connect(account1).setTierPercents(600, 1200, 2200, 6000)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting tierPercents caller owner', async () => {
                await saleContract.connect(saleOwner).setTierPercents(600, 1200, 2200, 6000)
                let tx = Number(await saleContract.connect(saleOwner).tiersPercents(1))
                expect(tx).to.be.equal(600)
                let tx2 = Number(await saleContract.connect(saleOwner).tiersPercents(2))
                expect(tx2).to.be.equal(1200)
                let tx3 = Number(await saleContract.connect(saleOwner).tiersPercents(3))
                expect(tx3).to.be.equal(2200)
                let tx4 = Number(await saleContract.connect(saleOwner).tiersPercents(4))
                expect(tx4).to.be.equal(6000)            
            })

            it('setting the setSaleAmount caller not owner', async () => {
                let tx = saleContract.connect(account1).setSaleAmount(basicAmount, totalSaleAmount)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the setSaleAmount caller owner', async () => {
                await saleContract.connect(saleOwner).setSaleAmount(basicAmount, totalSaleAmount)
                let tx = Number(await saleContract.connect(saleOwner).totalExpectSaleAmount())
                expect(tx).to.be.equal(basicAmount)
                let tx2 = Number(await saleContract.connect(saleOwner).totalOpenSaleAmount())
                expect(tx2).to.be.equal(totalSaleAmount)
            })

            it('setting the snapshot caller not owner', async () => {
                let tx = saleContract.connect(account1).setSnapshot(2)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the snapshot caller owner', async () => {
                let settingSnapNumber = 3
                let snapShot = await tosToken.connect(tosTokenOwner).snapshot()

                await expect(snapShot).to.emit(tosToken, 'Snapshot').withArgs(
                    settingSnapNumber
                )

                await saleContract.connect(saleOwner).setSnapshot(settingSnapNumber)
                let snap = Number(await saleContract.connect(saleOwner).snapshot())
                expect(snap).to.be.equal(3)

                let tx = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account1.address, settingSnapNumber))
                expect(tx).to.be.equal(100)
                let tx2 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account2.address, settingSnapNumber))
                expect(tx2).to.be.equal(200)
                let tx3 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account3.address, settingSnapNumber))
                expect(tx3).to.be.equal(1000)
                let tx4 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account4.address, settingSnapNumber))
                expect(tx4).to.be.equal(4000) 
            })

            it('setting the ExclusiveTime caller not owner', async () => {
                blocktime = Number(await time.latest())
                whitelistStartTime = blocktime + 86400;
                whitelistEndTime = whitelistStartTime + (86400*7);
                exclusiveStartTime = whitelistEndTime + 1;
                exclusiveEndTime = exclusiveStartTime + (86400*7);

                let tx = saleContract.connect(account1).setExclusiveTime(
                    whitelistStartTime, 
                    whitelistEndTime, 
                    exclusiveStartTime, 
                    exclusiveEndTime
                )
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it('setting the ExclusiveTime caller owner', async () => {
                blocktime = Number(await time.latest())
                // console.log(blocktime)
                whitelistStartTime = blocktime + 86400;
                whitelistEndTime = whitelistStartTime + (86400*7);
                exclusiveStartTime = whitelistEndTime + 1;
                exclusiveEndTime = exclusiveStartTime + (86400*7);

                await saleContract.connect(saleOwner).setExclusiveTime(
                    whitelistStartTime, 
                    whitelistEndTime, 
                    exclusiveStartTime, 
                    exclusiveEndTime
                )

                let tx = Number(await saleContract.startExclusiveTime())
                expect(tx).to.be.equal(exclusiveStartTime)
                let tx2 = Number(await saleContract.endExclusiveTime())
                expect(tx2).to.be.equal(exclusiveEndTime)
                let tx3 = Number(await saleContract.startAddWhiteTime())
                expect(tx3).to.be.equal(whitelistStartTime)
                let tx4 = Number(await saleContract.endAddWhiteTime())
                expect(tx4).to.be.equal(whitelistEndTime)
            })
        })
        describe("exclusiveSale Sale", () => {
            it("calculTierAmount test before addwhiteList", async () => {
                let tx = Number(await saleContract.calculTierAmount(account1.address))
                expect(tx).to.be.equal(60000)
                let tx2 = Number(await saleContract.calculTierAmount(account2.address))
                expect(tx2).to.be.equal(120000)
                let tx3 = Number(await saleContract.calculTierAmount(account3.address))
                expect(tx3).to.be.equal(220000)
                let tx4 = Number(await saleContract.calculTierAmount(account4.address))
                expect(tx4).to.be.equal(600000)
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [whitelistStartTime]);
                await ethers.provider.send('evm_mine');
            })

            it("addwhiteList", async () => {
                let tx = Number(await saleContract.connect(account1).tiersAccount(1))
                expect(tx).to.be.equal(0)
                await saleContract.connect(account1).addWhiteList()
                let tx2 = Number(await saleContract.connect(account1).tiersAccount(1))
                expect(tx2).to.be.equal(1)

                let tx3 = Number(await saleContract.connect(account2).tiersAccount(2))
                expect(tx3).to.be.equal(0)
                await saleContract.connect(account2).addWhiteList()
                let tx4 = Number(await saleContract.connect(account2).tiersAccount(2))
                expect(tx4).to.be.equal(1)

                let tx5 = Number(await saleContract.connect(account3).tiersAccount(3))
                expect(tx5).to.be.equal(0)
                await saleContract.connect(account3).addWhiteList()
                let tx6 = Number(await saleContract.connect(account3).tiersAccount(3))
                expect(tx6).to.be.equal(1)

                let tx7 = Number(await saleContract.connect(account4).tiersAccount(4))
                expect(tx7).to.be.equal(0)
                await saleContract.connect(account4).addWhiteList()
                let tx8 = Number(await saleContract.connect(account4).tiersAccount(4))
                expect(tx8).to.be.equal(1)

                let tx9 = saleContract.connect(account4).addWhiteList()
                await expect(tx9).to.be.revertedWith("already you attend whitelist")
            })

            it("how many input amount", async () => {
                let tx = Number(await saleContract.calculPayToken(60000))
                expect(tx).to.be.equal(60)
                let tx2 = Number(await saleContract.calculPayToken(120000))
                expect(tx2).to.be.equal(120)
                let tx3 = Number(await saleContract.calculPayToken(220000))
                expect(tx3).to.be.equal(220)
                let tx4 = Number(await saleContract.calculPayToken(600000))
                expect(tx4).to.be.equal(600)
            })

            it("calculTierAmount test after addwhiteList", async () => {
                let tx = Number(await saleContract.calculTierAmount(account1.address))
                expect(tx).to.be.equal(60000)
                let tx2 = Number(await saleContract.calculTierAmount(account2.address))
                expect(tx2).to.be.equal(120000)
                let tx3 = Number(await saleContract.calculTierAmount(account3.address))
                expect(tx3).to.be.equal(220000)
                let tx4 = Number(await saleContract.calculTierAmount(account4.address))
                expect(tx4).to.be.equal(600000)
            })

            it("exclusiveSale before exclusive startTime", async () => {
                await getToken.connect(account1).approve(saleContract.address, 60)
                let tx = saleContract.connect(account1).exclusiveSale(60)
                await expect(tx).to.be.revertedWith("need to exclusiveStartTime")
            })

            it("duration the time", async () => {
                // diffTime = exclusiveStartTime - blocktime;
                await ethers.provider.send('evm_setNextBlockTimestamp', [exclusiveStartTime]);
                await ethers.provider.send('evm_mine');
                // await time.increase(time.duration.seconds(diffTime));
                // await time.increase(time.duration.days(1));
                await time.increaseTo(exclusiveStartTime+86400);
            })

            it("addwhitelist after exclusiveTime", async () => {
                let tx3 = saleContract.connect(account1).addWhiteList()
                await expect(tx3).to.be.revertedWith("end the whitelistTime")
            })

            it("exclusiveSale after exclusive startTime", async () => {
                await getToken.connect(account1).approve(saleContract.address, 60)
                await saleContract.connect(account1).exclusiveSale(60)
                let tx = await saleContract.usersEx(account1.address)
                expect(Number(tx.payAmount)).to.be.equal(60)

                await getToken.connect(account2).approve(saleContract.address, 120)
                await saleContract.connect(account2).exclusiveSale(120)
                let tx2 = await saleContract.usersEx(account2.address)
                expect(Number(tx2.payAmount)).to.be.equal(120)

                await getToken.connect(account3).approve(saleContract.address, 220)
                await saleContract.connect(account3).exclusiveSale(220)
                let tx3 = await saleContract.usersEx(account3.address)
                expect(Number(tx3.payAmount)).to.be.equal(220)

                await getToken.connect(account4).approve(saleContract.address, 600)
                await saleContract.connect(account4).exclusiveSale(600)
                let tx4 = await saleContract.usersEx(account4.address)
                expect(Number(tx4.payAmount)).to.be.equal(600)

                let tx5 = Number(await saleContract.totalExPurchasedAmount())
                expect(tx5).to.be.equal(1000)
                let tx6 = Number(await saleContract.totalExSaleAmount())
                expect(tx6).to.be.equal(1000000)
            })
        })
    })
    
    describe("openSale", () => {
        describe("openSale setting", () => {
            it("setting the openSaletime not owner", async () => {
                blocktime = Number(await time.latest())
                depositStartTime = blocktime + 86400;
                depositEndTime = exclusiveStartTime + (86400*7); 
                openSaleStartTime = depositEndTime + 1;
                openSaleEndTime = openSaleStartTime + (86400*7);

                let tx = saleContract.connect(account1).setOpenTime(depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime)
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("setting the openSaletime owner", async () => {
                blocktime = Number(await time.latest())
                depositStartTime = blocktime + 86400;
                depositEndTime = exclusiveStartTime + (86400*7);  //일주일동안 deposit
                openSaleStartTime = depositEndTime + 1;
                openSaleEndTime = openSaleStartTime + (86400*7); //일주일동안 sale

                await saleContract.connect(saleOwner).setOpenTime(depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime)
                let tx = await saleContract.startDepositTime()
                expect(tx).to.be.equal(depositStartTime)
                let tx2 = await saleContract.endDepositTime()
                expect(tx2).to.be.equal(depositEndTime)
                let tx3 = await saleContract.startOpenSaleTime()
                expect(tx3).to.be.equal(openSaleStartTime)
                let tx4 = await saleContract.endOpenSaleTime()
                expect(tx4).to.be.equal(openSaleEndTime)
            })
        })

        describe("openSale Sale", () => {
            it("deposit before depositTime", async () => {
                let tx = saleContract.connect(account1).deposit(100)
                await expect(tx).to.be.revertedWith("don't start depositTime")
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [depositStartTime]);
                await ethers.provider.send('evm_mine');
            })

            it("deposit after depositTime", async () => {
                await getToken.connect(account1).approve(saleContract.address, 100)
                await getToken.connect(account2).approve(saleContract.address, 100)
                await getToken.connect(account3).approve(saleContract.address, 100)
                await getToken.connect(account4).approve(saleContract.address, 100)

                await saleContract.connect(account1).deposit(100)
                await saleContract.connect(account2).deposit(100)
                await saleContract.connect(account3).deposit(100)
                await saleContract.connect(account4).deposit(100)

                let tx = await saleContract.usersOpen(account1.address)
                expect(Number(tx.depositAmount)).to.be.equal(100)
                let tx2 = await saleContract.usersOpen(account2.address)
                expect(Number(tx2.depositAmount)).to.be.equal(100)
                let tx3 = await saleContract.usersOpen(account3.address)
                expect(Number(tx3.depositAmount)).to.be.equal(100)
                let tx4 = await saleContract.usersOpen(account4.address)
                expect(Number(tx4.depositAmount)).to.be.equal(100)
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [openSaleStartTime]);
                await ethers.provider.send('evm_mine');
            })

            it("deposit after depositEndTime", async () => {
                await getToken.connect(account1).approve(saleContract.address, 100)

                let tx = saleContract.connect(account1).deposit(100)
                await expect(tx).to.be.revertedWith("end the depositTime")
            })


        })
    })

    describe("claim test", () => {

    })
})