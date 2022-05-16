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
    tonbalanceBefore: 0
};
const tester2 = {
    account: null,
    wtonAmount: null,
    tonAmount: null,
    buyAmount: null,
    wtonbalanceBefore: 0,
    tonbalanceBefore: 0
};

const tester3 = {
    account: null,
    wtonAmount: null,
    tonAmount: null,
    buyAmount: null,
    wtonbalanceBefore: 0,
    tonbalanceBefore: 0
};



async function approve(token, account, to, amount ) {
    const tx = await token
          .connect(account)
          .approve(to, amount );
  
    await tx.wait();
  
    expect(
        await token.allowance(
          account.address,
          to
        )
      ).to.be.equal(amount);
  
    return [token, account];
}

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
    let privateSale, privateSaleContract;

    let accountlist;
    let user1, user2, user3, user4, user5, user6;
    let admin;
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

    
    //시나리오
    //tester1 : ton으로 1000개 구매, tester2 : ton으로 1000개 wton으로 2000개 구매, tester3 : wton으로 6000개 구매
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
    
    
        sender = await ico20Contracts.findSigner(defaultSender);
        tester1.account = await ico20Contracts.findSigner(user1);
        tester2.account = await ico20Contracts.findSigner(user2);
        tester3.account = await ico20Contracts.findSigner(user3);
        owner = sender;
    
        tester1.wtonAmount = ethers.utils.parseUnits("1000", 27);
        tester1.tonAmount = ethers.utils.parseUnits("1000", 18);
        tester1.buyAmount = ethers.utils.parseUnits("1000", 18);
    
        tester2.wtonAmount = ethers.utils.parseUnits("2000", 27);
        tester2.tonAmount = ethers.utils.parseUnits("1000", 18);
        tester2.buyAmount = ethers.utils.parseUnits("3000", 18);

        tester3.wtonAmount = ethers.utils.parseUnits("6000", 27);
        tester3.tonAmount = ethers.utils.parseUnits("1000", 18);
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
            privateSaleContract = await privateSale.connect(admin).deploy(dom.address, ton.address, getTONaddress.address, wton.address)
        });

        it("3. transfer domAmount", async function() {
            let privateSaleAmount = ethers.utils.parseUnits("12500000", 18)
            await dom.connect(owner).transfer(privateSaleContract.address, privateSaleAmount)
            let tx = await dom.balanceOf(privateSaleContract.address);
            expect(tx).to.be.equal(privateSaleAmount);
        })
    })

    describe("# 3. setting test", async function () {
        it('settingAll caller is not owner', async () => {
            let block = await ethers.provider.getBlock();
            saleStartTime = block.timestamp + 10;
            saleEndTime = saleStartTime + oneday;
            firstClaimTime = saleEndTime + oneday;
            claimStartTime = saleEndTime + (oneday*180);

            expect(privateSaleContract.connect(user4).settingAll(
                [saleStartTime,saleEndTime,firstClaimTime,claimStartTime],
                domPrice,
                tonPrice
            )).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('settingAll caller is owner', async () => {
            let block = await ethers.provider.getBlock();
            saleStartTime = block.timestamp + 10;
            saleEndTime = saleStartTime + oneday;
            firstClaimTime = saleEndTime + oneday;
            claimStartTime = saleEndTime + (oneday*180);

            await privateSaleContract.connect(admin).settingAll(
                [saleStartTime,saleEndTime,firstClaimTime,claimStartTime],
                domPrice,
                tonPrice
            )

            expect(await privateSaleContract.saleStartTime()).to.be.equal(saleStartTime)
            expect(await privateSaleContract.saleEndTime()).to.be.equal(saleEndTime)
            expect(await privateSaleContract.firstClaimTime()).to.be.equal(firstClaimTime)
            expect(await privateSaleContract.claimStartTime()).to.be.equal(claimStartTime)
            expect(await privateSaleContract.saleTokenPrice()).to.be.equal(domPrice)
            expect(await privateSaleContract.getTokenPrice()).to.be.equal(tonPrice)
        })
    })

    describe("# 4. whitelist setting", async function () {
        it("buy before saleTime", async () => {
            let buy1 = privateSaleContract.connect(tester1.account).buy(tester1.buyAmount)
            await expect(buy1).to.be.revertedWith("privaSale period end")
            let buy2 = privateSaleContract.connect(tester2.account).buy(tester2.buyAmount)
            await expect(buy2).to.be.revertedWith("privaSale period end")
            let buy3 = privateSaleContract.connect(tester3.account).buy(tester3.buyAmount)
            await expect(buy3).to.be.revertedWith("privaSale period end")            
        })

        it("buy before whitelisting", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [saleStartTime]);
            await ethers.provider.send('evm_mine');
            let buy1 = privateSaleContract.connect(tester1.account).buy(tester1.buyAmount)
            await expect(buy1).to.be.revertedWith("need to add whiteList amount")
            let buy2 = privateSaleContract.connect(tester2.account).buy(tester2.buyAmount)
            await expect(buy2).to.be.revertedWith("need to add whiteList amount")
            let buy3 = privateSaleContract.connect(tester3.account).buy(tester3.buyAmount)
            await expect(buy3).to.be.revertedWith("need to add whiteList amount")            
        })

        it("addwhitelist", async () => {
            await privateSaleContract.connect(admin).addwhitelist(
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
        it("buy caller is not whitelist", async () => {
            expect(privateSaleContract.connect(user4).buy(tester1.buyAmount)
            ).to.be.revertedWith("need to add whiteList amount");     
        })

        it("buy caller is whitelist but more amount", async () => {
            expect(privateSaleContract.connect(tester1.account).buy(tester2.buyAmount)
            ).to.be.revertedWith("need to add whiteList amount");     
        })

        it("buy caller is whitelist and exact amount before approve", async () => {
            expect(privateSaleContract.connect(tester1.account).buy(tester1.buyAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");    
        })

        it("buy caller is whitelist and exact amount for account1 (only TON)", async () => {
            await ton.connect(tester1.account).approve(privateSaleContract.address,tester1.buyAmount)
            await privateSaleContract.connect(tester1.account).wtonAndTonBuy(tester1.buyAmount,0);
            // await privateSaleContract.connect(tester1.account).buy(tester1.buyAmount);
            
            let tx = await privateSaleContract.usersAmount(tester1.account.address);
            expect(tx.totaloutputamount).to.be.equal(bigAccount1Total);
            expect(tx.firstReward).to.be.equal(bigAccount1first); 
        })

        it("buy ton and wton for account2", async () => {
            await ton.connect(tester2.account).approve(privateSaleContract.address,tester2.buyAmount)
            await wton.connect(tester2.account).approve(privateSaleContract.address,tester2.wtonAmount)
            await privateSaleContract.connect(tester2.account).wtonAndTonBuy(tester2.tonAmount,tester2.wtonAmount);
            
            let tx = await privateSaleContract.usersAmount(tester2.account.address);
            expect(tx.totaloutputamount).to.be.equal(bigAccount2Total);
            expect(tx.firstReward).to.be.equal(bigAccount2first); 
        })
        
        it("buy onlywton for account3", async () => {
            await wton.connect(tester3.account).approve(privateSaleContract.address,tester3.wtonAmount)
            await ton.connect(tester3.account).approve(privateSaleContract.address,tester3.buyAmount)
            // await privateSaleContract.connect(tester3.account).wtonBuy(tester3.wtonAmount);
            await privateSaleContract.connect(tester3.account).wtonAndTonBuy(0,tester3.wtonAmount);


            let tx = await privateSaleContract.usersAmount(tester3.account.address);
            expect(tx.totaloutputamount).to.be.equal(bigAccount3Total);
            expect(tx.firstReward).to.be.equal(bigAccount3first); 
        })
    })

    describe("# 6. claim test", () => {
        it("firstClaim before fisrClaimtime", async () => {
            await expect(privateSaleContract.connect(tester1.account).claim()
            ).to.be.revertedWith("need the fisrClaimtime");    
        })

        it("firstClaim after fisrClaimtime", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [firstClaimTime+10]);
            await ethers.provider.send('evm_mine');

            let balance = await dom.balanceOf(tester1.account.address);
            expect(balance).to.be.equal(0)

            // await privateSaleContract.connect(tester1.account).firstClaim();
            await privateSaleContract.connect(tester1.account).claim();
            let balance2 = await dom.balanceOf(tester1.account.address);
            // console.log(Number(balance2))
            let user1 = await privateSaleContract.usersAmount(tester1.account.address);
            expect(user1.firstReward).to.be.equal(balance2)
        })

        it("firstClaim about account3", async () => {
            let acc3balance = await dom.balanceOf(tester3.account.address);
            expect(acc3balance).to.be.equal(0)

            await privateSaleContract.connect(tester3.account).claim();

            let acc3balance2 = await dom.balanceOf(tester3.account.address);
            let user3 = await privateSaleContract.usersAmount(tester3.account.address);
            expect(user3.firstReward).to.be.equal(acc3balance2)
        })

        it("reply firstClaim", async () => {
            await expect(privateSaleContract.connect(tester3.account).claim()
            ).to.be.revertedWith("already getFirstreward");
        })

        it("claim 1month about account1, account2", async () => {
            await ethers.provider.send('evm_setNextBlockTimestamp', [claimStartTime+10]);
            await ethers.provider.send('evm_mine');

            await privateSaleContract.connect(tester1.account).claim();
            await privateSaleContract.connect(tester2.account).claim();
            
            let user1 = await privateSaleContract.usersAmount(tester1.account.address);
            let user2 = await privateSaleContract.usersAmount(tester2.account.address);
            let acc1balance = await dom.balanceOf(tester1.account.address);
            let acc2balance = await dom.balanceOf(tester2.account.address);
            
            expect(Number(user1.firstReward)+Number(user1.monthlyReward)).to.be.equal(Number(acc1balance))
            expect(Number(user2.firstReward)+Number(user2.monthlyReward)).to.be.equal(Number(acc2balance))
        })

        it("claim 2month about account1, account3", async () => {
            let after1month = claimStartTime + (oneday*30)
            await ethers.provider.send('evm_setNextBlockTimestamp', [after1month]);
            await ethers.provider.send('evm_mine');

            await privateSaleContract.connect(tester1.account).claim();
            await privateSaleContract.connect(tester3.account).claim();

            let user1 = await privateSaleContract.usersAmount(tester1.account.address);
            let user3 = await privateSaleContract.usersAmount(tester3.account.address);
            let acc1balance = await dom.balanceOf(tester1.account.address);
            let acc3balance = await dom.balanceOf(tester3.account.address);

            let user1monthlyReward = Number(user1.monthlyReward)
            let user3monthlyReward = Number(user3.monthlyReward)
            let user1Reward = user1monthlyReward * 2
            let user3Reward = user3monthlyReward * 2

            expect(user1Reward+Number(user1.firstReward)).to.be.equal(Number(acc1balance))
            expect(user3Reward+Number(user3.firstReward)).to.be.equal(Number(acc3balance))
        })

        it("claim 6month about account2, account3", async () => {
            let after5month = claimStartTime + ((oneday*30)*5)
            await ethers.provider.send('evm_setNextBlockTimestamp', [after5month]);
            await ethers.provider.send('evm_mine');

            await privateSaleContract.connect(tester2.account).claim();
            await privateSaleContract.connect(tester3.account).claim();

            let user2 = await privateSaleContract.usersAmount(tester2.account.address);
            let user3 = await privateSaleContract.usersAmount(tester3.account.address);
            let acc2balance = await dom.balanceOf(tester2.account.address);
            let acc3balance = await dom.balanceOf(tester3.account.address);

            let user2monthlyReward = Number(user2.monthlyReward)
            let user3monthlyReward = Number(user3.monthlyReward)
            let user2Reward = user2monthlyReward * 6
            let user3Reward = user3monthlyReward * 6

            expect(user2Reward+Number(user2.firstReward)).to.be.equal(Number(acc2balance))
            expect(user3Reward+Number(user3.firstReward)).to.be.equal(Number(acc3balance))
        })

        it("claim 10month abount account1", async () => {
            let after9month = claimStartTime + ((oneday*30)*9)
            await ethers.provider.send('evm_setNextBlockTimestamp', [after9month]);
            await ethers.provider.send('evm_mine');

            await privateSaleContract.connect(tester1.account).claim();

            let user1 = await privateSaleContract.usersAmount(tester1.account.address);
            let acc1balance = await dom.balanceOf(tester1.account.address);

            let user1monthlyReward = Number(user1.monthlyReward)
            let user1Reward = user1monthlyReward * 10

            expect(user1Reward+Number(user1.firstReward)).to.be.equal(Number(acc1balance))
        })

        it("claim 12month about account1, account2, account3", async () => {
            let after11month = claimStartTime + ((oneday*30)*11)
            await ethers.provider.send('evm_setNextBlockTimestamp', [after11month]);
            await ethers.provider.send('evm_mine');

            await privateSaleContract.connect(tester1.account).claim();
            await privateSaleContract.connect(tester2.account).claim();
            await privateSaleContract.connect(tester3.account).claim();

            let user1 = await privateSaleContract.usersAmount(tester1.account.address);
            let user2 = await privateSaleContract.usersAmount(tester2.account.address);
            let user3 = await privateSaleContract.usersAmount(tester3.account.address);
            let acc1balance = await dom.balanceOf(tester1.account.address);
            let acc2balance = await dom.balanceOf(tester2.account.address);
            let acc3balance = await dom.balanceOf(tester3.account.address);

            // console.log(Number(user1.totaloutputamount))
            // console.log(Number(user2.totaloutputamount))
            // console.log(Number(user3.totaloutputamount))

            // let user1monthlyReward = Number(user1.monthlyReward)
            // let user2monthlyReward = Number(user2.monthlyReward)
            // let user3monthlyReward = Number(user3.monthlyReward)
            // let user1Reward = user1monthlyReward * 9
            // let user2Reward = user2monthlyReward * 6
            // let user3Reward = user3monthlyReward * 6
            
            // expect(user1Reward+Number(user1.firstReward)).to.be.equal(Number(acc1balance))
            // expect(user2Reward+Number(user2.firstReward)).to.be.equal(Number(acc2balance))
            // expect(user3Reward+Number(user3.firstReward)).to.be.equal(Number(acc3balance))
            expect(Number(user1.totaloutputamount)).to.be.equal(Number(acc1balance))
            expect(Number(user2.totaloutputamount)).to.be.equal(Number(acc2balance))
            expect(Number(user3.totaloutputamount)).to.be.equal(Number(acc3balance))
        })
    })
})