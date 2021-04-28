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
const Stake1Vault = contract.fromArtifact('Stake1Vault');

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

describe('Stake1Vault Contract', function () {
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
        fldVault = await Stake1Vault.new({from:defaultSender});

        // create fld
        fld = await FLD.new({from:defaultSender});


    });

    it('setFLD', async function () {
        // mint fld to vault
        await fldVault.setFLD(fld.address, {from:defaultSender});
        await fld.mint(fldVault.address, utils.parseUnits(initialTotal, 18), {from:defaultSender});

    });
    it('addVault', async function () {
        const current = await time.latestBlock();
        if(logFlag) console.log(`Current block: ${current} `);
        let startBlock = parseInt(current.toString())+5;

        // add Vault
        await fldVault.addVault(
            PHASE2_VAULT_HASH,
            utils.parseUnits(initialTotal, 18),
            toBN(startBlock+''),
            {from:defaultSender})
    });


});