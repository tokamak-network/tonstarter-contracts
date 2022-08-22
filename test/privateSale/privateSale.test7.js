const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");
const utils = ethers.utils;

const JSBI = require('jsbi');
const BN = require("bn.js");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { expect, assert } = chai;
chai.use(require("chai-bn")(BN));
chai.use(solidity);
require("chai").should();

const {
    padLeft,
    toBN,
    toWei,
    fromWei,
    keccak256,
    soliditySha3,
    solidityKeccak256,
} = require("web3-utils");

const {
defaultSender,
accounts,
contract,
web3,
privateKeys,
} = require("@openzeppelin/test-environment");

const {
ICO20Contracts,
PHASE2_ETHTOS_Staking,
PHASE2_MINING_PERSECOND,
HASH_PHASE2_ETHTOS_Staking,
} = require("../../utils/ico_test_deploy_ethers.js");

const {
getAddresses,
findSigner,
setupContracts,
mineBlocks,
} = require("../hardhat-test/utils");

const { timeout } = require("../common.js");

const Web3EthAbi = require("web3-eth-abi");
const abiDecoder = require("abi-decoder");
const PrivateSale_ABI = require('../../artifacts/contracts/sale/PrivateSale.sol/PrivateSale.json');
const { ZERO_BYTES32 } = require("@openzeppelin/test-helpers/src/constants");

let deployedUniswapV3;
let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
const zeroAddress = "0x0000000000000000000000000000000000000000";
let vaultAddress = null;
let deployer;
let secondsPerMining;

const tester1 = {
    account: null,
    wtonAmount: null,
    tonAmount: null,
    buyAmount: null,
    wtonbalanceBefore: 0,
    tonbalanceBefore: 0,
    claimAccount: null
};
const tester2 = {
    account: null,
    wtonAmount: null,
    tonAmount: null,
    buyAmount: null,
    wtonbalanceBefore: 0,
    tonbalanceBefore: 0,
    claimAccount: null
};

const tester3 = {
    account: null,
    wtonAmount: null,
    tonAmount: null,
    buyAmount: null,
    wtonbalanceBefore: 0,
    tonbalanceBefore: 0,
    claimAccount: null
};



// async function approve(token, account, to, amount ) {
//     const tx = await token
//           .connect(account)
//           .approve(to, amount );
  
//     await tx.wait();
  
//     expect(
//         await token.allowance(
//           account.address,
//           to
//         )
//       ).to.be.equal(amount);
  
//     return [token, account];
// }

