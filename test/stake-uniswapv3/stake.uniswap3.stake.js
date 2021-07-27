const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require("ethers");
const utils = ethers.utils;
//const SwapRouterJson = require("../../abis_uniswap3_periphery/ISwapRouter.json");
const SwapRouterJson = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
//const PoolAddressJson = require("@uniswap/v3-periphery/artifacts/contracts/libraries/PoolAddress.sol/PoolAddress.json");
const {POOL_BYTECODE_HASH, computePoolAddress } = require('./computePoolAddress.js');
//import './interfaces/INonfungiblePositionManager.sol';
//const INonfungiblePositionManagerJson = require("@uniswap/v3-periphery/artifacts/contracts/interface/INonfungiblePositionManager.sol/INonfungiblePositionManager.json");
const { signERC2612Permit } = require("eth-permit");


const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

const {
  defaultSender,
  accounts,
  contract,
  web3,
  privateKeys,
} = require("@openzeppelin/test-environment");

const {
  deployedUniswapV3Contracts,
  FeeAmount,
  TICK_SPACINGS,
  getMinTick,
  getMaxTick,
  getNegativeOneTick,
  getPositiveOneMaxTick,
  encodePriceSqrt,
  getUniswapV3Pool,
  getBlock,
  mintPosition2,
  getTick
  // getMaxLiquidityPerTick,
} = require("../uniswap-v3-stake/uniswap-v3-contracts");

const {
  ICO20Contracts,
  Pharse2_ETHTOS_Staking,
  Pharse2_REWARD_PERBLOCK,
  HASH_Pharse2_ETHTOS_Staking
  } = require("../../utils/ico_test_deploy_ethers.js");

const {
  getAddresses,
  findSigner,
  setupContracts,
  mineBlocks,
} = require("../hardhat-test/utils");

const {
  timeout
  } = require("../common.js");

const Web3EthAbi = require('web3-eth-abi');
const abiDecoder = require('abi-decoder');

let deployedUniswapV3;
let ico20Contracts;
let TokamakContractsDeployed;
let ICOContractsDeployed;
let pool_eth_ton_address , pool_eth_tos_address, pool_ton_tos_address;
const zeroAddress = "0x0000000000000000000000000000000000000000";
let vaultAddress = null;
let stakeContractAddress = null;
let deployer ;
let tokenId_First, tokenId_second;

const createPool = async (token0, token1, nftPositionManager, sender ) => {

    const tx = await nftPositionManager.connect(sender).createAndInitializePoolIfNecessary(
      token0,
      token1,
      FeeAmount.MEDIUM,
      encodePriceSqrt(1, 1)
    );

    return await tx.wait();
  };

const mintPosition = async (
    token0,
    token1,
    amount0Desired,
    amount1Desired,
    nftPositionManager,
    sender
  ) => {

    // const StakeContractArtifact = await artifacts.readArtifact("StakeContract");
    const NonfungiblePositionManagerJson = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

    const contract = new ethers.Contract(nftPositionManager.address, NonfungiblePositionManagerJson.abi, ethers.provider);

    const tx = await contract.connect(sender).mint({
      token0,
      token1,
      amount0Desired,
      amount1Desired,
      amount0Min: 0,
      amount1Min: 0,
      deadline: 100000000000000,
      recipient: sender.address,
      fee: FeeAmount.MEDIUM,
      tickLower: getNegativeOneTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
      tickUpper: getPositiveOneMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
    });
    await tx.wait();
  };


