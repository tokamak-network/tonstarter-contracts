const { BigNumber, utils } = require("ethers")
const { ethers, upgrades } = require("hardhat")

// const { ether, time } = require("@openzeppelin/test-helpers");
const {
    defaultSender, accounts, contract, web3,
} = require('@openzeppelin/test-environment');

const BN = require('bn.js');

const chai = require('chai');
const { solidity } = require("ethereum-waffle");
const { expect } = chai;
chai.use(require('chai-bn')(BN));
chai.use(solidity);
require('chai').should();

const { padLeft, toBN, toWei, fromWei } = require('web3-utils');

const WETH = contract.fromArtifact('WETH');

describe('WETH', function () {
    let weth ;
    let a1, a2 ;
    let sendAmount = '1';

    before(async function () {
      a1 = await web3.eth.getBalance(accounts[0]) ;
      weth = await WETH.new({from:defaultSender});
      //console.log('before a: %s ETH ',fromWei(a,'ether'))
    });

    it('swapEthToWeth 1 ETH', async function () {
        await weth.swapEthToWeth({from: accounts[0], value: toWei(sendAmount, 'ether') });
        a2  = await web3.eth.getBalance(accounts[0]) ;
        //console.log('after a: %s ETH ',fromWei(a,'ether'));
        // let aBalance = await weth.balanceOf()
        let totalWeth = await weth.balanceEther();
        //console.log('total Ether Of WETH: %s ETH  ',fromWei(totalWeth,'ether'));

        let balanceAWeth = await weth.balanceOf(accounts[0]);
        //console.log('WETH.balanceOf(a): %s WETH ',fromWei(balanceAWeth,'ether'));

        expect(a1).to.be.bignumber.above(a2);
        expect(balanceAWeth).to.be.bignumber.equal(totalWeth);

    });

    it('swapWethToEth 1 ETH', async function () {
        a1  = await web3.eth.getBalance(accounts[0]) ;
        //console.log('before a: %s ETH ',fromWei(a1,'ether'));

        await weth.swapWethToEth(toWei(sendAmount, 'ether'), {from: accounts[0] });
        a2  = await web3.eth.getBalance(accounts[0]) ;
        //console.log('after a: %s ETH ',fromWei(a2,'ether'));
        // let aBalance = await weth.balanceOf()
        let totalWeth = await weth.balanceEther();
        // console.log('total Ether Of WETH: %s ETH  ',fromWei(totalWeth,'ether'));

        let balanceAWeth = await weth.balanceOf(accounts[0]);
        // console.log('WETH.balanceOf(a): %s WETH ',fromWei(balanceAWeth,'ether'));
        expect(totalWeth).to.be.bignumber.equal(toBN('0'));
        expect(balanceAWeth).to.be.bignumber.equal(toBN('0'));
        expect(a1).to.be.bignumber.below(a2);
    });
})
