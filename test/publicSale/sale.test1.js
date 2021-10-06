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

const LockTOS_ABI = require("../../artifacts/contracts/stake/LockTOS.sol/LockTOS.json");

const  PublicSale_ABI = require('../../artifacts/contracts/sale/publicSale.sol/PublicSale.json');

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

    let setSnapshot;
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

    let tos, ton, lockTOS, lockTOSImpl, lockTOSProxy ;
    let epochUnit, maxTime;
    const name = "TONStarter";
    const symbol = "TOS";
    const version = "1.0";
    // const tosAmount = ethers.BigNumber.from('100000000000000000000');
    const tosAmount = 100000000000;
    let deployer, user1, user2;
    let userLockInfo = [];

    let tester1 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0
    }
    let tester2 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0
    }

    let tester3 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0
    }

    let tester4 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0
    }

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
        account5 = await findSigner(addresses[8]);

        deployer = saleTokenOwner;
        tester1.account = account1;
        tester2.account = account2;
        tester3.account = account3;
        tester4.account = account4;

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

    describe("Initialize TON, TOS, LockTOS", () => {
        it("Initialize TON ", async function () {
            // this.timeout(1000000);
            // let dummy;
            // ({ dummy, ton } = await setupContracts(deployer.address));
            erc20token = await ethers.getContractFactory("ERC20Mock");
            ton = await erc20token.connect(getTokenOwner).deploy("testTON", "TON");
        });
        it("Initialize TOS", async function () {
            const TOS = await ethers.getContractFactory("TOS");
            tos = await TOS.deploy(name, symbol, version);
            await tos.deployed();
        });
        it("Deploy LockTOS", async function () {

            lockTOSImpl = await (await ethers.getContractFactory("LockTOS")).deploy();
            await lockTOSImpl.deployed();

            lockTOSProxy = await (
                await ethers.getContractFactory("LockTOSProxy")
            ).deploy(lockTOSImpl.address, deployer.address);
            await lockTOSProxy.deployed();

            await (
                await lockTOSProxy.initialize(tos.address, epochUnit, maxTime)
            ).wait();

            lockTOS = new ethers.Contract( lockTOSProxy.address, LockTOS_ABI.abi, ethers.provider );
        });

        it("mint TOS to users", async function () {
            await (await tos.connect(deployer).mint(tester1.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester1.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester2.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester2.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester3.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester3.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester4.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester4.account.address)).to.be.equal(tosAmount);

        });


        it("should create locks for user", async function () {
            expect(await lockTOS.balanceOf(tester1.account.address)).to.be.equal(0);
            expect(await lockTOS.balanceOf(tester2.account.address)).to.be.equal(0);

            let id = await createLockWithPermit({
                user: tester1.account,
                amount: 15000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            expect(id).to.be.equal(1);
            tester1.lockTOSIds.push(id);

            id = await createLockWithPermit({
                user: tester2.account,
                amount: 35000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester2.lockTOSIds.push(id);
            expect(id).to.be.equal(2);

            id = await createLockWithPermit({
                user: tester3.account,
                amount: 150000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester3.lockTOSIds.push(id);
            expect(id).to.be.equal(3);

            id = await createLockWithPermit({
                user: tester4.account,
                amount: 600000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester4.lockTOSIds.push(id);
            expect(id).to.be.equal(4);

            // ethers.provider.send("evm_increaseTime", [10])   // add 26 seconds
            // ethers.provider.send("evm_mine")      // mine the next block

            const block = await ethers.provider.getBlock('latest')
            if (!block) {
                throw new Error('null block returned from provider')
            }


            setSnapshot = block.timestamp;

            tester1.balanceOfAt = Number(await lockTOS.balanceOfAt(tester1.account.address, setSnapshot))
            console.log(tester1.balanceOfAt)

            tester2.balanceOfAt = Number(await lockTOS.balanceOfAt(tester2.account.address, setSnapshot))
            console.log(tester2.balanceOfAt)

            tester3.balanceOfAt = Number(await lockTOS.balanceOfAt(tester3.account.address, setSnapshot))
            console.log(tester3.balanceOfAt)

            tester4.balanceOfAt = Number(await lockTOS.balanceOfAt(tester4.account.address, setSnapshot))
            console.log(tester4.balanceOfAt)

            expect(tester1.balanceOfAt).to.be.above(0);
            expect(tester2.balanceOfAt).to.be.above(0);
            expect(tester3.balanceOfAt).to.be.above(0);
            expect(tester4.balanceOfAt).to.be.above(0);

            // expect(await lockTOS.totalSupplyAt(snapshot)).to.be.equal(
            //     tester1.balanceOfAt.add(tester2.balanceOfAt)
            // );

        });

    });

    describe("Initialize PublicSale", () => {
        it("Initialize Funcding Token", async function () {
            getToken = ton;
        });

        it("Initialize Sale Token", async function () {
            erc20token = await ethers.getContractFactory("ERC20Mock");
            saleToken = await erc20token.connect(saleTokenOwner).deploy("testDOC", "DOC");
        });

        it("Initialize PublicSale", async function () {
            let PublicSale = await ethers.getContractFactory("PublicSale");
            let deploySaleImpl = await PublicSale.connect(saleOwner).deploy();

            let PublicSaleProxy = await ethers.getContractFactory("PublicSaleProxy");
            let PublicSaleContract = await PublicSaleProxy.connect(saleOwner).deploy(
                deploySaleImpl.address,
                saleOwner.address
            );

            await PublicSaleContract.connect(saleOwner).initialize(
                saleToken.address,
                getToken.address,
                account5.address,
                lockTOS.address
            );

            saleContract = new ethers.Contract( PublicSaleContract.address, PublicSale_ABI.abi, ethers.provider );

            await saleToken.connect(saleTokenOwner).transfer(saleContract.address, (basicAmount*2))
            await getToken.connect(getTokenOwner).transfer(account1.address, basicAmount)
            await getToken.connect(getTokenOwner).transfer(account2.address, basicAmount)
            await getToken.connect(getTokenOwner).transfer(account3.address, basicAmount)
            await getToken.connect(getTokenOwner).transfer(account4.address, basicAmount)

        });
    });

    describe("exclusiveSale", () => {
        // describe("snapshot test", () => {
        //     it("check snapshot", async () => {
        //         let tx = await tosToken.connect(tosTokenOwner).snapshot()

        //         await expect(tx).to.emit(tosToken, 'Snapshot').withArgs(
        //             1
        //         )

        //         balance1 = Number(await tosToken.balanceOf(account1.address))
        //         expect(balance1).to.be.equal(0)

        //         await tosToken.connect(tosTokenOwner).transfer(account1.address, 100)

        //         balance1 = Number(await tosToken.balanceOf(account1.address))
        //         expect(balance1).to.be.equal(100)

        //         let tx2 = await tosToken.connect(tosTokenOwner).snapshot()

        //         await expect(tx2).to.emit(tosToken, 'Snapshot').withArgs(
        //             2
        //         )
        //     })

        //     it('snapshot balanceOf test', async () => {
        //         let tx = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account1.address, 1))
        //         expect(tx).to.be.equal(0)
        //         let tx2 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account1.address, 2))
        //         expect(tx2).to.be.equal(100)
        //     });
        // })
        describe("exclusiveSale setting", () => {
            it("check the balance (contract have the saleToken) ", async () => {
                balance1 = Number(await saleToken.balanceOf(saleContract.address))

                expect(balance1).to.be.equal((basicAmount*2))
            })

            it('setting the price caller not owner', async () => {
                let tx = saleContract.connect(account1).setTokenPrice(saleTokenPrice, payTokenPrice)
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
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
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('tier setting caller owner', async () => {
                // await tosToken.connect(tosTokenOwner).transfer(account2.address, 200)
                // await tosToken.connect(tosTokenOwner).transfer(account3.address, 1000)
                // await tosToken.connect(tosTokenOwner).transfer(account4.address, 4000)

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
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
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
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('setting the setSaleAmount caller owner', async () => {
                await saleContract.connect(saleOwner).setSaleAmount(basicAmount, totalSaleAmount)
                let tx = Number(await saleContract.connect(saleOwner).totalExpectSaleAmount())
                expect(tx).to.be.equal(basicAmount)
                let tx2 = Number(await saleContract.connect(saleOwner).totalExpectOpenSaleAmount())
                expect(tx2).to.be.equal(totalSaleAmount)
            })

            // it('setting the snapshot caller not owner', async () => {
            //     let tx = saleContract.connect(account1).setSnapshot(2)
            //     await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
            // })

            // it('setting the snapshot caller owner', async () => {
            //     let settingSnapNumber = 3
            //     let snapShot = await tosToken.connect(tosTokenOwner).snapshot()

            //     await expect(snapShot).to.emit(tosToken, 'Snapshot').withArgs(
            //         settingSnapNumber
            //     )

            //     await saleContract.connect(saleOwner).setSnapshot(settingSnapNumber)
            //     let snap = Number(await saleContract.connect(saleOwner).snapshot())
            //     expect(snap).to.be.equal(3)

            //     let tx = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account1.address, settingSnapNumber))
            //     expect(tx).to.be.equal(100)
            //     let tx2 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account2.address, settingSnapNumber))
            //     expect(tx2).to.be.equal(200)
            //     let tx3 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account3.address, settingSnapNumber))
            //     expect(tx3).to.be.equal(1000)
            //     let tx4 = Number(await tosToken.connect(tosTokenOwner).balanceOfAt(account4.address, settingSnapNumber))
            //     expect(tx4).to.be.equal(4000)
            // })

            it('setting the snapshot caller not owner', async () => {
                let tx = saleContract.connect(account1).setSnapshot(setSnapshot)
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('setting the snapshot caller owner', async () => {
                await saleContract.connect(saleOwner).setSnapshot(setSnapshot)
                let snap = Number(await saleContract.connect(saleOwner).snapshot())
                expect(snap).to.be.equal(setSnapshot)

                let tx = Number(await lockTOS.balanceOfAt(tester1.account.address, setSnapshot))
                expect(tx).to.be.above(100)
                let tx2 = Number(await lockTOS.balanceOfAt(tester2.account.address, setSnapshot))
                expect(tx2).to.be.above(200)
                let tx3 = Number(await lockTOS.balanceOfAt(tester3.account.address, setSnapshot))
                expect(tx3).to.be.above(1000)
                let tx4 = Number(await lockTOS.balanceOfAt(tester4.account.address, setSnapshot))
                expect(tx4).to.be.above(4000)
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
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
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

            it('setting the setClaim', async () => {
                claimStartTime = exclusiveEndTime + (86400 * 20);

                await saleContract.connect(saleOwner).setClaim(
                    claimStartTime,
                    claimInterval,
                    claimPeriod
                )

                let tx = Number(await saleContract.startClaimTime())
                expect(tx).to.be.equal(claimStartTime)
                let tx2 = Number(await saleContract.claimInterval())
                expect(tx2).to.be.equal(claimInterval)
                let tx3 = Number(await saleContract.claimPeriod())
                expect(tx3).to.be.equal(claimPeriod)
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
                let tx = Number(await saleContract.connect(tester1.account).tiersAccount(1))
                expect(tx).to.be.equal(0)
                await saleContract.connect(tester1.account).addWhiteList()
                let tx2 = Number(await saleContract.connect(tester1.account).tiersAccount(1))
                expect(tx2).to.be.equal(1)

                let tx3 = Number(await saleContract.connect(tester2.account).tiersAccount(2))
                expect(tx3).to.be.equal(0)
                await saleContract.connect(tester2.account).addWhiteList()
                let tx4 = Number(await saleContract.connect(tester2.account).tiersAccount(2))
                expect(tx4).to.be.equal(1)

                let tx5 = Number(await saleContract.connect(tester3.account).tiersAccount(3))
                expect(tx5).to.be.equal(0)
                await saleContract.connect(tester3.account).addWhiteList()
                let tx6 = Number(await saleContract.connect(tester3.account).tiersAccount(3))
                expect(tx6).to.be.equal(1)

                let tx7 = Number(await saleContract.connect(tester4.account).tiersAccount(4))
                expect(tx7).to.be.equal(0)
                await saleContract.connect(tester4.account).addWhiteList()
                let tx8 = Number(await saleContract.connect(tester4.account).tiersAccount(4))
                expect(tx8).to.be.equal(1)

                let tx9 = saleContract.connect(tester4.account).addWhiteList()
                await expect(tx9).to.be.revertedWith("PublicSale: already attended")
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
                await expect(tx).to.be.revertedWith("PublicSale: exclusiveStartTime has not passed")
            })

            it("duration the time", async () => {
                // diffTime = exclusiveStartTime - blocktime;
                await ethers.provider.send('evm_setNextBlockTimestamp', [exclusiveStartTime]);
                await ethers.provider.send('evm_mine');
                // await time.increase(time.duration.seconds(diffTime));
                // await time.increase(time.duration.days(1));
                await time.increaseTo(exclusiveStartTime+86400);
            })

            it("addwhitelist after whitelistTIme", async () => {
                let tx3 = saleContract.connect(account1).addWhiteList()
                await expect(tx3).to.be.revertedWith("PublicSale: end the whitelistTime")
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
                let tx7 = Number(await getToken.balanceOf(account5.address))
                expect(tx7).to.be.equal(1000)

            })
        })
    })

    describe("openSale", () => {
        describe("openSale setting", () => {
            it("setting the openSaletime not owner", async () => {
                blocktime = Number(await time.latest())
                //depositStartTime = blocktime + 86400;
                //depositStartTime = exclusiveEndTime + (60*60*1); // exclusive 끝나고 한시간뒤 또는 바로 즉시.
                depositStartTime = exclusiveEndTime ;
                depositEndTime = depositStartTime + (86400*7);
                openSaleStartTime = depositEndTime + 1;
                openSaleEndTime = openSaleStartTime + (86400*7);

                let tx = saleContract.connect(account1).setOpenTime(depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime)
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it("setting the openSaletime owner", async () => {
                blocktime = Number(await time.latest())
                //depositStartTime = blocktime + 86400;
                depositStartTime = exclusiveEndTime ;
                depositEndTime = depositStartTime + (86400*7);  //일주일동안 deposit
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
                await expect(tx).to.be.revertedWith("PublicSale: don't start depositTime")
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
                await expect(tx).to.be.revertedWith("PublicSale: end the depositTime")
            })

            it("depositors", async () => {
                let tx = await saleContract.depositors(0)
                expect(account1.address).to.be.equal(tx)
            })

            it("openSale function", async () => {
                let tx = await saleContract.usersClaim(account1.address)
                expect(Number(tx.totalClaimReward)).to.be.equal(60000)
                let tx2 = await saleContract.usersClaim(account2.address)
                expect(Number(tx2.totalClaimReward)).to.be.equal(120000)
                let tx3 = await saleContract.usersClaim(account3.address)
                expect(Number(tx3.totalClaimReward)).to.be.equal(220000)
                let tx4 = await saleContract.usersClaim(account4.address)
                expect(Number(tx4.totalClaimReward)).to.be.equal(600000)
                let totaldeposit = await saleContract.totalDepositAmount()
                expect(Number(totaldeposit)).to.be.equal(400)

                let beforeTON = Number(await getToken.balanceOf(account5.address))
                expect(beforeTON).to.be.equal(1000)

                await saleContract.connect(account1).openSale()
                await saleContract.connect(account2).openSale()
                await saleContract.connect(account3).openSale()
                await saleContract.connect(account4).openSale()

                let afterTON = Number(await getToken.balanceOf(account5.address))
                expect(afterTON).to.be.equal(1400)

                let tx5 = await saleContract.usersClaim(account1.address)
                expect(Number(tx5.totalClaimReward)).to.be.equal(160000)
                let tx6 = await saleContract.usersClaim(account2.address)
                expect(Number(tx6.totalClaimReward)).to.be.equal(220000)
                let tx7 = await saleContract.usersClaim(account3.address)
                expect(Number(tx7.totalClaimReward)).to.be.equal(320000)
                let tx8 = await saleContract.usersClaim(account4.address)
                expect(Number(tx8.totalClaimReward)).to.be.equal(700000)

                let tx9 = await saleContract.usersOpen(account1.address)
                expect(Number(tx9.saleAmount)).to.be.equal(100000)
                let tx10 = await saleContract.usersEx(account1.address)
                expect(Number(tx10.saleAmount)).to.be.equal(60000)
            })

        })
    })

    describe("claim test", () => {
        it('claim before claimTime', async () => {
            let tx = saleContract.connect(account1).claim()
            await expect(tx).to.be.revertedWith("PublicSale: don't start claimTime")
        })
        it("duration the time to period = 1", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [claimStartTime]);
            await ethers.provider.send('evm_mine');
        })
        it("claim period = 1, claim call the account1", async () => {
            let expectClaim = Number(await saleContract.calculCalimAmount(account1.address))
            let tx = await saleContract.usersClaim(account1.address)
            expect(Number(tx.claimAmount)).to.be.equal(0)
            await saleContract.connect(account1).claim()
            let tx2 = await saleContract.usersClaim(account1.address)
            // console.log("period1 :", Number(tx2.claimAmount))
            expect(Number(tx2.claimAmount)).to.be.equal(expectClaim)
            let tx3 = await saleToken.balanceOf(account1.address)
            expect(Number(tx3)).to.be.equal(expectClaim)
        })

        it("duration the time to period = 2", async () => {
            let period2 = claimStartTime + 86400
            await ethers.provider.send('evm_setNextBlockTimestamp', [period2]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 2, claim call the account1, account2", async () => {
            let expectClaim = Number(await saleContract.calculCalimAmount(account1.address))
            let expectClaim2 = Number(await saleContract.calculCalimAmount(account2.address))

            let claimAmount1 = await saleContract.usersClaim(account1.address)
            expect(Number(claimAmount1.claimAmount)).to.be.equal(26666)

            let claimAmount2 = await saleContract.usersClaim(account2.address)
            expect(Number(claimAmount2.claimAmount)).to.be.equal(0)

            await saleContract.connect(account1).claim()
            await saleContract.connect(account2).claim()

            let tx3 = await saleContract.usersClaim(account1.address)
            // console.log("period2 :", Number(tx3.claimAmount))
            expect(Number(tx3.claimAmount)).to.be.equal((Number(claimAmount1.claimAmount)+expectClaim))
            let tx4 = await saleToken.balanceOf(account1.address)
            expect(Number(tx4)).to.be.equal((Number(claimAmount1.claimAmount)+expectClaim))

            let tx5 = await saleContract.usersClaim(account2.address)
            expect(Number(tx5.claimAmount)).to.be.equal(expectClaim2)
            let tx6 = await saleToken.balanceOf(account2.address)
            expect(Number(tx6)).to.be.equal(expectClaim2)

            //account1 = 26666 + 26666
            //account2 = 73332
        })

        it("duration the time to period = 3", async () => {
            let period3 = claimStartTime + (86400*2)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period3]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 3, claim call the account1, account3", async () => {
            let expectClaim = Number(await saleContract.calculCalimAmount(account1.address))
            let expectClaim2 = Number(await saleContract.calculCalimAmount(account3.address))

            let claimAmount1 = await saleContract.usersClaim(account1.address)
            expect(Number(claimAmount1.claimAmount)).to.be.equal(53332)

            let claimAmount2 = await saleContract.usersClaim(account3.address)
            expect(Number(claimAmount2.claimAmount)).to.be.equal(0)

            await saleContract.connect(account1).claim()
            await saleContract.connect(account3).claim()

            let tx3 = await saleContract.usersClaim(account1.address)
            // console.log("period3 :", Number(tx3.claimAmount))
            expect(Number(tx3.claimAmount)).to.be.equal((Number(claimAmount1.claimAmount)+expectClaim))
            let tx4 = await saleToken.balanceOf(account1.address)
            expect(Number(tx4)).to.be.equal((Number(claimAmount1.claimAmount)+expectClaim))

            let tx5 = await saleContract.usersClaim(account3.address)
            expect(Number(tx5.claimAmount)).to.be.equal(expectClaim2)
            let tx6 = await saleToken.balanceOf(account3.address)
            expect(Number(tx6)).to.be.equal(expectClaim2)

            //account1 = 26666 + 26666 + 26666
            //account2 = 73332
            //account3 = 159999
        })

        it("duration the time to period = 4", async () => {
            let period4 = claimStartTime + (86400*3)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period4]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 4, claim call the account1, account4", async () => {
            let expectClaim = Number(await saleContract.calculCalimAmount(account1.address))
            let expectClaim2 = Number(await saleContract.calculCalimAmount(account4.address))

            let claimAmount1 = await saleContract.usersClaim(account1.address)
            expect(Number(claimAmount1.claimAmount)).to.be.equal(79998)

            let claimAmount2 = await saleContract.usersClaim(account4.address)
            expect(Number(claimAmount2.claimAmount)).to.be.equal(0)

            await saleContract.connect(account1).claim()
            await saleContract.connect(account4).claim()

            let tx3 = await saleContract.usersClaim(account1.address)
            // console.log("period4 :", Number(tx3.claimAmount))
            expect(Number(tx3.claimAmount)).to.be.equal((Number(claimAmount1.claimAmount)+expectClaim))
            let tx4 = await saleToken.balanceOf(account1.address)
            expect(Number(tx4)).to.be.equal((Number(claimAmount1.claimAmount)+expectClaim))

            let tx5 = await saleContract.usersClaim(account4.address)
            expect(Number(tx5.claimAmount)).to.be.equal(expectClaim2)
            let tx6 = await saleToken.balanceOf(account4.address)
            expect(Number(tx6)).to.be.equal(expectClaim2)

            //account1 = 26666 + 26666 + 26666 + 26666
            //account2 = 73332
            //account3 = 159999
            //account4 = 466664
        })

        it("duration the time to period = 6", async () => {
            let period6 = claimStartTime + (86400*5)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period6]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 6, claim call the account1, account2", async () => {
            let expectClaim = Number(await saleContract.calculCalimAmount(account1.address))
            let expectClaim2 = Number(await saleContract.calculCalimAmount(account2.address))

            let claimAmount1 = await saleContract.usersClaim(account1.address)
            expect(Number(claimAmount1.claimAmount)).to.be.equal(106664)
            let claimRemainAmount1 = Number(claimAmount1.totalClaimReward) - Number(claimAmount1.claimAmount)
            expect(claimRemainAmount1).to.be.equal(expectClaim)

            let claimAmount2 = await saleContract.usersClaim(account2.address)
            expect(Number(claimAmount2.claimAmount)).to.be.equal(73332)
            let claimRemainAmount2 = Number(claimAmount2.totalClaimReward) - Number(claimAmount2.claimAmount)
            expect(claimRemainAmount2).to.be.equal(expectClaim2)

            await saleContract.connect(account1).claim()
            await saleContract.connect(account2).claim()

            let tx3 = await saleContract.usersClaim(account1.address)
            // console.log("period4 :", Number(tx3.claimAmount))
            expect(Number(tx3.claimAmount)).to.be.equal(Number(claimAmount1.totalClaimReward))
            let tx4 = await saleToken.balanceOf(account1.address)
            expect(Number(tx4)).to.be.equal(Number(claimAmount1.totalClaimReward))

            let tx5 = await saleContract.usersClaim(account2.address)
            expect(Number(tx5.claimAmount)).to.be.equal(Number(tx5.totalClaimReward))
            let tx6 = await saleToken.balanceOf(account2.address)
            expect(Number(tx6)).to.be.equal(Number(tx5.totalClaimReward))

            //account1 = 160,000
            //account2 = 220,000
            //account3 = 159999
            //account4 = 466664
        })

        it("duration the time to period end", async () => {
            let periodEnd = claimStartTime + (86400*7)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period end, claim call the account1, account3, account4", async () => {
            let expectClaim = Number(await saleContract.calculCalimAmount(account1.address))
            expect(expectClaim).to.be.equal(0)
            let expectClaim2 = Number(await saleContract.calculCalimAmount(account3.address))
            let expectClaim3 = Number(await saleContract.calculCalimAmount(account4.address))

            let claimAmount1 = await saleContract.usersClaim(account3.address)
            expect(Number(claimAmount1.claimAmount)).to.be.equal(159999)
            let claimRemainAmount1 = Number(claimAmount1.totalClaimReward) - Number(claimAmount1.claimAmount)
            expect(claimRemainAmount1).to.be.equal(expectClaim2)

            let claimAmount2 = await saleContract.usersClaim(account4.address)
            expect(Number(claimAmount2.claimAmount)).to.be.equal(466664)
            let claimRemainAmount2 = Number(claimAmount2.totalClaimReward) - Number(claimAmount2.claimAmount)
            expect(claimRemainAmount2).to.be.equal(expectClaim3)

            // let revert = saleContract.connect(account1).claim()
            // await expect(revert).to.be.revertedWith("user is already getAllreward")

            await saleContract.connect(account3).claim()
            await saleContract.connect(account4).claim()


            let tx3 = await saleContract.usersClaim(account3.address)
            // console.log("period4 :", Number(tx3.claimAmount))
            expect(Number(tx3.claimAmount)).to.be.equal(Number(claimAmount1.totalClaimReward))
            let tx4 = await saleToken.balanceOf(account3.address)
            expect(Number(tx4)).to.be.equal(Number(claimAmount1.totalClaimReward))

            let tx5 = await saleContract.usersClaim(account4.address)
            expect(Number(tx5.claimAmount)).to.be.equal(Number(tx5.totalClaimReward))
            let tx6 = await saleToken.balanceOf(account4.address)
            expect(Number(tx6)).to.be.equal(Number(tx5.totalClaimReward))

            //account1 = 160,000
            //account2 = 220,000
            //account3 = 320,000
            //account4 = 700,000
        })
    })
})