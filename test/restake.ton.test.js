//const { BigNumber, utils } = require("ethers")
//const { ethers, upgrades } = require("hardhat")

const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require('ethers')
const BigNumber = ethers.BigNumber // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils

const {
    defaultSender, accounts, contract, web3, privateKeys
} = require('@openzeppelin/test-environment');

const [ candidate1, candidate2, candidate3, user1, user2, user3, user4,user5,operator1,operator2] = accounts;
const candidates = [candidate1, candidate2, candidate3];
const users = [user1, user2, user3, user4, user5];
const operators = [operator1,operator2];

//const { expectEvent } = require('openzeppelin-test-helpers');

const BN = require('bn.js');

const chai = require('chai');
const { solidity } = require("ethereum-waffle");
const { expect } = chai;
chai.use(require('chai-bn')(BN));
chai.use(solidity);
require('chai').should();

const { padLeft, toBN, toWei, fromWei , keccak256 , soliditySha3 , solidityKeccak256 } = require('web3-utils');

const { getSignature , signatureVaildTime, timeout } = require('./common');

//------------------------
const ICO20Contracts = require('../utils/ico_test_deploy.js');
let ico20Contracts;
let TokamakContractsDeployed ;
let ICOContractsDeployed ;
//------------------------
const Stake1Vault = contract.fromArtifact('Stake1Vault');
const Stake1 = contract.fromArtifact('Stake1');
const IERC20 = contract.fromArtifact('IERC20');
//----------------------
const initialTotal = '10000000000.' + '0'.repeat(18);
const Pharse1_TON_Staking = '175000000.' + '0'.repeat(18);
const Pharse1_ETH_Staking = '175000000.' + '0'.repeat(18);
const Pharse1_FLDETHLP_Staking = '150000000.' + '0'.repeat(18);
const Pharse1_DEV_Mining = '150000000.' + '0'.repeat(18);

const HASH_Pharse1_TON_Staking = keccak256("PHASE1_TON_STAKING");
const HASH_Pharse1_ETH_Staking = keccak256("PHASE1_ETH_STAKING");
const HASH_Pharse1_FLDETHLP_Staking = keccak256("PHASE1_FLDETHLP_Staking");
const HASH_Pharse1_DEV_Mining = keccak256("PHASE1_DEV_Mining");

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

