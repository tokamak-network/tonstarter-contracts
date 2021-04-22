//const { BigNumber, utils } = require("ethers")
//const { ethers, upgrades } = require("hardhat")

const {  time } = require("@openzeppelin/test-helpers");
const { ethers } = require('ethers')
const BigNumber = ethers.BigNumber // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils

const {
    defaultSender, accounts, contract, web3, privateKeys
} = require('@openzeppelin/test-environment');

//const { time } = require('openzeppelin-test-helpers');

const BN = require('bn.js');

const chai = require('chai');
const { solidity } = require("ethereum-waffle");
const { expect } = chai;
chai.use(require('chai-bn')(BN));
chai.use(solidity);
require('chai').should();

const { padLeft, toBN, toWei, fromWei , keccak256 , soliditySha3 , solidityKeccak256 } = require('web3-utils');

const { getSignature , signatureVaildTime, timeout } = require('./common');

const WETH = contract.fromArtifact('WETH');
const FLD = contract.fromArtifact('FLD');
const FLDVault = contract.fromArtifact('FLDVault');
const Mining = contract.fromArtifact('Mining');
const TestToken = contract.fromArtifact('TestToken');

const initialTotal = '10000000000.' + '0'.repeat(18);
const initialPharse1 = '500000000.' + '0'.repeat(18);
const salesWithETH = '175000000.' + '0'.repeat(18);
const salesWithTON = '175000000.' + '0'.repeat(18);
const salesWithETHTONLP = '150000000.' + '0'.repeat(18);
const initialPharse2 = '2500000000.' + '0'.repeat(18);

let saleStartTime = parseInt(Date.now()/1000)-100;
let saleEndTime = saleStartTime + (60*60*24*14);
let zeroAddress = '0x0000000000000000000000000000000000000000';

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");

const logFlag = false;

