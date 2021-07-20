const { time, expectEvent } = require("@openzeppelin/test-helpers");
const { ethers } = require("ethers");
const utils = ethers.utils;
//const SwapRouterJson = require("../../abis_uniswap3_periphery/ISwapRouter.json");
const SwapRouterJson = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");

const {
  padLeft,
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");
/*
const {
  defaultSender,
  accounts,
  contract,
  web3,
  privateKeys,
} = require("@openzeppelin/test-environment");
  */

const {
  deployedUniswapV3Contracts,
  FeeAmount,
  TICK_SPACINGS,
  getMinTick,
  getMaxTick,
  encodePriceSqrt,
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
let tokenId_First;

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
    const tx = await nftPositionManager.connect(sender).mint({
      token0,
      token1,
      amount0Desired,
      amount1Desired,
      amount0Min: 0,
      amount1Min: 0,
      deadline: 100000000000000,
      recipient: sender.address,
      fee: FeeAmount.MEDIUM,
      tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
      tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
    });
    await tx.wait();
  };

describe(" UniswapV3 Staking", function () {
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

  before(async () => {
    ico20Contracts = new ICO20Contracts();
    accountlist = await getAddresses();

    defaultSender = accountlist[0];
    user1 = accountlist[1];
    user2 = accountlist[2];
    user3 = accountlist[3];

    sender = await ico20Contracts.findSigner(defaultSender);
    tester = await ico20Contracts.findSigner(user1);
  });

  describe('# 1. Deploy UniswapV3', async function () {

    it("deployedUniswapV3Contracts", async function () {
      this.timeout(1000000);

      deployedUniswapV3  = await deployedUniswapV3Contracts(defaultSender);
      console.log('nftPositionManager', deployedUniswapV3.nftPositionManager.address );
      console.log('nftDescriptor', deployedUniswapV3.nftDescriptor.address );
      console.log('weth', deployedUniswapV3.weth.address );
      console.log('swapRouter', deployedUniswapV3.swapRouter.address );
      console.log('coreFactory', deployedUniswapV3.coreFactory.address );

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

  /*
  describe('# 4. Add Stake2Logic in Proxy (with phase=2)', async function () {
      it("1. create Stake2Logic ", async function () {
          this.timeout(1000000);
          stake2Logic = await Stake2Logic.connect(sender).deploy();
      });

      it("2. Check onlyOwner Function : Revert when running by non-admin", async function() {
          let _index = 2;
          await expect(
              stake1proxy.connect(tester).setImplementation(stake2Logic.address, _index, true)
          ).to.be.revertedWith("Accessible: Caller is not an admin");

          await expect(
              stake1proxy.connect(tester).setAliveImplementation(stake2Logic.address, true, { from: user1 })
          ).to.be.revertedWith("Accessible: Caller is not an admin");

          await expect(
              stake1proxy.connect(tester).setSelectorImplementations([_func1], stake2Logic.address, { from: user1 })
          ).to.be.revertedWith("Accessible: Caller is not an admin");

      });


      it("3. setImplementation ", async function () {
          this.timeout(1000000);
          let _index = 2;
          await stake1proxy.connect(sender).setImplementation(stake2Logic.address, _index, true );

          expect(await stake1proxy.implementation(_index)).to.be.equal(stake2Logic.address);

      });

      it('4. setSelectorImplementations ', async function () {
          await stake1proxy.connect(sender).setSelectorImplementations([_func1], stake2Logic.address);
          expect(await stake1proxy.getSelectorImplementation(_func1)).to.be.equal(stake2Logic.address);
      });
  });

  describe('# 3. Set Uniswap V3 Pool', async function () {

    it("Create WETH-WTON Pool ", async function () {
      let [token0, token1] = [deployedUniswapV3.weth, wton];
      if (wton.address < deployedUniswapV3.weth.address) {
        [token0, token1] = [wton, deployedUniswapV3.weth];
      }
      await token0.connect(defaultSender).approve(deployedUniswapV3.nftPositionManager.address, 100);
      await token1.connect(defaultSender).approve(deployedUniswapV3.nftPositionManager.address, 300);
     // pool_eth_wton_address = await createPool(token0.address, token1.address, deployedUniswapV3.nftPositionManager);
      //await mintPosition(token0.address, token1.address, 100, 300, deployedUniswapV3.nftPositionManager, defaultSender );

      console.log('pool_eth_wton_address', pool_eth_wton_address);
    });

    it("Create WETH-TOS Pool ", async function () {
      let [token0, token1] = [deployedUniswapV3.weth, tos];
      if (tos.address < deployedUniswapV3.weth.address) {
        [token0, token1] = [tos, deployedUniswapV3.weth];
      }
      await token0.approve(deployedUniswapV3.nftPositionManager.address, 100, { from: defaultSender });
      await token1.approve(deployedUniswapV3.nftPositionManager.address, 300, { from: defaultSender });
      pool_eth_tos_address = await createPool(token0.address, token1.address, deployedUniswapV3.nftPositionManager);
      await mintPosition(token0.address, token1.address, 100, 300, deployedUniswapV3.nftPositionManager, defaultSender );

      console.log('pool_eth_tos_address', pool_eth_tos_address);
    });

  });
  */

  describe('# 3. Phase 2 ', async function () {

    it("1. Create StakeUniswapV3 Vaults & Stake Contract ", async function () {
        this.timeout(1000000);

        let balance  = await stakeEntry2.balanceOf(wton.address, defaultSender);

        const cons = await ico20Contracts.getICOContracts();
        stakeVaultFactory = cons.stakeVaultFactory;
        stakeEntry2 = cons.stakeEntry2;
        tos = cons.tos;
        stakefactory = cons.stakefactory;

       let owner = await ico20Contracts.findSigner(defaultSender);

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

        for(let i=0; i< receipt.logs.length ;i++){

          if(receipt.logs[i].event == "CreatedStakeContract2"){
              vaultAddress = receipt.logs[i].args.vault;
              stakeContractAddress = receipt.logs[i].args.stakeContract;
          }

        }
        if(vaultAddress!=null){
            await tos.connect(owner).mint(
              vaultAddress,
              utils.parseUnits(Pharse2_ETHTOS_Staking, 18)
            );
        }
    });

    it("2. Create WTON-TOS Pool of User  ", async function () {
        this.timeout(1000000);

          let [token0, token1] = [wton, tos];
          if (tos.address < wton.address) {
            [token0, token1] = [tos, wton];
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

     it("3. Mint Position WTON:TOS = 1:5 ", async function () {

        const sender = await ico20Contracts.findSigner(user1);
        const owner = await ico20Contracts.findSigner(defaultSender);
        console.log('wton', wton.address );
        console.log('tos', tos.address );

        let [token0, token1] = [wton, tos];
        if (tos.address < wton.address) {
          [token0, token1] = [tos, wton];
        }

        let sendAmountWTON = "100." + "0".repeat(27);
        let sendAmountTOS = "1000." + "0".repeat(18);



        await tos.connect(owner).mint(user1, utils.parseUnits(sendAmountTOS, 18) );
        await wton.connect(owner).mint(user1, utils.parseUnits(sendAmountWTON, 27) );


        let balanceOfUserWTON = await wton.balanceOf(user1);
        console.log('user1  balanceOfUserWTON', utils.formatUnits(balanceOfUserWTON, 27) ,' TON' );
         let balanceOfUserTOS = await tos.balanceOf(user1);
        console.log('user1  balanceOfUserTOS', utils.formatUnits(balanceOfUserTOS, 18) ,' TOS' );


        await tos.connect(sender).approve(deployedUniswapV3.nftPositionManager.address, utils.parseUnits(sendAmountTOS, 18) );
        await wton.connect(sender).approve(deployedUniswapV3.nftPositionManager.address , utils.parseUnits(sendAmountWTON, 27) );

        //pool_eth_tos_address
        await mintPosition(
          token0.address,
          token1.address,
          utils.parseUnits(sendAmountWTON, 27),
          utils.parseUnits(sendAmountTOS, 18),
          deployedUniswapV3.nftPositionManager,
          sender );

        let balanceOf = await deployedUniswapV3.nftPositionManager.balanceOf(sender.address);
        console.log('balanceOf', balanceOf.toString());

        let len = parseInt(balanceOf.toString());
        for(let i=0; i< len; i++){
            let tokenId = await deployedUniswapV3.nftPositionManager.tokenOfOwnerByIndex(sender.address, i );
            console.log('tokenId', tokenId.toString());

            if(i==0) tokenId_First = tokenId;
        }


        let balanceOfUserWTON2 = await wton.balanceOf(user1);
        console.log('after mint : user1  balanceOfUserWTON', utils.formatUnits(balanceOfUserWTON2, 27) ,' TON' );
         let balanceOfUserTOS2 = await tos.balanceOf(user1);
        console.log('after mint : user1  balanceOfUserTOS', utils.formatUnits(balanceOfUserTOS2, 18) ,' TOS' );


     });


    it("4. Effective Liquidity Of User1 ", async function () {
        const giver = await ico20Contracts.findSigner(user1);
        const owner = await ico20Contracts.findSigner(defaultSender);


        let positionInfos = await deployedUniswapV3.nftPositionManager.positions(tokenId_First);
        //console.log('positionInfos',positionInfos);
        console.log('[tokenId: %s] liquidity: %s',tokenId_First.toString(), utils.formatUnits(positionInfos.liquidity)  ) ;
        console.log(' token0: %s, token1: %s',positionInfos.token0 , positionInfos.token1) ;
        console.log(' fee: %s ', positionInfos.fee.toString()) ;
        console.log(' tickLower: %s, tickUpper: %s',positionInfos.tickLower.toString(), positionInfos.tickUpper.toString()) ;

        /*
        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        require(liquidity > 0, "StakeUniswapV3: liquidity is zero");

        address poolAddress =
            PoolAddress.computeAddress(
                uniswapV3FactoryAddress,
                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
            );



        (, secondsPerLiquidityInsideX128, ) = IUniswapV3Pool( _depositTokens.poolAddress)
            .snapshotCumulativesInside(
            _depositTokens.tickLower,
            _depositTokens.tickUpper
        );
        */

    });

  /*
    it("5. Swap TON to TOS by User2 ", async function () {
        const swap_user = await ico20Contracts.findSigner(user2);
        const owner = await ico20Contracts.findSigner(defaultSender);

        let sendAmountTON = "1." + "0".repeat(18);
        let oneTON = utils.parseUnits(sendAmountTON, 18) ;
        await ton.connect(owner).mint(user2, oneTON);

        let balanceOfUserTON = await ton.balanceOf(user2);
        console.log('balanceOfUserTON', utils.formatUnits(balanceOfUserTON, 18) ,' TON' );
         let balanceOfUserTOS = await tos.balanceOf(user2);
        console.log('balanceOfUserTOS', utils.formatUnits(balanceOfUserTOS, 18) ,' TOS' );

        // let oneWTON = ethers.BigNumber.from('100000000000000000000000000000');
        // console.log('oneWTON',oneWTON.toString());

        const tx = await ton.connect(swap_user).approve(deployedUniswapV3.swapRouter.address, oneTON, {
          gasLimit: 10000000,
          gasPrice: 5000000000,
        });
        await tx.wait();
        console.log("approve tx:", tx.hash);

        let deadline = Date.now()/1000 + 900;
        deadline = parseInt(deadline);

        let params = {
                        tokenIn: ton.address,
                        tokenOut: tos.address,
                        fee: 3000,
                        recipient: user2,
                        deadline: deadline,
                        amountIn:  oneTON,
                        amountOutMinimum: ethers.BigNumber.from('0'),
                        sqrtPriceLimitX96: ethers.BigNumber.from('0')
                      };

        const tx2 = await deployedUniswapV3.swapRouter.connect(swap_user).exactInputSingle(params, {
          gasLimit: 10000000,
          gasPrice: 5000000000,
        });

        await tx.wait();


        let balanceOfUserTON2 = await ton.balanceOf(user2);
        console.log('after swap : balanceOfUserTON', utils.formatUnits(balanceOfUserTON2, 18) ,' TON' );
         let balanceOfUserTOS2 = await tos.balanceOf(user2);
        console.log('after swap : balanceOfUserTOS', utils.formatUnits(balanceOfUserTOS2, 18) ,' TOS' );

    });


    it("4. Effective Liquidity Of User1 ", async function () {
        const giver = await ico20Contracts.findSigner(user1);
        const owner = await ico20Contracts.findSigner(defaultSender);


        let positionInfos = await deployedUniswapV3.nftPositionManager.positions(tokenId_First);
        console.log('positionInfos',positionInfos);
        console.log('[tokenId: %s] liquidity: %s',tokenId_First.toString(), utils.formatUnits(positionInfos.liquidity, 18)  ) ;
        console.log(' token0: %s, token1: %s',positionInfos.token0 , positionInfos.token1) ;
        console.log(' fee: %s, token1: %s', positionInfos.fee.toString()) ;
        console.log(' tickLower: %s, tickUpper: %s',positionInfos.tickLower.toString(), positionInfos.tickUpper.toString()) ;

        / *
        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        require(liquidity > 0, "StakeUniswapV3: liquidity is zero");

        address poolAddress =
            PoolAddress.computeAddress(
                uniswapV3FactoryAddress,
                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
            );



        (, secondsPerLiquidityInsideX128, ) = IUniswapV3Pool( _depositTokens.poolAddress)
            .snapshotCumulativesInside(
            _depositTokens.tickLower,
            _depositTokens.tickUpper
        );
        * /

    });
    */

  });

});