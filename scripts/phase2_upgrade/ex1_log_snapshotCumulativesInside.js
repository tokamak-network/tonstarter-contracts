const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

const UniswapV3PoolJson = require("../../abis_uniswap3_core/UniswapV3Pool.json");
const requireWeb3 = require('web3')
const powerWeb3 = new requireWeb3(`${process.env.ARCHIVE_WHOST}`);

const {
  // padLeft,
  // toBN,
  // toWei,
  // fromWei,
  keccak256,
  // soliditySha3,
  // solidityKeccak256,
} = require("web3-utils");
const Web3EthAbi = require('web3-eth-abi');

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");

const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");


async function main() {

  const [deployer, user1, user2] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());
  let poolContract = null;
  let tickLower = 197160;
  let tickUpper = 200340;

  const tokenId135149 = ethers.BigNumber.from("135149");
  // case 1: 109556
  const tokenId109556 = ethers.BigNumber.from("109556");

  // case 2: 115616
  const tokenId115616 = ethers.BigNumber.from("115616");

  // test 1 : 135717
  const tokenId135717 = ethers.BigNumber.from("135717");

  let token = {
    id: tokenId135717,
    name: '135717',
    sender : user2
  }


  // let block = await ethers.provider.getBlock();
  // let currentTime = block.timestamp
  // console.log("\n ------------------" );
  // console.log("\n currentTime.timestamp:",  currentTime);

  const StakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", "0xC1349A9a33A0682804c390a3968e26E5a2366153");
  let depositTokens =  await StakeUniswapV3.depositTokens(token.id);

  console.log("\n StakeUniswapV3 depositTokens:",  token.id.toString(),
    '\n owner:',depositTokens.owner,
    '\n idIndex:',depositTokens.idIndex.toString(),
    '\n tickLower:',depositTokens.tickLower,
    '\n tickUpper:',depositTokens.tickUpper,
    '\n liquidity:',depositTokens.liquidity.toString(),
    '\n startTime:',depositTokens.startTime ,
    '\n claimedTime:',depositTokens.claimedTime ,
    '\n secondsInsideInitial:',depositTokens.secondsInsideInitial.toString(),
    '\n secondsInsideLast:',depositTokens.secondsInsideLast.toString()
    );


  // const block13421135 = await ethers.provider.getBlock(13421135)
  // console.log("\n block13421135:",  block13421135.timestamp);
  // 13421135 block :  1634280800 : Fri Oct 15 2021 15:53:20 GMT+0900 (한국 표준시)

 // 13421306  https://etherscan.io/tx/0x15feef0e240869cb26f2760a7432511d7372008dd4fb853df3ffafd8fb4ebd8e
 // 13420935  https://etherscan.io/tx/0xfe998e552867623edb99db78ba594758e41f1a77659e0190678e8c5c9b425316

  //console.log("\n depositTokens:",  depositTokens);
  // let latestBlockNumber = 13452000
  // let startBlockNumber = 13349502

  // let latestBlockNumber = 13421139
  // let startBlockNumber = 13421135

  //case1
  let latestBlockNumber = 13347570
  let startBlockNumber = 13347568

  let interval = 1;
  try{
        poolContract = new powerWeb3.eth.Contract(UniswapV3PoolJson.abi, process.env.UNISWAP_POOL );
        let block = startBlockNumber;

        let num = (latestBlockNumber-startBlockNumber)/interval;
        console.log('num:', num) ;

        for(let i = 0; i < num ; i++){
          block = startBlockNumber+(i*interval);
          poolContract.defaultBlock = block;
           console.log("\n ------------------" );
          console.log("\n *** block number :", block);
          let block1 = await ethers.provider.getBlock(block);
          let currentTime = block1.timestamp
          console.log("\n block timestamp:",  currentTime);

          let snapshotCumulativesInside = await poolContract.methods.snapshotCumulativesInside(depositTokens.tickLower, depositTokens.tickUpper).call();
          console.log("\n snapshotCumulativesInside:", block, snapshotCumulativesInside);

          // let res1 =  await StakeUniswapV3.getDepositToken(token.id);
          //   console.log("\n StakeUniswapV3 getDepositToken:",  token.id.toString(),
          //   '\n _poolAddress:',res1._poolAddress,
          //   '\n _depositTokens.tick:',res1.tick[0] , res1.tick[1] ,
          //   '\n _depositTokens.liquidity:',res1.liquidity.toString(),
          //   '\n _depositTokens.startTime:',res1.args[0].toString(),
          //   '\n _depositTokens.claimedTime:',res1.args[1].toString(),
          //   '\n _stakedCoinageTokens.startTime:',res1.args[2].toString(),
          //   '\n _stakedCoinageTokens.claimedTime:',res1.args[3].toString(),
          //   '\n _stakedCoinageTokens.claimedAmount:',res1.args[4].toString(),
          //   '\n _depositTokens.secondsInsideInitial:',res1.secondsPL[0].toString(),
          //   '\n _depositTokens.secondsInsideLast:',res1.secondsPL[1].toString()
          //   );
            //console.log("\n currentTime:",  parseInt(currentTime) );
            //console.log("\n _depositTokens.startTime:",  parseInt(res1.args[0].toString() ));


        }


  }catch(error){
      console.log('poolContract err :', error) ;
      process.exit();
  }

  if(poolContract ==null ){
        console.log('poolContract  is null ') ;
        process.exit();
  }

