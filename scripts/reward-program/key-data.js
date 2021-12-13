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
  soliditySha3,
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

  console.log("ADMIN_ROLE",ADMIN_ROLE);

//   let key =  {
//     rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
//     pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
//     startTime: 1635306300,
//     endTime: 1635306900,
//     refundee: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E'
//   }

/*
  let key =  {
    rewardToken: '0x409c4D8cd5d2924b9bc5509230d16a61289c8153',
    pool: '0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4',
    startTime: 1635309000,
    endTime: 1635393600,
    refundee: '0x150E5777E3cF75Bbbbbac123415Df10b221d7db2'
  }

  */
/*
let key =  {
    rewardToken: '0xb109f4c20bdb494a63e32aa035257fba0a4610a4',
    pool: '0x831a1f01ce17b6123a7d1ea65c26783539747d6d',
    startTime: 1636679100,
    endTime: 1636680600,
    refundee: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E'
  }
*/

let key =  {
    rewardToken: '0x409c4D8cd5d2924b9bc5509230d16a61289c8153',
    pool: '0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4',
    startTime: 1638752400,
    endTime: 1638801000,
    refundee: '0x0496b93040e1c7931c8f9b7d1c57787ceb6485d4'
  }

  //['0x409c4D8cd5d2924b9bc5509230d16a61289c8153','0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4',1638752400,1638801000,'0x0496b93040e1c7931c8f9b7d1c57787ceb6485d4']

  const incentiveKeyAbi =
  'tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'

    let data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

    console.log("encode",data);

    let incentiveId = soliditySha3(ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key]));

    console.log('incentiveId',incentiveId);

/*
['0x409c4D8cd5d2924b9bc5509230d16a61289c8153','0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4',1635309000,1635393600,'0x150E5777E3cF75Bbbbbac123415Df10b221d7db2']
*/


/**
7534
['0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd','0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',1635306300,1635306900,'0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E']
0x1f98407aab862cddef78ed252d6f557aa5b0f00d
0x00000000000000000000000073a54e5c054aa64c1ae7373c2b5474d8afea08bd000000000000000000000000516e1af7303a94f81e91e4ac29e20f4319d4ecaf000000000000000000000000000000000000000000000000000000006178cb3c000000000000000000000000000000000000000000000000000000006178cd94000000000000000000000000865264b30eb29a2978b9503b8afe2a2dda33ed7e
0x6f2c1e2c11f7d8fbf02655a751e8aed9afd5464cad3b7e5c96a6daa718f793d5
 */
/*

  key =  {
    rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
    pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
    startTime: 1635246000,
    endTime: 1635253200,
    refundee: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E'
  }
     data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

    console.log("encode2",data);

    incentiveId = soliditySha3(ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key]));

    console.log('incentiveId2',incentiveId);

  key =  {
    rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
    pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
    startTime: 1634612400,
    endTime: 1635649200,
    refundee: '0xFF1F43422A0240CCbD29C16197853b372a61255d'
  }

     data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

    console.log("encode3",data);

    incentiveId = soliditySha3(ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key]));

    console.log('incentiveId3',incentiveId);
*/


/*

  key =  {
    rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
    pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
    startTime: 1634871600,
    endTime: 1635303600,
    refundee: '0x660DE9AE5Dd7C8dE4C5c9A8dAB64AF706a9F8a57'
  }
     data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

    console.log("encode3",data);

    incentiveId = soliditySha3(ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key]));

    console.log('incentiveId3',incentiveId);

*/


let block = await  ethers.provider.getBlock();
console.log('block.timestamp', block.timestamp);

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  /*
0x1f98407aab862cddef78ed252d6f557aa5b0f00d

생성한 리워드 프로그램
- 리워드 토큰(ERC20)  주소 : 0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd
- 풀 주소 : 0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf
- 리워드기간 시작시간의 **Unix Timestamp**  :  1635305100
- 리워드기간 마감시간의 **Unix Timestamp**  :  1635256800 2021-10-26 23:00:00
- 리워드 기간 종료후,  남은 리워드를 받을 계정 주소 0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E

key (tuple)  ['0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd','0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',1635305100,1635256800,'0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E']
reward (uint256)  2000000000000000000


0x00000000000000000000000073a54e5c054aa64c1ae7373c2b5474d8afea08bd000000000000000000000000516e1af7303a94f81e91e4ac29e20f4319d4ecaf000000000000000000000000000000000000000000000000000000006177dfb000000000000000000000000000000000000000000000000000000000617809e0000000000000000000000000865264b30eb29a2978b9503b8afe2a2dda33ed7e


incentiveId 0x27bf09ba7d3e588d0004a9bf5681b0a5f48b84a02577eba1e2d9fb2a9f6e94ee




생성한 리워드 프로그램
- 리워드 토큰(ERC20)  주소 : 0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd
- 풀 주소 : 0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf
- 리워드기간 시작시간의 **Unix Timestamp**  :  1635246000 2021-10-26 20:00:00
- 리워드기간 마감시간의 **Unix Timestamp**  :  1635256800 2021-10-26 23:00:00
- 리워드 기간 종료후,  남은 리워드를 받을 계정 주소 0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E

key (tuple)  ['0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd','0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',1635246000,1635256800,'0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E']
reward (uint256)  2000000000000000000


0x00000000000000000000000073a54e5c054aa64c1ae7373c2b5474d8afea08bd000000000000000000000000516e1af7303a94f81e91e4ac29e20f4319d4ecaf000000000000000000000000000000000000000000000000000000006177dfb000000000000000000000000000000000000000000000000000000000617809e0000000000000000000000000865264b30eb29a2978b9503b8afe2a2dda33ed7e


incentiveId 0x27bf09ba7d3e588d0004a9bf5681b0a5f48b84a02577eba1e2d9fb2a9f6e94ee

--

생성한 리워드 프로그램
- 리워드 토큰(ERC20)  주소 : 0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd
- 풀 주소 : 0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf
- 리워드기간 시작시간의 **Unix Timestamp**  :  1635246000 2021-10-26 20:00:00
- 리워드기간 마감시간의 **Unix Timestamp**  :  1635253200 2021-10-26 22:00:00
- 리워드 기간 종료후,  남은 리워드를 받을 계정 주소 0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E

key (tuple)  ['0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd','0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',1635246000,1635253200,'0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E']
reward (uint256)  3000000000000000000

0x00000000000000000000000073a54e5c054aa64c1ae7373c2b5474d8afea08bd000000000000000000000000516e1af7303a94f81e91e4ac29e20f4319d4ecaf000000000000000000000000000000000000000000000000000000006177dfb0000000000000000000000000000000000000000000000000000000006177fbd0000000000000000000000000865264b30eb29a2978b9503b8afe2a2dda33ed7e

incentiveId 0xdb2e08952140adfa89b1783982ec69ea75006fddca538798222b5cc21ecaef9d


*/
