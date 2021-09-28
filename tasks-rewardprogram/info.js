const { findAccount, makeTimestamps, blockTimestamp } = require("./utils");
const {
  abi: STAKER_ABI,
} = require('../v3-staker/artifacts/contracts/UniswapV3Staker.sol/UniswapV3Staker.json');
// const {
//   abi: NPM_ABI,
// } = require("../uniswap-v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const {
  abi: NPM_ABI,
} = require("./NonfungiblePositionManager1.json");

// import {
//   expect,
//   getMaxTick,
//   getMinTick,
//   FeeAmount,
//   TICK_SPACINGS,
//   blockTimestamp,
//   BN,
//   BNe18,å
//   snapshotGasCost,
//   ActorFixture,
//   makeTimestamps,
//   maxGas,
// } from '../v3-staker/test/shared'

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

task("staker-address", "Reward Info")
  .setAction(async() => {
    const {
      UniswapV3Staker: uniswapV3Staker,
    } = process.env;

    console.log('uniswapV3Staker',uniswapV3Staker);

});


task("create-incentive", "Create Incentive")
  .addParam("creator", "creator address")
  .addParam("reward", "rewardToken address")
  .addParam("pool", "pool address")
  .addParam("start", "Start Time")
  .addParam("end", "End Time")
  .setAction(async({
      creator,
      reward,
      pool,
      start,
      end
    }) => {

    const {
      UniswapV3Staker: uniswapV3Staker,
    } = process.env;

    const _creator = await findAccount(creator);
    const { startTime, endTime } = makeTimestamps(await blockTimestamp(), 60*60*24*30)
    const totalReward = ethers.BigNumber.from('100000000000000000000')
    console.log('uniswapV3Staker',uniswapV3Staker);
    console.log('creator',_creator.address);
    console.log('reward',reward);
    console.log('pool',pool);
    console.log('start',start);
    console.log('end',end);

    // console.log('startTime',startTime);
    // console.log('endTime',endTime);

    const tos = await ethers.getContractAt("TOS", reward);
    await tos.connect(_creator).approve(uniswapV3Staker, totalReward);

    let allowAmount = await tos.connect(_creator).allowance(_creator.address, uniswapV3Staker);

    console.log('allowAmount', ethers.utils.formatUnits(allowAmount.toString(), 18));

    const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);
    const key = {
          rewardToken: reward,
          pool: pool,
          startTime: startTime,
          endTime: parseInt(end),
          refundee: creator,
        }
    console.log('key',key);

    const tx = await staker.connect(_creator).createIncentive(
        key,
        totalReward
      )
    await tx.wait();
  });



task("stake1-incentive", "Stake Incentive")
  .addParam("sender", "sender address")
  .addParam("tokenid", "tokenid")
  .setAction(async({
      sender,
      tokenid
    }) => {

    const {
      UniswapV3Staker: uniswapV3Staker,
    } = process.env;

    const {
      NonfungiblePositionManager: nonfungiblePositionManager,
    } = process.env;

    const _sender = await findAccount(sender);
    tokenid = parseInt(tokenid)

    console.log('sender',_sender.address);
    console.log('tokenid',tokenid);


    let key = {
      rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
      pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
      startTime: 1632716437,
      endTime: 1632802837,
      refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
    }
    const incentiveKeyAbi =
      'tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'

    // const invalidStakeParams = {
    //       rewardToken: context.rewardToken.address,
    //       refundee: incentiveCreator.address,
    //       pool: context.pool01,
    //       ...timestamps,
    //       startTime: 100,
    //     }

    let data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

    const npm = new ethers.Contract(nonfungiblePositionManager, NPM_ABI);
    const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);

    let isApprovedForAll = await npm.connect(_sender).isApprovedForAll(sender, uniswapV3Staker);

    if(!isApprovedForAll)
      await npm.connect(_sender).setApprovalForAll(uniswapV3Staker, true);

    console.log('sender',sender);
    console.log('uniswapV3Staker',uniswapV3Staker);

    const tx1 = await npm.connect(_sender).safeTransferFrom(sender, uniswapV3Staker, tokenid);
    console.log('safeTransferFrom tx',tx1.hash);
    await tx1.wait();

    const tx2 = await staker.connect(_sender).stakeToken(key, tokenid);
    console.log('stakeToken tx',tx2.hash);
    await tx2.wait();

  });



task("stake2-incentive", "Stake Incentive")
  .addParam("sender", "sender address")
  .addParam("tokenid", "tokenid")
  .setAction(async({
      sender,
      tokenid
    }) => {

    const {
      UniswapV3Staker: uniswapV3Staker,
    } = process.env;

    const {
      NonfungiblePositionManager: nonfungiblePositionManager,
    } = process.env;

    const _sender = await findAccount(sender);
    tokenid = parseInt(tokenid)

    console.log('sender',_sender.address);
    console.log('tokenid',tokenid);

    let key =  {
        rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
        pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
        startTime: 1632833326,
        endTime: 1635425326,
        refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
      }

    const incentiveKeyAbi =
      'tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'


    let data = ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key])

    const npm = new ethers.Contract(nonfungiblePositionManager, NPM_ABI);
    const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);


    const tx1 = await npm.connect(_sender).safeTransferFrom(sender, uniswapV3Staker, tokenid, data);
    console.log('safeTransferFrom tx',tx1.hash);
    await tx1.wait();


  });

  const incentiveResultToStakeAdapter = (params) => ({
    pool: params.pool,
    startTime: params.startTime,
    endTime: params.endTime,
    rewardToken: params.rewardToken,
    refundee: params.refundee,
  })

  task("stake3-incentive", "Stake Incentive")
    .addParam("sender", "sender address")
    .addParam("tokenid", "tokenid")
    .setAction(async({
        sender,
        tokenid
      }) => {

      const {
        UniswapV3Staker: uniswapV3Staker,
      } = process.env;

      const {
        NonfungiblePositionManager: nonfungiblePositionManager,
      } = process.env;

      const _sender = await findAccount(sender);
      console.log('sender',_sender.address);
      console.log('tokenid',tokenid);

      // this is the rewar program's incentiveKey that i made
      let key1 =  {
          rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
          pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
          startTime: 1632833326,
          endTime: 1635425326,
          refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
        }

      let key2 = {
        rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
        pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
        startTime: 1632834379,
        endTime: 1635392658,
        refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
      }

      const incentiveKeyAbi =
        'tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'

      let arraykey = [key1, key2];
      let arraydata = arraykey.map(incentiveResultToStakeAdapter)

        console.log(`${incentiveKeyAbi}[]`);
        console.log(arraydata);

      let data = ethers.utils.defaultAbiCoder.encode([`${incentiveKeyAbi}[]`], [arraydata])

      const npm = new ethers.Contract(nonfungiblePositionManager, NPM_ABI);
      const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);

      const tx1 = await npm.connect(_sender).safeTransferFrom(sender, uniswapV3Staker, tokenid, data);
      console.log('safeTransferFrom tx',tx1.hash);
      await tx1.wait();

    });
