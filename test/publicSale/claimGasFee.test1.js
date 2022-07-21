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

const PublicSale_ABI = require('../../artifacts/contracts/sale/publicSale.sol/PublicSale.json');
const PublicSale2_ABI = require('../../artifacts/contracts/sale/publicSale.sol/PublicSale2.json');

const zeroAddress = "0x0000000000000000000000000000000000000000";

describe("publicSale", () => {
    let testTotalSalesAmount = ethers.utils.parseUnits("1500000", 18);


    let claimPercent1 = 30;
    let claimPercent2 = 20;
    let claimPercent3 = 20;
    let claimPercent4 = 20;
    let claimPercent5 = 10;
    
    let claimTime1, claimTime2, claimTime3, claimTime4, claimTime5;

    let claimCounts = 5;
    
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
        uniswapRouter = await findSigner(addresses[11]);
        testTemp = await findSigner(addresses[12]); 
        uniswapAccount = await findSigner(addresses[13]);
        upgradeAdmin = await findSigner(addresses[14]);

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

            await (await tos.connect(deployer).mint(uniswapAccount.address, tosuniAmount)).wait();
            expect(await tos.balanceOf(uniswapAccount.address)).to.be.equal(tosuniAmount);
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
                const cons = await ico20Contracts.getPlasamContracts();
          
                ton = cons.ton;
                wton = cons.wton;
          
                await ton.mint(defaultSender, ethers.utils.parseUnits("1000", 18), {
                  from: defaultSender,
                });
                await wton.mint(defaultSender, ethers.utils.parseUnits("1000", 27), {
                  from: defaultSender,
                });

                await wton.mint(uniswapAccount.address, wtonuniAmount, {
                    from: defaultSender,
                });

                expect(await wton.balanceOf(uniswapAccount.address)).to.be.equal(wtonuniAmount);
    
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

            let code = await saleTokenOwner.provider.getCode(publicLogic.address);
            expect(code).to.not.eq("0x");

            await publicProxy.connect(saleTokenOwner).upgradeTo(publicLogic.address);

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
            await saleToken.connect(saleTokenOwner).transfer(saleContract.address, totalBigAmount)

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
        it()
    })
})