describe("PrivateSale", function () {
    let sender;
    let usersInfo;
    let tos, stakeregister, stakefactory, stake1proxy, stake1logic;
    let vault_phase1_eth,
      vault_phase1_ton,
      vault_phase1_tosethlp,
      vault_phase1_dev;
    let ton, wton, depositManager, seigManager;
    let domToken, dom;
    let privateSale, privateSalelogicContract;
    let privateSaleProxy,  privateSaleProxyContract;
    let privateSaleContract;

    let accountlist;
    let user1, user2, user3, user4, user5, user6;
    let admin;
    let lowerAdmin;
    let defaultSender;
    let owner;
    let getTONaddress;
    
    let saleStartTime, saleEndTime, firstClaimTime, claimStartTime;
    let tonPrice = 20000;
    let domPrice = 16;
    const oneday = 86400;

    let account1first = 62500
    let bigAccount1first = ethers.utils.parseUnits("62500", 18);
    let account1Total = 1250000
    let bigAccount1Total = ethers.utils.parseUnits("1250000", 18);
    
    let account2first = 187500
    let bigAccount2first = ethers.utils.parseUnits("187500", 18);
    let account2Total = 3750000
    let bigAccount2Total = ethers.utils.parseUnits("3750000", 18);
    
    let account3first = 375000
    let bigAccount3first = ethers.utils.parseUnits("375000", 18);
    let account3Total = 7500000
    let bigAccount3Total = ethers.utils.parseUnits("7500000", 18);

    let account1tonAllowance;
    let account2wtonAllowance;

    let claimCounts = 5;

    let claim1Times;
    let claim2Times;
    let claim3Times;
    let claim4Times;
    let claim5Times;

    let claim1Percents = 2000;
    let claim2Percents = 2000;
    let claim3Percents = 2000;
    let claim4Percents = 2000;
    let claim5Percents = 2000;
    
    //시나리오
    //tester1 : ton으로 1000개 구매, tester2 : ton으로 3000개 wton으로 0개 구매, tester3 : wton으로 6000개 구매
    //TON = 20,000원 , DoM = 16원 => 1TON = 1,250 DoM
    //privateSaleTotalAmount = 12,500,000 DoM,  fisrtClaimTotalAmount = 625,000, 나머지 = 11,875,000, 매달 = 989,583.3333333~
    //account1 = 1000TON 삼, firstClaim = 62,500, 매달 98,958.33333, totalAmount = 1,250,000
    //account2 = 30000TON 삼, fisrtClaim = 187,500, 매달 296,874.99999, totalAmount = 3,750,000
    //account3 = 6000TON 삼, fisrtClaim = 375,000, 매달 593,749.999998, totalAmount = 7,500,000
    //saleStartTime = nowblock + 10, saleEndTime = startTime + 1day, fisrtClaimTime = endTime + 1day, claimTime = endTime + 180day
    before(async () => {
        ico20Contracts = new ICO20Contracts();
        accountlist = await getAddresses();
    
        defaultSender = accountlist[0];
        // console.log("defaultSender :", defaultSender )
        user1 = accountlist[1];
        user2 = accountlist[2];
        user3 = accountlist[3];
        user4 = await findSigner(accountlist[4]);
        user5 = await findSigner(accountlist[5]);
        user6 = await findSigner(accountlist[6]);
        admin = await findSigner(accountlist[7]);
        getTONaddress = await findSigner(accountlist[8]); 
        tester1.claimAccount = await findSigner(accountlist[9]);
        tester2.claimAccount = await findSigner(accountlist[10]);
        tester3.claimAccount = await findSigner(accountlist[11]);
        lowerAdmin = await findSigner(accountlist[11]);

    
        sender = await ico20Contracts.findSigner(defaultSender);
        tester1.account = await ico20Contracts.findSigner(user1);
        tester2.account = await ico20Contracts.findSigner(user2);
        tester3.account = await ico20Contracts.findSigner(user3);
        owner = sender;
    
        tester1.wtonAmount = ethers.utils.parseUnits("0", 27);
        tester1.tonAmount = ethers.utils.parseUnits("1000", 18);
        tester1.buyAmount = ethers.utils.parseUnits("1000", 18);
        account1tonAllowance = ethers.utils.parseUnits("2000", 18);
        
    
        tester2.wtonAmount = ethers.utils.parseUnits("0", 27);
        tester2.tonAmount = ethers.utils.parseUnits("3000", 18);
        tester2.buyAmount = ethers.utils.parseUnits("3000", 18);
        account2wtonAllowance = ethers.utils.parseUnits("5000", 27);

        tester3.wtonAmount = ethers.utils.parseUnits("6000", 27);
        tester3.tonAmount = ethers.utils.parseUnits("0", 18);
        tester3.buyAmount = ethers.utils.parseUnits("6000", 18);
    });

    describe("# 1. Deploy WTON, TON", async function() {
        it("1. ico20Contracts init  ", async function () {
            this.timeout(1000000);
            ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
              defaultSender
            );
        });

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

            await ton.mint(tester1.account.address, tester1.tonAmount, {
                from: defaultSender,
            });
            await ton.mint(tester2.account.address, tester2.tonAmount, {
                from: defaultSender,
            });
            await ton.mint(tester3.account.address, tester3.tonAmount, {
                from: defaultSender,
            });
      
            await wton.mint(tester1.account.address, tester1.wtonAmount, {
                from: defaultSender,
            });
            await wton.mint(tester2.account.address, tester2.wtonAmount, {
                from: defaultSender,
            });
            await wton.mint(tester3.account.address, tester3.wtonAmount, {
                from: defaultSender,
            });
        });
    })

    describe("# 2. Deploy DoM Token & privateSale", async function () {
        it("1. DoM Token init", async function () {
            domToken = await ethers.getContractFactory("ERC20Mock");
            dom = await domToken.connect(owner).deploy("DoMToken", "DOM");
        });

        it("2. privateSale init", async function () {
            privateSale = await ethers.getContractFactory("PrivateSale");
            privateSalelogicContract = await privateSale.connect(admin).deploy()

            privateSaleProxy = await ethers.getContractFactory("PrivateSaleProxy");
            privateSaleProxyContract = await privateSaleProxy.connect(admin).deploy(
                privateSalelogicContract.address, 
                admin.address
            );

            await privateSaleProxyContract.connect(admin).initialize(
                wton.address,
                dom.address,
                ton.address,
                getTONaddress.address
            );

            privateSaleContract = new ethers.Contract( privateSaleProxyContract.address, PrivateSale_ABI.abi, ethers.provider );
        });

        it("3. transfer domAmount", async function() {
            let privateSaleAmount = ethers.utils.parseUnits("12500000", 18)
            await dom.connect(owner).transfer(privateSaleContract.address, privateSaleAmount)
            let tx = await dom.balanceOf(privateSaleContract.address);
            expect(tx).to.be.equal(privateSaleAmount);
        })
    })

    describe("# 3. setting test", async function () {
        it("add lowerAdmin", async () => {
            await privateSaleContract.connect(admin).addAdmin(lowerAdmin.address)
        })

        it('AddressSetting check', async () => {
            expect(await privateSaleContract.wton()).to.be.equal(wton.address)
            expect(await privateSaleContract.saleToken()).to.be.equal(dom.address)
            expect(await privateSaleContract.getToken()).to.be.equal(ton.address)
            expect(await privateSaleContract.getTokenOwner()).to.be.equal(getTONaddress.address)
        })
        
        it('settingAll caller is not owner', async () => {
            let block = await ethers.provider.getBlock();
            saleStartTime = block.timestamp + 10;
            saleEndTime = saleStartTime + oneday;
            claim1Times = saleEndTime + oneday;
            claim2Times = claim1Times + 20;
            claim3Times = claim2Times + 20;
            claim4Times = claim3Times + 20;
            claim5Times = claim4Times + 20;

            await expect(privateSaleContract.connect(user4).setAllsetting(
                [saleStartTime,saleEndTime],
                [domPrice,tonPrice],
                claimCounts,
                [claim1Times,claim2Times,claim3Times,claim4Times,claim5Times],
                [claim1Percents,claim2Percents,claim3Percents,claim4Percents,claim5Percents]
            )).to.be.revertedWith('Accessible: Caller is not an admin')
        })

        it("settingPause true, lowerAdmin don't setting", async () => {
            await privateSaleContract.connect(admin).setSettingPause(true);

            let block = await ethers.provider.getBlock();
            saleStartTime = block.timestamp + 10;
            saleEndTime = saleStartTime + oneday;
            claim1Times = saleEndTime + oneday;
            claim2Times = claim1Times + 20;
            claim3Times = claim2Times + 20;
            claim4Times = claim3Times + 20;
            claim5Times = claim4Times + 20;

            await expect(privateSaleContract.connect(lowerAdmin).setAllsetting(
                [saleStartTime,saleEndTime],
                [domPrice,tonPrice],
                claimCounts,
                [claim1Times,claim2Times,claim3Times,claim4Times,claim5Times],
                [claim1Percents,claim2Percents,claim3Percents,claim4Percents,claim5Percents]
            )).to.be.revertedWith("setting is Pause")
        })

        it("settingPause true, Admin can setting", async () => {
            let block = await ethers.provider.getBlock();
            saleStartTime = block.timestamp + 10;
            saleEndTime = saleStartTime + oneday;
            claim1Times = saleEndTime + oneday;
            claim2Times = claim1Times + 20;
            claim3Times = claim2Times + 20;
            claim4Times = claim3Times + 20;
            claim5Times = claim4Times + 20;

            await privateSaleContract.connect(admin).setAllsetting(
                [saleStartTime,saleEndTime],
                [domPrice,tonPrice],
                claimCounts,
                [claim1Times,claim2Times,claim3Times,claim4Times,claim5Times],
                [claim1Percents,claim2Percents,claim3Percents,claim4Percents,claim5Percents]
            )

            expect(await privateSaleContract.saleStartTime()).to.be.equal(saleStartTime)
            expect(await privateSaleContract.saleEndTime()).to.be.equal(saleEndTime)
            expect(await privateSaleContract.saleTokenPrice()).to.be.equal(domPrice)
            expect(await privateSaleContract.getTokenPrice()).to.be.equal(tonPrice)
            expect(await privateSaleContract.totalClaimCounts()).to.be.equal(claimCounts)
        })

        it("settingPause false", async () => {
            await privateSaleContract.connect(admin).setSettingPause(false);
        })

        it('settingAll caller is owner', async () => {
            let block = await ethers.provider.getBlock();
            saleStartTime = block.timestamp + 10;
            saleEndTime = saleStartTime + oneday;
            claim1Times = saleEndTime + oneday;
            claim2Times = claim1Times + 20;
            claim3Times = claim2Times + 20;
            claim4Times = claim3Times + 20;
            claim5Times = claim4Times + 20;

            await privateSaleContract.connect(lowerAdmin).setAllsetting(
                [saleStartTime,saleEndTime],
                [domPrice,tonPrice],
                claimCounts,
                [claim1Times,claim2Times,claim3Times,claim4Times,claim5Times],
                [claim1Percents,claim2Percents,claim3Percents,claim4Percents,claim5Percents]
            )

            expect(await privateSaleContract.saleStartTime()).to.be.equal(saleStartTime)
            expect(await privateSaleContract.saleEndTime()).to.be.equal(saleEndTime)
            expect(await privateSaleContract.saleTokenPrice()).to.be.equal(domPrice)
            expect(await privateSaleContract.getTokenPrice()).to.be.equal(tonPrice)
            expect(await privateSaleContract.totalClaimCounts()).to.be.equal(claimCounts)
        })
    })

    describe("# 4. whitelist setting", async function () {
        it("buy before saleTime", async () => {
            let buy1 = privateSaleContract.connect(tester1.account).directBuy(
                tester1.claimAccount.address,
                tester1.buyAmount
            )
            await expect(buy1).to.be.revertedWith("privaSale period end")
            let buy2 = privateSaleContract.connect(tester2.account).directBuy(
                tester2.claimAccount.address,
                tester2.buyAmount
            )
            await expect(buy2).to.be.revertedWith("privaSale period end")
            let buy3 = privateSaleContract.connect(tester3.account).directBuy(
                tester3.claimAccount.address,
                tester3.buyAmount
            )
            await expect(buy3).to.be.revertedWith("privaSale period end")            
        })

        it("buy before whitelisting", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [saleStartTime]);
            await ethers.provider.send('evm_mine');
            let buy1 = privateSaleContract.connect(tester1.account).directBuy(
                tester1.claimAccount.address,
                tester1.buyAmount
            )
            await expect(buy1).to.be.revertedWith("need to add whiteList amount")
            let buy2 = privateSaleContract.connect(tester2.account).directBuy(
                tester2.claimAccount.address,
                tester2.buyAmount
            )
            await expect(buy2).to.be.revertedWith("need to add whiteList amount")
            let buy3 = privateSaleContract.connect(tester3.account).directBuy(
                tester3.claimAccount.address,
                tester3.buyAmount
            )
            await expect(buy3).to.be.revertedWith("need to add whiteList amount")            
        })

        it("addwhitelist", async () => {
            await privateSaleContract.connect(admin).addWhiteList(
                tester1.account.address,
                tester1.buyAmount
            )
            let tx = await privateSaleContract.usersWhite(tester1.account.address)
            expect(tx).to.be.equal(tester1.buyAmount);
        })

        it("addWhiteListArray", async () => {
            await privateSaleContract.connect(admin).addWhiteListArray(
                [tester2.account.address,tester3.account.address],
                [tester2.buyAmount,tester3.buyAmount]
            )
            let tx2 = await privateSaleContract.usersWhite(tester2.account.address)
            expect(tx2).to.be.equal(tester2.buyAmount);
            let tx3 = await privateSaleContract.usersWhite(tester3.account.address)
            expect(tx3).to.be.equal(tester3.buyAmount);
        })
    })

    describe("# 5. buy test", () => {
        it("buy caller is whitelist and exact amount for account1 (only TON)", async () => {
            let data = await privateSaleContract.encodeAddressData(tester1.claimAccount.address);
            console.log(data);
            await ton.connect(tester1.account).approveAndCall(privateSaleContract.address,tester1.buyAmount,data);

            let buyTokenAmount = await privateSaleContract.calculSaleToken(tester1.buyAmount);
            
            let tx = await privateSaleContract.usersAmount(tester1.claimAccount.address);
            expect(tx.totaloutputamount).to.be.equal(buyTokenAmount);
            expect(tx.inputamount).to.be.equal(tester1.buyAmount); 

            let tx2 = await privateSaleContract.usersAmount(tester1.account.address);
            expect(tx2.totaloutputamount).to.be.equal(0);
            expect(tx2.inputamount).to.be.equal(0); 
        })

        it("directBuy ton for account2", async () => {
            // let data = await privateSaleContract.encodeAddressData(tester2.claimAccount.address);
            // console.log(data);
            // await ton.connect(tester2.account).approveAndCall(privateSaleContract.address,tester2.buyAmount,data);
            await ton.connect(tester2.account).approve(privateSaleContract.address,tester2.buyAmount)
            await privateSaleContract.connect(tester2.account).directBuy(tester2.claimAccount.address,tester2.buyAmount);

            let buyTokenAmount = await privateSaleContract.calculSaleToken(tester2.buyAmount);
            
            let tx = await privateSaleContract.usersAmount(tester2.claimAccount.address);
            expect(tx.totaloutputamount).to.be.equal(buyTokenAmount);
            expect(tx.inputamount).to.be.equal(tester2.buyAmount); 

            let tx2 = await privateSaleContract.usersAmount(tester2.account.address);
            expect(tx2.totaloutputamount).to.be.equal(0);
            expect(tx2.inputamount).to.be.equal(0); 
        })
        
        it("buy onlywton for account3", async () => {
            let data = await privateSaleContract.encodeAddressData(tester3.claimAccount.address);
            console.log(data);

            await wton.connect(tester3.account).approveAndCall(privateSaleContract.address,tester3.wtonAmount,data);
            
            let buyTokenAmount = await privateSaleContract.calculSaleToken(tester3.buyAmount);

            let tx = await privateSaleContract.usersAmount(tester3.claimAccount.address);
            expect(tx.totaloutputamount).to.be.equal(buyTokenAmount);
            expect(tx.inputamount).to.be.equal(tester3.buyAmount); 

            let tx2 = await privateSaleContract.usersAmount(tester3.account.address);
            expect(tx2.totaloutputamount).to.be.equal(0);
            expect(tx2.inputamount).to.be.equal(0); 
        })
    })

    describe("#6. claim test", () => {
        it("claim try before SaleEnd", async () => {
            await expect(privateSaleContract.connect(tester1.claimAccount).claim()
            ).to.be.revertedWith("need the endSale");   
        })

        it("claim try befroe claimTime", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [saleEndTime+10]);
            await ethers.provider.send('evm_mine');

            await expect(privateSaleContract.connect(tester1.claimAccount).claim()
            ).to.be.revertedWith("need the claimTime");   
        })

        it("claim round1 for account1", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [claim1Times+10]);
            await ethers.provider.send('evm_mine');

            let round = await privateSaleContract.connect(tester1.claimAccount).currentRound(); 
            console.log("round : ", round);
            let claimAmountConractexpect = await privateSaleContract.calculClaimAmount(tester1.claimAccount.address,round);
            console.log("claimAmountConractexpect : ", Number(claimAmountConractexpect));

            let beforeTokenAmount = await dom.balanceOf(tester1.claimAccount.address);
            expect(beforeTokenAmount).to.be.equal(0);

            let calculdirectAmount = bigAccount1Total * claim1Percents / 100;
            console.log("calculdirectAmount : ", calculdirectAmount);

            await privateSaleContract.connect(tester1.claimAccount).claim(); 
            console.log("1");

            let afterTokenAmount = await dom.balanceOf(tester1.claimAccount.address);
            expect(afterTokenAmount).to.be.equal(claimAmountConractexpect);
        })

        it("claim round2 for account2, account3", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [claim2Times+5]);
            await ethers.provider.send('evm_mine');

            let round = await privateSaleContract.connect(tester2.claimAccount).currentRound(); 
            expect(round).to.be.equal(2);

            let claimAmountConractexpect = await privateSaleContract.calculClaimAmount(tester2.claimAccount.address,round);
            // console.log("claimAmountConractexpect : ", Number(claimAmountConractexpect));
            let claimAmountConractexpect2 = await privateSaleContract.calculClaimAmount(tester3.claimAccount.address,round);
            // console.log("claimAmountConractexpect2 : ", Number(claimAmountConractexpect2));

            let beforeTokenAmount = await dom.balanceOf(tester2.claimAccount.address);
            expect(beforeTokenAmount).to.be.equal(0);

            let beforeTokenAmount2 = await dom.balanceOf(tester3.claimAccount.address);
            expect(beforeTokenAmount2).to.be.equal(0);

            let calculdirectAmount = bigAccount2Total * (claim1Percents+claim2Percents) / 100;
            // console.log("calculdirectAmount : ", calculdirectAmount);

            let calculdirectAmount2 = bigAccount3Total * (claim1Percents+claim2Percents) / 100;
            // console.log("calculdirectAmount2 : ", calculdirectAmount2);

            await privateSaleContract.connect(tester2.claimAccount).claim(); 
            await privateSaleContract.connect(tester3.claimAccount).claim(); 

            let afterTokenAmount = await dom.balanceOf(tester2.claimAccount.address);
            expect(afterTokenAmount).to.be.equal(claimAmountConractexpect);
            let afterTokenAmount2 = await dom.balanceOf(tester3.claimAccount.address);
            expect(afterTokenAmount2).to.be.equal(claimAmountConractexpect2);
        })

        // it("claim round4 for account1", async () => {
        //     await ethers.provider.send('evm_setNextBlockTimestamp', [claim4Times+5]);
        //     await ethers.provider.send('evm_mine');

        //     let round = await privateSaleContract.connect(tester1.claimAccount).currentRound(); 
        //     expect(round).to.be.equal(4);

        //     let claimAmountConractexpect = await privateSaleContract.calculClaimAmount(tester1.claimAccount.address,round);
        //     console.log("claimAmountConractexpect : ", Number(claimAmountConractexpect));

        //     let beforeTokenAmount = await dom.balanceOf(tester1.claimAccount.address);
        //     let beforeGetTokenAmount = await privateSaleContract.usersAmount(tester1.claimAccount.address)
        //     // console.log(Number(beforeGetTokenAmount.getAmount));
        //     expect(beforeTokenAmount).to.be.equal(beforeGetTokenAmount.getAmount);

        //     let calculdirectAmount = bigAccount1Total * (claim1Percents+claim2Percents+claim3Percents+claim4Percents) / 100;
        //     console.log("calculdirectAmount : ", calculdirectAmount);
        //     expect(Number(claimAmountConractexpect)+Number(beforeTokenAmount)).to.be.equal(calculdirectAmount);

        //     await privateSaleContract.connect(tester1.claimAccount).claim(); 
            
        //     let afterTokenAmount = await dom.balanceOf(tester1.claimAccount.address);
        //     expect(Number(afterTokenAmount)).to.be.equal(calculdirectAmount);
        // })


        it("claim round5 for account1, account2, account3", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [claim5Times+5]);
            await ethers.provider.send('evm_mine');

            let round = await privateSaleContract.connect(tester1.claimAccount).currentRound(); 
            expect(round).to.be.equal(5);

            let claimAmountConractexpect = await privateSaleContract.calculClaimAmount(tester1.claimAccount.address,round);
            console.log("claimAmountConractexpect : ", Number(claimAmountConractexpect));

            let beforeTokenAmount = await dom.balanceOf(tester1.claimAccount.address);
            let beforeGetTokenAmount = await privateSaleContract.usersAmount(tester1.claimAccount.address)
            // console.log(Number(beforeGetTokenAmount.getAmount));
            expect(beforeTokenAmount).to.be.equal(beforeGetTokenAmount.getAmount);

            let calculdirectAmount = bigAccount1Total
            let calculdirectAmount2 = bigAccount2Total
            let calculdirectAmount3 = bigAccount3Total
            console.log("calculdirectAmount : ", Number(calculdirectAmount));
            console.log("calculdirectAmount2 : ", Number(calculdirectAmount2));
            console.log("calculdirectAmount3 : ", Number(calculdirectAmount3));
            // expect(Number(claimAmountConractexpect)+Number(beforeTokenAmount)).to.be.equal(calculdirectAmount);

            await privateSaleContract.connect(tester1.claimAccount).claim(); 
            await privateSaleContract.connect(tester2.claimAccount).claim(); 
            await privateSaleContract.connect(tester3.claimAccount).claim(); 
            
            let afterTokenAmount = await dom.balanceOf(tester1.claimAccount.address);
            let afterTokenAmount2 = await dom.balanceOf(tester2.claimAccount.address);
            let afterTokenAmount3 = await dom.balanceOf(tester3.claimAccount.address);
            expect(Number(afterTokenAmount)).to.be.equal(Number(calculdirectAmount));
            expect(Number(afterTokenAmount2)).to.be.equal(Number(calculdirectAmount2));
            expect(Number(afterTokenAmount3)).to.be.equal(Number(calculdirectAmount3));
        })
    })

    
})