describe(" UniswapV3 LP Staking", function () {
  let sender;
  let usersInfo;
  let tos, stakeregister, stakefactory, stake1proxy, stake1logic;
  let vault_phase1_eth, vault_phase1_ton, vault_phase1_tosethlp, vault_phase1_dev;
  let ton, wton, depositManager, seigManager;
  let stakeEntry, stakeEntry2, layer2, stakeUniswapV3Factory, stakeUniswapV3,
      stake2Logic, stake2Vault, stakeVaultFactory;
  let Stake2Logic, StakeUniswapV3, StakeUniswapV3Factory, Stake2Vault;

  const stakeType = "2"; // stake type for uniswapV3 stake

  let setup;
  let nftPositionManager, weth;
  let accountlist;
  let user1, user2, user3;
  let defaultSender ;
  let owner, tester2, tester ;

  before(async () => {
    ico20Contracts = new ICO20Contracts();
    accountlist = await getAddresses();

    defaultSender = accountlist[0];
    user1 = accountlist[1];
    user2 = accountlist[2];
    user3 = accountlist[3];

    sender = await ico20Contracts.findSigner(defaultSender);
    tester = await ico20Contracts.findSigner(user1);
    tester2 = await ico20Contracts.findSigner(user2);
    owner = sender;
  });

  describe('# 1. Deploy UniswapV3', async function () {

    it("deployedUniswapV3Contracts", async function () {
      this.timeout(1000000);

      deployedUniswapV3  = await deployedUniswapV3Contracts(defaultSender);
      nftPositionManager = deployedUniswapV3.nftPositionManager;
      console.log('nftPositionManager', deployedUniswapV3.nftPositionManager.address );
      console.log('nftDescriptor', deployedUniswapV3.nftDescriptor.address );
      console.log('weth', deployedUniswapV3.weth.address );
      console.log('swapRouter', deployedUniswapV3.swapRouter.address );
      console.log('coreFactory', deployedUniswapV3.coreFactory.address );
      console.log('poolAddressLib', deployedUniswapV3.poolAddressLib.address );
      console.log('tickMathLib', deployedUniswapV3.tickMathLib.address );

    });

  });

  describe('# 2. TONStarter Deployed ', async function () {

    it("ico20Contracts init  ", async function () {
      this.timeout(1000000);
      ICOContractsDeployed = await ico20Contracts.initializeICO20Contracts(
        defaultSender
      );

    });

    it("tokamakContracts init  ", async function () {
      this.timeout(1000000);
      TokamakContractsDeployed =
        await ico20Contracts.initializePlasmaEvmContracts(defaultSender);

      const cons = await ico20Contracts.getPlasamContracts();
      ton = cons.ton;
      wton = cons.wton;
      depositManager = cons.depositManager;
      seigManager = cons.seigManager;
      globalWithdrawalDelay = await depositManager.globalWithdrawalDelay();


      await ton.mint(defaultSender, ethers.utils.parseUnits('1000', 18), { from: defaultSender });
      await wton.mint(defaultSender, ethers.utils.parseUnits('1000', 18), { from: defaultSender });
    });

    it("Set StakeProxy ", async function () {
      this.timeout(1000000);
      stakeEntry = await ico20Contracts.setEntryExceptUniswap(defaultSender);

      const cons = await ico20Contracts.getICOContracts();
      stakeregister = cons.stakeregister;
      tos = cons.tos;
      stakefactory = cons.stakefactory;
      stake1proxy = cons.stake1proxy;
      stake1logic = cons.stake1logic;

      await stakeregister.addDefiInfo(
        "UNISWAP_V3",
        deployedUniswapV3.swapRouter.address,
        deployedUniswapV3.nftPositionManager.address,
        deployedUniswapV3.weth.address,
        FeeAmount.LOW,
        zeroAddress
      );

    });

  });


  describe('# 3. Regist Stake2Vault with phase=2 ', async function () {

      it("1. addStake2LogicAndVault2Factory for UniswapV3 Staking", async function () {
          this.timeout(1000000);

          stakeEntry2 = await ico20Contracts.addStake2LogicAndVault2Factory(defaultSender)
          const cons = await ico20Contracts.getICOContracts();
          stake2logic = cons.stake2logic;
          stakeUniswapV3Logic = cons.stakeUniswapV3Logic;
          stakeCoinageFactory = cons.stakeCoinageFactory;
          stakeUniswapV3Factory = cons.stakeUniswapV3Factory;
          stakeVaultFactory = cons.stakeVaultFactory;
          stake2vaultlogic = cons.stake2vaultlogic;
      });

  });

  describe('# 3. Phase 2 ', async function () {

    it("1. Create StakeUniswapV3 Vaults & Stake Contract ", async function () {
        this.timeout(1000000);

        let balance  = await stakeEntry2.balanceOf(wton.address, defaultSender);

        const cons = await ico20Contracts.getICOContracts();
        stakeVaultFactory = cons.stakeVaultFactory;
        stakeEntry2 = cons.stakeEntry2;
        tos = cons.tos;
        stakefactory = cons.stakefactory;

       //let owner = await ico20Contracts.findSigner(defaultSender);

        let tx = await stakeEntry2.connect(owner).createVault2(
          utils.parseUnits(Pharse2_ETHTOS_Staking, 18),
          utils.parseUnits(Pharse2_REWARD_PERBLOCK, 18),
          ethers.BigNumber.from("2"),
          HASH_Pharse2_ETHTOS_Staking,
          ethers.BigNumber.from("2"),
          [ deployedUniswapV3.nftPositionManager.address,
            deployedUniswapV3.coreFactory.address,
            deployedUniswapV3.weth.address,
            tos.address,
          ],
          "UniswapV3"
        );
        const receipt = await tx.wait();
        //console.log('receipt',receipt);

        for(let i=0; i< receipt.events.length ;i++){
          //console.log('receipt.events[i].event',i, receipt.events[i].event);
          if(receipt.events[i].event == "CreatedStakeContract2" && receipt.events[i].args!=null){
              vaultAddress = receipt.events[i].args.vault;
              stakeContractAddress = receipt.events[i].args.stakeContract;

              console.log('CreatedStakeContract2',vaultAddress);
          }

        }
        if(vaultAddress!=null){
            await tos.connect(owner).mint(
              vaultAddress,
              utils.parseUnits(Pharse2_ETHTOS_Staking, 18)
            );
        }
      console.log('vaultAddress',vaultAddress);
      console.log('stakeContractAddress',stakeContractAddress);

    });

    it("2. Create WTON-TOS Pool of User  ", async function () {
        this.timeout(1000000);

        console.log('wait... Create WTON-TOS Pool');

      //  await timeout(10);
        let [token0, token1] = [ton, tos];
        if (tos.address < ton.address) {
          [token0, token1] = [tos, ton];
        }

        const sender = await ico20Contracts.findSigner(user1);

       // console.log('defaultSender',defaultSender);
        const owner = await ico20Contracts.findSigner(defaultSender);

         // let topic0= Web3EthAbi.encodeFunctionSignature("PoolCreated(address,address,uint24,int24,address)") ;
          let topic0 = ethers.utils.id("PoolCreated(address,address,uint24,int24,address)")
          let interface = [{
                                type: 'address',
                                name: 'token0',
                                indexed: true
                            },{
                                type: 'address',
                                name: 'token1',
                                indexed: true
                            },{
                                type: 'uint24',
                                name: 'fee',
                                indexed: true
                            },
                            {
                                type: 'int24',
                                name: 'tickSpacing'
                            },
                            {
                                type: 'address',
                                name: 'pool'
                            }] ;
          const receipt = await createPool(token0.address, token1.address, deployedUniswapV3.nftPositionManager, owner );

          for(let i=0; i< receipt.logs.length ;i++){
            if(receipt.logs[i].topics[0] == topic0){
                const eventObj = Web3EthAbi.decodeLog(
                  interface,
                  receipt.logs[i].data,
                  receipt.logs[i].topics.slice(1)
                );
               // console.log(i, eventObj);
                pool_ton_tos_address = eventObj.pool;
               // console.log('eventObj.pool', eventObj.pool);
            }
          }

          console.log('pool_ton_tos_address', pool_ton_tos_address);

     });

     it("3. Mint Position ", async function () {
         console.log('wait... Mint Position');
        // await timeout(10);

        //const user_mint = await ico20Contracts.findSigner(user1);
        //const owner = await ico20Contracts.findSigner(defaultSender);
        console.log('ton', ton.address );
        console.log('tos', tos.address );

        let [token0, token1] = [ton, tos];
        if (tos.address < ton.address) {
          [token0, token1] = [tos, wton];
        }
        // let sendAmountWTON = "1000." + "0".repeat(18);
        // let sendAmountTOS = "1000." + "0".repeat(18);

        let sendAmountWTON = "50." + "0".repeat(18);
        let sendAmountTOS = "10000." + "0".repeat(18)

        const tx3 = await tos.connect(owner).mint(user1, utils.parseUnits(sendAmountTOS, 18) , {
          gasLimit: 10000000,
          gasPrice: 5000000000,
        });
        await tx3.wait();

        const tx4 = await ton.connect(owner).mint(user1, utils.parseUnits(sendAmountWTON, 18) , {
          gasLimit: 10000000,
          gasPrice: 5000000000,
        });
        await tx4.wait();


        let balanceOfUserWTON = await ton.balanceOf(user1);
        console.log('user1  balanceOfUserWTON', utils.formatUnits(balanceOfUserWTON, 18) ,' TON' );
         let balanceOfUserTOS = await tos.balanceOf(user1);
        console.log('user1  balanceOfUserTOS', utils.formatUnits(balanceOfUserTOS, 18) ,' TOS' );

        const tx1 = await tos.connect(tester).approve(deployedUniswapV3.nftPositionManager.address, utils.parseUnits(sendAmountTOS, 18), {
          gasLimit: 10000000,
          gasPrice: 5000000000,
        });
        await tx1.wait();

        const tx2 = await ton.connect(tester).approve(deployedUniswapV3.nftPositionManager.address, utils.parseUnits(sendAmountWTON, 18), {
          gasLimit: 10000000,
          gasPrice: 5000000000,
        });
        await tx2.wait();


       // await timeout(5);
        let allowance = await ton.allowance(user1,deployedUniswapV3.nftPositionManager.address);
        console.log('user1  allowance', allowance.toString());

        console.log('mintPosition start'  );


        try{
            // let _tickLower = Math.ceil( (-1*TICK_SPACINGS[FeeAmount.MEDIUM]) / TICK_SPACINGS[FeeAmount.MEDIUM]) * TICK_SPACINGS[FeeAmount.MEDIUM] ;
            // let _tickUpper = Math.floor( (1*TICK_SPACINGS[FeeAmount.MEDIUM]) / TICK_SPACINGS[FeeAmount.MEDIUM]) * TICK_SPACINGS[FeeAmount.MEDIUM] ;
            // console.log('_tickLower',_tickLower);
            // console.log('_tickUpper ',_tickUpper);

            await mintPosition(
              token0.address,
              token1.address,
              utils.parseUnits(sendAmountWTON, 18),
              utils.parseUnits(sendAmountTOS, 18),
              deployedUniswapV3.nftPositionManager,
              tester
            );

        }catch(err){
          console.log('err',err);
        }

         await timeout(5);

        let balanceOf = await deployedUniswapV3.nftPositionManager.balanceOf(tester.address);
        console.log('balanceOf', balanceOf.toString());

        let len = parseInt(balanceOf.toString());
        for(let i=0; i< len; i++){
            let tokenId = await deployedUniswapV3.nftPositionManager.tokenOfOwnerByIndex(tester.address, i );
            console.log('tokenId', tokenId.toString());

            if(i==0) tokenId_First = tokenId;
        }

        let balanceOfUserWTON2 = await ton.balanceOf(user1);
        console.log('after mint : user1  balanceOfUserWTON', utils.formatUnits(balanceOfUserWTON2, 18) ,' TON' );
         let balanceOfUserTOS2 = await tos.balanceOf(user1);
        console.log('after mint : user1  balanceOfUserTOS', utils.formatUnits(balanceOfUserTOS2, 18) ,' TOS' );
       // await timeout(20);
        //await snapshotCumulativesInside(deployedUniswapV3, tokenId_First, user_mint, owner );
        //await viewNFT(deployedUniswapV3, tokenId_First , user1 );
     });

    it("4. Liquidity Of NFT ", async function () {
        console.log('wait... Liquidity Of NFT', tokenId_First);
        //await timeout(10);

       // let tokenURI = await deployedUniswapV3.nftPositionManager.tokenURI(tokenId_First);
       // console.log('tokenURI',tokenURI);

        if(tokenId_First!=null){
            let positionInfos = await deployedUniswapV3.nftPositionManager.positions(ethers.BigNumber.from(tokenId_First+''));
            console.log('positionInfos',positionInfos);
            console.log('[tokenId: %s] liquidity: %s',tokenId_First.toString(),  positionInfos.liquidity.toString()  ) ;
        }
      //await timeout(20);
    });
  });

});