describe('Mining Contract', function () {
    let weth , fld, fldVault, mining, fldVault2 , miningFLD, testToken;
    let a1, a2, tokenInfo;
    let sendAmount = '1';
    let admin = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let userPrivate2 = privateKeys[2];

    let sendAmountForTest = '1000' ;
    let buyTokensEtehrs = ['1', '5', '3', '2'];
    let buyTokensDurations = ['10', '60', '120', '150'];


    before(async function () {

        // create vault
        fldVault = await FLDVault.new({from:defaultSender});
        // create vault
        fldVault2 = await FLDVault.new({from:defaultSender});
        //await fldVault.grantRole(CLAIMER_ROLE, admin, {from:defaultSender});

        // create fld
        fld = await FLD.new({from:defaultSender});

        // mint fld to vault
        await fldVault.setFLD(fld.address, {from:defaultSender});
        await fld.mint(fldVault.address, utils.parseUnits(initialTotal, 18), {from:defaultSender});

        await fldVault2.setFLD(fld.address, {from:defaultSender});
        await fld.mint(fldVault2.address, utils.parseUnits(initialTotal, 18), {from:defaultSender});

        // claimFLD to user1 for test
        testToken = await TestToken.new({from:defaultSender});
        await testToken.mint(user1, utils.parseUnits(sendAmountForTest, 18), {from:defaultSender});

    });
    it('create mining contract with paytoken ether ', async function () {
        mining = await Mining.new( {from:defaultSender});

        await mining.initialize(
            toBN(saleStartTime),
            toBN(saleEndTime),
            fld.address,
            fldVault.address,
            zeroAddress,
            {from:defaultSender});

    });

    it('create mining contract with paytoken TestToken ', async function () {
        miningFLD = await Mining.new( {from:defaultSender});

        await miningFLD.initialize(
            toBN(saleStartTime),
            toBN(saleEndTime),
            fld.address,
            fldVault.address,
            testToken.address,
            {from:defaultSender});
    });

    it('changeVaultHashName ', async function () {
        let hash = keccak256("PHASE2_VAULT_1");
        let preVaultHashName =  await mining.vaultHashName();
        await mining.changeVaultHashName(hash,{from:defaultSender});
        expect(preVaultHashName).be.to.not.equal(await mining.vaultHashName());
    });

    it('changeVault ', async function () {
        let preVault =  await mining.vault();
        await mining.changeVault(fldVault2.address,{from:defaultSender});
        expect(preVault).be.to.not.equal(await mining.vault());
    });

    it('changeStartEndTime ', async function () {
        let saleStartTimeTemp = await mining.startTime();
        let saleEndTimeTemp = await mining.endTime();
        saleStartTime = parseInt(Date.now()/1000);
        saleEndTimeTemp = saleStartTime + (60*60*24*14);
        await mining.changeStartEndTime(toBN(saleStartTime), toBN(saleEndTimeTemp),{from:defaultSender});

        expect(saleStartTimeTemp).be.to.not.equal(await mining.startTime());
        expect(saleEndTimeTemp).be.to.not.equal(await mining.endTime());
    });

    it('changeUintMiningPeriods ', async function () {
        let prevUintMiningPeriods = await mining.uintMiningPeriods();
        let uintMiningPeriods = 60*60*24*30;
        uintMiningPeriods = parseInt(uintMiningPeriods);
        await mining.changeUintMiningPeriods(toBN(uintMiningPeriods+''),{from:defaultSender});
        expect(prevUintMiningPeriods).be.to.not.equal(await mining.uintMiningPeriods());
    });
    it('changeDefaultDuration ', async function () {
        let defaultDurationTemp = await mining.defaultDuration();
        let defaultDuration = '300' ;
        await mining.changeDefaultDuration(toBN(defaultDuration),{from:defaultSender});
        expect(defaultDurationTemp).be.to.not.equal(await mining.defaultDuration());
    });

    it('changeRewardRatioType ', async function () {
        let ratioTypeTemp = await mining.ratioType();
        let changeRatioType = 1;
        await mining.changeRewardRatioType(changeRatioType,{from:defaultSender});
        expect(changeRatioType).be.to.not.equal(await mining.ratioType());
        await mining.changeRewardRatioType(0,{from:defaultSender});
    });



    it('buyTokens - Etehr ', async function () {
        let userFldBalance = [0,0];
        let sumBuyTokens = 0;

        for (let i=0; i < userFldBalance.length; i++) {
            userFldBalance[i] = await fld.balanceOf(user1);
            sumBuyTokens += parseInt(buyTokensEtehrs[i]);
            await mining.buyToken(buyTokensDurations[i], {from:user1, value: toWei(buyTokensEtehrs[i],'ether')});
            expect(utils.parseUnits(sumBuyTokens+'', 18)).be.to.equal(await web3.eth.getBalance(mining.address));
            expect(await fld.balanceOf(user1)).to.be.bignumber.above(userFldBalance[i]);
        }
    });

    it('buyTokens by FLD - can not buyToken with ether', async function () {
        let userFldBalance = [0,0];
        let sumBuyTokens = 0;
        await expect(
            miningFLD.buyToken(buyTokensDurations[0], {from:user1, value: toWei(buyTokensEtehrs[0],'ether')})
        ).to.be.revertedWith("Mining: check values fail");
    });

    it('withdraw by ETH', async function () {
        this.timeout(1000000);
        let loop = true;
       // let userFldBalance = 0;
        let canWithdrawAmount = 0;
        let curBlockTimeStamp = 0, curBlockNumber = 0;
       // let duration = 20;
         let tempBalance;

        let allLocks = await mining.getAllUserLocks(user1);
        let lastLocks = allLocks[allLocks.length-1];
        //console.log(`lastLocks: `, lastLocks, lastLocks[3], lastLocks['releaseTime'] );
        if(logFlag) console.log("getAllUserLocks :",await mining.getAllUserLocks(user1));
        while(loop){
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + 5);
            const current = await time.latestBlock();
            curBlockTimeStamp = await mining.curBlockTimeStamp();
            if(logFlag) console.log(`------------------------------ `);
            if(logFlag) console.log(`Current block: ${current} `);

            curBlockTimeStamp = await mining.curBlockTimeStamp();
            curBlockNumber = await mining.curBlockNumber();

            if(logFlag) console.log( "curBlockTimeStamp :", curBlockTimeStamp.toString() , "curBlockNumber ", curBlockNumber.toString());
            //console.log("getAllUserLocks :",await mining.getAllUserLocks(user1));

            canWithdrawAmount = await mining.canWithdrawAmount(user1);
            if(logFlag) console.log("canWithdrawAmount :", canWithdrawAmount.toString());

            if(canWithdrawAmount > 0){
                //console.log("balance ether user1 :", (await web3.eth.getBalance(user1)).toString());
                //console.log("balanceOf FLD user1 :", (await fld.balanceOf(user1)).toString());
                tempBalance = await web3.eth.getBalance(user1);
                await mining.withdraw({from:user1});
                expect(await web3.eth.getBalance(user1)).to.be.bignumber.above(tempBalance);

                if(logFlag) console.log("balance ether after withdrawing :", (await web3.eth.getBalance(user1)).toString());
                //console.log("balanceOf FLD after withdrawing :", (await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("getAllUserLocks :",await mining.getAllUserLocks(user1));
            }

            if(lastLocks['releaseTime'] < curBlockTimeStamp ){
                loop = false;
                if(logFlag) console.log("withdraw end .");
            }else{
                await timeout(15);
            }
        }
    });
    it('rebuyToken by ETH ', async function () {
        this.timeout(1000000);
        let userFldBalance = [0,0];
        let allLocks = await mining.getAllUserLocks(user1);
        let firstLocks = allLocks[0];
        let lastLocks = allLocks[allLocks.length-1];
        let loop = true;
        let tempBalance, tempFLDBalance, prevBalance, prevFLDBalance;
        let canWithdrawAmount = 0;
        let curBlockTimeStamp = 0, curBlockNumber = 0;

        //console.log(`lastLocks: `, lastLocks, lastLocks[3], lastLocks['releaseTime'] );
        if(logFlag) console.log("getAllUserLocks :",await mining.getAllUserLocks(user1));
        while(loop){
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + 5);
            const current = await time.latestBlock();
            if(logFlag) console.log(`------------------------------ `);
            if(logFlag) console.log(`Current block: ${current} `);

            curBlockTimeStamp = await mining.curBlockTimeStamp();
            curBlockNumber = await mining.curBlockNumber();

            canWithdrawAmount = await mining.canWithdrawAmount(user1);
            if(logFlag) console.log("canWithdrawAmount :", canWithdrawAmount.toString());
            if(canWithdrawAmount > 0){
                tempBalance = await web3.eth.getBalance(user1);
                tempFLDBalance = await fld.balanceOf(user1);
                await mining.rebuyToken(buyTokensDurations[1], {from:user1});
                if(logFlag) console.log("rebuyToken ! "  );
                let a1 = parseInt(tempFLDBalance.toString());
                let a2 = parseInt((await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("ADD FLD : ",a2-a1);
                a1 = parseInt(tempBalance.toString());
                a2 = parseInt((await web3.eth.getBalance(user1)).toString());
                if(logFlag) console.log("MINUS ETH : ",a1-a2);
                if(logFlag) console.log("getAllUserLocks :",await mining.getAllUserLocks(user1));
                //expect(await web3.eth.getBalance(user1)).to.be.bignumber.below(tempBalance);
                expect(await fld.balanceOf(user1)).to.be.bignumber.above(tempFLDBalance);
            }
            if(lastLocks['releaseTime'] < curBlockTimeStamp ){
                loop = false;
            //   if(logFlag) console.log("getBalance ETH :",  (await web3.eth.getBalance(user1)).toString());
            //   if(logFlag) console.log("getBalance FLD :",  (await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("rebuyToken end .");
            }else{
                await timeout(15);
            }
        }
    });

    it('buyTokens by TestToken ', async function () {
        let userFldBalance = [0,0];
        let sumBuyTokens = 0;
        let userPayTokenBalance = [0,0];
        let prevUserPayTokenBalance ;

        for (let i=0; i < userFldBalance.length; i++) {
            userFldBalance[i] = await fld.balanceOf(user1);
            sumBuyTokens += parseInt(buyTokensEtehrs[i]);
            userPayTokenBalance[i] = await testToken.balanceOf(user1);
            await miningFLD.buyTokens(testToken.address, toWei(buyTokensEtehrs[i],'ether') , buyTokensDurations[i], {from:user1 });

            //check payToken amount
            expect((await testToken.balanceOf(user1)).add(toBN(toWei(buyTokensEtehrs[i],'ether')))).to.be.bignumber.equal(userPayTokenBalance[i]);

            // check mining amount
            expect(await fld.balanceOf(user1)).to.be.bignumber.above(userFldBalance[i]);
        }
    });

    it('withdraw by TestToken', async function () {
        this.timeout(1000000);
        let loop = true;
       // let userFldBalance = 0;
        let canWithdrawAmount = 0;
        let curBlockTimeStamp = 0, curBlockNumber = 0;
       // let duration = 20;
         let tempBalance, tempTestTokenBalance;

        let allLocks = await miningFLD.getAllUserLocks(user1);
        let lastLocks = allLocks[allLocks.length-1];
        //console.log(`lastLocks: `, lastLocks, lastLocks[3], lastLocks['releaseTime'] );
        if(logFlag) console.log("getAllUserLocks :",await miningFLD.getAllUserLocks(user1));
        while(loop){
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + 5);
            const current = await time.latestBlock();
            curBlockTimeStamp = await miningFLD.curBlockTimeStamp();
            if(logFlag) console.log(`------------------------------ `);
            if(logFlag) console.log(`Current block: ${current} `);

            curBlockTimeStamp = await miningFLD.curBlockTimeStamp();
            curBlockNumber = await miningFLD.curBlockNumber();

            if(logFlag) console.log( "curBlockTimeStamp :", curBlockTimeStamp.toString() , "curBlockNumber ", curBlockNumber.toString());
            //console.log("getAllUserLocks :",await miningFLD.getAllUserLocks(user1));

            canWithdrawAmount = await miningFLD.canWithdrawAmount(user1);
            if(logFlag) console.log("canWithdrawAmount :", canWithdrawAmount.toString());

            if(canWithdrawAmount > 0){
                //console.log("balance ether user1 :", (await web3.eth.getBalance(user1)).toString());
                //console.log("balanceOf FLD user1 :", (await fld.balanceOf(user1)).toString());
                //tempBalance = await web3.eth.getBalance(user1);
                tempTestTokenBalance = await testToken.balanceOf(user1);
                await miningFLD.withdraw({from:user1});

                //check payToken amount
                expect(await testToken.balanceOf(user1)).to.be.bignumber.above(tempTestTokenBalance);
                if(logFlag) console.log("balance paytoken after withdrawing :", (await testToken.balanceOf(user1)).toString());
                //console.log("balanceOf FLD after withdrawing :", (await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("getAllUserLocks :",await miningFLD.getAllUserLocks(user1));
            }

            if(lastLocks['releaseTime'] < curBlockTimeStamp ){
                loop = false;
                if(logFlag) console.log("withdraw end .");
            }else{
                await timeout(15);
            }
        }
    });

    it('rebuyToken by TestToken', async function () {
        this.timeout(1000000);
        let userFldBalance = [0,0];
        let allLocks = await miningFLD.getAllUserLocks(user1);
        let firstLocks = allLocks[0];
        let lastLocks = allLocks[allLocks.length-1];
        let loop = true;
        let tempBalance, tempFLDBalance, prevBalance, prevFLDBalance, tempTestTokenBalance ;
        let canWithdrawAmount = 0;
        let curBlockTimeStamp = 0, curBlockNumber = 0;

        //console.log(`lastLocks: `, lastLocks, lastLocks[3], lastLocks['releaseTime'] );
        if(logFlag) console.log("getAllUserLocks :",await miningFLD.getAllUserLocks(user1));
        while(loop){
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + 5);
            const current = await time.latestBlock();
            if(logFlag) console.log(`------------------------------ `);
            if(logFlag) console.log(`Current block: ${current} `);

            curBlockTimeStamp = await miningFLD.curBlockTimeStamp();
            curBlockNumber = await miningFLD.curBlockNumber();

            canWithdrawAmount = await miningFLD.canWithdrawAmount(user1);
            if(logFlag) console.log("canWithdrawAmount :", canWithdrawAmount.toString());
            if(canWithdrawAmount > 0){
                tempBalance = await web3.eth.getBalance(user1);
                tempFLDBalance = await fld.balanceOf(user1);
                await miningFLD.rebuyToken(buyTokensDurations[1], {from:user1});
                if(logFlag) console.log("rebuyToken by TestToken ! "  );
                let a1 = parseInt(tempFLDBalance.toString());
                let a2 = parseInt((await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("ADD FLD : ",a2-a1);

                a1 = parseInt(tempBalance.toString());
                a2 = parseInt((await web3.eth.getBalance(user1)).toString());
                if(logFlag) console.log("MINUS ETH : ",a1-a2);

                if(logFlag) console.log("getAllUserLocks :",await miningFLD.getAllUserLocks(user1));
                //expect(await web3.eth.getBalance(user1)).to.be.bignumber.below(tempBalance);
                expect(await fld.balanceOf(user1)).to.be.bignumber.above(tempFLDBalance);
            }
            if(lastLocks['releaseTime'] < curBlockTimeStamp ){
                loop = false;
            //   if(logFlag) console.log("getBalance ETH :",  (await web3.eth.getBalance(user1)).toString());
            //   if(logFlag) console.log("getBalance FLD :",  (await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("rebuyToken by TestToken end .");
            }else{
                await timeout(15);
            }
        }
    });

})
