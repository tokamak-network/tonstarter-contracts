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

const {
    ICO20Contracts,
    PHASE2_ETHTOS_Staking,
    PHASE2_MINING_PERSECOND,
    HASH_PHASE2_ETHTOS_Staking,
} = require("../../utils/ico_test_deploy_ethers.js");

const {
    deployedUniswapV3Contracts,
    FeeAmount,
    TICK_SPACINGS,
    getMinTick,
    getMaxTick,
    getNegativeOneTick,
    getPositiveOneMaxTick,
    encodePriceSqrt,
    getUniswapV3Pool,
    getBlock,
    mintPosition2,
    getTick,
    // getMaxLiquidityPerTick,
  } = require("./uniswap-v3/uniswap-v3-contracts");

const LockTOS_ABI = require("../..//artifacts/contracts/stake/LockTOS.sol/LockTOS.json");
const PublicSale_ABI = require('../../artifacts/contracts/sale/publicSale.sol/PublicSale.json');
const PublicSale2_ABI = require('../../artifacts/contracts/sale/PublicSale2.sol/PublicSale2.json');

const zeroAddress = "0x0000000000000000000000000000000000000000";

describe("publicSale", () => {
    let testTotalSalesAmount = ethers.utils.parseUnits("1500000", 18);


    let claimPercent1 = 30;
    let claimPercent2 = 20;
    let claimPercent3 = 20;
    let claimPercent4 = 10;
    let claimPercent5 = 10;
    let claimPercent6 = 10;
    
    let claimTime1, claimTime2, claimTime3, claimTime4, claimTime5, claimTime6;

    let claimCounts = 6;
    
    let saleTokenPrice = 12;
    let payTokenPrice = 12000;

    let saleTokenOwner;         //doc
    let getTokenOwner;         //ton
    let tosTokenOwner;          //sTOS
    let saleOwner;              //publicContract
    let vaultAddress;
    let vaultAmount = ethers.utils.parseUnits("500000", 18);            //500,000 token -> 500 TON
    let hardcapAmount = ethers.utils.parseUnits("100", 18);     
    let changeTOS = 10;
    let minPer = 5;
    let maxPer = 10;

    let account1;
    let account2;
    let account3;
    let account4;
    let account5;
    let account6;
    let uniswapAccount;
    
    let ico20Contracts;
    let TokamakContractsDeployed;
    let ICOContractsDeployed;

    // let account3 = accounts[6];   
    // let account4 = accounts[7];
    let balance1, balance2, balance3;
    
    let erc20token, erc20snapToken, saleToken, getToken, tosToken, deploySale, saleContract;

    // let BN = toBN("1");
    // let basicAmount = toBN("1000");

    let basicAmount = 1000000;          //round1 판매량
    let totalSaleAmount = 1000000;      //round2 판매량
    let round1SaleAmount = ethers.utils.parseUnits("1000000", 18);
    let round2SaleAmount = ethers.utils.parseUnits("1000000", 18);
    let totalBigAmount = ethers.utils.parseUnits("2000000", 18); //round1, round2 판매량

    let account1BigTONAmount = ethers.utils.parseUnits("200", 18);
    let account1BigWTONAmount = ethers.utils.parseUnits("60", 27);
    let account2BigTONAmount = ethers.utils.parseUnits("120", 18);
    // let account2BigWTONAmount = ethers.utils.parseUnits("400", 27);
    let account2BigWTONAmount = ethers.utils.parseUnits("100", 27);
    let account3BigTONAmount = ethers.utils.parseUnits("520", 18);
    let account3BigWTONAmount = ethers.utils.parseUnits("300", 27);
    let account4BigTONAmount = ethers.utils.parseUnits("1100", 18);
    let account4BigWTONAmount = ethers.utils.parseUnits("1100", 27);
    let account6BigTONAmount = ethers.utils.parseUnits("300", 18);

    let refundAmount1 = ethers.utils.parseUnits("100", 18);
    let refundAmount2 = ethers.utils.parseUnits("200", 18);
    let refundAmount3 = ethers.utils.parseUnits("300", 18);
    let refundAmount4 = ethers.utils.parseUnits("400", 18);

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

    let claimInterval = 86400;  //86400은 하루
    let claimPeriod = 6;
    let claimTestTime;
    let claimFirst = 50;

    let tos, ton, lockTOS, lockTOSImpl, lockTOSProxy ;
    let epochUnit, maxTime;
    const name = "TONStarter";
    const symbol = "TOS";
    const version = "1.0";
    // const tosAmount = ethers.BigNumber.from('100000000000000000000');
    const tosAmount = 100000000000;
    const tosuniAmount = ethers.utils.parseUnits("1000000", 18);
    const wtonuniAmount = ethers.utils.parseUnits("1000000", 27);
    let deployer, user1, user2;
    let defaultSender;
    let userLockInfo = [];
    let account1Before, account1After;
    let account2Before, account2After;
    let account3Before, account3After;
    let account4Before, account4After;
    let publicFactory;

    let publicProxy;
    let publicLogic;
    let publicSaleContract;

    let deploySaleImpl;
    let uniswapRouter;
    let testTemp;
    let wtonTosPool;
    let initialliquidityVault;
    let initialVaultFactory;
    let initialVaultLogic;

    let addressVault;
    let eventLogAddress;

    let upgradeAdmin;

    let deployTime;

    let tester1 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        wtonAmount: null,
        tonAmount: null
    }
    let tester2 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        wtonAmount: null,
        tonAmount: null
    }

    let tester3 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        wtonAmount: null,
        tonAmount: null
    }

    let tester4 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        wtonAmount: null,
        tonAmount: null
    }

    let tester6 = {
        account: null,
        lockTOSIds: [],
        balanceOf: 0,
        snapshot: 0,
        balanceOfAt: 0,
        wtonAmount: null,
        tonAmount: null
    }

    let saleContracts = [
        {
         name : "Test1",
         owner : null,
         contractAddress: null,
         index : null,
  
        },
        {
         name : "Test2",
         owner : null,
         contractAddress: null,
         index : null
        },
        {
         name : "Test3",
         owner : null,
         contractAddress: null,
         index : null
        },
    ]

    let uniswapInfo={
        poolfactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        npm: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        wethUsdcPool: "0xfbDc20aEFB98a2dD3842023f21D17004eAefbe68",
        wtonWethPool: "0xE032a3aEc591fF1Ca88122928161eA1053a098AC",
        wtonTosPool: "0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf",
        wton: "0x709bef48982Bbfd6F2D4Be24660832665F53406C",
        tos: "0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd",
        weth: "0xc778417e063141139fce010982780140aa0cd5ab",
        usdc: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8abe2b",
        _fee: ethers.BigNumber.from("3000"),
        NonfungibleTokenPositionDescriptor: "0x91ae842A5Ffd8d12023116943e72A606179294f3"
    } 

    let price = {
        tos: ethers.BigNumber.from("1000"),
        projectToken:  ethers.BigNumber.from("100"),
        initSqrtPrice: 0,
        initTick: 0,
        targetPriceInterval: 1,
        targetInterval: 1,
        tickPrice: 0
    }

    before(async () => {
        ico20Contracts = new ICO20Contracts();

        const addresses = await getAddresses();
        defaultSender = addresses[0];
        saleTokenOwner = await findSigner(addresses[0]);
        // console.log("defaultSender :", defaultSender)
        // console.log("saleTokenOwner :", saleTokenOwner)
        getTokenOwner = await findSigner(addresses[1]);
        tosTokenOwner = await findSigner(addresses[2]);
        saleOwner = await findSigner(addresses[3]);
        account1 = await findSigner(addresses[4]);
        account2 = await findSigner(addresses[5]);
        account3 = await findSigner(addresses[6]);
        account4 = await findSigner(addresses[7]);
        account5 = await findSigner(addresses[8]);
        account6 = await findSigner(addresses[9]);
        vaultAddress = await findSigner(addresses[10]);
        // uniswapRouter = await findSigner(addresses[11]);
        // testTemp = await findSigner(addresses[12]); 
        // uniswapAccount = await findSigner(addresses[13]);
        // upgradeAdmin = await findSigner(addresses[14]);

        // accounts = awar, getTokit ethers.getSigners();
        // [saleTokenOwneenOwner, tosTokenOwner, saleOwner, account1, account2, account3, account4, account6 ] = accounts;

        saleContracts[0].owner = saleOwner;
        saleContracts[1].owner = account1;
        saleContracts[2].owner = account2;

        deployer = saleTokenOwner;
        tester1.account = account1;
        tester2.account = account2;
        tester3.account = account3;
        tester4.account = account4;
        tester6.account = account6;
        
        // for sTOS
        epochUnit = 60*60*1;  // 1시간
        maxTime = epochUnit * 156;
    });

    describe("Initialize TON, TOS, LockTOS", () => {
        //saleToken Deploy
        it("Initialize Sale Token", async function () {
            erc20token = await ethers.getContractFactory("ERC20Mock");
            saleToken = await erc20token.connect(saleTokenOwner).deploy("test", "ABC");
        });

        //TOS Contract deploy
        it("Initialize TOS", async function () {
            const TOS = await ethers.getContractFactory("TOS");
            tos = await TOS.deploy(name, symbol, version);
            await tos.deployed();
            uniswapInfo.tos = tos.address;
        });

        //LockTOS Contract deploy (need the TOS staking)
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

        //give the TOS
        it("mint TOS to users", async function () {
            await (await tos.connect(deployer).mint(tester1.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester1.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester2.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester2.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester3.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester3.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester4.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester4.account.address)).to.be.equal(tosAmount);

            await (await tos.connect(deployer).mint(tester6.account.address, tosAmount)).wait();
            expect(await tos.balanceOf(tester6.account.address)).to.be.equal(tosAmount);

            // await (await tos.connect(deployer).mint(uniswapAccount.address, tosuniAmount)).wait();
            // expect(await tos.balanceOf(uniswapAccount.address)).to.be.equal(tosuniAmount);
        });

        describe("# 1. Deploy WTON, TON", async function() {
            it("1. ico20Contracts init  ", async function () {
                this.timeout(1000000);
                ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
                    defaultSender
                );
            });
            
            //ton, wton deploy
            it("2. tokamakContracts init  ", async function () {
                this.timeout(1000000);
                TokamakContractsDeployed =
                  await ico20Contracts.initializePlasmaEvmContracts(defaultSender);
                console.log("1");
                const cons = await ico20Contracts.getPlasamContracts();
          
                ton = cons.ton;
                wton = cons.wton;
          
                await ton.mint(defaultSender, ethers.utils.parseUnits("1000", 18), {
                  from: defaultSender,
                });
                await wton.mint(defaultSender, ethers.utils.parseUnits("1000", 27), {
                  from: defaultSender,
                });

                // await wton.mint(uniswapAccount.address, wtonuniAmount, {
                //     from: defaultSender,
                // });

                // expect(await wton.balanceOf(uniswapAccount.address)).to.be.equal(wtonuniAmount);
    
                // await ton.mint(tester1.account.address, tester1.tonAmount, {
                //     from: defaultSender,
                // });
                // await ton.mint(tester2.account.address, tester2.tonAmount, {
                //     from: defaultSender,
                // });
                // await ton.mint(tester3.account.address, tester3.tonAmount, {
                //     from: defaultSender,
                // });
          
                // await wton.mint(tester1.account.address, tester1.wtonAmount, {
                //     from: defaultSender,
                // });
                // await wton.mint(tester2.account.address, tester2.wtonAmount, {
                //     from: defaultSender,
                // });
                // await wton.mint(tester3.account.address, tester3.wtonAmount, {
                //     from: defaultSender,
                // });
            });
        })

    });

    describe("deploy the PublicSaleProxy and PublicSaleLogic", () => {
        it("Initialize Funding Token", async () => {
            getToken = ton;
        });

        it("deploy PublicSale and setting", async () => {
            const PublicSaleProxy = await ethers.getContractFactory("PublicSaleProxy");
            publicProxy = await PublicSaleProxy.connect(saleTokenOwner).deploy();

            let code = await saleTokenOwner.provider.getCode(publicProxy.address);
            expect(code).to.not.eq("0x");

            const PublicSale = await ethers.getContractFactory("PublicSale");
            publicLogic = await PublicSale.connect(saleTokenOwner).deploy();

            let code1 = await saleTokenOwner.provider.getCode(publicLogic.address);
            expect(code1).to.not.eq("0x");

            await publicProxy.connect(saleTokenOwner).upgradeTo(publicLogic.address);
            
            deployTime = Number(await time.latest())
            console.log(deployTime)

            await publicProxy.connect(saleTokenOwner).initialize(
                saleToken.address,
                saleTokenOwner.address,
                saleTokenOwner.address
            );

            await publicProxy.connect(saleTokenOwner).changeBasicSet(
                getToken.address,
                lockTOS.address,
                wton.address,
                wton.address,
                tos.address
            );

            await publicProxy.connect(saleTokenOwner).setMaxMinPercent(
                minPer,
                maxPer
            )

            await publicProxy.connect(saleTokenOwner).setSTOSstandard(
                100,
                200,
                1000,
                4000
            )
            
            //delay = 600
            await publicProxy.connect(saleTokenOwner).setDelayTime(
                600
            )

            publicSaleContract = new ethers.Contract(publicProxy.address, PublicSale_ABI.abi, ethers.provider);
        })

        it("send the token", async () => {
            await saleToken.connect(saleTokenOwner).transfer(publicSaleContract.address, totalBigAmount)

            await getToken.connect(saleTokenOwner).transfer(account1.address, account1BigTONAmount)
            await wton.mint(account1.address, account1BigWTONAmount, {
                from: defaultSender,
            });
            await getToken.connect(saleTokenOwner).mint(account2.address, account2BigTONAmount)
            await wton.mint(account2.address, account2BigWTONAmount, {
                from: defaultSender,
            });
            await getToken.connect(saleTokenOwner).mint(account3.address, account3BigTONAmount)
            await wton.mint(account3.address, account3BigWTONAmount, {
                from: defaultSender,
            });
            await getToken.connect(saleTokenOwner).mint(account4.address, account4BigTONAmount)
            await getToken.connect(saleTokenOwner).mint(account6.address, account6BigTONAmount)
        })

        it("duration the time", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [deployTime + 605]);
            await ethers.provider.send('evm_mine');
        })

        it("should create locks for user", async function () {
            expect(await lockTOS.balanceOf(tester1.account.address)).to.be.equal(0);
            expect(await lockTOS.balanceOf(tester2.account.address)).to.be.equal(0);

            let id = await createLockWithPermit({
                user: tester1.account,
                amount: 15500,
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
                amount: 170000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester3.lockTOSIds.push(id);
            expect(id).to.be.equal(3);

            id = await createLockWithPermit({
                user: tester4.account,
                amount: 650000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester4.lockTOSIds.push(id);
            expect(id).to.be.equal(4);

            id = await createLockWithPermit({
                user: tester6.account,
                amount: 650000,
                unlockWeeks: 2,
                tos,
                lockTOS,
            });
            tester6.lockTOSIds.push(id);
            expect(id).to.be.equal(5);

            // ethers.provider.send("evm_increaseTime", [10])   // add 26 seconds
            // ethers.provider.send("evm_mine")      // mine the next block

            const block = await ethers.provider.getBlock('latest')
            if (!block) {
                throw new Error('null block returned from provider')
            }


            setSnapshot = block.timestamp;
            console.log(Number(setSnapshot))

            tester1.balanceOfAt = Number(await lockTOS.balanceOfAt(tester1.account.address, setSnapshot))
            
            tester2.balanceOfAt = Number(await lockTOS.balanceOfAt(tester2.account.address, setSnapshot))
            
            tester3.balanceOfAt = Number(await lockTOS.balanceOfAt(tester3.account.address, setSnapshot))
            
            tester4.balanceOfAt = Number(await lockTOS.balanceOfAt(tester4.account.address, setSnapshot))
            
            tester6.balanceOfAt = Number(await lockTOS.balanceOfAt(tester6.account.address, setSnapshot))
            console.log(tester1.balanceOfAt)
            console.log(tester2.balanceOfAt)
            console.log(tester3.balanceOfAt)
            console.log(tester4.balanceOfAt)
            console.log(tester6.balanceOfAt)
            
            expect(tester1.balanceOfAt).to.be.above(0);
            expect(tester2.balanceOfAt).to.be.above(0);
            expect(tester3.balanceOfAt).to.be.above(0);
            expect(tester4.balanceOfAt).to.be.above(0);

        });
    })

    describe("publicSale SaleSetting", async () => {
        it("check the balance (contract have the saleToken) ", async () => {
            balance1 = await saleToken.balanceOf(publicSaleContract.address)

            expect(Number(balance1)).to.be.equal(Number(totalBigAmount))
        })

        it('setAllsetting caller owner', async () => {
            blocktime = Number(await time.latest())
            whitelistStartTime = blocktime + 86400;
            whitelistEndTime = whitelistStartTime + (86400*7);
            exclusiveStartTime = whitelistEndTime + 1;
            exclusiveEndTime = exclusiveStartTime + (86400*7);
            depositStartTime = exclusiveEndTime;
            depositEndTime = depositStartTime + (86400*7);
            claimTime1 = depositEndTime + (86400 * 20);
            claimTime2 = claimTime1 + (60 * 1);
            claimTime3 = claimTime2 + (60 * 2);
            claimTime4 = claimTime3 + (60 * 3);
            claimTime5 = claimTime4 + (60 * 4);
            claimTime6 = claimTime5 + (60 * 4);

            await publicSaleContract.connect(saleTokenOwner).setAllsetting(
                [100, 200, 1000, 4000, 600, 1200, 2200, 6000],
                [round1SaleAmount, round2SaleAmount, saleTokenPrice, payTokenPrice, hardcapAmount, changeTOS],
                [setSnapshot, whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime, depositStartTime, depositEndTime, claimCounts],
                [claimTime1,claimTime2,claimTime3,claimTime4,claimTime5,claimTime6],
                [claimPercent1,claimPercent2,claimPercent3,claimPercent4,claimPercent5,claimPercent6]
            )

            let tx = await publicSaleContract.connect(saleTokenOwner).saleTokenPrice()
            let tx2 = await publicSaleContract.connect(saleTokenOwner).payTokenPrice()
            // console.log("tx : ", tx)
            expect(tx).to.be.equal(saleTokenPrice)
            // console.log("tx : ", tx2)
            expect(tx2).to.be.equal(payTokenPrice)

            let tx3 = Number(await publicSaleContract.connect(saleTokenOwner).totalExpectSaleAmount())
            // console.log("tx3 : ", tx3)
            expect(tx3).to.be.equal(Number(round1SaleAmount))
            let tx4 = Number(await publicSaleContract.connect(saleTokenOwner).totalExpectOpenSaleAmount())
            // console.log("tx4 : ", tx4)
            expect(tx4).to.be.equal(Number(round2SaleAmount))
            
            let tx5 = Number(await publicSaleContract.connect(saleTokenOwner).tiers(1))
            expect(tx5).to.be.equal(100)
            let tx6 = Number(await publicSaleContract.connect(saleTokenOwner).tiers(2))
            expect(tx6).to.be.equal(200)
            let tx7 = Number(await publicSaleContract.connect(saleTokenOwner).tiers(3))
            expect(tx7).to.be.equal(1000)
            let tx8 = Number(await publicSaleContract.connect(saleTokenOwner).tiers(4))
            expect(tx8).to.be.equal(4000)
            let tx9 = Number(await publicSaleContract.connect(saleTokenOwner).tiersPercents(1))
            expect(tx9).to.be.equal(600)
            let tx10 = Number(await publicSaleContract.connect(saleTokenOwner).tiersPercents(2))
            expect(tx10).to.be.equal(1200)
            let tx11 = Number(await publicSaleContract.connect(saleTokenOwner).tiersPercents(3))
            expect(tx11).to.be.equal(2200)
            let tx12 = Number(await publicSaleContract.connect(saleTokenOwner).tiersPercents(4))
            expect(tx12).to.be.equal(6000) 
            
            let tier1snap = Number(await lockTOS.balanceOfAt(tester1.account.address, setSnapshot))
            expect(tier1snap).to.be.above(100)
            let tier2snap = Number(await lockTOS.balanceOfAt(tester2.account.address, setSnapshot))
            expect(tier2snap).to.be.above(200)
            let tier3snap = Number(await lockTOS.balanceOfAt(tester3.account.address, setSnapshot))
            expect(tier3snap).to.be.above(1000)
            let tier4snap = Number(await lockTOS.balanceOfAt(tester4.account.address, setSnapshot))
            expect(tier4snap).to.be.above(4000) 
            let tier5snap = Number(await lockTOS.balanceOfAt(tester6.account.address, setSnapshot))
            expect(tier5snap).to.be.above(4000) 

            let tx13 = Number(await publicSaleContract.startExclusiveTime())
            expect(tx13).to.be.equal(exclusiveStartTime)
            let tx14 = Number(await publicSaleContract.endExclusiveTime())
            expect(tx14).to.be.equal(exclusiveEndTime)
            let tx15 = Number(await publicSaleContract.startAddWhiteTime())
            expect(tx15).to.be.equal(whitelistStartTime)
            let tx16 = Number(await publicSaleContract.endAddWhiteTime())
            expect(tx16).to.be.equal(whitelistEndTime)

            let tx17 = Number(await publicSaleContract.claimTimes(0))
            expect(tx17).to.be.equal(claimTime1)
            let tx18 = Number(await publicSaleContract.totalClaimCounts())
            expect(tx18).to.be.equal(claimCounts)
        })
    })

    describe("Sale", () => {
        describe("exclusiveSale Sale", () => {
            //calculTierAmount test
            it("calculTierAmount test before addwhiteList", async () => {
                let big60000 = ethers.utils.parseUnits("60000", 18);
                let big120000 = ethers.utils.parseUnits("120000", 18);
                let big220000 = ethers.utils.parseUnits("220000", 18);
                let big600000 = ethers.utils.parseUnits("600000", 18);
                let tx = Number(await publicSaleContract.calculTierAmount(account1.address))
                expect(tx).to.be.equal(Number(big60000))
                let tx2 = Number(await publicSaleContract.calculTierAmount(account2.address))
                expect(tx2).to.be.equal(Number(big120000))
                let tx3 = Number(await publicSaleContract.calculTierAmount(account3.address))
                expect(tx3).to.be.equal(Number(big220000))
                let tx4 = Number(await publicSaleContract.calculTierAmount(account4.address))
                expect(tx4).to.be.equal(Number(big600000))
                let tx5 = Number(await publicSaleContract.calculTierAmount(account6.address))
                expect(tx5).to.be.equal(Number(big600000))
            })

            it("duration the time", async () => {
                604800
                await ethers.provider.send('evm_setNextBlockTimestamp', [whitelistStartTime]);
                await ethers.provider.send('evm_mine');
            })

            //addwhiteList test and data check
            it("addwhiteList", async () => {
                let tx = Number(await publicSaleContract.connect(tester1.account).tiersAccount(1))
                expect(tx).to.be.equal(0)
                await publicSaleContract.connect(tester1.account).addWhiteList()
                let tx2 = Number(await publicSaleContract.connect(tester1.account).tiersAccount(1))
                expect(tx2).to.be.equal(1)

                let tx3 = Number(await publicSaleContract.connect(tester2.account).tiersAccount(2))
                expect(tx3).to.be.equal(0)
                await publicSaleContract.connect(tester2.account).addWhiteList()
                let tx4 = Number(await publicSaleContract.connect(tester2.account).tiersAccount(2))
                expect(tx4).to.be.equal(1)

                let tx5 = Number(await publicSaleContract.connect(tester3.account).tiersAccount(3))
                expect(tx5).to.be.equal(0)
                await publicSaleContract.connect(tester3.account).addWhiteList()
                let tx6 = Number(await publicSaleContract.connect(tester3.account).tiersAccount(3))
                expect(tx6).to.be.equal(1)

                let tx7 = Number(await publicSaleContract.connect(tester4.account).tiersAccount(4))
                expect(tx7).to.be.equal(0)
                await publicSaleContract.connect(tester4.account).addWhiteList()
                let tx8 = Number(await publicSaleContract.connect(tester4.account).tiersAccount(4))
                expect(tx8).to.be.equal(1)

                let tx9 = publicSaleContract.connect(tester4.account).addWhiteList()
                await expect(tx9).to.be.revertedWith("PublicSale: already attended")
                
                let big300000 = ethers.utils.parseUnits("300000", 18);
                let big600000 = ethers.utils.parseUnits("600000", 18);
                let tx10 = Number(await publicSaleContract.calculTierAmount(account6.address))
                expect(tx10).to.be.equal(Number(big300000))

                let tx11 = Number(await publicSaleContract.calculTierAmount(account4.address))
                expect(tx11).to.be.equal(Number(big600000))

                let tx12 = Number(await publicSaleContract.connect(tester6.account).tiersAccount(4))
                expect(tx12).to.be.equal(1)
                await publicSaleContract.connect(tester6.account).addWhiteList()
                let tx13 = Number(await publicSaleContract.connect(tester6.account).tiersAccount(4))
                expect(tx13).to.be.equal(2)

                let tx14 = Number(await publicSaleContract.calculTierAmount(account6.address))
                expect(tx14).to.be.equal(Number(big300000))

                let tx15 = Number(await publicSaleContract.calculTierAmount(account4.address))
                expect(tx15).to.be.equal(Number(big300000))

                let tx16 = Number(await publicSaleContract.totalWhitelists())
                expect(tx16).to.be.equal(5)
            })

            //calculate how many input ton amount
            it("how many input amount", async () => {
                let tx = Number(await publicSaleContract.calculPayToken(60000))
                expect(tx).to.be.equal(60)
                let tx2 = Number(await publicSaleContract.calculPayToken(120000))
                expect(tx2).to.be.equal(120)
                let tx3 = Number(await publicSaleContract.calculPayToken(220000))
                expect(tx3).to.be.equal(220)
                let tx4 = Number(await publicSaleContract.calculPayToken(300000))
                expect(tx4).to.be.equal(300)
                let tx5 = Number(await publicSaleContract.calculPayToken(300000))
                expect(tx5).to.be.equal(300)
            })

            //calculTierAmount test (before and after different)
            it("calculTierAmount test after addwhiteList", async () => {
                let big60000 = ethers.utils.parseUnits("60000", 18);
                let big120000 = ethers.utils.parseUnits("120000", 18);
                let big220000 = ethers.utils.parseUnits("220000", 18);
                let big300000 = ethers.utils.parseUnits("300000", 18);
                let tx = Number(await publicSaleContract.calculTierAmount(account1.address))
                expect(tx).to.be.equal(Number(big60000))
                let tx2 = Number(await publicSaleContract.calculTierAmount(account2.address))
                expect(tx2).to.be.equal(Number(big120000))
                let tx3 = Number(await publicSaleContract.calculTierAmount(account3.address))
                expect(tx3).to.be.equal(Number(big220000))
                let tx4 = Number(await publicSaleContract.calculTierAmount(account4.address))
                expect(tx4).to.be.equal(Number(big300000))
                let tx5 = Number(await publicSaleContract.calculTierAmount(account6.address))
                expect(tx5).to.be.equal(Number(big300000))
            })
            
            //time condition test
            it("exclusiveSale before exclusive startTime", async () => {
                await getToken.connect(account1).approve(publicSaleContract.address, 60)
                let tx = publicSaleContract.connect(account1).exclusiveSale(account1.address,60)
                await expect(tx).to.be.revertedWith("PublicSale: exclusiveStartTime has not passed")
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [exclusiveStartTime]);
                await ethers.provider.send('evm_mine');

                await time.increaseTo(exclusiveStartTime+86400);
            })

            //time condition test
            it("addwhitelist after whitelistTIme", async () => {
                let tx = publicSaleContract.connect(account1).addWhiteList()
                await expect(tx).to.be.revertedWith("PublicSale: end the whitelistTime")
            })

            //round1 sale test
            it("exclusiveSale after exclusive startTime", async () => {
                let big60 = ethers.utils.parseUnits("60", 18);
                let account1TON = Number(await getToken.balanceOf(account1.address))
                let account1WTON = Number(await wton.balanceOf(account1.address))
                let account2TON = Number(await getToken.balanceOf(account2.address))
                let account2WTON = Number(await wton.balanceOf(account2.address))
                let account3TON = Number(await getToken.balanceOf(account3.address))
                let account3WTON = Number(await wton.balanceOf(account3.address))
                let account4TON = Number(await getToken.balanceOf(account4.address))
                let account4WTON = Number(await wton.balanceOf(account4.address))
                let account6TON = Number(await getToken.balanceOf(account6.address))
                let account6WTON = Number(await wton.balanceOf(account6.address))
                
                // let contractTON = Number(await getToken.balanceOf(account5.address))
                // console.log("contract TON :", contractTON)

                // console.log("account1 TON :", account1TON)
                // console.log("account1 WTON :", account1WTON)
                // console.log("account2 TON :", account2TON)
                // console.log("account2 WTON :", account2WTON)
                // console.log("account3 TON :", account3TON)
                // console.log("account3 WTON :", account3WTON)
                // console.log("account4 TON :", account4TON)
                // console.log("account4 WTON :", account4WTON)
                // console.log("account6 TON :", account6TON)
                // console.log("account6 WTON :", account6WTON)

                await wton.connect(account1).approveAndCall(publicSaleContract.address, account1BigWTONAmount, 0);
                // await wton.connect(account1).approve(saleContract.address, account1BigWTONAmount)
                // await saleContract.connect(account1).exclusiveSale(account1.address,big60)
                let tx = await publicSaleContract.usersEx(account1.address)
                expect(Number(tx.payAmount)).to.be.equal(Number(big60))

                let big120 = ethers.utils.parseUnits("120", 18);
                await getToken.connect(account2).approveAndCall(publicSaleContract.address, big120, 0);
                // await saleContract.connect(account2).exclusiveSale(account2.address,big120)
                let tx2 = await publicSaleContract.usersEx(account2.address)
                expect(Number(tx2.payAmount)).to.be.equal(Number(big120))
                
                let big220 = ethers.utils.parseUnits("220", 18);
                await getToken.connect(account3).approveAndCall(publicSaleContract.address, big220, 0);
                // await getToken.connect(account3).approve(saleContract.address, big220)
                // await saleContract.connect(account3).exclusiveSale(account3.address,big220)
                let tx3 = await publicSaleContract.usersEx(account3.address)
                expect(Number(tx3.payAmount)).to.be.equal(Number(big220))
                
                let big300 = ethers.utils.parseUnits("300", 18);
                await getToken.connect(account4).approveAndCall(publicSaleContract.address, big300, 0);
                // await getToken.connect(account4).approve(saleContract.address, big300)
                // await saleContract.connect(account4).exclusiveSale(account4.address,big300)
                let tx4 = await publicSaleContract.usersEx(account4.address)
                expect(Number(tx4.payAmount)).to.be.equal(Number(big300))
                
                await getToken.connect(account6).approveAndCall(publicSaleContract.address, account6BigTONAmount, 0);
                // await getToken.connect(account6).approve(saleContract.address, account6BigTONAmount)
                // await saleContract.connect(account6).exclusiveSale(account6.address,account6BigTONAmount)
                let tx5 = await publicSaleContract.usersEx(account6.address)
                expect(Number(tx5.payAmount)).to.be.equal(Number(account6BigTONAmount))
                
                
                let account1TON2 = Number(await getToken.balanceOf(account1.address))
                let account1WTON2 = Number(await wton.balanceOf(account1.address))
                let account2TON2 = Number(await getToken.balanceOf(account2.address))
                let account2WTON2 = Number(await wton.balanceOf(account2.address))
                let account3TON2 = Number(await getToken.balanceOf(account3.address))
                let account3WTON2 = Number(await wton.balanceOf(account3.address))
                let account4TON2 = Number(await getToken.balanceOf(account4.address))
                let account4WTON2 = Number(await wton.balanceOf(account4.address))
                let account6TON2 = Number(await getToken.balanceOf(account6.address))
                let account6WTON2 = Number(await wton.balanceOf(account6.address))
                // console.log("------------------------------------------------------")
                // console.log("account1 TON2 :", account1TON2)
                // console.log("account1 WTON2 :", account1WTON2)
                // console.log("account2 TON2 :", account2TON2)
                // console.log("account2 WTON2 :", account2WTON2)
                // console.log("account3 TON2 :", account3TON2)
                // console.log("account3 WTON2 :", account3WTON2)
                // console.log("account4 TON2 :", account4TON2)
                // console.log("account4 WTON2 :", account4WTON2)
                // console.log("account6 TON2 :", account6TON2)
                // console.log("account6 WTON2 :", account6WTON2)

                let big1000 = ethers.utils.parseUnits("1000", 18);
                let big1000000 = ethers.utils.parseUnits("1000000", 18);
                let tx6 = Number(await publicSaleContract.totalExPurchasedAmount())
                expect(tx6).to.be.equal(Number(big1000))
                let tx7 = Number(await publicSaleContract.totalExSaleAmount())
                expect(tx7).to.be.equal(Number(big1000000))
                // let tx8 = Number(await getToken.balanceOf(account5.address))
                // expect(tx8).to.be.equal(Number(big1000))
            })
        })

        describe("openSale Sale", () => {
            //time condition test
            it("deposit before depositTime", async () => {
                let tx = publicSaleContract.connect(account1).deposit(account1.address,100)
                await expect(tx).to.be.revertedWith("PublicSale: don't start depositTime")
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [depositStartTime]);
                await ethers.provider.send('evm_mine');
            })

            //round2 deposit
            it("deposit after depositTime", async () => {
                account1Before = Number(await getToken.balanceOf(account1.address))
                account2Before = Number(await getToken.balanceOf(account2.address))
                account3Before = Number(await getToken.balanceOf(account3.address))
                account4Before = Number(await getToken.balanceOf(account4.address))

                // let big10 = ethers.utils.parseUnits("10", 18);
                // await getToken.connect(saleTokenOwner).transfer(account1.address, big10)
                
                let big50 = ethers.utils.parseUnits("50", 18);
                let big100 = ethers.utils.parseUnits("100", 18);
                let big150 = ethers.utils.parseUnits("150", 18);
                let big200 = ethers.utils.parseUnits("200", 18);
                let big300 = ethers.utils.parseUnits("300", 18);
                let big400 = ethers.utils.parseUnits("400", 18);
                let big600 = ethers.utils.parseUnits("600", 18);
                let big800 = ethers.utils.parseUnits("800", 18);
                // await getToken.connect(account1).approve(saleContract.address, big200)                       //200
                // await wton.connect(account2).approve(saleContract.address, account2BigWTONAmount)           //400
                // await getToken.connect(account3).approve(saleContract.address, big300)                      //300
                await wton.connect(account3).approve(publicSaleContract.address, account3BigWTONAmount)           //300
                // await getToken.connect(account4).approve(saleContract.address, big800)                      //800

                let account1TON = Number(await getToken.balanceOf(account1.address))
                let account1WTON = Number(await wton.balanceOf(account1.address))
                let account2TON = Number(await getToken.balanceOf(account2.address))
                let account2WTON = Number(await wton.balanceOf(account2.address))
                let account3TON = Number(await getToken.balanceOf(account3.address))
                let account3WTON = Number(await wton.balanceOf(account3.address))
                let account4TON = Number(await getToken.balanceOf(account4.address))
                let account4WTON = Number(await wton.balanceOf(account4.address))
                let account6TON = Number(await getToken.balanceOf(account6.address))
                let account6WTON = Number(await wton.balanceOf(account6.address))
                
                // let contractTON = Number(await getToken.balanceOf(account5.address))
                // console.log("contract TON :", contractTON)

                // console.log("account1 TON :", account1TON)
                // console.log("account1 WTON :", account1WTON)
                // console.log("account2 TON :", account2TON)
                // console.log("account2 WTON :", account2WTON)
                // console.log("account3 TON :", account3TON)
                // console.log("account3 WTON :", account3WTON)
                // console.log("account4 TON :", account4TON)
                // console.log("account4 WTON :", account4WTON)
                // console.log("account6 TON :", account6TON)
                // console.log("account6 WTON :", account6WTON)

                await getToken.connect(account1).approveAndCall(publicSaleContract.address, big50, 0);
                // await saleContract.connect(account1).deposit(big200)
                await wton.connect(account2).approveAndCall(publicSaleContract.address, account2BigWTONAmount, 0);
                // await saleContract.connect(account2).deposit(big400)

                var dec = 300000000000000000000;
                var hex = dec.toString(16);
                // console.log("hex : ", hex, " hex.length : ", hex.length);
                let length = hex.length;
                for(let i = 1; i<=(64-length); i++) {
                    hex = "0"+hex;
                    if (i==(64-length)) {
                        hex = "0x" + hex;
                    }
                }

                await getToken.connect(account3).approveAndCall(publicSaleContract.address, big150, 0);
                // await saleContract.connect(account3).deposit(big600)
                await getToken.connect(account4).approveAndCall(publicSaleContract.address, big200, 0);
                // await saleContract.connect(account4).deposit(big800)

                let account1TON2 = Number(await getToken.balanceOf(account1.address))
                let account1WTON2 = Number(await wton.balanceOf(account1.address))
                let account2TON2 = Number(await getToken.balanceOf(account2.address))
                let account2WTON2 = Number(await wton.balanceOf(account2.address))
                let account3TON2 = Number(await getToken.balanceOf(account3.address))
                let account3WTON2 = Number(await wton.balanceOf(account3.address))
                let account4TON2 = Number(await getToken.balanceOf(account4.address))
                let account4WTON2 = Number(await wton.balanceOf(account4.address))
                let account6TON2 = Number(await getToken.balanceOf(account6.address))
                let account6WTON2 = Number(await wton.balanceOf(account6.address))
                // console.log("------------------------------------------------------")
                // console.log("account1 TON2 :", account1TON2)
                // console.log("account1 WTON2 :", account1WTON2)
                // console.log("account2 TON2 :", account2TON2)
                // console.log("account2 WTON2 :", account2WTON2)
                // console.log("account3 TON2 :", account3TON2)
                // console.log("account3 WTON2 :", account3WTON2)
                // console.log("account4 TON2 :", account4TON2)
                // console.log("account4 WTON2 :", account4WTON2)
                // console.log("account6 TON2 :", account6TON2)
                // console.log("account6 WTON2 :", account6WTON2)

                let tx = await publicSaleContract.usersOpen(account1.address)
                expect(Number(tx.depositAmount)).to.be.equal(Number(big50))
                let tx2 = await publicSaleContract.usersOpen(account2.address)
                expect(Number(tx2.depositAmount)).to.be.equal(Number(big100))
                let tx3 = await publicSaleContract.usersOpen(account3.address)
                expect(Number(tx3.depositAmount)).to.be.equal(Number(big150))
                let tx4 = await publicSaleContract.usersOpen(account4.address)
                expect(Number(tx4.depositAmount)).to.be.equal(Number(big200))
            })
        })
    })

    describe("claim test", () => {
        //time condition test
        it('claim before claimTime', async () => {
            let tx = publicSaleContract.connect(account1).claim()
            await expect(tx).to.be.revertedWith("PublicSale: don't start claimTime")
        })
        
        it("duration the time to claimTime1", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [claimTime1]);
            await ethers.provider.send('evm_mine');
        })

        //claimTime1 account1 claim and balance check
        it("claim claimTime1, claim call the account1", async () => {
            await publicSaleContract.connect(account1).claim()
        })

        it("duration the time to period end", async () => {
            let periodEnd = claimTime2 + (1)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("claim claimTime2, claim call the account1", async () => {
            await publicSaleContract.connect(account1).claim()
        })

        it("duration the time to period end", async () => {
            let periodEnd = claimTime3 + (1)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("claim claimTime3, claim call the account1", async () => {
            await publicSaleContract.connect(account1).claim()
        })

        it("duration the time to period end", async () => {
            let periodEnd = claimTime4 + (1)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("claimTime4, claim call account1", async () => {
            await publicSaleContract.connect(account1).claim()
        })

        it("duration the time to period end", async () => {
            let periodEnd = claimTime5 + (1)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("claimTime5, claim call account1", async () => {
            await publicSaleContract.connect(account1).claim()
        })

        it("duration the time to period end", async () => {
            let periodEnd = claimTime6 + (86400*7)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })


        it("claim period end, claim call account1", async () => {
            await publicSaleContract.connect(account1).claim()
        })

        it("claim period end, claim call account2", async () => {
            await publicSaleContract.connect(account2).claim()
        })

        it("claim period end, claim call account3", async () => {
            await publicSaleContract.connect(account3).claim()
        })

        it("claim period end, claim call account4", async () => {
            await publicSaleContract.connect(account4).claim()
        })

        it("claim period end, claim call account6", async () => {
            await publicSaleContract.connect(account6).claim()
        })

        // it("claim period end, claim call the account3, account4, account6", async () => {
        //     let expectClaim = await publicSaleContract.calculClaimAmount(account1.address, 0)
        //     let expectClaim2 = await publicSaleContract.calculClaimAmount(account2.address, 0)
        //     let expectClaim3 = await publicSaleContract.calculClaimAmount(account3.address, 0)
        //     let expectClaim4 = await publicSaleContract.calculClaimAmount(account4.address, 0)
        //     let expectClaim5 = await publicSaleContract.calculClaimAmount(account6.address, 0)

        //     await publicSaleContract.connect(account1).claim()
        //     await publicSaleContract.connect(account2).claim()
        //     await publicSaleContract.connect(account3).claim()
        //     await publicSaleContract.connect(account4).claim()
        //     await publicSaleContract.connect(account6).claim()

        //     let tx1 = await saleToken.balanceOf(account1.address)
        //     let tx2 = await saleToken.balanceOf(account2.address)
        //     let tx3 = await saleToken.balanceOf(account3.address)
        //     let tx4 = await saleToken.balanceOf(account4.address)
        //     let tx6 = await saleToken.balanceOf(account6.address)

        //     expect(Number(tx1)).to.be.equal(Number(expectClaim._totalClaim))
        //     expect(Number(tx2)).to.be.equal(Number(expectClaim2._totalClaim))
        //     expect(Number(tx3)).to.be.equal(Number(expectClaim3._totalClaim))
        //     expect(Number(tx4)).to.be.equal(Number(expectClaim4._totalClaim))
        //     expect(Number(tx6)).to.be.equal(Number(expectClaim5._totalClaim))
        // })

        // it("distributionByRound test",async () => {
        //     let claim1 = Number(await publicSaleContract.distributionByRound(1));
        //     console.log((claim1))
        //     let claim2 = Number(await publicSaleContract.distributionByRound(2));
        //     console.log((claim2))
        //     let claim3 = Number(await publicSaleContract.distributionByRound(3));
        //     console.log((claim3))
        //     let claim4 = Number(await publicSaleContract.distributionByRound(4));
        //     console.log((claim4))
        //     let claim5 = Number(await publicSaleContract.distributionByRound(5));
        //     console.log((claim5))
        // })

        // it("distributionByRounds test",async () => {
        //     console.log("1")
        //     let claims = await publicSaleContract.distributionByRounds(1,5);
        //     console.log("2")
        //     console.log(claims)
        //     console.log(claims[1])
        //     console.log(claims[2])
        //     console.log(claims[3])
        //     console.log(claims[4])
        // })
    })
})
