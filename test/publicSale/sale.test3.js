/* eslint-disable no-undef */
const chai = require("chai");
const { expect } = require("chai");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { time, expectEvent } = require("@openzeppelin/test-helpers");
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
    //
    let allocatedSaleAmount = ethers.BigNumber.from('2'+'0'.repeat(24));
    let allocatedExclusiveSale = allocatedSaleAmount.mul(ethers.BigNumber.from(7)).div(ethers.BigNumber.from(10));
    let allocatedOpenSale = allocatedSaleAmount.sub(allocatedExclusiveSale);

    console.log(allocatedExclusiveSale.toString());
    console.log(allocatedOpenSale.toString());

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
    const tosAmount = ethers.BigNumber.from('10'+'0'.repeat(24));
    let deployer, user1, user2;
    let userLockInfo = [];

    let sTOSSendAmount = [
        ethers.BigNumber.from('15'+'0'.repeat(21)),
        ethers.BigNumber.from('35'+'0'.repeat(21)),
        ethers.BigNumber.from('15'+'0'.repeat(22)),
        ethers.BigNumber.from('6'+'0'.repeat(23)),
        ethers.BigNumber.from('10'+'0'.repeat(21)),
        ethers.BigNumber.from('15'+'0'.repeat(22)),
    ]

    let tierLimitSTOS = [
        ethers.BigNumber.from('1'+'0'.repeat(20)),
        ethers.BigNumber.from('2'+'0'.repeat(20)),
        ethers.BigNumber.from('1'+'0'.repeat(21)),
        ethers.BigNumber.from('4'+'0'.repeat(21))
    ];

    let tierPercentage = [600, 1200, 2200, 6000];

    let ZEROBN = ethers.BigNumber.from('0')

    let tierAmount = [ ZEROBN,ZEROBN,ZEROBN,ZEROBN ]

    let tierInfo = [
        { number: 0, whitelistNumber: 0 },
        { number: 0, whitelistNumber: 0 },
        { number: 0, whitelistNumber: 0 },
        { number: 0, whitelistNumber: 0 }
    ]

    let openSaleAmountAdjust ;
    let totalDepositAmountPayToken;

    let tester1 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        tier: 0,
        exclusiveSalePayAmount: ethers.BigNumber.from('0'),
        exclusiveSaleBuyAmount: ethers.BigNumber.from('0'),
        depositAmountPayToken: ethers.BigNumber.from('0'),
        openSaleBuyAmount: ethers.BigNumber.from('0'),
    }
    let tester2 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        tier: 0,
        exclusiveSalePayAmount: ethers.BigNumber.from('0'),
        exclusiveSaleBuyAmount: ethers.BigNumber.from('0'),
        depositAmountPayToken: ethers.BigNumber.from('0'),
        openSaleBuyAmount: ethers.BigNumber.from('0'),
    }

    let tester3 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        tier: 0,
        exclusiveSalePayAmount: ethers.BigNumber.from('0'),
        exclusiveSaleBuyAmount: ethers.BigNumber.from('0'),
        depositAmountPayToken: ethers.BigNumber.from('0'),
        openSaleBuyAmount: ethers.BigNumber.from('0'),
    }

    let tester4 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        tier: 0,
        exclusiveSalePayAmount: ethers.BigNumber.from('0'),
        exclusiveSaleBuyAmount: ethers.BigNumber.from('0'),
        depositAmountPayToken: ethers.BigNumber.from('0'),
        openSaleBuyAmount: ethers.BigNumber.from('0'),
    }

    let tester5 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        tier: 0,
        exclusiveSalePayAmount: ethers.BigNumber.from('0'),
        exclusiveSaleBuyAmount: ethers.BigNumber.from('0'),
        depositAmountPayToken: ethers.BigNumber.from('0'),
        openSaleBuyAmount: ethers.BigNumber.from('0'),
    }

    let tester6 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        tier: 0,
        exclusiveSalePayAmount: ethers.BigNumber.from('0'),
        exclusiveSaleBuyAmount: ethers.BigNumber.from('0'),
        depositAmountPayToken: ethers.BigNumber.from('0'),
        openSaleBuyAmount: ethers.BigNumber.from('0'),
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
        account6 = await findSigner(addresses[9]);
        account7 = await findSigner(addresses[10]);


        deployer = saleTokenOwner;
        tester1.account = account1;
        tester2.account = account2;
        tester3.account = account3;
        tester4.account = account4;
        tester5.account = account5;
        tester6.account = account6;

        // for sTOS
        epochUnit = 60*60*1;  // 1시간
        maxTime = epochUnit * 156;
    });


    function calculPayToken (payTokenNumber){
        //return parseInt(payTokenNumber*saleTokenPrice/payTokenPrice);
        return payTokenNumber.mul(ethers.BigNumber.from(saleTokenPrice+"")).div(ethers.BigNumber.from(payTokenPrice+""));
    }

    function calculSaleToken (saleTokenNumber){
        return saleTokenNumber.mul(ethers.BigNumber.from(payTokenPrice+'')).div(ethers.BigNumber.from(saleTokenPrice+""));
    }

    async function calculTierAmount(user, lockTOS, _tierPercentage, _tierInfo)  {
        let tier = await userTier(user.account, lockTOS);
        if(user.tier > 0){
            let salePossible = allocatedExclusiveSale.mul(_tierPercentage[user.tier-1]).div(_tierInfo[user.tier-1].whitelistNumber).div(10000);
            return salePossible;
        } else {
            let tierAccount = tierInfo[tier-1].whitelistNumber +1;
            let salePossible = allocatedExclusiveSale.mul(_tierPercentage[tier-1]).div(tierAccount).div(10000);
            return salePossible;
        }
    }

    async function userTier(user, lockTOS)  {
        let tx = (await lockTOS.balanceOfAt(user.address, setSnapshot))

        if(tx.gte(tierLimitSTOS[3])) return 4;
        else if(tx.gte(tierLimitSTOS[2]))  return 3;
        else if(tx.gte(tierLimitSTOS[1]))  return 2;
        else if(tx.gte(tierLimitSTOS[0]))  return 1;
        else  return 0;
    }


    async function checkCalculTierAmountPrev(_account, _tierPercentage){
        let tier = await saleContract.calculTier(_account)
        let tiersAccount = await saleContract.tiersAccount(tier)
        let calculTierAmount = (await saleContract.calculTierAmount(_account))
        tier = tier.toNumber();
        tiersAccount = tiersAccount.toNumber();
        let _tierAmount = ethers.BigNumber.from('0')
        if(tier > 0 ){
            _tierAmount = allocatedExclusiveSale.mul(ethers.BigNumber.from(_tierPercentage[tier-1]+"")).div(ethers.BigNumber.from("10000"))
        }
        if(tiersAccount > 0 ){
            _tierAmount = _tierAmount.div(ethers.BigNumber.from(tiersAccount+""));
        }
        expect(calculTierAmount).to.be.equal(_tierAmount)
    }

    async function checkCalculTierAmount(_account, tierAmount){
        let tier = await saleContract.calculTier(_account)
        let tiersAccount = await saleContract.tiersAccount(tier)
        let tx1 = (await saleContract.calculTierAmount(_account))

        if(tier.toNumber() == 1) expect(tx1).to.be.equal(tierAmount[0])
        else if(tier.toNumber() == 2) expect(tx1).to.be.equal(tierAmount[1])
        else if(tier.toNumber() == 3) expect(tx1).to.be.equal(tierAmount[2])
        else if(tier.toNumber() == 4) expect(tx1).to.be.equal(tierAmount[3])
    }


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

            await (await tos.connect(deployer).mint(tester5.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester5.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester6.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester6.account.address)).to.be.equal(tosAmount);

        });


        it("should create locks for user", async function () {
            expect(await lockTOS.balanceOf(tester1.account.address)).to.be.equal(0);
            expect(await lockTOS.balanceOf(tester2.account.address)).to.be.equal(0);

            let id = await createLockWithPermit({
                user: tester1.account,
                amount: sTOSSendAmount[0],
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            expect(id).to.be.equal(1);
            tierInfo[0].number++;
            tester1.lockTOSIds.push(id);

            id = await createLockWithPermit({
                user: tester2.account,
                amount: sTOSSendAmount[1],
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester2.lockTOSIds.push(id);
            expect(id).to.be.equal(2);
            tierInfo[1].number++;

            id = await createLockWithPermit({
                user: tester3.account,
                amount: sTOSSendAmount[2],
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester3.lockTOSIds.push(id);
            expect(id).to.be.equal(3);
            tierInfo[2].number++;

            id = await createLockWithPermit({
                user: tester4.account,
                amount: sTOSSendAmount[3],
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester4.lockTOSIds.push(id);
            expect(id).to.be.equal(4);
            tierInfo[3].number++;


            id = await createLockWithPermit({
                user: tester5.account,
                amount: sTOSSendAmount[4],
                unlockWeeks: 1,
                tos,
                lockTOS,
            });
            tester5.lockTOSIds.push(id);
            expect(id).to.be.equal(5);
            //tierInfo[0].number++;


            id = await createLockWithPermit({
                user: tester6.account,
                amount: sTOSSendAmount[5],
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester6.lockTOSIds.push(id);
            expect(id).to.be.equal(6);
            tierInfo[2].number++;

            // ethers.provider.send("evm_increaseTime", [10])   // add 26 seconds
            // ethers.provider.send("evm_mine")      // mine the next block

            const block = await ethers.provider.getBlock('latest')
            if (!block) {
                throw new Error('null block returned from provider')
            }


            setSnapshot = block.timestamp;

            tester1.balanceOfAt = (await lockTOS.balanceOfAt(tester1.account.address, setSnapshot))
            // console.log(tester1.balanceOfAt.toString() , ethers.utils.formatUnits(tester1.balanceOfAt,18) )

            tester2.balanceOfAt = (await lockTOS.balanceOfAt(tester2.account.address, setSnapshot))
            // console.log(tester2.balanceOfAt.toString(), ethers.utils.formatUnits(tester2.balanceOfAt,18) )

            tester3.balanceOfAt = (await lockTOS.balanceOfAt(tester3.account.address, setSnapshot))
            // console.log(tester3.balanceOfAt.toString(), ethers.utils.formatUnits(tester3.balanceOfAt,18) )

            tester4.balanceOfAt = (await lockTOS.balanceOfAt(tester4.account.address, setSnapshot))
            // console.log(tester4.balanceOfAt.toString(), ethers.utils.formatUnits(tester4.balanceOfAt,18) )
            tester5.balanceOfAt = (await lockTOS.balanceOfAt(tester5.account.address, setSnapshot))

            tester6.balanceOfAt = (await lockTOS.balanceOfAt(tester6.account.address, setSnapshot))


            expect(tester1.balanceOfAt).to.be.above(0);
            expect(tester2.balanceOfAt).to.be.above(0);
            expect(tester3.balanceOfAt).to.be.above(0);
            expect(tester4.balanceOfAt).to.be.above(0);
            expect(tester5.balanceOfAt).to.be.above(0);
            expect(tester6.balanceOfAt).to.be.above(0);
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

            await saleToken.connect(saleTokenOwner).transfer(saleContract.address, allocatedSaleAmount)
            await getToken.connect(getTokenOwner).transfer(account1.address, allocatedExclusiveSale)
            await getToken.connect(getTokenOwner).transfer(account2.address, allocatedExclusiveSale)
            await getToken.connect(getTokenOwner).transfer(account3.address, allocatedExclusiveSale)
            await getToken.connect(getTokenOwner).transfer(account4.address, allocatedExclusiveSale)
            await getToken.connect(getTokenOwner).transfer(account5.address, allocatedExclusiveSale)
            await getToken.connect(getTokenOwner).transfer(account6.address, allocatedExclusiveSale)

        });
    });

    describe("setting", () => {

        describe("exclusiveSale setting", () => {
            it("check the balance (contract have the saleToken) ", async () => {
                balance1 = (await saleToken.balanceOf(saleContract.address))

                expect(balance1).to.be.equal(allocatedSaleAmount)
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
                let tx = saleContract.connect(account1).setTier(tierLimitSTOS[0], tierLimitSTOS[1], tierLimitSTOS[2], tierLimitSTOS[3])
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('tier setting caller owner', async () => {
                // await tosToken.connect(tosTokenOwner).transfer(account2.address, 200)
                // await tosToken.connect(tosTokenOwner).transfer(account3.address, 1000)
                // await tosToken.connect(tosTokenOwner).transfer(account4.address, 4000)

                await saleContract.connect(saleOwner).setTier(tierLimitSTOS[0], tierLimitSTOS[1], tierLimitSTOS[2], tierLimitSTOS[3])

                let tx = await saleContract.connect(saleOwner).tiers(1)
                expect(tx).to.be.equal(tierLimitSTOS[0])
                let tx2 = (await saleContract.connect(saleOwner).tiers(2))
                expect(tx2).to.be.equal(tierLimitSTOS[1])
                let tx3 = (await saleContract.connect(saleOwner).tiers(3))
                expect(tx3).to.be.equal(tierLimitSTOS[2])
                let tx4 = (await saleContract.connect(saleOwner).tiers(4))
                expect(tx4).to.be.equal(tierLimitSTOS[3])
            })

            it('setting tierPercents caller not owner', async () => {
                let tx = saleContract.connect(account1).setTierPercents(tierPercentage[0], tierPercentage[1], tierPercentage[2], tierPercentage[3])
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('setting tierPercents caller owner', async () => {
                await saleContract.connect(saleOwner).setTierPercents(tierPercentage[0], tierPercentage[1], tierPercentage[2], tierPercentage[3])
                let tx = Number(await saleContract.connect(saleOwner).tiersPercents(1))
                expect(tx).to.be.equal(tierPercentage[0])
                let tx2 = Number(await saleContract.connect(saleOwner).tiersPercents(2))
                expect(tx2).to.be.equal(tierPercentage[1])
                let tx3 = Number(await saleContract.connect(saleOwner).tiersPercents(3))
                expect(tx3).to.be.equal(tierPercentage[2])
                let tx4 = Number(await saleContract.connect(saleOwner).tiersPercents(4))
                expect(tx4).to.be.equal(tierPercentage[3])
            })

            it('setting the setSaleAmount caller not owner', async () => {
                let tx = saleContract.connect(account1).setSaleAmount(allocatedExclusiveSale, allocatedOpenSale)
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('setting the setSaleAmount caller owner', async () => {
                await saleContract.connect(saleOwner).setSaleAmount(allocatedExclusiveSale, allocatedOpenSale)
                let tx = (await saleContract.connect(saleOwner).totalExpectSaleAmount())
                expect(tx).to.be.equal(allocatedExclusiveSale)
                let tx2 = (await saleContract.connect(saleOwner).totalExpectOpenSaleAmount())
                expect(tx2).to.be.equal(allocatedOpenSale)
            })

            it('setting the snapshot caller not owner', async () => {
                let tx = saleContract.connect(account1).setSnapshot(setSnapshot)
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it('setting the snapshot caller owner', async () => {
                await saleContract.connect(saleOwner).setSnapshot(setSnapshot)
                let snap = Number(await saleContract.connect(saleOwner).snapshot())
                expect(snap).to.be.equal(setSnapshot)

                let tx = (await lockTOS.balanceOfAt(tester1.account.address, setSnapshot))
                expect(tx).to.be.above(tierLimitSTOS[0])
                tester1.tier = await userTier(tester1.account, lockTOS);
                expect(tester1.tier).to.be.eq(1)


                let tx2 = (await lockTOS.balanceOfAt(tester2.account.address, setSnapshot))
                expect(tx2).to.be.above(tierLimitSTOS[1])
                tester2.tier = await userTier(tester2.account, lockTOS);
                expect(tester2.tier).to.be.eq(2)

                let tx3 = (await lockTOS.balanceOfAt(tester3.account.address, setSnapshot))
                expect(tx3).to.be.above(tierLimitSTOS[2])
                tester3.tier = await userTier(tester3.account, lockTOS);
                expect(tester3.tier).to.be.eq(3)

                let tx4 = (await lockTOS.balanceOfAt(tester4.account.address, setSnapshot))
                expect(tx4).to.be.above(tierLimitSTOS[3])
                tester4.tier = await userTier(tester4.account, lockTOS);
                expect(tester4.tier).to.be.eq(4)


                let tx5 = (await lockTOS.balanceOfAt(tester5.account.address, setSnapshot))
                // expect(tx5).to.be.above(tierLimitSTOS[0])
                tester5.tier = await userTier(tester5.account, lockTOS);
                expect(tester5.tier).to.be.eq(0)


                let tx6 = (await lockTOS.balanceOfAt(tester6.account.address, setSnapshot))
                expect(tx6).to.be.above(tierLimitSTOS[2])
                tester6.tier = await userTier(tester6.account, lockTOS);
                expect(tester6.tier).to.be.eq(3)

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
                let block = await ethers.provider.getBlock();
                whitelistStartTime = block.timestamp + 86400;
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

        describe("openSale setting", () => {
            it("setting the openSaletime not owner", async () => {
                //blocktime = Number(await time.latest())
                depositStartTime = exclusiveEndTime ;
                depositEndTime = depositStartTime + (86400*7);
                openSaleStartTime = depositEndTime + 1;
                openSaleEndTime = openSaleStartTime + (86400*7);

                let tx = saleContract.connect(account1).setOpenTime(depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime)
                await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
            })

            it("setting the openSaletime owner", async () => {
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
    })


    describe("Sale", () => {
        describe("exclusiveSale Sale", () => {
            it("calculTierAmount test before addwhiteList", async () => {

                await checkCalculTierAmountPrev(account1.address, tierPercentage);
                await checkCalculTierAmountPrev(account2.address, tierPercentage);
                await checkCalculTierAmountPrev(account3.address, tierPercentage);
                await checkCalculTierAmountPrev(account4.address, tierPercentage);
                await checkCalculTierAmountPrev(account5.address, tierPercentage);
                await checkCalculTierAmountPrev(account6.address, tierPercentage);
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [whitelistStartTime]);
                await ethers.provider.send('evm_mine');
            })

            it("addwhiteList", async () => {
                let tierNumber = 1;
                let tx = Number(await saleContract.connect(tester1.account).tiersAccount(tierNumber))
                expect(tx).to.be.equal(0)
                await saleContract.connect(tester1.account).addWhiteList()
                tierInfo[tierNumber-1].whitelistNumber++;
                tester1.tier = await userTier(tester1.account, lockTOS);
                let tx2 = Number(await saleContract.connect(tester1.account).tiersAccount(tierNumber))
                expect(tx2).to.be.equal(tierInfo[tierNumber-1].whitelistNumber)


                tierNumber = 2;
                let tx3 = Number(await saleContract.connect(tester2.account).tiersAccount(tierNumber))
                expect(tx3).to.be.equal(0)
                await saleContract.connect(tester2.account).addWhiteList()
                tierInfo[tierNumber-1].whitelistNumber++;
                tester2.tier = await userTier(tester2.account, lockTOS);
                let tx4 = Number(await saleContract.connect(tester2.account).tiersAccount(tierNumber))
                expect(tx4).to.be.equal(tierInfo[tierNumber-1].whitelistNumber)

                tierNumber = 3;
                let tx5 = Number(await saleContract.connect(tester3.account).tiersAccount(tierNumber))
                expect(tx5).to.be.equal(0)
                await saleContract.connect(tester3.account).addWhiteList()
                tierInfo[tierNumber-1].whitelistNumber++;
                tester3.tier = await userTier(tester3.account, lockTOS);
                let tx6 = Number(await saleContract.connect(tester3.account).tiersAccount(tierNumber))
                expect(tx6).to.be.equal(tierInfo[tierNumber-1].whitelistNumber)


                tierNumber = 4;
                let tx7 = Number(await saleContract.connect(tester4.account).tiersAccount(tierNumber))
                expect(tx7).to.be.equal(0)
                await saleContract.connect(tester4.account).addWhiteList()
                tierInfo[tierNumber-1].whitelistNumber++;
                tester4.tier = await userTier(tester4.account, lockTOS);
                let tx8 = Number(await saleContract.connect(tester4.account).tiersAccount(tierNumber))
                expect(tx8).to.be.equal(tierInfo[tierNumber-1].whitelistNumber)

                let tx9 = saleContract.connect(tester4.account).addWhiteList()
                await expect(tx9).to.be.revertedWith("PublicSale: already attended")

                tierNumber = 1;
                tx = Number(await saleContract.connect(tester5.account).tiersAccount(tierNumber))
                expect(tx).to.be.equal(1)

                await expect(saleContract.connect(tester5.account).addWhiteList()).to.be.revertedWith("PublicSale: need to more sTOS")

                tierNumber = 3;
                tx = Number(await saleContract.connect(tester6.account).tiersAccount(tierNumber))
                expect(tx).to.be.equal(1)
                await saleContract.connect(tester6.account).addWhiteList()
                tierInfo[tierNumber-1].whitelistNumber++;
                tester4.tier = await userTier(tester6.account, lockTOS);
                tx = Number(await saleContract.connect(tester6.account).tiersAccount(tierNumber))
                expect(tx).to.be.equal(tierInfo[tierNumber-1].whitelistNumber)

            })

            it("how many input amount", async () => {
                let payTokenNumber, saleTokenNumber;

                payTokenNumber = ethers.BigNumber.from("60000");
                let tx = (await saleContract.calculPayToken(payTokenNumber))
                expect(tx).to.be.equal((calculPayToken(payTokenNumber)))

                payTokenNumber = ethers.BigNumber.from("120000");
                let tx2 = (await saleContract.calculPayToken(payTokenNumber))
                expect(tx2).to.be.equal((calculPayToken(payTokenNumber)))

                payTokenNumber = ethers.BigNumber.from("220000");
                let tx3 = (await saleContract.calculPayToken(payTokenNumber))
                expect(tx3).to.be.equal((calculPayToken(payTokenNumber)))

                payTokenNumber = ethers.BigNumber.from("600000");
                let tx4 = (await saleContract.calculPayToken(payTokenNumber))
                expect(tx4).to.be.equal((calculPayToken(payTokenNumber)))

            })


            it("calculTierAmount test after addwhiteList", async () => {

                for(let i=0; i< 4; i++){
                    tierAmount[i] = allocatedExclusiveSale.mul(ethers.BigNumber.from(tierPercentage[i]+"")).div(ethers.BigNumber.from("10000")).div(ethers.BigNumber.from(tierInfo[i].number+""));
                }

                await checkCalculTierAmount(account1.address, tierAmount);
                await checkCalculTierAmount(account2.address, tierAmount);
                await checkCalculTierAmount(account3.address, tierAmount);
                await checkCalculTierAmount(account4.address, tierAmount);
                await checkCalculTierAmount(account5.address, tierAmount);
                await checkCalculTierAmount(account6.address, tierAmount);
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

            it("It can be purchased multiple times only for the allocated amount on ExclusiveSale", async () => {

                let possibleSaleAmount = await saleContract.connect(account1).calculTierAmount(account1.address);
                possibleSaleAmount = possibleSaleAmount.div(ethers.BigNumber.from('2'))
                // console.log('possibleSaleAmount/2',ethers.utils.formatUnits(possibleSaleAmount.toString(),18));
                let possiblePuchaseAmount = calculPayToken(possibleSaleAmount);
                // console.log('possiblePuchaseAmount', ethers.utils.formatUnits(possiblePuchaseAmount.toString(),18));

                await getToken.connect(account1).approve(saleContract.address, possiblePuchaseAmount)
                await saleContract.connect(account1).exclusiveSale(possiblePuchaseAmount)
                let tx = await saleContract.usersEx(account1.address)
                expect(tx.payAmount).to.be.equal(possiblePuchaseAmount)

                await getToken.connect(account1).approve(saleContract.address, possiblePuchaseAmount)
                await saleContract.connect(account1).exclusiveSale(possiblePuchaseAmount)
                tx = await saleContract.usersEx(account1.address)
                expect(tx.payAmount).to.be.equal(possiblePuchaseAmount.mul(ethers.BigNumber.from('2')))

                tester1.exclusiveSalePayAmount = tx.payAmount;
                tester1.exclusiveSaleBuyAmount = possibleSaleAmount.add(possibleSaleAmount);

                await expect(saleContract.connect(account1).exclusiveSale(possiblePuchaseAmount)).to.be.revertedWith("PublicSale: just buy tier's allocated amount")
            })
            it("exclusiveSale after exclusive startTime", async () => {
                let possibleSaleAmount = await saleContract.connect(account2).calculTierAmount(account2.address);
                let possiblePuchaseAmount = calculPayToken(possibleSaleAmount);

                await getToken.connect(account2).approve(saleContract.address, possiblePuchaseAmount)
                await saleContract.connect(account2).exclusiveSale(possiblePuchaseAmount)
                let tx2 = await saleContract.usersEx(account2.address)
                expect(tx2.payAmount).to.be.equal(possiblePuchaseAmount)

                tester2.exclusiveSalePayAmount = tx2.payAmount;
                tester2.exclusiveSaleBuyAmount = possibleSaleAmount;
            })

            it("exclusiveSale after exclusive startTime : account3", async () => {
                let possibleSaleAmount = await saleContract.connect(account3).calculTierAmount(account3.address);
                let possiblePuchaseAmount = calculPayToken(possibleSaleAmount);
                await getToken.connect(account3).approve(saleContract.address, possiblePuchaseAmount)
                await saleContract.connect(account3).exclusiveSale(possiblePuchaseAmount)
                let tx3 = await saleContract.usersEx(account3.address)
                expect((tx3.payAmount)).to.be.equal(possiblePuchaseAmount)

                tester3.exclusiveSalePayAmount = tx3.payAmount;
                tester3.exclusiveSaleBuyAmount = possibleSaleAmount;
            })

            it("exclusiveSale after exclusive startTime : account4", async () => {
                let possibleSaleAmount = await saleContract.connect(account4).calculTierAmount(account4.address);
                let possiblePuchaseAmount = calculPayToken(possibleSaleAmount);

                await getToken.connect(account4).approve(saleContract.address, possiblePuchaseAmount)
                await saleContract.connect(account4).exclusiveSale(possiblePuchaseAmount)
                let tx2 = await saleContract.usersEx(account4.address)
                expect(tx2.payAmount).to.be.equal(possiblePuchaseAmount)

                tester4.exclusiveSalePayAmount = tx2.payAmount;
                tester4.exclusiveSaleBuyAmount = possibleSaleAmount;
            })

            it("Accounts not on the whitelist is reverted. : account5", async () => {
                let possibleSaleAmount = await saleContract.connect(account5).calculTierAmount(account5.address);

                expect(possibleSaleAmount).to.be.equal(ethers.BigNumber.from("0"))
                await expect(saleContract.connect(account5).exclusiveSale(possibleSaleAmount)).to.be.revertedWith("PublicSale: zero");

                await expect(saleContract.connect(account5).exclusiveSale(ethers.BigNumber.from("1000"))).to.be.revertedWith("PublicSale: not registered in whitelist");
            })


            it("exclusiveSale after exclusive startTime : account6", async () => {
                let possibleSaleAmount = await saleContract.connect(account6).calculTierAmount(account6.address);
                possibleSaleAmount = possibleSaleAmount.div(ethers.BigNumber.from('2'))
                let possiblePuchaseAmount = calculPayToken(possibleSaleAmount);

                await getToken.connect(account6).approve(saleContract.address, possiblePuchaseAmount)
                await saleContract.connect(account6).exclusiveSale(possiblePuchaseAmount)
                let tx2 = await saleContract.usersEx(account6.address)
                expect(tx2.payAmount).to.be.equal(possiblePuchaseAmount)

                tester6.exclusiveSalePayAmount = tx2.payAmount;
                tester6.exclusiveSaleBuyAmount = possibleSaleAmount;
            })
        })

        describe("withdraw test", () => {
            it("withdraw fial when not owner ", async () => {
                await expect(saleContract.connect(account6).withdraw()).to.be.revertedWith("Accessible: Caller is not an admin")
            })
            it("withdraw fial when no withdrawable amount ", async () => {
                await expect(saleContract.connect(saleOwner).withdraw()).to.be.revertedWith("PublicSale: no withdrawable amount")
            })
            it("withdraw when it has a withdrawable amount ", async () => {
                let amount = ethers.BigNumber.from('1','0'.repeat(20))
                await saleToken.connect(saleTokenOwner).transfer(saleContract.address, amount)

                let balanceOfProjectTokenBefore = await saleToken.balanceOf(saleContract.address)
                await saleContract.connect(saleOwner).withdraw()
                let balanceOfProjectTokenAfter = await saleToken.balanceOf(saleContract.address)

                expect(balanceOfProjectTokenAfter).to.be.equal(balanceOfProjectTokenBefore.sub(amount))
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

            it("check the opensale's allocated amount after exclusive-end", async () => {
                let totalPayAmount = tester1.exclusiveSalePayAmount.add(tester2.exclusiveSalePayAmount).add(tester3.exclusiveSalePayAmount).add(tester4.exclusiveSalePayAmount)
                .add(tester5.exclusiveSalePayAmount).add(tester6.exclusiveSalePayAmount)
                let totalPayAmountToSaleAmount = calculSaleToken(totalPayAmount);
                openSaleAmountAdjust = await saleContract.totalExpectOpenSaleAmountView();
                expect(openSaleAmountAdjust).to.be.equal(allocatedSaleAmount.sub(totalPayAmountToSaleAmount))
            });

            it("Can be deposited multiple times after depositTime : account1 ", async () => {
                let tester = tester1
                let account = account1
                let balance = await getToken.balanceOf(account.address)
                tester.depositAmountPayToken = balance.div(ethers.BigNumber.from('4'))
                await getToken.connect(account).approve(saleContract.address, tester.depositAmountPayToken)
                await saleContract.connect(account).deposit(tester.depositAmountPayToken)

                await getToken.connect(account).approve(saleContract.address, tester.depositAmountPayToken)
                await saleContract.connect(account).deposit(tester.depositAmountPayToken)

                tester.depositAmountPayToken = tester.depositAmountPayToken.add(tester.depositAmountPayToken)

                let tx = await saleContract.usersOpen(account.address)

                expect((tx.depositAmount)).to.be.equal(tester.depositAmountPayToken)
            });

            it("deposit after depositTime : account2 , account3, account6 ", async () => {
                let testers = [tester2, tester3, tester6]
                let accounts = [account2 , account3, account6]

                for(let i = 0; i < 3; i++){
                    let tester = testers[i]
                    let account = accounts[i]

                    let balance = await getToken.balanceOf(account.address)
                    tester.depositAmountPayToken = balance.div(ethers.BigNumber.from('2'))
                    await getToken.connect(account).approve(saleContract.address, tester.depositAmountPayToken)
                    await saleContract.connect(account).deposit(tester.depositAmountPayToken)

                    let tx = await saleContract.usersOpen(account.address)
                    expect((tx.depositAmount)).to.be.equal(tester.depositAmountPayToken)
                }
            });

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

            it("check the totalClaimReward of userClaim : tester1, tester2, tester3, tester4, tester5, tester6", async () => {
                let testers = [tester1, tester2, tester3, tester4, tester5, tester6]
                let accounts = [account1, account2, account3, account4, account5, account6]

                for(let i = 0; i < 3; i++){
                    let tester = testers[i]
                    let account = accounts[i]
                    let tx = await saleContract.usersClaim(account.address)
                    let totalClaimReward = tester.exclusiveSaleBuyAmount;
                    expect((tx.totalClaimReward)).to.be.equal(totalClaimReward)
                }
            })

            it("totalDepositAmountPayToken", async () => {

                totalDepositAmountPayToken = tester1.depositAmountPayToken.add(tester2.depositAmountPayToken)
                .add(tester3.depositAmountPayToken)
                .add(tester4.depositAmountPayToken)
                .add(tester5.depositAmountPayToken)
                .add(tester6.depositAmountPayToken)
            })
            /*
            it("openSale : tester1, tester2, tester3, tester6", async () => {
                let testers = [tester1, tester2, tester3, tester6]
                let accounts = [account1, account2, account3, account6]

                for(let i = 0; i < 3; i++){
                    let tester = testers[i]
                    let account = accounts[i]

                    let myAvailableProjectSaleAmount = openSaleAmountAdjust.mul(tester.depositAmountPayToken).div(totalDepositAmountPayToken)
                    let myAvailablePayAmount = calculPayToken(myAvailableProjectSaleAmount)
                    let refundAmount = ethers.BigNumber.from('0')
                    if(tester.depositAmountPayToken.gt(myAvailablePayAmount)) refundAmount = tester.depositAmountPayToken.sub(myAvailablePayAmount)

                    let beforeTON = await getToken.balanceOf(account.address)
                    let tx = await saleContract.connect(account).openSale()

                    let afterTON = await getToken.balanceOf(account.address)
                    if(refundAmount.gt(ethers.BigNumber.from('0'))){
                        expect(afterTON).to.be.equal(beforeTON.add(refundAmount))
                    }

                    let usersOpen = await saleContract.usersOpen(account.address)
                    tester.openSaleBuyAmount = tester.openSaleBuyAmount.add(usersOpen.saleAmount)
                    expect(usersOpen.saleAmount).to.be.above(ethers.BigNumber.from('0'))

                    tx = await saleContract.usersClaim(account.address)
                    let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
                    expect((tx.totalClaimReward)).to.be.equal(totalClaimReward)

                }
            })

            it("openSale : account4", async () => {
                let tester = tester4
                let account = account4
                await expect(saleContract.connect(account).openSale()).to.be.revertedWith("PublicSale: not deposit")
            })
            it("openSale : account5", async () => {
                let tester = tester5
                let account = account5
                await expect(saleContract.connect(account).openSale()).to.be.revertedWith("PublicSale: not deposit")
            })
            */
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

        it("claim period = 1, tester1, tester4", async () => {
            let testers = [tester1, tester4]
            //let testers = [tester1]

            let accounts = [account1, account4]

            for(let i = 0; i < testers.length ; i++){
                let tester = testers[i]
                let account = accounts[i]
                let userSaleAmount = (await saleContract.totalSaleUserAmount(account.address))
                console.log('userSaleAmount._realPayAmount ', userSaleAmount._realPayAmount.toString());
                console.log('userSaleAmount._realSaleAmount ', userSaleAmount._realSaleAmount.toString());
                console.log('userSaleAmount._refundAmount ', userSaleAmount._refundAmount.toString());

                let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
                let expectClaim = (await saleContract.calculClaimAmount(account.address))
                //(await saleContract.connect(account).calculClaimAmountTransaction(account.address))

                let usersClaimPrev = await saleContract.usersClaim(account.address)

                console.log('** expectClaim ', expectClaim.toString());
                console.log('** usersClaimPrev.claimAmount ', usersClaimPrev.claimAmount.toString());


                let tx = await saleContract.usersClaim(account.address)
                expect(tx.claimAmount).to.be.equal(ethers.BigNumber.from('0'))
                // expect(tx.periodReward).to.be.equal(totalClaimReward.div(ethers.BigNumber.from(claimPeriod+"")))
                // expect(expectClaim).to.be.equal(tx.periodReward)


                console.log('-------------------- claim start ', i, account.address);
                await saleContract.connect(account).claim()
                console.log('-------------------- claim end ', i, account.address);

                let usersClaim = await saleContract.usersClaim(account.address)
                console.log('**usersClaim.claimAmount ', usersClaim.claimAmount.toString());

                expect(usersClaim.claimAmount).to.be.equal(expectClaim)

                let balanceOfProjectToken = await saleToken.balanceOf(account.address)
                expect(balanceOfProjectToken).to.be.equal(expectClaim)
            }

        })


        it("claim period = 1, account5", async () => {
            let tester = tester5
            let account = account5

            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            expect(totalClaimReward).to.be.equal(ethers.BigNumber.from('0'))

            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            expect(expectClaim).to.be.equal(ethers.BigNumber.from('0'))

            let tx = await saleContract.usersClaim(account.address)
            expect(tx.claimAmount).to.be.equal(ethers.BigNumber.from('0'))
            expect(expectClaim).to.be.equal(tx.periodReward)

            await expect(saleContract.connect(account).claim()).to.be.revertedWith("PublicSale: no purchase amount")
        })

        it("duration the time to period = 2", async () => {
            let period2 = claimStartTime + 86400
            await ethers.provider.send('evm_setNextBlockTimestamp', [period2]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 2, tester1", async () => {
            let tester = tester1
            let account = account1
            let period = 2;

            let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            let usersClaim = await saleContract.usersClaim(account.address)
            //expect(expectClaim).to.be.equal(usersClaim.periodReward)

            await saleContract.connect(account).claim()
            let usersClaimAfter = await saleContract.usersClaim(account.address)
            expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

            let balanceOfProjectToken = await saleToken.balanceOf(account.address)
            expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))

        })

        it("claim period = 2, tester2", async () => {
            let tester = tester2
            let account = account2

            let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            let usersClaim = await saleContract.usersClaim(account.address)

            //expect(expectClaim).to.be.equal(usersClaim.periodReward.mul(ethers.BigNumber.from('2')))

            await saleContract.connect(account).claim()
            let usersClaimAfter = await saleContract.usersClaim(account.address)
            expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

            let balanceOfProjectToken = await saleToken.balanceOf(account.address)
            expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))

        })

        it("duration the time to period = 3", async () => {
            let period3 = claimStartTime + (86400*2)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period3]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 3, tester1, tester2", async () => {
            let testers = [tester1, tester2]
            let accounts = [account1, account2]

            for(let i = 0; i < testers.length ; i++){
                let tester = testers[i]
                let account = accounts[i]

                let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
                let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
                let expectClaim = (await saleContract.calculClaimAmount(account.address))
                let usersClaim = await saleContract.usersClaim(account.address)
                // expect(expectClaim).to.be.equal(usersClaim.periodReward)

                await saleContract.connect(account).claim()
                let usersClaimAfter = await saleContract.usersClaim(account.address)
                expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

                let balanceOfProjectToken = await saleToken.balanceOf(account.address)
                expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))
            }
        })

        it("claim period = 3, tester3", async () => {
            let tester = tester3
            let account = account3

            let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            let usersClaim = await saleContract.usersClaim(account.address)

            //expect(expectClaim).to.be.equal(usersClaim.periodReward.mul(ethers.BigNumber.from('3')))

            await saleContract.connect(account).claim()
            let usersClaimAfter = await saleContract.usersClaim(account.address)
            expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

            let balanceOfProjectToken = await saleToken.balanceOf(account.address)
            expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))

        })

        it("duration the time to period = 4", async () => {
            let period4 = claimStartTime + (86400*3)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period4]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 4, tester1, tester2, tester3", async () => {
            let testers = [tester1, tester2, tester3]
            let accounts = [account1, account2, account3]

            for(let i = 0; i < testers.length ; i++){
                let tester = testers[i]
                let account = accounts[i]

                let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
                let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
                let expectClaim = (await saleContract.calculClaimAmount(account.address))
                let usersClaim = await saleContract.usersClaim(account.address)
                // expect(expectClaim).to.be.equal(usersClaim.periodReward)

                await saleContract.connect(account).claim()
                let usersClaimAfter = await saleContract.usersClaim(account.address)
                expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

                let balanceOfProjectToken = await saleToken.balanceOf(account.address)
                expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))
            }
        })

        it("duration the time to period = 5", async () => {
            let period5 = claimStartTime + (86400*4)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period5]);
            await ethers.provider.send('evm_mine');
        })
        it("claim period = 5, tester1, tester2, tester3 ", async () => {
            let testers = [tester1, tester2, tester3]
            let accounts = [account1, account2, account3]

            for(let i = 0; i < testers.length ; i++){
                let tester = testers[i]
                let account = accounts[i]

                let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
                let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
                let expectClaim = (await saleContract.calculClaimAmount(account.address))
                let usersClaim = await saleContract.usersClaim(account.address)
               // expect(expectClaim).to.be.equal(usersClaim.periodReward)

                await saleContract.connect(account).claim()
                let usersClaimAfter = await saleContract.usersClaim(account.address)
                expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

                let balanceOfProjectToken = await saleToken.balanceOf(account.address)
                expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))
            }
        })


        it("claim period = 5, tester4", async () => {
            let tester = tester4
            let account = account4

            let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            let usersClaim = await saleContract.usersClaim(account.address)

            //expect(expectClaim).to.be.equal(usersClaim.periodReward.mul(ethers.BigNumber.from('4')))

            await saleContract.connect(account).claim()
            let usersClaimAfter = await saleContract.usersClaim(account.address)
            expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

            let balanceOfProjectToken = await saleToken.balanceOf(account.address)
            expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))

        })

        it("duration the time to period = 6", async () => {
            let period6 = claimStartTime + (86400*5)
            await ethers.provider.send('evm_setNextBlockTimestamp', [period6]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period = 6, tester2, tester3, tester4", async () => {
            let testers = [tester2, tester3, tester4]
            let accounts = [account2, account3, account4]

            for(let i = 0; i < testers.length ; i++){
                let tester = testers[i]
                let account = accounts[i]

                let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
                let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
                let expectClaim = (await saleContract.calculClaimAmount(account.address))
                let usersClaim = await saleContract.usersClaim(account.address)
                //expect(expectClaim).to.be.equal(totalClaimReward.sub(usersClaim.claimAmount))

                await saleContract.connect(account).claim()
                let usersClaimAfter = await saleContract.usersClaim(account.address)
                expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

                let balanceOfProjectToken = await saleToken.balanceOf(account.address)
                expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))
            }
        })


        it("duration the time to period end", async () => {
            let periodEnd = claimStartTime + (86400*7)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("claim period end, tester1", async () => {
            let tester = tester1
            let account = account1

            let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            let usersClaim = await saleContract.usersClaim(account.address)

            //expect(expectClaim).to.be.equal(totalClaimReward.sub(usersClaim.claimAmount))

            await saleContract.connect(account).claim()
            let usersClaimAfter = await saleContract.usersClaim(account.address)
            expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

            let balanceOfProjectToken = await saleToken.balanceOf(account.address)
            expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))

        })
        it("claim period end, tester6", async () => {
            let tester = tester6
            let account = account6

            let balanceOfProjectTokenBefore = await saleToken.balanceOf(account.address)
            let totalClaimReward = tester.exclusiveSaleBuyAmount.add(tester.openSaleBuyAmount);
            let expectClaim = (await saleContract.calculClaimAmount(account.address))
            let usersClaim = await saleContract.usersClaim(account.address)

            //expect(expectClaim).to.be.equal(totalClaimReward.sub(usersClaim.claimAmount))

            await saleContract.connect(account).claim()
            let usersClaimAfter = await saleContract.usersClaim(account.address)
            expect(usersClaimAfter.claimAmount).to.be.equal(usersClaim.claimAmount.add(expectClaim))

            let balanceOfProjectToken = await saleToken.balanceOf(account.address)
            expect(balanceOfProjectToken).to.be.equal(balanceOfProjectTokenBefore.add(expectClaim))

        })

    })

    /*
    describe("withdraw test", () => {
        it("withdraw fial when not owner ", async () => {
            await expect(saleContract.connect(account6).withdraw()).to.be.revertedWith("Accessible: Caller is not an admin")
        })

        it("withdraw when it has a withdrawable amount ", async () => {

            let totalSale = ethers.BigNumber.from('0')
            let testers = [tester1, tester2, tester3, tester4,tester5,tester6]

            for(let i=0; i< testers.length; i++ ){
                let tester = testers[i]
                totalSale = totalSale.add(tester.exclusiveSaleBuyAmount).add(tester.openSaleBuyAmount)
            }

            let refund = allocatedSaleAmount.sub(totalSale)
            let balanceOfProjectTokenBefore = await saleToken.balanceOf(saleOwner.address)
            await saleContract.connect(saleOwner).withdraw()
            let balanceOfProjectTokenAfter = await saleToken.balanceOf(saleOwner.address)

            expect(balanceOfProjectTokenAfter).to.be.equal(balanceOfProjectTokenBefore.add(refund))
        })
    })
    */
})
