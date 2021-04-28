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

const FLD = contract.fromArtifact('FLD');
const FLDVault = contract.fromArtifact('FLDVault');
const StakeWithSalePeriod = contract.fromArtifact('StakeWithSalePeriod');
const TestToken = contract.fromArtifact('TestToken');

const initialTotal = '10000000000.' + '0'.repeat(18);
const initialPharse1 = '500000000.' + '0'.repeat(18);
const salesWithETH = '175000000.' + '0'.repeat(18);
const salesWithTON = '175000000.' + '0'.repeat(18);
const salesWithETHTONLP = '150000000.' + '0'.repeat(18);
const initialPharse2 = '2500000000.' + '0'.repeat(18);

let saleStartBlock = 0;
let salePeriod = (60*60*24*14) / 13;
let stakePeriod = (60*60*24*30) / 13;
salePeriod = parseInt(salePeriod);
stakePeriod = parseInt(stakePeriod);

let zeroAddress = '0x0000000000000000000000000000000000000000';

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const PHASE2_VAULT_HASH = keccak256("PHASE2_VAULT");
const EVENT_VAULT_HASH = keccak256("EVENT_VAULT");

const logFlag = true;

describe('StakeWithSalePeriod Contract', function () {
    let weth , fld, fldVault,  stakeWithSalePeriod, testToken;
    let a1, a2, tokenInfo;
    let sendAmount = '1';
    let admin = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let userPrivate2 = privateKeys[2];

    let sendAmountForTest = '1' ;
    let sendAmountForTest2 = '5' ;
    let buyTokensEtehrs = ['1', '5', '3', '2'];
    let buyTokensDurations = ['10', '60', '120', '150'];


    before(async function () {
        this.timeout(1000000);
        // create vault
        fldVault = await FLDVault.new({from:defaultSender});
        //await fldVault.grantRole(CLAIMER_ROLE, admin, {from:defaultSender});

        // create fld
        fld = await FLD.new({from:defaultSender});

        // mint fld to vault
        await fldVault.setFLD(fld.address, {from:defaultSender});
        await fld.mint(fldVault.address, utils.parseUnits(initialTotal, 18), {from:defaultSender});

        // add Vault Name
        await fldVault.addPhaseVault(PHASE2_VAULT_HASH, utils.parseUnits(initialTotal, 18), {from:defaultSender})

        // claimFLD to user1 for test
        testToken = await TestToken.new({from:defaultSender});
        await testToken.mint(user1, utils.parseUnits(sendAmountForTest, 18), {from:defaultSender});

        // StakeWithSalePeriod
        saleStartBlock = await time.latestBlock();
        stakeWithSalePeriod = await StakeWithSalePeriod.new({from:defaultSender});
        await stakeWithSalePeriod.initialize(
            toBN(saleStartBlock),
            toBN(salePeriod),
            toBN(stakePeriod),
            utils.parseUnits(salesWithETH, 18),
            fld.address,
            zeroAddress,
             {from:defaultSender});

    });

    it('setDefaultStakePeriod', async function () {
        let periodBlocks = 5 ;

        await stakeWithSalePeriod.setDefaultStakePeriodBlocks(toBN(periodBlocks), {from:defaultSender});
        expect(toBN(periodBlocks)).be.to.bignumber.equal(await stakeWithSalePeriod.defaultStakePeriodBlocks());
    });

    it('changeStartEndBlock', async function () {
        saleStartBlock = saleStartBlock + 1;
        salePeriod = 5;
        stakePeriod = 10;

        await stakeWithSalePeriod.changeStartEndBlock(
            toBN(saleStartBlock),toBN(salePeriod),toBN(stakePeriod),
            {from:defaultSender});

        expect(toBN(saleStartBlock)).be.to.bignumber.equal(await stakeWithSalePeriod.startBlock());
        expect(toBN(salePeriod)).be.to.bignumber.equal(await stakeWithSalePeriod.salePeriodBlocks());
        expect(toBN(stakePeriod)).be.to.bignumber.equal(await stakeWithSalePeriod.stakePeriodBlocks());
    });
    /*
    it('changeCap', async function () {
        let cap = utils.parseUnits(salesWithTON, 18);
        await stakeWithSalePeriod.changeCap(cap, {from:defaultSender});
        expect(toBN(toWei(salesWithTON,'ether'))).be.to.bignumber.equal(await stakeWithSalePeriod.cap());
    });

    it('sendTransaction - can not stake with msg.value is zero ', async function () {
        await expect(
            stakeWithSalePeriod.sendTransaction({from:defaultSender,value:0})
        ).to.be.revertedWith("StakeWithSalePeriod: stake's amount or period is zero");
    });
    */

    async function logStorage(account1){
        console.log('############### logStorage : ' ,account1);

        let userStakesLength = await stakeWithSalePeriod.userStakesLength(account1);
        console.log('############### userStakesLength : ' ,userStakesLength.toString() );
        for(let i=0; i< userStakesLength ; i++){
            let userStakes = await stakeWithSalePeriod.userStakes(account1, i);

            console.log('\n=========' ,i,'=========' );
            console.log(' startBlock' , userStakes.startBlock.toString() );
            console.log(' endBlock' , userStakes.endBlock.toString() );
            console.log(' stakeAmount' , utils.formatUnits(userStakes.stakeAmount.toString(), 18) ,' ether' );
            console.log(' claimBlock' , userStakes.claimBlock.toString() );
            console.log(' takenReward' , userStakes.takenReward.toString() );
        }
        console.log('\n############### snapshotBlocks ###############' );
        let snapshotBlocksLen = await stakeWithSalePeriod.snapshotBlocksLength();
        let snapshotBlocks = await stakeWithSalePeriod.snapshotBlocksAll();
        console.log('\nsnapshotBlocksLen ', snapshotBlocksLen.toString() );
        //console.log('snapshotBlocks ', snapshotBlocks );

        for(let i=0; i< snapshotBlocksLen ; i++){
            let snapshot = await stakeWithSalePeriod.stakedSnapshots(snapshotBlocks[i]);
            console.log('\n=========' ,i,'=========' );
            console.log(' blockNumber' , snapshot.blockNumber.toString() );
            console.log(' totalStaked' , utils.formatUnits(snapshot.totalStaked.toString(), 18) ,' ether'  );
            console.log(' balanceOfToken' , utils.formatUnits(snapshot.balanceOfToken.toString(), 18) ,' ether' );
            console.log(' index' , snapshot.index.toString() );
         }

    }
    async function logAccumulatedStaked(){
        console.log('############### logAccumulatedStaked   ' );

        let stakedAccumulatedIndexLength = await stakeWithSalePeriod.stakedAccumulatedIndexLength();
        let stakedAccumulated  = await stakeWithSalePeriod.stakedAccumulatedIndexAll();
        console.log('\n stakedAccumulatedIndexLength', stakedAccumulatedIndexLength.toString() );
        //console.log('stakedAccumulated ', stakedAccumulated );

        for(let i=0; i< stakedAccumulatedIndexLength ; i++){
            let staked  = await stakeWithSalePeriod.stakedAccumulated(stakedAccumulated[i]);
            console.log('\n=========' ,i,'=========' );
            console.log(' blockNumber' , stakedAccumulated[i].toString() );
            console.log(' stakedAccumulated' , utils.formatUnits(staked.toString(), 18) ,' ether'  );
           // console.log(' stakedAccumulated' , staked   );
         }
    }

    async function logUnstakedAccumulated(){
        console.log('############### logUnstakedAccumulated   ' );

        let unstakedLogIndexLength = await stakeWithSalePeriod.unstakedLogIndexLength();
        let unstakedLogIndexAll  = await stakeWithSalePeriod.unstakedLogIndexAll();
        console.log('\n unstakedLogIndexLength', unstakedLogIndexLength.toString() );


        for(let i=0; i< unstakedLogIndexLength ; i++){
            let unstakedLog = await stakeWithSalePeriod.unstakedLog(unstakedLogIndexAll[i]);
            console.log('\n=========' ,i,'=========' );
            console.log(' outBlock' , unstakedLog.outBlock.toString() );
            console.log(' amount' , unstakedLog.amount.toString() );
            console.log(' index' , unstakedLog.index.toString() );
            console.log(' beforeBlock' , unstakedLog.beforeBlock.toString() );
            console.log(' nextBlock' , unstakedLog.nextBlock.toString() );
         }
    }

    it('rewardPerBlock ', async function () {
        let reward = await stakeWithSalePeriod.rewardPerBlock();
        console.log('rewardPerBlock ', reward.toString());

    });
    it('sendTransaction - stake 1 ether (defaultSender) ', async function () {
         const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
        //await stakeWithSalePeriod.sendTransaction({from:defaultSender,value:toWei(sendAmountForTest,'ether')});

        await stakeWithSalePeriod._addUserStake(defaultSender, toBN('5'), toWei(sendAmountForTest2,'ether') ,{from:defaultSender})
        //console.log('data', data);
        //await logStorage(defaultSender);
        //await logAccumulatedStaked();
        //await logUnstakedAccumulated();

        await stakeWithSalePeriod._addUserStake(defaultSender, toBN('5'), toWei(sendAmountForTest,'ether') ,{from:defaultSender})
        await logAccumulatedStaked();
        //await logUnstakedAccumulated();

    });
    it('sendTransaction - stake 5 ether (user1)', async function () {
         const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
        await stakeWithSalePeriod.sendTransaction({from:user1,value:toWei(sendAmountForTest2,'ether')});
        await logStorage(user1);

    });
    it('sendTransaction - stake 1 ether (user2) ', async function () {
         const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
       await stakeWithSalePeriod.sendTransaction({from:user2,value:toWei(sendAmountForTest,'ether')});
        //await logStorage(user2);

         await logAccumulatedStaked();
         for(let i=12; i< 22; i++){
            console.log(`expectedTotals:  `,i, (await stakeWithSalePeriod.expectedTotals(toBN(i+''))).toString());
        }
    });
    /*
    it('availableUserReward (defaultSender) ', async function () {
        this.timeout(1000000);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 6);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);;
        let reward = await stakeWithSalePeriod.availableUserReward(defaultSender, toBN('0'),toBN('0'), {from:defaultSender});
        console.log('reward data ', fromWei(reward,'ether'));

    });

    it('availableSnapshotRecords (user1) ', async function () {
        this.timeout(1000000);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
        console.log('reward data ', fromWei(reward,'ether') );

    });

    it('availableSnapshotRecords - passed 3 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 4 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 5 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 6 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
         console.log('reward data ', fromWei(reward,'ether') );
    });

    it('availableSnapshotRecords - passed 7 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );

        await logAccumulatedStaked();
    });

    it('availableSnapshotRecords - passed 8 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 9 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 10 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 11 blocks (defaultSender)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
        console.log('reward data ', fromWei(reward,'ether') );
    });
    it('availableSnapshotRecords - passed 12 blocks (user1)', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 1);
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);

        let reward = await stakeWithSalePeriod.availableSnapshotRecords(user1, toBN('0'), {from:user1});
   //    console.log('reward ', reward);
         console.log('reward data ', fromWei(reward,'ether') );
    });
    */
});