//const { BigNumber, utils } = require("ethers")
//const { ethers, upgrades } = require("hardhat")

const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require('ethers')
const BigNumber = ethers.BigNumber // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils

const {
    defaultSender, accounts, contract, web3, privateKeys
} = require('@openzeppelin/test-environment');

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
const StakeFactory = contract.fromArtifact('StakeFactory');
const StakeRegistry = contract.fromArtifact('StakeRegistry');
const FLD = contract.fromArtifact('FLD');
const FLDVault = contract.fromArtifact('FLDVault');
const Stake1Vault = contract.fromArtifact('Stake1Vault');
const Stake1Logic = contract.fromArtifact('Stake1Logic');
const Stake1Proxy = contract.fromArtifact('Stake1Proxy');
const Stake1 = contract.fromArtifact('Stake1');
const IERC20 = contract.fromArtifact('IERC20');

const LibTokenStake1 = contract.fromArtifact('LibTokenStake1');
//------------------------
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


describe('StakeVault Contract', function () {

    let weth , fld, stakeregister , stakefactory, stake1proxy, stake1logic ;
    let vault_phase1_eth,  vault_phase1_ton, vault_phase1_fldethlp, vault_phase1_dev;

    let stakeEntry ;

    let a1, a2, tokenInfo;
    let sendAmount = '1';
    let admin = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let userPrivate2 = privateKeys[2];

    let testStakingPeriodBlocks = [10,20];
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

        // create fld
        fld = await FLD.new({from:defaultSender});

        stakeregister = await StakeRegistry.new({from:defaultSender});
        stakefactory = await StakeFactory.new({from:defaultSender});
        stake1logic = await Stake1Logic.new({from:defaultSender});
        stake1proxy = await Stake1Proxy.new({from:defaultSender});

        saleStartBlock = await time.latestBlock();
        saleStartBlock = parseInt(saleStartBlock.toString());
        stakeStartBlock = saleStartBlock + 15;

    });
    /*
    it('Pharse1_ETH_Staking Vault', async function () {
        //let library = await LibTokenStake1.new();
        //vault_phase1_eth.link('LibTokenStake1', library.address);

         // create vault
        vault_phase1_eth = await Stake1Vault.new({from:defaultSender});

        // mint fld to vault
        await vault_phase1_eth.initialize(
            fld.address,
            zeroAddress,
            utils.parseUnits(Pharse1_ETH_Staking, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            stakefactory.address,
            {from:defaultSender});
        await fld.mint(vault_phase1_eth.address, utils.parseUnits(Pharse1_ETH_Staking, 18), {from:defaultSender});

    });
    */
    /*
    it('Pharse1_TON_Staking Vault', async function () {
        // mint fld to vault
        await vault_phase1_ton.initialize(
            fld.address,
            utils.parseUnits(Pharse1_TON_Staking, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            {from:defaultSender});

        await fld.mint(vault_phase1_ton.address, utils.parseUnits(Pharse1_TON_Staking, 18), {from:defaultSender});
        await vault_phase1_ton.grantRole(ADMIN_ROLE,stakefactory.address,{from:defaultSender});
    });
    it('Pharse1_FLDETHLP_Staking Vault', async function () {
        // mint fld to vault
        await vault_phase1_fldethlp.initialize(
            fld.address,
            utils.parseUnits(Pharse1_FLDETHLP_Staking, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            {from:defaultSender});

        await fld.mint(vault_phase1_fldethlp.address, utils.parseUnits(Pharse1_FLDETHLP_Staking, 18), {from:defaultSender});
        await vault_phase1_fldethlp.grantRole(ADMIN_ROLE,stakefactory.address,{from:defaultSender});
    });

    it('Pharse1_DEV_Mining Vault', async function () {
        // mint fld to vault
        await vault_phase1_dev.initialize(
            fld.address,
            utils.parseUnits(Pharse1_DEV_Mining, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            {from:defaultSender});

        await fld.mint(vault_phase1_dev.address, utils.parseUnits(Pharse1_DEV_Mining, 18), {from:defaultSender});
        await vault_phase1_dev.grantRole(ADMIN_ROLE,stakefactory.address,{from:defaultSender});
    });
    */
    it('Stake1Proxy upgradeTo ', async function () {

        await stake1proxy.upgradeTo(stake1logic.address, {from:defaultSender});

    });
