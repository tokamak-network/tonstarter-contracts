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
const PreMining = contract.fromArtifact('PreMining');

const initialTotal = '10000000000.' + '0'.repeat(18);
const initialPharse1 = '500000000.' + '0'.repeat(18);
const salesWithETH = '175000000.' + '0'.repeat(18);
const salesWithTON = '175000000.' + '0'.repeat(18);
const salesWithETHTONLP = '150000000.' + '0'.repeat(18);

let saleStartTime = parseInt(Date.now()/1000)-100;
let saleEndTime = saleStartTime + (60*60*24*14);
let zeroAddress = '0x0000000000000000000000000000000000000000';

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");

const logFlag = false;

describe('PreMining with ETH ', function () {
    let weth , fld, fldVault, preMining ;
    let a1, a2, tokenInfo;
    let sendAmount = '1';
    let admin = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let userPrivate2 = privateKeys[2];

    let changeCap = '170000000' ;
    let buyTokensEtehrs = ['1', '5', '3', '2'];
    let buyTokensDurations = ['10', '60', '120', '150'];


    before(async function () {

        // create vault
        fldVault = await FLDVault.new({from:defaultSender});
        //await fldVault.grantRole(CLAIMER_ROLE, admin, {from:defaultSender});

        // create fld
        fld = await FLD.new({from:defaultSender});

        // mint fld to vault
        await fldVault.setFLD(fld.address, {from:defaultSender});
        await fld.mint(fldVault.address, utils.parseUnits(initialTotal, 18), {from:defaultSender});

    });
    it('create preMining contract ', async function () {
        preMining = await PreMining.new( {from:defaultSender});

        await preMining.initialize(
            toBN(saleStartTime),
            toBN(saleEndTime),
            fld.address,
            utils.parseUnits(salesWithETH, 18),
            zeroAddress,
            {from:defaultSender});

    });
    it('send salesWithETH to preMining contract', async function () {
        await fldVault.claimFLD(preMining.address, utils.parseUnits(salesWithETH, 18),{from:defaultSender});
        expect(utils.parseUnits(salesWithETH, 18)).be.to.equal((await fld.balanceOf(preMining.address)).toString());

    });
    it('changeStartEndTime ', async function () {
        let saleStartTimeTemp = await preMining.startTime();
        let saleEndTimeTemp = await preMining.endTime();

        saleStartTime = parseInt(Date.now()/1000);
        saleEndTimeTemp = saleStartTime + (60*60*24*14);

        await preMining.changeStartEndTime(toBN(saleStartTime), toBN(saleEndTimeTemp),{from:defaultSender});

        expect(saleStartTimeTemp).be.to.not.equal(await preMining.startTime());
        expect(saleEndTimeTemp).be.to.not.equal(await preMining.endTime());
       // console.log('saleStartTime',(await preMining.startTime()).toString());
       // console.log('saleStartTime',(await preMining.endTime()).toString());

    });

    it('changeDefaultDuration ', async function () {
        let defaultDurationTemp = await preMining.defaultDuration();
        let defaultDuration = '300' ;
        await preMining.changeDefaultDuration(toBN(defaultDuration),{from:defaultSender});
        expect(defaultDurationTemp).be.to.not.equal(await preMining.defaultDuration());
       // console.log('defaultDuration',(await preMining.defaultDuration()).toString());
    });

    it('changeCap ', async function () {
        let capTemp = await preMining.cap();

        await preMining.changeCap(utils.parseUnits(changeCap, 18) ,{from:defaultSender});
        expect(capTemp).be.to.not.equal(await preMining.cap());
       // console.log('cap',(await preMining.cap()).toString());
    });

    it('changeRewardRatioType ', async function () {
        let ratioTypeTemp = await preMining.ratioType();
        let changeRatioType = 1;
        await preMining.changeRewardRatioType(changeRatioType,{from:defaultSender});
        expect(changeRatioType).be.to.not.equal(await preMining.ratioType());
        await preMining.changeRewardRatioType(0,{from:defaultSender});
    });

    it('buyTokens ', async function () {

        let userFldBalance = [0,0];
        let sumBuyTokens = 0;

        for (let i=0; i < userFldBalance.length; i++) {
            userFldBalance[i] = await fld.balanceOf(user1);
            sumBuyTokens += parseInt(buyTokensEtehrs[i]);
            await preMining.buyToken(buyTokensDurations[i], {from:user1, value: toWei(buyTokensEtehrs[i],'ether')});
            expect(utils.parseUnits(sumBuyTokens+'', 18)).be.to.equal(await web3.eth.getBalance(preMining.address));
            expect(await fld.balanceOf(user1)).to.be.bignumber.above(userFldBalance[i]);
        }

    });

    it('withdraw ', async function () {
        this.timeout(1000000);
        let loop = true;
       // let userFldBalance = 0;
        let canWithdrawAmount = 0;
        let curBlockTimeStamp = 0, curBlockNumber = 0;
       // let duration = 20;
         let tempBalance;

        let allLocks = await preMining.getAllUserLocks(user1);
        let lastLocks = allLocks[allLocks.length-1];
        //console.log(`lastLocks: `, lastLocks, lastLocks[3], lastLocks['releaseTime'] );
        if(logFlag) console.log("getAllUserLocks :",await preMining.getAllUserLocks(user1));
        while(loop){
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + 5);
            const current = await time.latestBlock();
            curBlockTimeStamp = await preMining.curBlockTimeStamp();
            if(logFlag) console.log(`------------------------------ `);
            if(logFlag) console.log(`Current block: ${current} `);

            curBlockTimeStamp = await preMining.curBlockTimeStamp();
            curBlockNumber = await preMining.curBlockNumber();

            if(logFlag) console.log( "curBlockTimeStamp :", curBlockTimeStamp.toString() , "curBlockNumber ", curBlockNumber.toString());
            //console.log("getAllUserLocks :",await preMining.getAllUserLocks(user1));

            canWithdrawAmount = await preMining.canWithdrawAmount(user1);
            if(logFlag) console.log("canWithdrawAmount :", canWithdrawAmount.toString());

            if(canWithdrawAmount > 0){
                //console.log("balance ether user1 :", (await web3.eth.getBalance(user1)).toString());
                //console.log("balanceOf FLD user1 :", (await fld.balanceOf(user1)).toString());
                tempBalance = await web3.eth.getBalance(user1);
                await preMining.withdraw({from:user1});
                expect(await web3.eth.getBalance(user1)).to.be.bignumber.above(tempBalance);

                if(logFlag) console.log("balance ether after withdrawing :", (await web3.eth.getBalance(user1)).toString());
                //console.log("balanceOf FLD after withdrawing :", (await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("getAllUserLocks :",await preMining.getAllUserLocks(user1));
            }

            if(lastLocks['releaseTime'] < curBlockTimeStamp ){
                loop = false;
                if(logFlag) console.log("withdraw end .");
            }else{
                await timeout(15);
            }
        }
    });

    it('rebuyToken ', async function () {
        this.timeout(1000000);
        let userFldBalance = [0,0];
        let allLocks = await preMining.getAllUserLocks(user1);
        let firstLocks = allLocks[0];
        let lastLocks = allLocks[allLocks.length-1];
        let loop = true;
        let tempBalance, tempFLDBalance, prevBalance, prevFLDBalance;
        let canWithdrawAmount = 0;
        let curBlockTimeStamp = 0, curBlockNumber = 0;

        //console.log(`lastLocks: `, lastLocks, lastLocks[3], lastLocks['releaseTime'] );
        if(logFlag) console.log("getAllUserLocks :",await preMining.getAllUserLocks(user1));
        while(loop){
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + 5);
            const current = await time.latestBlock();
            if(logFlag) console.log(`------------------------------ `);
            if(logFlag) console.log(`Current block: ${current} `);

            curBlockTimeStamp = await preMining.curBlockTimeStamp();
            curBlockNumber = await preMining.curBlockNumber();

            canWithdrawAmount = await preMining.canWithdrawAmount(user1);
            if(logFlag) console.log("canWithdrawAmount :", canWithdrawAmount.toString());
            if(canWithdrawAmount > 0){
                tempBalance = await web3.eth.getBalance(user1);
                tempFLDBalance = await fld.balanceOf(user1);
                await preMining.rebuyToken(buyTokensDurations[1], {from:user1});
                if(logFlag) console.log("rebuyToken ! "  );
                let a1 = parseInt(tempFLDBalance.toString());
                let a2 = parseInt((await fld.balanceOf(user1)).toString());
                if(logFlag) console.log("ADD FLD : ",a2-a1);
                a1 = parseInt(tempBalance.toString());
                a2 = parseInt((await web3.eth.getBalance(user1)).toString());
                if(logFlag) console.log("MINUS ETH : ",a1-a2);
                if(logFlag) console.log("getAllUserLocks :",await preMining.getAllUserLocks(user1));
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

})
