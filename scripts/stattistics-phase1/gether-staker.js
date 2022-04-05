const { ethers, upgrades } = require("hardhat");

const StakeSimpleABI = require("../../abis/StakeSimple.json").abi;
const Erc20ABI = require("../../abis/erc20ABI.json");
const SeigManagerABI = require("../../abis/SeigManager.json").abi;
const DepositManagerABI = require("../../abis/DepositManager.json").abi;


const stakeContract1 = "0x9a8294566960Ab244d78D266FFe0f284cDf728F1";
const stakeContract2 = "0x7da4E8Ab0bB29a6772b6231b01ea372994c2A49A";
const stakeContract3 = "0xFC1fC3a05EcdF6B3845391aB5CF6a75aeDef7CeA";
const stakeContract4 = "0x9F97b34161686d60ADB955ed63A2FC0b2eC0a2a9";
const stakeContract5 = "0x21Db1777Dd95749A849d9e244136E72bd93082Ea";

const TON = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5";
const WTON = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2";
const TOS = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153";
const Layer2 = "0x42ccf0769e87cb2952634f607df1c7d62e0bbc52";
const SeigManager = "0x710936500aC59e8551331871Cbad3D33d5e0D909";
const DepositManager = "0x56e465f654393fa48f007ed7346105c7195cee43";
const Vault = "0xf04f6a6d6115d8400d18eca99bdee67abb498a7b";

let stakers = [];

let stakeInfos = []

async function main() {

    await getData(stakeContract1);

}

async function getData(contractAddress) {
    const contract = await ethers.getContractAt(StakeSimpleABI, contractAddress, ethers.provider);

    const TONContract = await ethers.getContractAt(Erc20ABI, TON, ethers.provider);
    const TOSContract = await ethers.getContractAt(Erc20ABI, TOS, ethers.provider);
    const WTONContract = await ethers.getContractAt(Erc20ABI, WTON, ethers.provider);
    const SeigManagerContract = await ethers.getContractAt(SeigManagerABI, SeigManager, ethers.provider);
    const DepositManagerContract = await ethers.getContractAt(DepositManagerABI, DepositManager, ethers.provider);

    console.log( 'contract ', contract.address);
    let balance = await TONContract.balanceOf(contract.address);
    console.log( 'TON balanceOf ', ethers.utils.formatUnits(balance.toString(), 18).toString() );
    balance = await TOSContract.balanceOf(contract.address);
    console.log( 'TOS balanceOf ', ethers.utils.formatUnits(balance.toString(), 18).toString() );
    balance = await WTONContract.balanceOf(contract.address);
    console.log( 'WTON balanceOf ', ethers.utils.formatUnits(balance.toString(), 27).toString() );
    balance = await SeigManagerContract.stakeOf(Layer2, contract.address);
    console.log( 'SeigManagerContract stakeOf ', ethers.utils.formatUnits(balance.toString(), 27).toString());

    balance = await DepositManagerContract.pendingUnstaked(Layer2, contract.address);
    console.log( 'DepositManagerContract pending ', ethers.utils.formatUnits(balance.toString(), 27).toString());

    // let balance = await TONContract.balanceOf(Vault);
    // console.log( 'TON balanceOf ', balance.toString());
    // balance = await TOSContract.balanceOf(Vault);
    // console.log( 'TOS balanceOf ', balance.toString());
    // balance = await WTONContract.balanceOf(Vault);
    // console.log( 'WTON balanceOf ', balance.toString());
    // balance = await SeigManagerContract.stakeOf(Layer2, Vault);
    // console.log( 'SeigManagerContract stakeOf ', balance.toString());

    let startBlock = 12880649;
    let endBlock = 14441730;
    let allEvents = [];

    //endBlock = 13017541+10000;


    let eventFilter = [
        contract.filters.Staked(null, null)
        ];
    let txCount = 0;
    for(let i = startBlock; i < endBlock; i += 5000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 4999);
      const events = await contract.queryFilter(eventFilter, _startBlock, _endBlock);
      //console.log(events);

      for(let l=0; l< events.length; l++){
        // console.log(e);
        if(events[l].event == "Staked" ){
            // console.log("txCount", txCount,e.event, e.blockNumber, e.transactionHash, e.args.to, e.args.amount);
            txCount++;
            let userStaked = await contract.userStaked(events[l].args.to);
            let canRewardAmount = await contract.canRewardAmount(events[l].args.to, endBlock);
            add(events[l].args.to.toLowerCase(), events[l].args.amount, userStaked.released, canRewardAmount);
        }
      }
      console.log('==== block ', i);
      for(let k=0; k< stakeInfos.length; k++){
        console.log( k,'    ', stakeInfos[k].account, '    ',ethers.utils.formatUnits(stakeInfos[k].amount.toString(), 18),'    ', stakeInfos[k].withdraw,'    ',  ethers.utils.formatUnits(stakeInfos[k].canReward.toString(), 18) );
      }
      //allEvents = [...allEvents, ...events]
    }
    console.log('==== end block ', i );
    for(let h=0; h< stakeInfos.length; h++){
      console.log( h,'    ', stakeInfos[h].account, '    ',ethers.utils.formatUnits(stakeInfos[h].amount.toString(), 18),'    ', stakeInfos[h].withdraw,'    ',  ethers.utils.formatUnits(stakeInfos[h].canReward.toString(), 18) );
    }

    return null;
  };


  function add(user, amount, withdraw, canReward) {
    //console.log('stakers.includes(user)',user, stakers.includes(user));
    if(!stakers.includes(user)) {
       let data = {
          account: user,
          amount: amount,
          withdraw: withdraw,
          canReward: canReward
        }
        stakeInfos.push(data);
        stakers.push(user);
     } else {
       for(let i=0; i< stakeInfos.length ; i++){
          if(stakeInfos[i].account == user){
            stakeInfos[i].amount = stakeInfos[i].amount.add(amount)
            stakeInfos[i].withdraw = withdraw;
            stakeInfos[i].canReward = canReward;

          }
       }
     }
  }


main()
  .then(() => process.exit(0))
  .catch((error) => {

    for(i=0; i< stakeInfos.length; i++){
      console.log( i,'    ', stakeInfos[i].account, '    ',ethers.utils.formatUnits(stakeInfos[i].amount.toString(), 18),'    ', stakeInfos[i].withdraw,'    ',  ethers.utils.formatUnits(stakeInfos[i].canReward.toString(),18) );
    }

    console.error(error);
    process.exit(1);
  });