describe('StakeProxy ', function () {

    let weth , fld, stakeregister , stakefactory, stake1proxy, stake1logic ;
    let vault_phase1_eth,  vault_phase1_ton, vault_phase1_fldethlp, vault_phase1_dev;
    let ton, wton, depositManager, seigManager ;
    let stakeEntry , layer2 ;

    let a1, a2, tokenInfo;
    let sendAmount = '1';
    /*
    let admin = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let userPrivate2 = privateKeys[2];
    */

    let testStakingPeriodBlocks = [20,30];
    let testStakingUsers = [user1, user2];
    let testUser1StakingAmount = ['10', '5'];
    let testUser2StakingAmount = ['10', '20'];
    let testClaimBlock = [5, 10, 5, 5];

    let sendAmountForTest = '1' ;
    let sendAmountForTest2 = '5' ;
    let buyTokensEtehrs = ['10', '5', '20', '2'];
    let buyTokensDurations = ['10', '60', '120', '150'];
    let saleStartBlock = 0;
    let stakeStartBlock = 0;

    before(async function () {
         this.timeout(1000000);
        ico20Contracts = new ICO20Contracts();
    });

    it('ico20Contracts init  ', async function () {
        this.timeout(1000000);
        ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(defaultSender);

    });
    it('tokamakContracts init  ', async function () {
        this.timeout(1000000);
        TokamakContractsDeployed = await ico20Contracts.initializePlasmaEvmContracts(defaultSender);

        let cons = await ico20Contracts.getPlasamContracts();
        ton = cons.ton;
        wton = cons.wton;
        depositManager = cons.depositManager;
        seigManager = cons.seigManager;
    });

    it('Set StakeEntry  ', async function () {
        this.timeout(1000000);
        stakeEntry = await ico20Contracts.setEntry(defaultSender);
        console.log('stakeEntry',stakeEntry.address);

        let cons = await ico20Contracts.getICOContracts();
        fld = cons.fld;
        stakeregister = cons.stakeregister;
        stakefactory = cons.stakefactory;
        stake1proxy = cons.stake1proxy;
        stake1logic = cons.stake1logic;

    });

    it('stakeEntry create TON Vault ', async function () {
        const current = await time.latestBlock();
        saleStartBlock = current;
        saleStartBlock = parseInt(saleStartBlock.toString());
        stakeStartBlock = saleStartBlock + 20;

        if(logFlag) {
            console.log(`\n\nCurrent block: ${current} `);
            console.log(` saleStartBlock `,saleStartBlock);
            console.log(` stakeStartBlock `,stakeStartBlock);
        }

        let tx = await stakeEntry.createVault(
            ton.address,
            utils.parseUnits(Pharse1_TON_Staking, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            toBN('1'),
            HASH_Pharse1_TON_Staking
            ,{from:defaultSender});

        let vaultAddress = tx.receipt.logs[tx.receipt.logs.length-1].args.vault ;
        vault_phase1_ton = await Stake1Vault.at(vaultAddress, {from:defaultSender});
        await fld.mint(vault_phase1_ton.address, utils.parseUnits(Pharse1_TON_Staking, 18), {from:defaultSender});

    });

    it('createStakeContract with TON ', async function () {
        for(let i = 0; i < testStakingPeriodBlocks.length; i++){
            await stakeEntry.createStakeContract(
                toBN('1'),
                vault_phase1_ton.address,
                fld.address,
                ton.address,
                toBN(testStakingPeriodBlocks[i]+''),
                'PHASE1_TON_'+testStakingPeriodBlocks[i]+'_BLOCKS',
                {from:defaultSender});
        }
    });

    it('Stake TON ', async function () {
        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        let stakeContractAddress = null;
        for(let i = 0; i < stakeAddresses.length; i++){
            stakeContractAddress = stakeAddresses[i];
            if (stakeContractAddress != null) {
                let stakeContract = await Stake1.at(stakeContractAddress);

                // general erc20 - need to approve
                // await stakeContract.stake(toWei(testUser1StakingAmount[i],'ether'), {from: user1});
                // await stakeContract.stake(toWei(testUser2StakingAmount[i],'ether'), {from: user2});

                // ton
                await ico20Contracts.stake(stakeContractAddress, user1, toWei(testUser1StakingAmount[i],'ether') );
                await ico20Contracts.stake(stakeContractAddress, user2, toWei(testUser2StakingAmount[i],'ether') );

            }
        }
    });

    it('closeSale TON Vault  ', async function () {
        await stakeEntry.closeSale(vault_phase1_ton.address, {from:user1});
    });

    it('addOperator on TOKAMAK ', async function () {
      //  console.log('operator1',operator1);
        layer2 = await ico20Contracts.addOperator(operator1);
    });

    //stakeContract에 있는 톤을 Operator에 스테이킹
    it('Staking locked tons in stakeContract to Operator', async function () {
        this.timeout(1000000);
        await timeout(20);
        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 15);
        let current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);
        for(let i = 0; i < stakeAddresses.length; i++){
            console.log(`\n\n ************* restake ton to tokamak : `,i, stakeAddresses[i] );
            let stakeContract1 = await Stake1.at(stakeAddresses[i]);
            let endBlock = await stakeContract1.endBlock();

            if (current < endBlock) {
                let tonAmount = await ton.balanceOf(stakeAddresses[i]);
                console.log('tonAmount:',utils.formatUnits(tonAmount.toString(), 18) ,'TON' );
                let wtonAmount = await wton.balanceOf(stakeAddresses[i]);
                console.log('wtonAmount:',utils.formatUnits(wtonAmount.toString(), 27) ,'TON' );

                if (tonAmount.gt(toBN('0'))){

                    // 토카막에 스테이킹  : Staking TON in Tokamak
                    await stakeEntry.tokamakStaking(stakeAddresses[i], layer2.address,  tonAmount, {from: defaultSender});

                    let accStakedAccount = await depositManager.accStakedAccount(stakeAddresses[i]);
                    console.log('depositManager accStakedAccount:', utils.formatUnits(accStakedAccount.toString(), 27) ,'TON' );
                    let stakeOf = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
                    console.log('seigManager stakeOf:', utils.formatUnits(stakeOf.toString(), 27)  ,'TON');

                    let current = await time.latestBlock();
                    if(logFlag) console.log(`\n\nCurrent block: ${current} `);

                    let tonAmountAfter = await ton.balanceOf(stakeAddresses[i]);
                    console.log('tonAmountAfter:',utils.formatUnits(tonAmountAfter.toString(), 18) ,'TON' );
                    let wtonAmountAfter = await wton.balanceOf(stakeAddresses[i]);
                    console.log('wtonAmountAfter:',utils.formatUnits(wtonAmountAfter.toString(), 27) ,'TON' );

                }
            }
        }
    });

    //토카막: 리워드 업데이트.
    it('updateRewardTokamak', async function () {
        this.timeout(1000000);
        await timeout(20);
        await ico20Contracts.updateRewardTokamak(layer2, operator1);
    });

    //토카막에 톤 스테이킹후, 리워드 출금 요청
    it('After staking TON in Tokamak, request withdrawal of rewards', async function () {
        this.timeout(1000000);
        await timeout(20);

        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 15);
        let current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);
        for(let i = 0; i < stakeAddresses.length; i++){
            console.log(`\n\n ************* request withdrawal of rewards : `,i, stakeAddresses[i] );
            let stakeContract1 = await Stake1.at(stakeAddresses[i]);
            let totalStakedAmount = await stakeContract1.totalStakedAmount();
            console.log('totalStakedAmount:', utils.formatUnits(totalStakedAmount.toString(),18), 'TON' );
            let totalStakedAmountWtonStr = totalStakedAmount.toString()+'000000000';

            // 코인에이지 팩터때문에 여유분이 있어야 되는듯.
            let totalStakedAmountWton = toBN(totalStakedAmountWtonStr).add(toBN('1'));
            // check stakeOf
            let stakeOf = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
            console.log('seigManager stakeOf:',utils.formatUnits(stakeOf.toString(), 27) ,'TON' );

            if(stakeOf.gt(totalStakedAmountWton)){
                // 토카막에 리워드 양만큼만 언스테이킹 요청 : Request UnStaking TON in Tokamak
                // 원금은 출금하지 않는 함수.
                let _amount = stakeOf.sub(totalStakedAmountWton);
                console.log('** Request UnStaking _amount:', utils.formatUnits(_amount.toString(), 27) ,'TON');
                await stakeEntry.tokamakRequestUnStaking(stakeAddresses[i], layer2.address, _amount, {from: defaultSender});
                let accStakedAccount = await depositManager.accStakedAccount(stakeAddresses[i]);
                console.log('depositManager accStakedAccount:', utils.formatUnits(accStakedAccount.toString(), 27) ,'TON' );
                let stakeOfAfterRequest = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
                console.log('seigManager stakeOf After Request:', utils.formatUnits(stakeOfAfterRequest.toString(), 27)  ,'TON');

            }else{
                console.log('No rewards have been added.');
            }
        }
    });

    //출금지연블록 후에, 리워드 출금
    it('Process reward withdrawal after withdrawal delay block', async function () {
        this.timeout(1000000);

        let delayBlocks = await depositManager.globalWithdrawalDelay();
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + parseInt(delayBlocks));
        let current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `, 'delayBlocks:', delayBlocks.toString());
        await timeout(20);

        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        for(let i = 0; i < stakeAddresses.length; i++){
            console.log(`\n\n ************* Process withdrawal of rewards : `,i, stakeAddresses[i] );
            let tonAmount = await ton.balanceOf(stakeAddresses[i]);
            console.log('tonAmount:',utils.formatUnits(tonAmount.toString(), 18) ,'TON' );
            let wtonAmount  = await wton.balanceOf(stakeAddresses[i]);
            console.log('wtonAmount:',utils.formatUnits(wtonAmount.toString(), 27) ,'TON' );

            let stakeContract1 = await Stake1.at(stakeAddresses[i]);
            let totalStakedAmount = await stakeContract1.totalStakedAmount();
            console.log('totalStakedAmount:', utils.formatUnits(totalStakedAmount.toString(),18), 'TON' );

            let stakeOf = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
            console.log('seigManager stakeOf:',utils.formatUnits(stakeOf.toString(), 27) ,'TON' );

            let pendingUnstaked = await stakeContract1.tokamakPendingUnstaked(layer2.address);
            console.log('pendingUnstaked:',utils.formatUnits(pendingUnstaked.toString(), 27) ,'TON' );

            //리워드 출금, TON으로 출금함.
            await stakeEntry.tokamakProcessUnStaking(stakeAddresses[i], layer2.address, true, {from: defaultSender});

            let tonAmountAfter = await ton.balanceOf(stakeAddresses[i]);
            console.log('** tonAmount After Process UnStaking:',utils.formatUnits(tonAmountAfter.toString(), 18) ,'TON' );
            let wtonAmountAfter = await wton.balanceOf(stakeAddresses[i]);
            console.log('wtonAmount After Process UnStaking:',utils.formatUnits(wtonAmountAfter.toString(), 27) ,'TON' );
        }
    });

    //토카막에 스테이킹되어 있는 원금 출금 요청
    it('Request for withdrawal of principal funds staked in Tokamak', async function () {
        this.timeout(1000000);
       // await timeout(20);
        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        const latest = await time.latestBlock();
        let current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);
        for(let i = 0; i < stakeAddresses.length; i++){
            console.log(`\n\n ************* request withdrawal of all : `,i, stakeAddresses[i] );
            let tonAmount = await ton.balanceOf(stakeAddresses[i]);
            console.log('tonAmount:',utils.formatUnits(tonAmount.toString(), 18) ,'TON' );
            let wtonAmount  = await wton.balanceOf(stakeAddresses[i]);
            console.log('wtonAmount:',utils.formatUnits(wtonAmount.toString(), 27) ,'TON' );

             let stakeContract1 = await Stake1.at(stakeAddresses[i]);
            // check stakeOf
            let stakeOf = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
            console.log('seigManager stakeOf:',utils.formatUnits(stakeOf.toString(), 27) ,'TON' );

            // 토카막에 모든 금액 언스테이킹 요청 : Request UnStaking TON in Tokamak
            await stakeEntry.tokamakRequestUnStakingAll(stakeAddresses[i], layer2.address, {from: defaultSender});

            let pendingUnstaked = await stakeContract1.tokamakPendingUnstaked(layer2.address);
            console.log('** pendingUnstaked:',utils.formatUnits(pendingUnstaked.toString(), 27) ,'TON' );

            let accStakedAccount = await depositManager.accStakedAccount(stakeAddresses[i]);
            console.log('depositManager accStakedAccount:', utils.formatUnits(accStakedAccount.toString(), 27) ,'TON' );
            let stakeOfAfterRequest = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
            console.log('seigManager stakeOf After Request:', utils.formatUnits(stakeOfAfterRequest.toString(), 27)  ,'TON');

        }
    });

    //토카막에 스테이킹되어 있는 원금 출금처리
    it('Process principal funds withdrawal after withdrawal delay block', async function () {
        this.timeout(1000000);
        //await timeout(20);

        let delayBlocks = await depositManager.globalWithdrawalDelay();
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + parseInt(delayBlocks));
        let current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `, 'delayBlocks:', delayBlocks.toString());
        await timeout(20);

        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        for(let i = 0; i < stakeAddresses.length; i++){
            console.log(`\n\n ************* Process withdrawal of all : `,i, stakeAddresses[i] );
            let tonAmount = await ton.balanceOf(stakeAddresses[i]);
            console.log('tonAmount:',utils.formatUnits(tonAmount.toString(), 18) ,'TON' );
            let wtonAmount  = await wton.balanceOf(stakeAddresses[i]);
            console.log('wtonAmount:',utils.formatUnits(wtonAmount.toString(), 27) ,'TON' );

            let stakeContract1 = await Stake1.at(stakeAddresses[i]);
            let totalStakedAmount = await stakeContract1.totalStakedAmount();
            console.log('totalStakedAmount:', utils.formatUnits(totalStakedAmount.toString(),18), 'TON' );

            let stakeOf = await seigManager.stakeOf(layer2.address, stakeAddresses[i]);
            console.log('seigManager stakeOf:',utils.formatUnits(stakeOf.toString(), 27) ,'TON' );

            let pendingUnstaked = await stakeContract1.tokamakPendingUnstaked(layer2.address);
            console.log('pendingUnstaked:',utils.formatUnits(pendingUnstaked.toString(), 27) ,'TON' );

            //리워드 출금, TON으로 출금함.
            await stakeEntry.tokamakProcessUnStaking(stakeAddresses[i], layer2.address, true, {from: defaultSender});

            let tonAmountAfter = await ton.balanceOf(stakeAddresses[i]);
            console.log('** tonAmount After Process UnStaking:',utils.formatUnits(tonAmountAfter.toString(), 18) ,'TON' );
            let wtonAmountAfter = await wton.balanceOf(stakeAddresses[i]);
            console.log('wtonAmount After Process UnStaking:',utils.formatUnits(wtonAmountAfter.toString(), 27) ,'TON' );
        }
    });

    /*
    it('Stake Contracts List : Phase1 ', async function () {
        let phases1 = await stakeEntry.vaultsOfPahse(toBN('1'));
        for(let i = 0; i< phases1.length; i++){
            let phaseVault = phases1[i];
            if (phaseVault != null){
                console.log('phaseVault ',i,phaseVault );
                let contractsInVault = await stakeEntry.stakeContractsOfVault(phaseVault);
                console.log('contractsInVault ',contractsInVault );
                await logStakeContracts(1,phaseVault );
            }
        }
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
    });
    it('claim reward ', async function () {
        this.timeout(1000000);
        await timeout(15);
        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        for(let i = 0; i< 3; i++){

            let delayBlock = testClaimBlock[i];
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + delayBlock);
            const current = await time.latestBlock();
            if(logFlag) console.log(`\n\nCurrent block: ${current} `);
            //console.log(` stakeAddresses: `,stakeAddresses );
            if (stakeAddresses.length > 0){
                for(let j = 0; j< 1; j++){
                    let stakeContract = await Stake1.at(stakeAddresses[j]);
                    console.log(`\n stakeAddresses[j]: `,j, stakeAddresses[j] );

                    for (let u = 0; u < 1; u++) {
                        console.log('\n testStakingUsers[u]: ',u, testStakingUsers[u] );

                        let reward = await stakeContract.canRewardAmount(testStakingUsers[u]);
                        console.log(` \n------- user`,u, testStakingUsers[u] );
                        console.log(` reward:  `, fromWei(reward.toString(),'ether') );

                        if(reward.gt(toBN('0'))){

                           let fldBalance1 = await fld.balanceOf(testStakingUsers[u]);
                           console.log(` pre claim -> fldBalance1 :  `, fromWei(fldBalance1.toString(),'ether'));

                            let tx = await stakeContract.claim({from:testStakingUsers[u]});
                            console.log(` tx.receipt.logs :  `, tx.receipt.logs[0].event , tx.receipt.logs[0].args.from ,tx.receipt.logs[0].args.amount.toString() ,tx.receipt.logs[0].args.currentBlcok.toString()  );

                           let fldBalance2 = await fld.balanceOf(testStakingUsers[u]);
                           console.log(` after claim -> fldBalance2 :  `, fromWei(fldBalance2.toString(),'ether'));

                            let rewardClaimedTotal2 = await stakeContract.rewardClaimedTotal();
                            console.log(`after claim -> stakeContract rewardClaimedTotal2 :  `, fromWei(rewardClaimedTotal2.toString(),'ether') );
                            await logUserStaked(stakeAddresses[j], testStakingUsers[u], 'user1');

                        }
                    }
                }
            }
        }
    });

    it('withdraw ', async function () {
        this.timeout(1000000);
        await timeout(20);
        let stakeAddresses = await stakeEntry.stakeContractsOfVault(vault_phase1_ton.address);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 15);
        let current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);

        for(let i = 0; i < stakeAddresses.length; i++){
            console.log(`\n\n ************* withdraw : `,i, stakeAddresses[i] );
            let stakeContract1 = await Stake1.at(stakeAddresses[i]);
            let endBlock = await stakeContract1.endBlock();
            while(endBlock.gt(current)){
                await time.advanceBlockTo(parseInt(current) + 5);
                await timeout(13);
                current = await time.latestBlock();
                if(logFlag) console.log(`\n\nCurrent block: ${current} `);
            }

            let payTokenBalance1 = await web3.eth.getBalance(user1) ;
            console.log('\n payTokenBalance1:' , fromWei(payTokenBalance1.toString(),'ether') );

            await logUserStaked(stakeAddresses[i], user1, 'user1 pre withdraw' );

            await stakeContract1.withdraw({from:user1});
            await timeout(2);

            let payTokenBalance2 = await web3.eth.getBalance(user1) ;
            console.log('\n payTokenBalance2:' , fromWei(payTokenBalance2.toString(),'ether') );
            await logUserStaked(stakeAddresses[i], user1, 'user1 after withdraw' );

        }
    });
*/
    async function logStakeContracts(_phase, _phaseVault ){
        console.log('\n\n############### logStakeContracts [ PHASE',1,']',  _phaseVault);
        const vault = await Stake1Vault.at(_phaseVault);
        console.log('vault',  vault.address);
        let paytoken = await vault.paytoken();
        let cap = await vault.cap();
        let saleStartBlock = await vault.saleStartBlock();
        let stakeStartBlock = await vault.stakeStartBlock();
        let stakeEndBlock = await vault.stakeEndBlock();
        let blockTotalReward = await vault.blockTotalReward();
        let saleClosed = await vault.saleClosed();
        let orderedEndBlocks = await vault.orderedEndBlocksAll();
        let stakeAddresses = await vault.stakeAddressesAll();

        console.log('cap',  utils.formatUnits(cap.toString(), 18) );
        console.log('paytoken',   paytoken );
        console.log('saleStartBlock',  saleStartBlock.toString());
        console.log('stakeStartBlock',  stakeStartBlock.toString());
        console.log('stakeEndBlock',  stakeEndBlock.toString() );
        console.log('blockTotalReward',  utils.formatUnits(blockTotalReward.toString(), 18)  );
        console.log('saleClosed',  saleClosed);
        console.log('stakeAddresses', stakeAddresses );

        console.log('\n\n----------- stakeEndBlockTotal ' );
        for(let i = 0; i< orderedEndBlocks.length; i++){
             let stakeEndBlockTotal = await vault.stakeEndBlockTotal(orderedEndBlocks[i]);
              console.log(' stakeEndBlockTotal', orderedEndBlocks[i].toString() , utils.formatUnits(stakeEndBlockTotal.toString(), 18)  );
        }
        for(let i = 0; i< stakeAddresses.length; i++){
            let _contract = stakeAddresses[i];
            let stakeInfo = await vault.stakeInfos(_contract);

            console.log('\n\n----------- Stake Contract ',  _contract);
            let stakeContract = await Stake1.at(_contract);
            let token = await stakeContract.token();
            let paytoken = await stakeContract.paytoken();
            let contractVault = await stakeContract.vault();
            let saleStartBlock = await stakeContract.saleStartBlock();
            let startBlock = await stakeContract.startBlock();
            let endBlock = await stakeContract.endBlock();
            let rewardClaimedTotal = await stakeContract.rewardClaimedTotal();
            let totalStakedAmount = await stakeContract.totalStakedAmount();

            let payTokenBalance = toBN('0');
            if (paytoken == zeroAddress) {
                payTokenBalance = await web3.eth.getBalance(_contract) ;
            } else {
                let ercTemp = await IERC20.at(paytoken);
                payTokenBalance = await ercTemp.balanceOf(_contract);
            }
            console.log(' token',  token );
            console.log(' paytoken',  paytoken );
            console.log(' contract-Vault',  contractVault );
            console.log(' saleStartBlock',  saleStartBlock.toString() );
            console.log(' startBlock',  startBlock.toString() );
            console.log(' endBlock',  endBlock.toString() );
            console.log(' rewardClaimedTotal',   utils.formatUnits(rewardClaimedTotal.toString(), 18) );
            console.log(' totalStakedAmount', utils.formatUnits(totalStakedAmount.toString(), 18) );
            console.log(' ** payTokenBalance', utils.formatUnits(payTokenBalance.toString(), 18) );

            console.log(' name',  stakeInfo.name );
            console.log(' startBlcok',  stakeInfo.startBlcok.toString() );
            console.log(' endBlock',  stakeInfo.endBlock.toString() );
            console.log(' balance', utils.formatUnits(stakeInfo.balance.toString(), 18) );
            console.log(' totalRewardAmount',  utils.formatUnits(stakeInfo.totalRewardAmount.toString(), 18) );
            console.log(' claimRewardAmount',  utils.formatUnits(stakeInfo.claimRewardAmount.toString(), 18) );

            await logUserStaked(_contract, user1, 'user1');
            await logUserStaked(_contract, user2, 'user2');

        }
    }

    async function logUserStaked(_contract, _user, username ){
        console.log('\n\n*********** logUserStaked [',_contract,']', username,  _user);
        const stakeContract = await Stake1.at(_contract);
        let userStaked = await stakeContract.userStaked(_user);
        console.log('amount',  utils.formatUnits(userStaked.amount.toString(), 18) );
        console.log('claimedBlock',  userStaked.claimedBlock.toString());
        console.log('claimedAmount', utils.formatUnits(userStaked.claimedAmount.toString(), 18) );
        console.log('releasedBlock',  userStaked.releasedBlock.toString());
        console.log('releasedAmount',  utils.formatUnits(userStaked.releasedAmount.toString(), 18) );
        console.log('released',  userStaked.released.toString());
    }
});