/*

  const tos = await ethers.getContractAt("TOS", tostoken);
  console.log("tos:", tos.address);

  //================================================

  let PHASE2_STAKE_UNISWAPV3_ADDRESS = process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS
  PHASE2_STAKE_UNISWAPV3_ADDRESS = "0xC1349A9a33A0682804c390a3968e26E5a2366153"
  const StakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", PHASE2_STAKE_UNISWAPV3_ADDRESS);

  const UNISWAPPOOLContract = new ethers.Contract(
    process.env.UNISWAP_POOL,
    UniswapV3PoolJson.abi,  ethers.provider);

  const tokenId135149 = ethers.BigNumber.from("135149");
  let token = {
    id: tokenId135149,
    name: '135149',
    sender : user2
  }

  let block = await ethers.provider.getBlock();
  let currentTime = block.timestamp
  console.log("\n currentTime.timestamp:",  currentTime);
*/
  /*

   let res0 =  await StakeUniswapV3.depositTokens(token.id);
    console.log("\n StakeUniswapV3 depositTokens:",  token.id.toString(),
    '\n owner:',res0.owner,
    '\n idIndex:',res0.idIndex.toString()
    );


   let res1 =  await StakeUniswapV3.getDepositToken(token.id);
    console.log("\n StakeUniswapV3 getDepositToken:",  token.id.toString(),
    '\n _poolAddress:',res1._poolAddress,
    '\n _depositTokens.tick:',res1.tick[0] , res1.tick[1] ,
    '\n _depositTokens.liquidity:',res1.liquidity.toString(),
    '\n _depositTokens.startTime:',res1.args[0].toString(),
    '\n _depositTokens.claimedTime:',res1.args[1].toString(),
    '\n _stakedCoinageTokens.startTime:',res1.args[2].toString(),
    '\n _stakedCoinageTokens.claimedTime:',res1.args[3].toString(),
    '\n _stakedCoinageTokens.claimedAmount:',res1.args[4].toString(),
     '\n _depositTokens.secondsInsideInitial:',res1.secondsPL[0].toString(),
     '\n _depositTokens.secondsInsideLast:',res1.secondsPL[1].toString()
    );
  console.log("\n currentTime:",  parseInt(currentTime) );
  console.log("\n _depositTokens.startTime:",  parseInt(res1.args[0].toString() ));

  let secondsAbsolute = parseInt(currentTime) - parseInt(res1.args[0].toString()) ;
  console.log("\n secondsAbsolute:",  secondsAbsolute );
  let secondsInside256 = 371461
  let secondsInsideInitial = parseInt(res1.secondsPL[0].toString())
  console.log("\n secondsInside256:",  secondsInside256 );
  console.log("\n secondsInsideInitial:",  secondsInsideInitial );

  secondsInsideDiff256 = secondsInside256 - secondsInsideInitial;
  console.log("\n secondsInsideDiff256:",  secondsInsideDiff256 );


  let res =  await StakeUniswapV3.getMiningTokenId(token.id);
  if(res!=null){
    console.log("\n StakeUniswapV3 getMiningTokenId:",
    token.id.toString(),
      '\n miningAmount:',utils.formatUnits(res.miningAmount.toString(), 18) ,
      '\n nonMiningAmount:',utils.formatUnits(res.nonMiningAmount.toString(), 18),
      '\n minableAmount:',utils.formatUnits(res.minableAmount.toString(), 18),
      '\n secondsInside:',res.secondsInside.toString(),
      '\n secondsInsideDiff256:',res.secondsInsideDiff256.toString(),
      '\n liquidity:',res.liquidity.toString(),
      '\n balanceOfTokenIdRay:', utils.formatUnits(res.balanceOfTokenIdRay.toString(), 27),
      '\n minableAmountRay:', utils.formatUnits(res.minableAmountRay.toString(), 27),
      '\n secondsInside256:',res.secondsInside256.toString(),
      '\n secondsAbsolute256:',res.secondsAbsolute256.toString()
      );
  }
  */
  /*
  res =  await StakeUniswapV3.userTotalStaked(token.sender.address);
   if(res!=null){
    console.log("\n StakeUniswapV3 userTotalStaked:",
    token.sender.address,
      '\n totalDepositAmount:',utils.formatUnits(res.totalDepositAmount.toString(), 18) ,
      '\n totalMiningAmount:',utils.formatUnits(res.totalMiningAmount.toString(), 18),
      '\n totalNonMiningAmount:',utils.formatUnits(res.totalNonMiningAmount.toString(), 18)
      );
  }
  res =  await StakeUniswapV3.totalStakedAmount();
   if(res!=null){
    console.log("\n StakeUniswapV3 totalStakedAmount:",
      '\n totalDepositAmount:',utils.formatUnits(res.toString(), 18)
      );
  }


   //=====================================
  let res2 =  await StakeUniswapV3.totalSupplyCoinage();
  console.log("\n StakeUniswapV3 totalSupplyCoinage:", utils.formatUnits(res2.toString(), 27)  );

  let res3 =  await StakeUniswapV3.balanceOfCoinage(token.id);
  console.log("\n StakeUniswapV3 balanceOfCoinage:", utils.formatUnits(res3.toString(), 27)  );

  const Stake2Vault = await ethers.getContractAt("Stake2Vault", process.env.PHASE2_LP_VAULT_ADDRESS);
  let miningPerSecond =  await Stake2Vault.miningPerSecond();
  console.log("\n Stake2Vault miningPerSecond:", utils.formatUnits(miningPerSecond.toString(), 18)  );

  let coinageLastMintBlockTimetamp =  await StakeUniswapV3.coinageLastMintBlockTimetamp();
  console.log("\n StakeUniswapV3 coinageLastMintBlockTimetamp:", coinageLastMintBlockTimetamp.toString()  );


  let stakeStartTime =  await StakeUniswapV3.stakeStartTime();
  console.log("\n -------- StakeUniswapV3 stakeStartTime:", stakeStartTime.toString());

  let saleStartTime =  await StakeUniswapV3.saleStartTime();
  console.log("\n -------- StakeUniswapV3 saleStartTime:", saleStartTime.toString());
  */
 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
