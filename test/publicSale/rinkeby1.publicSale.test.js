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

// let UniswapV3Factory = require('../abis/UniswapV3Factory.json');

const LockTOS_ABI = require("../..//artifacts/contracts/stake/LockTOS.sol/LockTOS.json");
const PublicSale_ABI = require('../../artifacts/contracts/sale/publicSale.sol/PublicSale.json');
const PublicSaleTest_ABI = require('../../artifacts/contracts/sale/PublicSaleTest.sol/PublicSaleTest.json');
const PublicSale2_ABI = require('../../artifacts/contracts/sale/PublicSale2.sol/PublicSale2.json');
// const PublicSaleForDoM_ABI = require('../../artifacts/contracts/sale/PublicSaleForDoM.sol/PublicSaleForDoM.json');
const LiquidtyVault = require("../../abis/InitialLiquidityVaultFactory.json");
const LiquidtyVaultLogic = require("../../abis/InitialLiquidityVault.json");
const EventLog_ABI = require("../../abis/EventLog.json");

const VestingFundFactory = require("../../abis/VestingPublicFundFactory.json");
const VestingFundLogic = require("../../abis/VestingPublicFund.json");
const VestingFundLogicProxy = require("../../abis/VestingPublicFundProxy.json");

const TON_ABI = require("../../abis/TON.json");
const WTON_ABI = require("../../abis/WTON.json");

const TOS_ABI = require("../../abis/TOS.json");
const LockTOSABI_ABI = require("../../abis/LockTOS_ABI.json");

const zeroAddress = "0x0000000000000000000000000000000000000000";

