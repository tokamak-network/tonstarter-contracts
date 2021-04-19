/*
const { BigNumber, utils } = require("ethers")
const { ethers, upgrades } = require("hardhat")
*/
//const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const { ethers } = require('ethers')

const chai = require('chai');
const { solidity } = require("ethereum-waffle");
const { expect } = chai;
const BN = require('bn.js');
chai.use(require('chai-bn')(BN));
chai.use(solidity);

const BigNumber = ethers.BigNumber // https://docs.ethers.io/v5/api/utils/bignumber/
const utils = ethers.utils

// const { ether, time } = require("@openzeppelin/test-helpers");

const {
    defaultSender, accounts, contract, web3, provider , privateKeys
} = require('@openzeppelin/test-environment');
/*
// ...
  await provider.queue.onIdle();
  const url = provider.wrappedProvider.host;
  */

const { padLeft, toBN, toWei, fromWei , keccak256 , soliditySha3 , solidityKeccak256 } = require('web3-utils');

const { getSignature , signatureVaildTime } = require('./common');

const ExchangeGovernToken = contract.fromArtifact('ExchangeGovernToken');
const FLD = contract.fromArtifact('FLD');
const SFLD = contract.fromArtifact('sFLD');
const FLDVault = contract.fromArtifact('FLDVault');

const ADMIN_ROLE = keccak256("ADMIN");
const MINTER_ROLE = keccak256("MINTER");
const BURNER_ROLE = keccak256("BURNER");
const CLAIMER_ROLE = keccak256("CLAIMER");
const initialTotal = '1000000.' + '0'.repeat(18);

const PERMIT_TYPEHASH = '0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9';

/*
async function getSignature(_private, _hash, owner, spender, value, deadline) {
        let _data = web3.utils.soliditySha3(
            { t: "bytes32", v: _hash },
            { t: "address", v: owner },
            { t: "address", v: spender },
            { t: "uint256", v: value  },
            { t: "uint256", v: deadline },
          );
          let signTx  = await web3.eth.accounts.sign(_data, _private);
          return signTx.signature;
    }
*/

