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

const {
  abi: POOL_ABI,
} = require('../uniswap-v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');

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


  task("unstake-incentive", "Stake Incentive")
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

      // this is the rewar program's incentiveKey that i made
      let key = {
        rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
        pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
        startTime: 1632716437,
        endTime: 1632802837,
        refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
      }

      const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);

      const tx1 = await staker.connect(_sender).unstakeToken(key, tokenid);
      console.log('unstakeToken tx',tx1.hash);
      await tx1.wait();

    });



  task("withdraw-incentive", "Stake Incentive")
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
      const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);

      const tx1 = await staker.connect(_sender).withdrawToken(tokenid, sender, '0x');
      console.log('withdrawToken tx',tx1.hash);
      await tx1.wait();
    });


  task("claim-incentive", "Stake Incentive")
    .addParam("sender", "sender address")
    .addParam("rewardtoken", "rewardtoken")
    .setAction(async({
        sender,
        rewardtoken
      }) => {

      const {
        UniswapV3Staker: uniswapV3Staker,
      } = process.env;

      const {
        NonfungiblePositionManager: nonfungiblePositionManager,
      } = process.env;


      const _sender = await findAccount(sender);

      console.log('sender',sender  );
      console.log('rewardtoken',rewardtoken  );

      const tos = await ethers.getContractAt("TOS", rewardtoken);
      const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);
      let claimable = await staker.connect(_sender).rewards(rewardtoken, sender);
      console.log('claimable ',claimable.toString());

      let balancePre = await tos.balanceOf(sender);
      console.log('balancePre ',balancePre.toString());

      const tx1 = await staker.connect(_sender).claimReward(rewardtoken, sender, claimable);
      console.log('claimReward tx',tx1.hash);
      await tx1.wait();

      let balanceAfter = await tos.balanceOf(sender);
      console.log('balanceAfter ',balanceAfter.toString());

    });


  const computeRewardAmount = (
      totalRewardUnclaimed,
      totalSecondsClaimedX128,
      startTime,
      endTime,
      liquidity,
      secondsPerLiquidityInsideInitialX128,
      secondsPerLiquidityInsideX128,
      currentTime
  ) => {
    let reward = ethers.BigNumber.from('0');
    console.log('computeRewardAmount' ,currentTime, startTime);

    if(currentTime >= startTime) {
      let secondsInsideX128 = secondsPerLiquidityInsideX128.sub(secondsPerLiquidityInsideInitialX128).mul(liquidity) ;
      let mtime = Math.max(endTime, currentTime) ;
      let totalSecondsUnclaimedX128 = mtime - startTime;
      totalSecondsUnclaimedX128 = totalSecondsUnclaimedX128 - totalSecondsClaimedX128;
      let toBNsecondsInsideX128 = ethers.BigNumber.from(secondsInsideX128);
      let toBNtotalSecondsUnclaimedX128 = ethers.BigNumber.from(totalSecondsUnclaimedX128);
      reward = totalRewardUnclaimed.mul(toBNsecondsInsideX128).div(toBNtotalSecondsUnclaimedX128) ;
    }

    return reward;
  }

task("reward-incentive", "Stake Incentive")
    .addParam("sender", "sender address")
    .addParam("tokenid", "tokenid")
    .setAction(async({
        sender,
        tokenid
      }) => {

      let key =  {
        rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
        pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
        startTime: 1632833326,
        endTime: 1635425326,
        refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
      }

      const incentiveKeyAbi =
        'tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'

      // let incentiveId = soliditySha3(ethers.utils.defaultAbiCoder.encode([incentiveKeyAbi], [key]));

      // console.log('incentiveId',incentiveId);

      const {
        UniswapV3Staker: uniswapV3Staker,
      } = process.env;

      const _sender = await findAccount(sender);
      const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);

      /*
      const pool = new ethers.Contract(key.pool, POOL_ABI);

      let stakes = await staker.connect(_sender).stakes(tokenid, incentiveId);
      let deposit = await staker.connect(_sender).deposits(tokenid);
      let poolinfo = await pool.connect(_sender).snapshotCumulativesInside(deposit.tickLower,deposit.tickUpper);

      console.log('stakes ',stakes);

      console.log('stakes.secondsPerLiquidityInsideInitialX128 ',stakes.secondsPerLiquidityInsideInitialX128.toString());
      console.log('stakes.liquidity ',stakes.liquidity.toString());

      console.log('deposit ',deposit);
      console.log('poolinfo ',poolinfo);


      let incentive = await staker.connect(_sender).incentives(incentiveId);
      //console.log('incentive ',incentive);
      console.log('numberOfStakes ',incentive.numberOfStakes.toString());
      console.log('totalRewardUnclaimed ',incentive.totalRewardUnclaimed.toString());
      console.log('totalSecondsClaimedX128 ',incentive.totalSecondsClaimedX128.toString());

      let currentTime = await blockTimestamp();

      let reward = computeRewardAmount(
          incentive.totalRewardUnclaimed,
          incentive.totalSecondsClaimedX128,
          key.startTime,
          key.endTime,
          stakes.liquidity,
          stakes.secondsPerLiquidityInsideInitialX128,
          poolinfo.secondsPerLiquidityInsideX128,
          currentTime
      );
      console.log('reward ',reward.toString());
      */
      let getRewardInfo = await staker.connect(_sender).getRewardInfo(key, tokenid);
      console.log('getRewardInfo ',getRewardInfo.reward.toString());

    });


  task("end-incentive", "Stake Incentive")
    .addParam("sender", "sender address")
    .setAction(async({
        sender
      }) => {

      const {
        UniswapV3Staker: uniswapV3Staker,
      } = process.env;

      const {
        NonfungiblePositionManager: nonfungiblePositionManager,
      } = process.env;

      const _sender = await findAccount(sender);

      let key = {
        rewardToken: '0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd',
        pool: '0x516e1af7303a94f81e91e4ac29e20f4319d4ecaf',
        startTime: 1632716437,
        endTime: 1632802837,
        refundee: '0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9'
      }

      const staker = new ethers.Contract(uniswapV3Staker, STAKER_ABI);

      const tx = await staker.connect(_sender).endIncentive(key);
      console.log('endIncentive tx',tx.hash);
      await tx.wait();

    });