//typeC로 세팅 업그레이드 테스트
describe("Sale", () => {
    //mockERC20으로 doc, ton 배포함
    //시나리오
    //티어별 참여자가 여러명일때 모든 풀에 참여자가 있을때 테스트 (티어1,2,3,4에 모든 유저가 whitelist했고 exclusive했을 경우)
    //saleTokenPrice(DOC) = 12원
    //payTokenPrice(TON) = 12,000원
    //TON 10개 = DOC 10,000개  1: 1000
    //티어1 : 100 sTOS, 6%(600)     /60,000 DOC -> TON 60개 
    //티어2 : 200 sTOS, 12%(1200)   /120,000 DOC -> TON 120개
    //티어3 : 1,000 sTOS, 22%(2200) /220,000 DOC -> TON 220개
    //티어4 : 4,000 sTOS, 60%(6000) /600,000 DOC -> TON 600개
    //Round1 : 1,000,000 -> 1000개 참여면 끝 (총 1000TON 참여)
    //account1 -> 티어 1 참여 -> 60,000DOC 할당 -> TON 60개 (WTON으로 참여)
    //account2 -> 티어 2 참여 -> 120,000DOC 할당 -> TON 120개
    //account3 -> 티어 3 참여 -> 220,000DOC 할당 -> TON 220개
    //account4 -> 티어 4 참여 -> 300,000DOC 할당 -> TON 300개
    //account6 -> 티어 4 참여 -> 300,000DOC 할당 -> TON 300개
    //Round2 : 1,000,000 -> 1000개 참여면 끝 (총 2000TON 참여 -> 1000개구매 끝, 1000개 환불)
    //account1 -> 200개 참여 (TON 200개) -> 200/2000 * 1,000,000 = 100,000 DOC -> 100TON 사용 100TON 환불  -> 50TON 참여 -> 50,000 DOC
    //account2 -> 400개 참여 (WTON 400개) -> 400/2000 * 1,000,000 = 200,000 DOC -> 200TON 사용 200TON 환불 -> 100TON 참여 -> 100,000 DOC
    //account3 -> 600개 참여 (TON 300개, WTON 300개) -> 600/2000 * 1,000,000 = 300,000 DOC -> 300TON 사용 300TON 환불 -> 150TON참여 -> 150,000 DOC
    //account4 -> 800개 참여 (TON 800개) -> 800/2000 * 1,000,000 = 400,000 DOC -> 400TON 사용 400TON 환불 -> 200TON 참여 -> 200,000 DOC
    //total 구매 및 결과
    //account1 -> 160,000 DOC -> 260TON 참여 -> 160 TON 구매 100 TON 환불
    //account2 -> 320,000 DOC -> 520TON 참여 -> 320 TON 구매 200 TON 환불
    //account3 -> 520,000 DOC -> 820TON 참여 -> 520 TON 구매 300 TON 환불
    //account4 -> 700,000 DOC -> 1100TON 참여 -> 700 TON 구매 400 TON 환불
    //account6 -> 300,000 DOC -> 300TON 참여 -> 300 TON 구매

    //원하는 시간에 맞춰서 정해진 수량 배분 (총 6번 실행할 것 시간은 처음 클레임 시작 후 1분 후 2분 후 3분 후 4분 후 로 테스트)
    //claimPercent1 = 30%
    //claimPercent2 = 20%
    //claimPercent3 = 20%
    //claimPercent4 = 20%
    //claimPercent5 = 10%


    //account들 총 TON창여량
    //account1 = 110TON
    //account2 = 220TON
    //account3 = 370TON
    //account4 = 500TON
    //account6 = 300TON

    //account이 받는 DOC양
    //account1 = 33,000 , 22,000 , 22,000, 22,000 , 11,000 -> 110,000 DOC
    //account2 = 66,000 , 44,000 , 44,000, 44,000 , 22,000 -> 220,000 DOC
    //account3 = 111,000 , 74,000 , 74,000, 74,000, 37,000 -> 370,000 DOC
    //account4 = 150,000 , 100,000 , 100,000, 100,000 , 50,000 -> 500,000 DOC
    //account6 = 90,000 , 60,000 , 60,000, 60,000 , 30,000 -> 300,000 DOC

    //round1 = 450,000
    //round2 = 300,000
    //round3 = 300,000
    //round4 = 300,000
    //round5 = 150,000

    //total = 1,500,000

    //판매자가 받을 TON양
    //총 1500TON 중 10% 제외 -> 1350TON
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
    let fundVaultAddress;
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
    let daoAccount;
    
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
    
    let contracthaveTON = ethers.utils.parseUnits("1500", 18);
    let getTokenOwnerHaveTON = ethers.utils.parseUnits("1350", 18);
    let contractChangeWTON1 = ethers.utils.parseUnits("100", 27);
    let contractChangeWTON2 = ethers.utils.parseUnits("50", 27);
    let contractChangeWTON3 = ethers.utils.parseUnits("150", 27);
    let contractChangeWTON4 = ethers.utils.parseUnits("1", 27);

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

    let tos, ton, wton, lockTOS, lockTOSImpl, lockTOSProxy ;
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
    let deploySaleImpl;
    let deploySaleImpl2;
    let libPublicSale2;
    let uniswapRouter;
    let testTemp;
    let wtonTosPool;
    let initialliquidityVault;
    let initialVaultFactory;
    let initialVaultLogic;

    let vestingPublicFundLogic;
    let vestingPublicFundFactory;

    let tosWtonPoolAddress;

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

    let lockTOSAddress = "0x5adc7de3a0B4A4797f02C3E99265cd7391437568";
    let tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0";

    let price = {
        tos: ethers.BigNumber.from("1000"),
        projectToken:  ethers.BigNumber.from("100"),
        initSqrtPrice: 0,
        initTick: 0,
        targetPriceInterval: 1,
        targetInterval: 1,
        tickPrice: 0
    }

    let vaultInfo = {
        name: "test",
        contractAddress: null,
        allocateToken: null,
        admin : null,
        totalAllocatedAmount: null,
        claimCounts: ethers.BigNumber.from("3"),
        claimTimes: [],
        claimIntervalSeconds : 60*60*24,
        claimAmounts: [],
        totalClaimsAmount: ethers.BigNumber.from("0")
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
        daoAccount = await findSigner(addresses[13]);
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
        // let lockTosAdmin = 0x5b6e72248b19F2c5b88A4511A6994AD101d0c287;
        // await hre.ethers.provider.send("hardhat_impersonateAccount",[lockTosAdmin]);

        // let _lockTosAdmin = await ethers.getSigner(lockTosAdmin);
    });

    describe("#1 .setting the TON, WTON, LockTOS, SaleToken, eventLog", () => {
        //saleToken Deploy
        it("#1-1. Initialize Sale Token", async function () {
            erc20token = await ethers.getContractFactory("ERC20Mock");
            saleToken = await erc20token.connect(saleTokenOwner).deploy("testDoM", "AURA");
        });

        it("#1-2. setting the TON", async () => {
            ton = new ethers.Contract( tonAddress, TON_ABI.abi, ethers.provider );
        })

        it("#1-3. setting the WTON", async () => {
            wton = new ethers.Contract(uniswapInfo.wton, WTON_ABI.abi, ethers.provider );
        })

        it("#1-4. setting the TOS", async () => {
            tos = new ethers.Contract(uniswapInfo.tos, TOS_ABI.abi, ethers.provider );
        })

        // it("#1-5. setting the lockTOS", async () => {
        //     lockTOS = new ethers.Contract( lockTOSAddress, LockTOSABI_ABI, ethers.provider );
        // })

        it("#1-5. Deploy LockTOS", async function () {
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

        it("#1-6. Deploy the eventLog", async () => {
            const contract = await (
                await ethers.getContractFactory(
                    EventLog_ABI.abi,
                    EventLog_ABI.bytecode
                )
            ).deploy();
            await contract.deployed();
            // let tx = await contract.deployed();
            eventLogAddress = contract.address;
        })
    })

    describe("#2. initial LiquidityVault deploy & setting", () => {
        it("#2-1. deploy initialLiquidityFactory", async () => {
            const contract = await (
                await ethers.getContractFactory(
                    LiquidtyVault.abi,
                    LiquidtyVault.bytecode
                )
            ).deploy();

            await contract.deployed();
            initialVaultFactory = await ethers.getContractAt(LiquidtyVault.abi, contract.address);
            let code = await ethers.provider.getCode(initialVaultFactory.address);
            expect(code).to.not.eq("0x");
        })

        it("#2-2. deploy initialLiquidityLogic", async () => {
            const contract = await (
                await ethers.getContractFactory(
                    LiquidtyVaultLogic.abi,
                    LiquidtyVaultLogic.bytecode
                )
            ).deploy();

            await contract.deployed();
            initialVaultLogic = await ethers.getContractAt(LiquidtyVaultLogic.abi, contract.address);
            let code = await ethers.provider.getCode(initialVaultLogic.address);
            expect(code).to.not.eq("0x");
        })

        it("#2-3. setLogic caller is not admin", async () => {
            await expect(
                initialVaultFactory.connect(account1).setLogic(initialVaultLogic.address)
            ).to.be.revertedWith("Accessible: Caller is not an admin");
        })

        it("#2-4. setLogic caller is admin", async () => {
            await initialVaultFactory.connect(saleTokenOwner).setLogic(initialVaultLogic.address);

            expect(await initialVaultFactory.vaultLogic()).to.be.eq(initialVaultLogic.address);
        })

        it("#2-5. setUpgradeAdmin caller is not admin", async () => {
            await expect(
                initialVaultFactory.connect(account1).setUpgradeAdmin(upgradeAdmin.address)
            ).to.be.revertedWith("Accessible: Caller is not an admin");
        });

        it("#2-6. setUpgradeAdmin caller is admin", async () => {
            await initialVaultFactory.connect(saleTokenOwner).setUpgradeAdmin(upgradeAdmin.address);
            expect(await initialVaultFactory.upgradeAdmin()).to.be.eq(upgradeAdmin.address);
        });

        it("#2-7. setUniswapInfoNTokens caller is not admin ", async () => {
            await expect(
                initialVaultFactory.connect(account1).setUniswapInfoNTokens(
                    [uniswapInfo.poolfactory,
                    uniswapInfo.npm ],
                    uniswapInfo.tos,
                    ethers.BigNumber.from("3000")
                )
            ).to.be.revertedWith("Accessible: Caller is not an admin");
        });

        it("#2-8. setUniswapInfoNTokens caller is admin", async () => {
            await initialVaultFactory.connect(saleTokenOwner).setUniswapInfoNTokens(
                [uniswapInfo.poolfactory,
                uniswapInfo.npm],
                uniswapInfo.tos,
                ethers.BigNumber.from("3000")
            );
            expect(await initialVaultFactory.uniswapV3Factory()).to.be.eq(uniswapInfo.poolfactory);
            expect(await initialVaultFactory.nonfungiblePositionManager()).to.be.eq(uniswapInfo.npm);
            expect(await initialVaultFactory.tos()).to.be.eq(uniswapInfo.tos);
            expect(await initialVaultFactory.fee()).to.be.eq(ethers.BigNumber.from("3000"));
        });

        it("#2-9. create the InitialLiquidityFactory", async () => {
            let tx = await initialVaultFactory.create(
                "ABCD",
                saleToken.address,
                tosTokenOwner.address,
                price.tos,
                price.projectToken
            );

            const receipt = await tx.wait();
            let _function ="CreatedInitialLiquidityVault(address, string)";
            let interface = initialVaultFactory.interface;
            let tokenId = null;
            for(let i=0; i< receipt.events.length; i++){
                if(receipt.events[i].topics[0] == interface.getEventTopic(_function)){
                    let data = receipt.events[i].data;
                    let topics = receipt.events[i].topics;
                    let log = interface.parseLog(
                    {  data,  topics } );
                    vaultAddress = log.args.contractAddress;
                }
            }

            expect(await initialVaultFactory.totalCreatedContracts()).to.be.eq(1);
            expect((await initialVaultFactory.getContracts(0)).contractAddress).to.be.eq(vaultAddress);
            expect((await initialVaultFactory.lastestCreated()).contractAddress).to.be.eq(vaultAddress);
        })

        it("#2-10. create2 the InitialLiquidityFactory", async () => {
            let tx = await initialVaultFactory.create(
                "ABC",
                saleToken.address,
                tosTokenOwner.address,
                price.tos,
                price.projectToken
            );

            const receipt = await tx.wait();
            let _function ="CreatedInitialLiquidityVault(address, string)";
            let interface = initialVaultFactory.interface;
            let tokenId = null;
            for(let i=0; i< receipt.events.length; i++){
                if(receipt.events[i].topics[0] == interface.getEventTopic(_function)){
                    let data = receipt.events[i].data;
                    let topics = receipt.events[i].topics;
                    let log = interface.parseLog(
                    {  data,  topics } );
                    vaultAddress = log.args.contractAddress;
                }
            }

            expect(await initialVaultFactory.totalCreatedContracts()).to.be.eq(2);
            expect((await initialVaultFactory.getContracts(1)).contractAddress).to.be.eq(vaultAddress);
            // let tx2 = await initialVaultFactory.getContracts(1);
            // console.log(tx2);
            expect((await initialVaultFactory.lastestCreated()).contractAddress).to.be.eq(vaultAddress);
        })
    })

    describe("#3. Initialize PublicSaleProxyFactroy and PublicSale", () => {
        //funding Token set(TON)
        it("#3-1. Initialize Funding Token", async function () {
            getToken = ton;
        });

        it("#3-2. deploy PublicSlaeFactory", async () => {
            const PublicSaleProxyFactory = await ethers.getContractFactory("PublicSaleProxyFactory");

            publicFactory = await PublicSaleProxyFactory.connect(saleTokenOwner).deploy();

            let code = await saleTokenOwner.provider.getCode(publicFactory.address);
            expect(code).to.not.eq("0x");
        })

        //deploy publicSale and publicSaleProxy and transfer TON, WTON
        it("#3-3. Initialize PublicSale", async function () {
            let PublicSale = await ethers.getContractFactory("PublicSale");
            deploySaleImpl = await PublicSale.connect(saleOwner).deploy();

            let code = await saleOwner.provider.getCode(deploySaleImpl.address);
            expect(code).to.not.eq("0x");
        });

        it("#3-4. Deploy LibPublicSale2 ", async function () {
            const LibPublicSale2 = await ethers.getContractFactory("LibPublicSale2");
            libPublicSale2 = await LibPublicSale2.connect(saleOwner).deploy();
        });

        it("#3-5. Initialize PublicSale2", async function () {
            let PublicSale2 = await ethers.getContractFactory("PublicSale2",{
                libraries: {
                    LibPublicSale2: libPublicSale2.address
                }
            });
            deploySaleImpl2 = await PublicSale2.connect(saleOwner).deploy();

            let code = await saleOwner.provider.getCode(deploySaleImpl2.address);
            expect(code).to.not.eq("0x");
        });

        it("#3-6. setting the Proxy basicSet from not admin", async () => {
            await expect(publicFactory.connect(account1).basicSet(
                [
                    getToken.address,
                    wton.address,
                    lockTOS.address,
                    tos.address,
                    uniswapInfo.swapRouter,
                    deploySaleImpl.address
                ]
            )).to.be.revertedWith("Accessible: Caller is not an admin");
        });

        it("#3-7. setting the Proxy basicSet from admin", async () => {
            await publicFactory.connect(saleTokenOwner).basicSet(
                [
                    getToken.address,
                    wton.address,
                    lockTOS.address,
                    tos.address,
                    uniswapInfo.swapRouter,
                    deploySaleImpl.address
                ]
            )

            let tx = await publicFactory.publicLogic();
            expect(tx).to.be.equal(deploySaleImpl.address);
        });

        it("#3-8. change the basicSet address from admin", async () => {
            await publicFactory.connect(saleTokenOwner).basicSet(
                [
                    getToken.address,
                    wton.address,
                    lockTOS.address,
                    tos.address,
                    uniswapInfo.swapRouter,
                    deploySaleImpl2.address
                ]
            )

            let tx = await publicFactory.publicLogic();
            expect(tx).to.be.equal(deploySaleImpl2.address);
        });
        
        it("#3-9. set allset from admin", async () => {
            await publicFactory.connect(saleTokenOwner).allSet(
                [
                    upgradeAdmin.address,
                    initialVaultFactory.address,
                    eventLogAddress
                ],
                [
                    minPer,
                    maxPer,
                    100,
                    200,
                    1000,
                    4000,
                    600
                ]
            );
        })

        it("#3-10. deploy PublicSaleProxy from Factory but not match the liquidtyAddress", async () => {
            let publicSaleContract = saleContracts[0];
            await expect(publicFactory.connect(saleTokenOwner).create(
                publicSaleContract.name,
                publicSaleContract.owner.address,
                [
                    saleToken.address,
                    account5.address,
                    vaultAddress,
                ],
                0
            )).to.be.revertedWith("another liquidityVault");
        })

        it("#3-11. deploy PublicSaleProxy from Factory", async () => {
            let publicSaleContract = saleContracts[0];
            let prevTotalCreatedContracts = await publicFactory.totalCreatedContracts();

            await publicFactory.connect(saleTokenOwner).create(
                publicSaleContract.name,
                publicSaleContract.owner.address,
                [
                    saleToken.address,
                    account5.address,
                    vaultAddress,
                ],
                1
            );
        
            let afterTotalCreatedContracts = await publicFactory.totalCreatedContracts();
        
            publicSaleContract.index = prevTotalCreatedContracts;
            expect(afterTotalCreatedContracts).to.be.equal(prevTotalCreatedContracts.add(1));
        
            let info = await publicFactory.connect(saleOwner).getContracts(publicSaleContract.index);
            expect(info.name).to.be.equal(publicSaleContract.name);
            publicSaleContract.contractAddress = info.contractAddress;

            saleContract = new ethers.Contract( publicSaleContract.contractAddress, PublicSale2_ABI.abi, ethers.provider );
            let deployTime1 = await saleContract.deployTime();
            console.log(Number(deployTime1))
            deployTime = Number(await time.latest())
            console.log(deployTime)
            expect(await saleContract.isAdmin(saleTokenOwner.address)).to.be.equal(false);
            expect(await saleContract.isAdmin(upgradeAdmin.address)).to.be.equal(true);
            expect(await saleContract.isProxyAdmin(upgradeAdmin.address)).to.be.equal(true);
            expect(await saleContract.isAdmin(publicSaleContract.owner.address)).to.be.equal(true);
            //2,000,000의 판매량
            await saleToken.connect(saleTokenOwner).transfer(saleContract.address, totalBigAmount)
            
            //account1 = WTON 60, TON 200
            //account2 = WTON 400, TON 120
            //account3 = WTON 300, TON 520
            //account4 = WTON 0, TON 1100
            //account6 = WTON 0, TON 300
            await getToken.connect(saleTokenOwner).transfer(account1.address, account1BigTONAmount)
            await wton.connect(saleTokenOwner).transfer(account1.address, account1BigWTONAmount)
 
            await getToken.connect(saleTokenOwner).transfer(account2.address, account2BigTONAmount)
            await wton.connect(saleTokenOwner).transfer(account2.address, account2BigWTONAmount)

            await getToken.connect(saleTokenOwner).transfer(account3.address, account3BigTONAmount)
            await wton.connect(saleTokenOwner).transfer(account3.address, account3BigWTONAmount)

            await getToken.connect(saleTokenOwner).transfer(account4.address, account4BigTONAmount)
            await getToken.connect(saleTokenOwner).transfer(account6.address, account6BigTONAmount)
        });

        it("duration the time", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [deployTime + 600]);
            await ethers.provider.send('evm_mine');
        })

        it("#3-12. transfer tos", async () => {
            await tos.connect(deployer).transfer(tester1.account.address, tosAmount);
            await tos.connect(deployer).transfer(tester2.account.address, tosAmount);
            await tos.connect(deployer).transfer(tester3.account.address, tosAmount);
            await tos.connect(deployer).transfer(tester4.account.address, tosAmount);
            await tos.connect(deployer).transfer(tester6.account.address, tosAmount);
        })

        // it("for test setSnapshot", async () => {
        //     const block = await ethers.provider.getBlock('latest')
        //     if (!block) {
        //         throw new Error('null block returned from provider')
        //     }
        //     setSnapshot = block.timestamp;
        //     console.log(Number(setSnapshot))
        // })

        // it("#3-13. tos grantRole the LockTOS", async () => {
        //     let adminPermit = "0xdf8b4c520ffe197c5343c6f5aec59570151ef9a492f2c624fd45ddde6135ec42"
        //     let tx = await tos.hasRole(
        //         adminPermit,
        //         deployer.address
        //     )
        //     console.log("tx : ", tx);
        //     let permitHash = "0xb397c60dd7b1c20a49e703fbb963429124e983fa44a000cb3d8ac4357d984a88"
        //     console.log(deployer.address);
        //     await tos.connect(deployer).grantRole(
        //         adminPermit,
        //         lockTOS.address
        //     )
        // })

        it("#3-13. should create locks for user", async function () {
            expect(await lockTOS.balanceOf(tester1.account.address)).to.be.equal(0);
            expect(await lockTOS.balanceOf(tester2.account.address)).to.be.equal(0);

            await tos.connect(tester1.account).approve(lockTOS.address, 15500) 
            await lockTOS.connect(tester1.account).createLock(15500, 2);

            let userLocks = await lockTOS.connect(tester1.account).locksOf(tester1.account.address);
            let lockId = userLocks[userLocks.length - 1];
            expect(lockId).to.be.equal(1);
            tester1.lockTOSIds.push(lockId);


            await tos.connect(tester2.account).approve(lockTOS.address, 35000) 
            await lockTOS.connect(tester2.account).createLock(35000, 2);

            userLocks = await lockTOS.connect(tester2.account).locksOf(tester2.account.address);
            lockId = userLocks[userLocks.length - 1];
            expect(lockId).to.be.equal(2);
            tester2.lockTOSIds.push(lockId);


            await tos.connect(tester3.account).approve(lockTOS.address, 170000) 
            await lockTOS.connect(tester3.account).createLock(170000, 2);

            userLocks = await lockTOS.connect(tester3.account).locksOf(tester3.account.address);
            lockId = userLocks[userLocks.length - 1];
            expect(lockId).to.be.equal(3);
            tester3.lockTOSIds.push(lockId);


            await tos.connect(tester4.account).approve(lockTOS.address, 650000) 
            await lockTOS.connect(tester4.account).createLock(650000, 2);

            userLocks = await lockTOS.connect(tester4.account).locksOf(tester4.account.address);
            lockId = userLocks[userLocks.length - 1];
            expect(lockId).to.be.equal(4);
            tester4.lockTOSIds.push(lockId);


            await tos.connect(tester6.account).approve(lockTOS.address, 650000) 
            await lockTOS.connect(tester6.account).createLock(650000, 2);

            userLocks = await lockTOS.connect(tester6.account).locksOf(tester6.account.address);
            lockId = userLocks[userLocks.length - 1];
            expect(lockId).to.be.equal(5);
            tester6.lockTOSIds.push(lockId);

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
    });

    describe("#4. vestingPublicFund deploy & setting", () => {
        it("#4-1. deploy VestingPublicFundFactory", async () => {
            const contract = await (
                await ethers.getContractFactory(
                    VestingFundFactory.abi,
                    VestingFundFactory.bytecode
                )
            ).deploy();

            await contract.deployed();
            vestingPublicFundFactory = await ethers.getContractAt(VestingFundFactory.abi,contract.address);
            let code = await ethers.provider.getCode(vestingPublicFundFactory.address);
            expect(code).to.not.eq("0x"); 
        })

        it("#4-2. deploy VestingPublicFundLogic", async () => {
            const contract = await (
                await ethers.getContractFactory(
                    VestingFundLogic.abi,
                    VestingFundLogic.bytecode
                )
            ).deploy();

            await contract.deployed();
            vestingPublicFundLogic = await ethers.getContractAt(VestingFundLogic.abi,contract.address);
            let code = await ethers.provider.getCode(vestingPublicFundLogic.address);
            expect(code).to.not.eq("0x"); 
        })

        it("#4-3. set logic", async () => {
            await vestingPublicFundFactory.connect(deployer).setLogic(vestingPublicFundLogic.address);

            expect(await vestingPublicFundFactory.vaultLogic()).to.be.eq(vestingPublicFundLogic.address);
        })

        it("#4-4. setUpgradeAdmin ", async () => {
            await vestingPublicFundFactory.connect(deployer).setUpgradeAdmin(upgradeAdmin.address);
            expect(await vestingPublicFundFactory.upgradeAdmin()).to.be.eq(upgradeAdmin.address);
        });

        it("#4-5. setBaseInfo : when not admin, fail ", async () => {
            await vestingPublicFundFactory.connect(deployer).setBaseInfo([ton.address, daoAccount.address]);
            expect(await vestingPublicFundFactory.token()).to.be.eq(ton.address);
            expect(await vestingPublicFundFactory.daoAddress()).to.be.eq(daoAccount.address);
        });

        it("#4-6. setLogEventAddress   ", async () => {
            await vestingPublicFundFactory.connect(deployer).setLogEventAddress(eventLogAddress);
            expect(await vestingPublicFundFactory.logEventAddress()).to.be.eq(eventLogAddress);
        });

        it("#4-7. create : vestingPublicFundProxy", async () => {
            let tx = await vestingPublicFundFactory.create(
                vaultInfo.name,
                saleContract.address,
                getTokenOwner.address
            );
            vaultInfo.admin = daoAccount;

            const receipt = await tx.wait();
            let _function ="CreatedVestingPublicFund(address,string)";
            let interface = vestingPublicFundFactory.interface;

            for(let i=0; i< receipt.events.length; i++){
                if(receipt.events[i].topics[0] == interface.getEventTopic(_function)){
                    let data = receipt.events[i].data;
                    let topics = receipt.events[i].topics;
                    let log = interface.parseLog(
                    {  data,  topics } );
                    fundVaultAddress = log.args.contractAddress;
                    vaultInfo.contractAddress = fundVaultAddress;
                }
            }

            expect(await vestingPublicFundFactory.totalCreatedContracts()).to.be.eq(1);
            expect((await vestingPublicFundFactory.getContracts(0)).contractAddress).to.be.eq(fundVaultAddress);
            expect((await vestingPublicFundFactory.lastestCreated()).contractAddress).to.be.eq(fundVaultAddress);

            // let VaultContract = await ethers.getContractAt("VestingPublicFundProxy", fundVaultAddress);
            let VaultContract = await ethers.getContractAt(VestingFundLogicProxy.abi, fundVaultAddress);
            // let VaultContract = new ethers.Contract( fundVaultAddress, VestingFundProxy.abi, ethers.provider );
            vestingPublicFundProxy = VaultContract;

            vestingPublicFund = await ethers.getContractAt(VestingFundLogic.abi, fundVaultAddress);

            expect(await VaultContract.isProxyAdmin(upgradeAdmin.address)).to.be.eq(true);
            expect(await VaultContract.isProxyAdmin(vaultInfo.admin.address)).to.be.eq(false);

            expect(await VaultContract.isAdmin(vaultInfo.admin.address)).to.be.eq(true);
            expect(await VaultContract.isAdmin(upgradeAdmin.address)).to.be.eq(true);

            expect(await vestingPublicFundFactory.token()).to.be.eq(await vestingPublicFundProxy.token());
            expect(getTokenOwner.address).to.be.eq(await vestingPublicFundProxy.receivedAddress());
            expect(saleContract.address).to.be.eq(await vestingPublicFundProxy.publicSaleVaultAddress());
        })
    })

    describe("#5. setting the PublicSale", () => {
        it("#5-1. check the balance (contract have the saleToken) ", async () => {
            balance1 = await saleToken.balanceOf(saleContract.address)

            expect(Number(balance1)).to.be.equal(Number(totalBigAmount))
        })

         //setting owner test
        it('#5-2. setAllsetting caller not owner', async () => {
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

            let tx = saleContract.connect(account1).setAllsetting(
                [100, 200, 1000, 4000, 600, 1200, 2200, 6000],
                [round1SaleAmount, round2SaleAmount, saleTokenPrice, payTokenPrice, hardcapAmount, changeTOS],
                [setSnapshot, whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime, depositStartTime, depositEndTime, claimCounts],
                [claimTime1,claimTime2,claimTime3,claimTime4,claimTime5],
                [claimPercent1,claimPercent2,claimPercent3,claimPercent4,claimPercent5]
            )
            await expect(tx).to.be.revertedWith("Accessible: Caller is not an admin")
        })

        it("#5-3. setAllsetting snapshot error", async () => {
            let smallsnapshot = setSnapshot-100;
            let tx = saleContract.connect(saleOwner).setAllsetting(
                [100, 200, 1000, 4000, 600, 1200, 2200, 6000],
                [round1SaleAmount, round2SaleAmount, saleTokenPrice, payTokenPrice, hardcapAmount, changeTOS],
                [smallsnapshot, whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime, depositStartTime, depositEndTime, claimCounts],
                [claimTime1,claimTime2,claimTime3,claimTime4,claimTime5],
                [claimPercent1,claimPercent2,claimPercent3,claimPercent4,claimPercent5]
            )
            await expect(tx).to.be.revertedWith("snapshot need later")
        })

        //PublicSale setting owner
        it('#5-4. setAllsetting caller owner', async () => {
            await saleContract.connect(saleOwner).setAllsetting(
                [100, 200, 1000, 4000, 600, 1200, 2200, 6000],
                [round1SaleAmount, round2SaleAmount, saleTokenPrice, payTokenPrice, hardcapAmount, changeTOS],
                [setSnapshot, whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime, depositStartTime, depositEndTime, claimCounts],
                [claimTime1,claimTime2,claimTime3,claimTime4,claimTime5],
                [claimPercent1,claimPercent2,claimPercent3,claimPercent4,claimPercent5]
            )

            let tx = await saleContract.connect(saleOwner).saleTokenPrice()
            let tx2 = await saleContract.connect(saleOwner).payTokenPrice()
            // console.log("tx : ", tx)
            expect(tx).to.be.equal(saleTokenPrice)
            // console.log("tx : ", tx2)
            expect(tx2).to.be.equal(payTokenPrice)

            let tx3 = Number(await saleContract.connect(saleOwner).totalExpectSaleAmount())
            // console.log("tx3 : ", tx3)
            expect(tx3).to.be.equal(Number(round1SaleAmount))
            let tx4 = Number(await saleContract.connect(saleOwner).totalExpectOpenSaleAmount())
            // console.log("tx4 : ", tx4)
            expect(tx4).to.be.equal(Number(round2SaleAmount))
            
            let tx5 = Number(await saleContract.connect(saleOwner).tiers(1))
            expect(tx5).to.be.equal(100)
            let tx6 = Number(await saleContract.connect(saleOwner).tiers(2))
            expect(tx6).to.be.equal(200)
            let tx7 = Number(await saleContract.connect(saleOwner).tiers(3))
            expect(tx7).to.be.equal(1000)
            let tx8 = Number(await saleContract.connect(saleOwner).tiers(4))
            expect(tx8).to.be.equal(4000)
            let tx9 = Number(await saleContract.connect(saleOwner).tiersPercents(1))
            expect(tx9).to.be.equal(600)
            let tx10 = Number(await saleContract.connect(saleOwner).tiersPercents(2))
            expect(tx10).to.be.equal(1200)
            let tx11 = Number(await saleContract.connect(saleOwner).tiersPercents(3))
            expect(tx11).to.be.equal(2200)
            let tx12 = Number(await saleContract.connect(saleOwner).tiersPercents(4))
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

            let tx13 = Number(await saleContract.startExclusiveTime())
            expect(tx13).to.be.equal(exclusiveStartTime)
            let tx14 = Number(await saleContract.endExclusiveTime())
            expect(tx14).to.be.equal(exclusiveEndTime)
            let tx15 = Number(await saleContract.startAddWhiteTime())
            expect(tx15).to.be.equal(whitelistStartTime)
            let tx16 = Number(await saleContract.endAddWhiteTime())
            expect(tx16).to.be.equal(whitelistEndTime)

            let tx17 = Number(await saleContract.claimTimes(0))
            expect(tx17).to.be.equal(claimTime1)
            let tx18 = Number(await saleContract.totalClaimCounts())
            expect(tx18).to.be.equal(claimCounts)
        })

        it("#5-5. changeTONOwner to VestingFund", async () => {
            await saleContract.connect(saleOwner).changeTONOwner(
                fundVaultAddress
            )
            let tx = await saleContract.getTokenOwner()
            expect(tx).to.be.equal(fundVaultAddress);
        })

    })

    describe("#6. PublicSale", () => {
        describe("#6-1. round1 Sale", () => {
            it("#6-1-1. calculTierAmount test before addwhiteList", async () => {
                let big60000 = ethers.utils.parseUnits("60000", 18);
                let big120000 = ethers.utils.parseUnits("120000", 18);
                let big220000 = ethers.utils.parseUnits("220000", 18);
                let big600000 = ethers.utils.parseUnits("600000", 18);
                let tx = Number(await saleContract.calculTierAmount(account1.address))
                expect(tx).to.be.equal(Number(big60000))
                let tx2 = Number(await saleContract.calculTierAmount(account2.address))
                expect(tx2).to.be.equal(Number(big120000))
                let tx3 = Number(await saleContract.calculTierAmount(account3.address))
                expect(tx3).to.be.equal(Number(big220000))
                let tx4 = Number(await saleContract.calculTierAmount(account4.address))
                expect(tx4).to.be.equal(Number(big600000))
                let tx5 = Number(await saleContract.calculTierAmount(account6.address))
                expect(tx5).to.be.equal(Number(big600000))
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [whitelistStartTime]);
                await ethers.provider.send('evm_mine');
            })

            it("#6-1-2. addWhiteList", async () => {
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
                
                let big300000 = ethers.utils.parseUnits("300000", 18);
                let big600000 = ethers.utils.parseUnits("600000", 18);
                let tx10 = Number(await saleContract.calculTierAmount(account6.address))
                expect(tx10).to.be.equal(Number(big300000))

                let tx11 = Number(await saleContract.calculTierAmount(account4.address))
                expect(tx11).to.be.equal(Number(big600000))

                let tx12 = Number(await saleContract.connect(tester6.account).tiersAccount(4))
                expect(tx12).to.be.equal(1)
                await saleContract.connect(tester6.account).addWhiteList()
                let tx13 = Number(await saleContract.connect(tester6.account).tiersAccount(4))
                expect(tx13).to.be.equal(2)

                let tx14 = Number(await saleContract.calculTierAmount(account6.address))
                expect(tx14).to.be.equal(Number(big300000))

                let tx15 = Number(await saleContract.calculTierAmount(account4.address))
                expect(tx15).to.be.equal(Number(big300000))

                let tx16 = Number(await saleContract.totalWhitelists())
                expect(tx16).to.be.equal(5)
            })

            it("#6-1-3. calculation the inputAmount", async () => {
                let tx = Number(await saleContract.calculPayToken(60000))
                expect(tx).to.be.equal(60)
                let tx2 = Number(await saleContract.calculPayToken(120000))
                expect(tx2).to.be.equal(120)
                let tx3 = Number(await saleContract.calculPayToken(220000))
                expect(tx3).to.be.equal(220)
                let tx4 = Number(await saleContract.calculPayToken(300000))
                expect(tx4).to.be.equal(300)
                let tx5 = Number(await saleContract.calculPayToken(300000))
                expect(tx5).to.be.equal(300)
            })

            it("#6-1-4. calculTierAmount test after addwhiteList", async () => {
                let big60000 = ethers.utils.parseUnits("60000", 18);
                let big120000 = ethers.utils.parseUnits("120000", 18);
                let big220000 = ethers.utils.parseUnits("220000", 18);
                let big300000 = ethers.utils.parseUnits("300000", 18);
                let tx = Number(await saleContract.calculTierAmount(account1.address))
                expect(tx).to.be.equal(Number(big60000))
                let tx2 = Number(await saleContract.calculTierAmount(account2.address))
                expect(tx2).to.be.equal(Number(big120000))
                let tx3 = Number(await saleContract.calculTierAmount(account3.address))
                expect(tx3).to.be.equal(Number(big220000))
                let tx4 = Number(await saleContract.calculTierAmount(account4.address))
                expect(tx4).to.be.equal(Number(big300000))
                let tx5 = Number(await saleContract.calculTierAmount(account6.address))
                expect(tx5).to.be.equal(Number(big300000))
            })

            it("#6-1-5. exclusiveSale before exclusive startTime", async () => {
                await getToken.connect(account1).approve(saleContract.address, 60)
                let tx = saleContract.connect(account1).exclusiveSale(account1.address,60)
                await expect(tx).to.be.revertedWith("PublicSale: exclusiveStartTime has not passed")
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [exclusiveStartTime]);
                await ethers.provider.send('evm_mine');

                await time.increaseTo(exclusiveStartTime+86400);
            })

            it("#6-1-6. addwhitelist after whitelistTIme", async () => {
                let tx = saleContract.connect(account1).addWhiteList()
                await expect(tx).to.be.revertedWith("PublicSale: end the whitelistTime")
            })

            it("#6-1-7. exclusiveSale after exclusive startTime", async () => {
                let big60 = ethers.utils.parseUnits("60", 18);
                let big120 = ethers.utils.parseUnits("120", 18);
                let big220 = ethers.utils.parseUnits("220", 18);
                let big300 = ethers.utils.parseUnits("300", 18);

                await wton.connect(account1).approveAndCall(saleContract.address, account1BigWTONAmount, 0);
                let tx = await saleContract.usersEx(account1.address)
                expect(Number(tx.payAmount)).to.be.equal(Number(big60))

                await getToken.connect(account2).approveAndCall(saleContract.address, big120, 0);
                let tx2 = await saleContract.usersEx(account2.address)
                expect(Number(tx2.payAmount)).to.be.equal(Number(big120))

                await getToken.connect(account3).approveAndCall(saleContract.address, big220, 0);
                let tx3 = await saleContract.usersEx(account3.address)
                expect(Number(tx3.payAmount)).to.be.equal(Number(big220))

                await getToken.connect(account4).approveAndCall(saleContract.address, big300, 0);
                let tx4 = await saleContract.usersEx(account4.address)
                expect(Number(tx4.payAmount)).to.be.equal(Number(big300))

                await getToken.connect(account6).approveAndCall(saleContract.address, account6BigTONAmount, 0);
                let tx5 = await saleContract.usersEx(account6.address)
                expect(Number(tx5.payAmount)).to.be.equal(Number(account6BigTONAmount))

                let big1000 = ethers.utils.parseUnits("1000", 18);
                let big1000000 = ethers.utils.parseUnits("1000000", 18);
                let tx6 = Number(await saleContract.totalExPurchasedAmount())
                expect(tx6).to.be.equal(Number(big1000))
                let tx7 = Number(await saleContract.totalExSaleAmount())
                expect(tx7).to.be.equal(Number(big1000000))
            })
        })

        describe("#6-2. round2 Sale", () => {
            it("#6-2-1. deposit before depositTime", async () => {
                let tx = saleContract.connect(account1).deposit(account1.address,100)
                await expect(tx).to.be.revertedWith("PublicSale: don't start depositTime")
            })

            it("duration the time", async () => {
                await ethers.provider.send('evm_setNextBlockTimestamp', [depositStartTime]);
                await ethers.provider.send('evm_mine');
            })

            it("#6-2-2. deposit after depositTime", async () => {
                account1Before = Number(await getToken.balanceOf(account1.address))
                account2Before = Number(await getToken.balanceOf(account2.address))
                account3Before = Number(await getToken.balanceOf(account3.address))
                account4Before = Number(await getToken.balanceOf(account4.address))

                let big50 = ethers.utils.parseUnits("50", 18);
                let big100 = ethers.utils.parseUnits("100", 18);
                let big150 = ethers.utils.parseUnits("150", 18);
                let big200 = ethers.utils.parseUnits("200", 18);

                await wton.connect(account3).approve(saleContract.address, account3BigWTONAmount)         
                await getToken.connect(account1).approveAndCall(saleContract.address, big50, 0);
                await wton.connect(account2).approveAndCall(saleContract.address, account2BigWTONAmount, 0);

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

                await getToken.connect(account3).approveAndCall(saleContract.address, big150, 0);
                await getToken.connect(account4).approveAndCall(saleContract.address, big200, 0);

                let tx = await saleContract.usersOpen(account1.address)
                expect(Number(tx.depositAmount)).to.be.equal(Number(big50))
                let tx2 = await saleContract.usersOpen(account2.address)
                expect(Number(tx2.depositAmount)).to.be.equal(Number(big100))
                let tx3 = await saleContract.usersOpen(account3.address)
                expect(Number(tx3.depositAmount)).to.be.equal(Number(big150))
                let tx4 = await saleContract.usersOpen(account4.address)
                expect(Number(tx4.depositAmount)).to.be.equal(Number(big200))
            })
        })
    })

    describe("#7. claim", () => {
        it("#7-1. claim before claimTime", async () => {
            let tx = saleContract.connect(account1).claim()
            await expect(tx).to.be.revertedWith("PublicSale: don't start claimTime")
        })


        it("duration the time to period end", async () => {
            let periodEnd = claimTime5 + (86400*7)
            await ethers.provider.send('evm_setNextBlockTimestamp', [periodEnd]);
            await ethers.provider.send('evm_mine');
        })

        it("#7-2. claim period end, claim call the account3, account4, account6", async () => {
            let expectClaim = await saleContract.calculClaimAmount(account1.address, 0)
            let expectClaim2 = await saleContract.calculClaimAmount(account2.address, 0)
            let expectClaim3 = await saleContract.calculClaimAmount(account3.address, 0)
            let expectClaim4 = await saleContract.calculClaimAmount(account4.address, 0)
            let expectClaim5 = await saleContract.calculClaimAmount(account6.address, 0)

            await saleContract.connect(account1).claim()
            await saleContract.connect(account2).claim()
            await saleContract.connect(account3).claim()
            await saleContract.connect(account4).claim()
            await saleContract.connect(account6).claim()

            let tx1 = await saleToken.balanceOf(account1.address)
            let tx2 = await saleToken.balanceOf(account2.address)
            let tx3 = await saleToken.balanceOf(account3.address)
            let tx4 = await saleToken.balanceOf(account4.address)
            let tx6 = await saleToken.balanceOf(account6.address)

            expect(Number(tx1)).to.be.equal(Number(expectClaim._totalClaim))
            expect(Number(tx2)).to.be.equal(Number(expectClaim2._totalClaim))
            expect(Number(tx3)).to.be.equal(Number(expectClaim3._totalClaim))
            expect(Number(tx4)).to.be.equal(Number(expectClaim4._totalClaim))
            expect(Number(tx6)).to.be.equal(Number(expectClaim5._totalClaim))
        })

        it("#7-3. no refund check", async () => {
            let tx = await saleContract.usersClaim(account1.address)
            expect(Number(tx.refundAmount)).to.be.equal(0)
            let tx2 = await saleContract.usersClaim(account2.address)
            expect(Number(tx2.refundAmount)).to.be.equal(0)
            let tx3 = await saleContract.usersClaim(account3.address)
            expect(Number(tx3.refundAmount)).to.be.equal(0)
            let tx4 = await saleContract.usersClaim(account4.address)
            expect(Number(tx4.refundAmount)).to.be.equal(0)
        })

        it("#7-4. contract have 1500TON", async () => {
            let checkTON = await ton.balanceOf(saleContract.address);
            expect(Number(checkTON)).to.be.eq(Number(contracthaveTON));
        })

        it("#7-5. depositWithdraw test before exchangeWTONtoTOS", async () => {
            let tx = saleContract.connect(saleOwner).depositWithdraw();
            await expect(tx).to.be.revertedWith("PublicSale : need the exchangeWTONtoTOS")
        })
        
        it("#7-6. exchangeWTONtoTOS test", async () => {
            let tosValue = await tos.balanceOf(vaultAddress);
            console.log(Number(tosValue))
            expect(tosValue).to.be.equal(0);
            await saleContract.connect(saleOwner).exchangeWTONtoTOS(contractChangeWTON4,uniswapInfo.wtonTosPool);
        })

        it("#7-7. check tos", async () => {
            let tosValue = await tos.balanceOf(vaultAddress);
            console.log(Number(tosValue))
            expect(tosValue).to.be.above(0);
        })

        it("#7-8. check getAmount value", async () => {
            let hardcapValue = await saleContract.hardcapCalcul();
            let getAmount = await ton.balanceOf(saleContract.address);
            console.log("hardcapValue :", Number(hardcapValue));
            console.log("getAmount :", Number(getAmount));
            let overflow = Number(getAmount)-Number(hardcapValue);
            console.log("overflow :", Number(overflow));
        })

        it("#7-9. depositWithdraw test after exchangeWTONtoTOS", async () => {
            let balance1 = await ton.balanceOf(fundVaultAddress);
            expect(balance1).to.be.equal(0);
            await saleContract.connect(saleOwner).depositWithdraw();

            let balance2 = await ton.balanceOf(fundVaultAddress);
            console.log("balance2 :",Number(balance2));
            expect(balance2).to.be.equal(getTokenOwnerHaveTON);
        })
    })
})