describe('ExchangeGovernToken', function () {
    let echangeGovernToken , fld, sfld , fldvault ;
    let a1, a2 ;
    let sendAmount = '1';
    let exchangeWeight = 1;

    before(async function () {
      this.timeout(1000000);
      a1 = await web3.eth.getBalance(accounts[0]) ;

      fldvault = await FLDVault.new({from:defaultSender});
      fldvault.grantRole(CLAIMER_ROLE, accounts[0], {from:defaultSender});

      fld = await FLD.new({from:defaultSender});
      await fldvault.setFLD(fld.address, {from:defaultSender});
      await fld.mint(fldvault.address, utils.parseUnits(initialTotal, 18), {from:defaultSender});


      sfld = await SFLD.new({from:defaultSender});

      echangeGovernToken = await ExchangeGovernToken.new(fld.address, sfld.address, {from:accounts[0]});
      await echangeGovernToken.initialize(fld.address, sfld.address, {from:accounts[0]});

      sfld.grantRole(MINTER_ROLE, echangeGovernToken.address, {from:defaultSender});
      sfld.grantRole(BURNER_ROLE, echangeGovernToken.address, {from:defaultSender});

      // Deploying
      //const echangeGovernToken = await deployProxy(ExchangeGovernToken, [fld.address, sfld.address], { from:accounts[0] });
      //const upgraded = await upgradeProxy(instance.address, BoxV2, { deployer });

      // Upgrading
      //const BoxV2 = await ethers.getContractFactory("BoxV2");
      //const upgraded = await upgrades.upgradeProxy(instance.address, BoxV2);

      //console.log('before a: %s ETH ',fromWei(a,'ether'))
      /*
      ExchangeGovernToken = await ethers.getContractFactory("ExchangeGovernToken");
      echangeGovernToken = await upgrades.deployProxy(ExchangeGovernToken, [fld.address, sfld.address], { unsafeAllowCustomTypes: true });
      await echangeGovernToken.deployed();
      */
    });

    it('setExchangeWeight can\'t use by non-owner ', async function () {
      this.timeout(1000000);
      //let isAdmin = await echangeGovernToken.hasRole(ADMIN_ROLE, accounts[1]);
      //console.log(' 1' , isAdmin);

      await expect(
          echangeGovernToken.setExchangeWeight(100 , {from:accounts[1]})
      ).to.be.revertedWith("ExchangeGovernToken: Caller is not an admin")

    });

    it('setExchangeWeight can use by owner ', async function () {
        await echangeGovernToken.setExchangeWeight(100 , {from:accounts[0]});

        exchangeWeight = await echangeGovernToken.exchangeWeight();

    });

    it('mintSFLD : anybody can use mintSFLD with FLD.', async function () {

      let balanceFLD_00 = await fld.balanceOf(fldvault.address);
      let balanceFLD_0 = await fldvault.claimFLDAvailableAmount({from:accounts[0]});
      await fldvault.claimFLD(accounts[1], utils.parseUnits(sendAmount, 18), {from:accounts[0]});

      let balanceFLD_1 = await fld.balanceOf(accounts[1]);
      let balanceSFLD_1 = await sfld.balanceOf(accounts[1]);

      expect(balanceFLD_1).to.be.bignumber.equal(toWei(sendAmount, 'ether'));
      expect(balanceSFLD_1).to.be.bignumber.equal(toBN('0'));


      let value = toWei(sendAmount, 'ether');
      let deadline = Date.now()/1000 + signatureVaildTime;
      deadline = parseInt(deadline);
      let owner = accounts[1];
      let ownerPrivate = privateKeys[1];
      let spender = echangeGovernToken.address;
      let sig = await getSignature(privateKeys[1], owner, spender, value,  deadline);
      let tx = await echangeGovernToken.mintSFLD( value, deadline, sig ,{from:accounts[1]});

      let balanceFLD_2 = await fld.balanceOf(accounts[1]);
      let balanceSFLD_2 = await sfld.balanceOf(accounts[1]);
      let countSFLD = toBN(sendAmount).mul(exchangeWeight);
      /*
      console.log('balanceFLD_2:',  toBN(balanceFLD_2).toString() ) ;
      console.log('balanceSFLD_2:',   toBN(balanceSFLD_2).toString() ) ;
      console.log('exchangeWeight:',   toBN(exchangeWeight).toString()) ;
      console.log('countSFLD:',   countSFLD.toString() ) ;
      */
      expect(balanceFLD_2).to.be.bignumber.equal(toBN('0'));
      expect(fromWei(balanceSFLD_2.toString(), 'ether')).to.be.equal(countSFLD.toString());

    });

    it('burnSFLD : anybody can use burnSFLD with SFLD. ', async function () {

      let balanceFLD_1 = await fld.balanceOf(accounts[1]);
      let balanceSFLD_1 = await sfld.balanceOf(accounts[1]);
      let countbackFLD = balanceSFLD_1.div(exchangeWeight);
      /*
      console.log('exchangeWeight:',  toBN(exchangeWeight).toString() ) ;
      console.log('balanceFLD_1:',  toBN(balanceFLD_1).toString() ) ;
      console.log('balanceSFLD_1:',  toBN(balanceSFLD_1).toString() ) ;
      console.log('countbackFLD:',  toBN(countbackFLD).toString() ) ;
      */
      let tx = await echangeGovernToken.burnSFLD(balanceSFLD_1,{from:accounts[1]});

      let balanceFLD_2 = await fld.balanceOf(accounts[1]);
      let balanceSFLD_2 = await sfld.balanceOf(accounts[1]);

      expect(balanceFLD_2).to.be.bignumber.equal(countbackFLD );
      expect(balanceSFLD_2).to.be.bignumber.equal(toBN('0'));

    });

})