/*
    it('Register Vault', async function () {

        // add Vault
        await stakeregister.addVault(
            toBN('1'),
            HASH_Pharse1_ETH_Staking, vault_phase1_eth.address ,
            {from:defaultSender});

        await stakeregister.addVault(
            toBN('1'),
            HASH_Pharse1_TON_Staking, vault_phase1_ton.address ,
            {from:defaultSender});
        await stakeregister.addVault(
            toBN('1'),
            HASH_Pharse1_FLDETHLP_Staking, vault_phase1_fldethlp.address ,
            {from:defaultSender});
        await stakeregister.addVault(
            toBN('1'),
            HASH_Pharse1_DEV_Mining, vault_phase1_dev.address ,
            {from:defaultSender});


    });
*/
    it('stakeEntry set', async function () {
        stakeEntry = await Stake1Logic.at(stake1proxy.address,{from:defaultSender});
        await stakeEntry.setStore(fld.address, stakeregister.address, stakefactory.address,{from:defaultSender});
        await stakeregister.grantRole(ADMIN_ROLE,stake1proxy.address,{from:defaultSender});
    });

    it('stakeEntry create Vault', async function () {
        //let library = await LibTokenStake1.new();
        //vault_phase1_eth.link('LibTokenStake1', library.address);

         // create vault
        vault_phase1_eth = await Stake1Vault.new({from:defaultSender});

        // mint fld to vault
        await vault_phase1_eth.initialize(
            fld.address,
            zeroAddress,
            utils.parseUnits(Pharse1_ETH_Staking, 18),
            toBN(saleStartBlock),
            toBN(stakeStartBlock),
            stakefactory.address,
            {from:defaultSender});
        await fld.mint(vault_phase1_eth.address, utils.parseUnits(Pharse1_ETH_Staking, 18), {from:defaultSender});
        //await vault_phase1_eth.grantRole(ADMIN_ROLE,stakefactory.address,{from:defaultSender});
    });
    it('createStakeContract ', async function () {
        for(let i = 0; i < testStakingPeriodBlocks.length; i++){
            await stakeEntry.createStakeContract(
                toBN('1'),
                vault_phase1_eth.address,
                fld.address,
                zeroAddress,
                toBN(testStakingPeriodBlocks[i]+''),
                'PHASE1_ETH_'+testStakingPeriodBlocks[i]+'_BLOCKS',
                {from:defaultSender});
        }
    });
    it('Stake ether : Phase1 : 1st Contract: user1 ', async function () {
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        for(let i = 0; i < stakeAddresses.length; i++){
            stakeContractAddress = stakeAddresses[i];
            if (stakeContractAddress != null) {
                let stakeContract = await Stake1.at(stakeContractAddress);

                await stakeContract.sendTransaction(
                    {from:user1, value:toWei(testUser1StakingAmount[i],'ether')});

                await stakeContract.sendTransaction(
                    {from:user2, value:toWei(testUser2StakingAmount[i],'ether')});

            }
        }

    });
    it('closeSale : Phase1 : closeSale ', async function () {
        await vault_phase1_eth.closeSale({from:user1});
    });


    it('Stake Contracts List : Phase1 ', async function () {
        let phases1 = await stakeregister.phasesAll(toBN('1'));
        for(let i = 0; i< phases1.length; i++){
            let phaseVault = phases1[i];
            if (phaseVault != null){
                console.log('phaseVault ',i,phaseVault );
                let contractsInVault = await stakeregister.stakeContractsOfVaultAll(phaseVault);
                console.log('contractsInVault ',contractsInVault );
                await logStakeContracts(1,phaseVault );
            }
        }

        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
    });
    /*
    it('can reward amount ', async function () {
        this.timeout(1000000);
        await timeout(15);
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        for(let i = 0; i< testClaimBlock.length; i++){

            let delayBlock = testClaimBlock[i];
            const latest = await time.latestBlock();
            await time.advanceBlockTo(parseInt(latest) + delayBlock);
            const current = await time.latestBlock();
            if(logFlag) console.log(`\n\nCurrent block: ${current} `);
            //console.log(` stakeAddresses: `,stakeAddresses );
            if (stakeAddresses.length > 0){
                for(let j = 0; j< stakeAddresses.length; j++){
                    let stakeContract = await Stake1.at(stakeAddresses[j]);
                    console.log(`\n stakeAddresses[j]: `,j, stakeAddresses[j] );

                    for (let u = 0; u < testStakingUsers.length; u++) {
                        console.log(' testStakingUsers[u]: ',u, testStakingUsers[u] );

                        let reward = await stakeContract.canRewardAmount(testStakingUsers[u]);
                        console.log(` ------- user`,u, testStakingUsers[u] );
                        console.log(` reward:  `, reward.toString());

                    }
                }
            }
        }
    });
    */

    it('claim reward ', async function () {
        this.timeout(1000000);
        await timeout(15);
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
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
/*
    let testStakingPeriodBlocks = [10,20];
    let testStakingUsers = [user1, user2];
    let testUser1StakingAmount = ['10', '5'];
    let testUser2StakingAmount = ['10', '20'];
    let testClaimBlock = [5, 10, 15, 20 , 25];


    it('createStakeContract  ', async function () {
        let _period = (60 * 60 * 24 * 14) / 13;
        _period = parseInt(_period);

        _period = 10;

        await stakeEntry.createStakeContract(
            toBN('1'),
            vault_phase1_eth.address,
            fld.address,
            zeroAddress,
            toBN(_period+''),
            'PHASE1_ETH_2WEEKS',
            {from:defaultSender});
    });
    // Pharse1_ETH_Staking : 2 weeks
    it('createStakeContract with 2 weeks', async function () {
        let _period = (60 * 60 * 24 * 14) / 13;
        _period = parseInt(_period);

        _period = 10;

        await stakeEntry.createStakeContract(
            toBN('1'),
            vault_phase1_eth.address,
            fld.address,
            zeroAddress,
            toBN(_period+''),
            'PHASE1_ETH_2WEEKS',
            {from:defaultSender});
    });

    it('createStakeContract with 4 weeks', async function () {
        let _period = (60 * 60 * 24 * 30) / 13;
        _period = parseInt(_period);

        _period = 20;

        await stakeEntry.createStakeContract(
            toBN('1'),
            vault_phase1_eth.address,
            fld.address,
            zeroAddress,
            toBN(_period+''),
            'PHASE1_ETH_4WEEKS',
            {from:defaultSender});
    });
    // Pharse1_ETH_Staking : 1 year
    it('createStakeContract with 4 weeks', async function () {
        let _period = (60 * 60 * 24 * 365) / 13;
        _period = parseInt(_period);
        _period = 50;
        await stakeEntry.createStakeContract(
            toBN('1'),
            vault_phase1_eth.address,
            fld.address,
            zeroAddress,
            toBN(_period+''),
            'PHASE1_ETH_1YEAR',
            {from:defaultSender});
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
                let ercTemp = IERC20.at(paytoken);
                payTokenBalance = ercTemp.balanceOf(_contract);
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
        console.log('released',  userStaked.released.toString());
    }
    /*
    it('Stake 10 ether : Phase1 : 1st Contract: user1 ', async function () {
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 0) stakeContractAddress = stakeAddresses[0];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);

            await stakeContract.sendTransaction(
                {from:user1, value:toWei(buyTokensEtehrs[0],'ether')});

        }
    });
    it('Stake 5 ether : Phase1 : 1st Contract: user2 ', async function () {
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 0) stakeContractAddress = stakeAddresses[0];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);

            await stakeContract.sendTransaction(
                {from:user2, value:toWei(buyTokensEtehrs[1],'ether')});

        }
    });
    it('Stake 10 ether : Phase1 : 2nd Contract : user1', async function () {
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 1) stakeContractAddress = stakeAddresses[1];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);

            await stakeContract.sendTransaction(
                {from:user1, value:toWei(buyTokensEtehrs[0],'ether')});

        }
    });
    it('Stake 20 ether : Phase1 : 2st Contract: user2 ', async function () {
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 1) stakeContractAddress = stakeAddresses[1];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);

            await stakeContract.sendTransaction(
                {from:user2, value:toWei(buyTokensEtehrs[2],'ether')});

        }
    });

    it('Stake 10 ether : Phase1 : 3rd Contract', async function () {
    }
    it('Stake 5 ether : Phase1 : 1st Contract', async function () {
    }
    it('Stake 5 ether : Phase1 : 2nd Contract', async function () {
    }
    it('Stake 5 ether : Phase1 : 3rd Contract', async function () {
    }

    it('closeSale : Phase1 : closeSale ', async function () {
        await vault_phase1_eth.closeSale({from:user1});
    });

    it('Stake Contracts List : Phase1 ', async function () {
        let phases1 = await stakeregister.phasesAll(toBN('1'));
        for(let i = 0; i< phases1.length; i++){
            let phaseVault = phases1[i];
            if (phaseVault != null){
                console.log('phaseVault ',i,phaseVault );
                let contractsInVault = await stakeregister.stakeContractsOfVaultAll(phaseVault);
                console.log('contractsInVault ',contractsInVault );
                await logStakeContracts(1,phaseVault );
            }
        }

        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
    });

    it('can reward amount : 1st Contract : Phase1 : user1  ', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 5);
        const current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);
        //
        let orderedEndBlocks = await vault_phase1_eth.orderedEndBlocksAll();
        console.log('\n----------- stakeEndBlockTotal ' );
        for(let i = 0; i< orderedEndBlocks.length; i++){
             let stakeEndBlockTotal = await vault_phase1_eth.stakeEndBlockTotal(orderedEndBlocks[i]);
              console.log(' stakeEndBlockTotal', orderedEndBlocks[i].toString() , utils.formatUnits(stakeEndBlockTotal.toString(), 18)  );
        }

        //
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 0) stakeContractAddress = stakeAddresses[0];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);
            let reward = await stakeContract.canRewardAmount(user1);
            if(logFlag) console.log(`reward.reward:  `, reward.reward.toString());
            if(logFlag) console.log(`reward.blockTotalReward:  `, reward.blockTotalReward.toString());

            if(logFlag) console.log(`reward._total:  `, reward._total.toString() );
            if(logFlag) console.log(`reward._end:  `, reward._end.toString());
        }

    });

    it('can reward amount : 1st Contract : user1  ', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 7);
        const current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);
        //
        let orderedEndBlocks = await vault_phase1_eth.orderedEndBlocksAll();
        console.log('\n----------- stakeEndBlockTotal ' );
        for(let i = 0; i< orderedEndBlocks.length; i++){
             let stakeEndBlockTotal = await vault_phase1_eth.stakeEndBlockTotal(orderedEndBlocks[i]);
              console.log(' stakeEndBlockTotal', orderedEndBlocks[i].toString() , utils.formatUnits(stakeEndBlockTotal.toString(), 18)  );
        }

        //
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 0) stakeContractAddress = stakeAddresses[0];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);
            let reward = await stakeContract.canRewardAmount(user1);
             if(logFlag) console.log(`reward.reward:  `, reward.reward.toString());
             if(logFlag) console.log(`reward.blockTotalReward:  `, reward.blockTotalReward.toString());

            if(logFlag) console.log(`reward._total:  `, reward._total.toString() );
            if(logFlag) console.log(`reward._end:  `, reward._end.toString());
        }
    });

    it('can reward amount : 1st Contract : user1  ', async function () {
        this.timeout(1000000);
        await timeout(15);
        const latest = await time.latestBlock();
        await time.advanceBlockTo(parseInt(latest) + 7);
        const current = await time.latestBlock();
        if(logFlag) console.log(`\n\nCurrent block: ${current} `);
        //
        let orderedEndBlocks = await vault_phase1_eth.orderedEndBlocksAll();
        console.log('\n----------- stakeEndBlockTotal ' );
        for(let i = 0; i< orderedEndBlocks.length; i++){
             let stakeEndBlockTotal = await vault_phase1_eth.stakeEndBlockTotal(orderedEndBlocks[i]);
              console.log(' stakeEndBlockTotal', orderedEndBlocks[i].toString() , utils.formatUnits(stakeEndBlockTotal.toString(), 18)  );
        }

        //
        let stakeAddresses = await vault_phase1_eth.stakeAddressesAll();
        let stakeContractAddress = null;
        if (stakeAddresses.length > 0) stakeContractAddress = stakeAddresses[0];
        if (stakeContractAddress != null) {
            let stakeContract = await Stake1.at(stakeContractAddress);
            let reward = await stakeContract.canRewardAmount(user1);
             if(logFlag) console.log(`reward.reward:  `, reward.reward.toString());
             if(logFlag) console.log(`reward.blockTotalReward:  `, reward.blockTotalReward.toString());

            if(logFlag) console.log(`reward._total:  `, reward._total.toString() );
            if(logFlag) console.log(`reward._end:  `, reward._end.toString());
        }
    });

    it('Claim 1st Contract : Phase1 ', async function () {
    }
    it('Claim 2nd Contract : Phase1 ', async function () {
    }
    it('Claim 3rd Contract : Phase1 ', async function () {
    }
    it('Withdraw 1st Contract : Phase1 ', async function () {
    }
    it('Withdraw 2nd Contract : Phase1 ', async function () {
    }
    it('Withdraw 3rd Contract : Phase1 ', async function () {
    }
    */
});