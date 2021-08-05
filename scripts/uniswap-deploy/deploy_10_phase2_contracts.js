const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");
//const loadDeployedInput = require("./load_deployed_input");

const { printGasUsedOfUnits } = require("../log_tx");

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
const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");
const factory = loadDeployed(process.env.NETWORK, "StakeFactory");
const vaultFactory = loadDeployed(process.env.NETWORK, "StakeVaultFactory");

const logic = loadDeployed(process.env.NETWORK, "Stake1Logic");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const tonFactory = loadDeployed(process.env.NETWORK, "StakeTONFactory");

const ton = loadDeployed(process.env.NETWORK, "TON");
  /*
const {
  createValue,
  createStakeContract,
  timeout,
  getPeriodBlockByTimes
  } = require("../../utils/deploy_common.js");
*/

async function addStake2LogicAndVault2Factory() {
  const [deployer  ] = await ethers.getSigners();
  let tx;
  let stakeType = ethers.BigNumber.from("2");
  let phase = ethers.BigNumber.from("2");

  const stakeEntry = await ethers.getContractAt("Stake1Logic", proxy);
  console.log("stakeEntry:", stakeEntry.address);

  const stakeVaultFactory = await ethers.getContractAt("StakeVaultFactory", vaultFactory);
  console.log("stakeVaultFactory:", stakeVaultFactory.address);

  //=====================================
  // 1. 볼트 컨트랙 만들기
  // 1-1. 생성
  const Stake2VaultLogic = await ethers.getContractFactory("Stake2Vault");
  let stake2vaultlogic = await Stake2VaultLogic.deploy();
  tx =  await stake2vaultlogic.deployed();
  console.log("Stake2Vault:", stake2vaultlogic.address);
  deployInfo = {
    name: "Stake2Vault",
    address: stake2vaultlogic.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('Stake2Vault Deploy',tx);


  // 1-2. 볼트팩토리에 연결
  tx = await stakeVaultFactory.setVaultLogicByPhase(phase, stake2vaultlogic.address);
  console.log("stakeVaultFactory setVaultLogicByPhase:", tx.hash);

  //=====================================
  // 2. 스테이크 컨트랙 만들기
  // StakeType 에 따른 스테이크 컨트랙의 로직을 생성하여 지정하고 등록한다.
  // 2-1. 생성
  const StakeUniswapV3 = await ethers.getContractFactory("StakeUniswapV3");
  const StakeCoinageFactory = await ethers.getContractFactory("StakeCoinageFactory");


  let stakeUniswapV3Logic = await StakeUniswapV3.deploy();
  tx =  await stakeUniswapV3Logic.deployed();
  console.log("StakeUniswapV3:", stakeUniswapV3Logic.address);
  deployInfo = {
    name: "StakeUniswapV3",
    address: stakeUniswapV3Logic.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('StakeUniswapV3 Deploy',tx);
   //=====================================


  let stakeCoinageFactory = await StakeCoinageFactory.deploy();
  tx =  await stakeCoinageFactory.deployed();
  console.log("StakeCoinageFactory:", stakeCoinageFactory.address);
  deployInfo = {
    name: "StakeCoinageFactory",
    address: stakeCoinageFactory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('StakeCoinageFactory Deploy',tx);
  //=====================================

  const StakeUniswapV3Factory = await ethers.getContractFactory("StakeUniswapV3Factory");

  // const stakeUniswapV3Address = loadDeployed(process.env.NETWORK, "StakeUniswapV3");
  // const stakeCoinageFactoryAddress = loadDeployed(process.env.NETWORK, "StakeCoinageFactory");
  // let stakeUniswapV3Logic = await ethers.getContractAt("StakeVaultFactory", stakeUniswapV3Address);
  // let stakeCoinageFactory = await ethers.getContractAt("StakeCoinageFactory", stakeCoinageFactoryAddress);


  let stakeUniswapV3Factory = await StakeUniswapV3Factory.deploy(
      stakeUniswapV3Logic.address,
      stakeCoinageFactory.address
  );

  tx =  await stakeCoinageFactory.deployed();
  console.log("StakeUniswapV3Factory:", stakeUniswapV3Factory.address);
  deployInfo = {
    name: "StakeUniswapV3Factory",
    address: stakeUniswapV3Factory.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('StakeUniswapV3Factory Deploy',tx);


  // const StakeUniswapV3FactoryAddress = loadDeployed(process.env.NETWORK, "StakeUniswapV3Factory");
  // let stakeUniswapV3Factory = await ethers.getContractAt("StakeUniswapV3Factory", StakeUniswapV3FactoryAddress);


   //=====================================
  // 2-2. 스테이크컨트랙에 연결
  tx = await stakeEntry.setFactoryByStakeType(
      stakeType,
      stakeUniswapV3Factory.address
  );
  printGasUsedOfUnits('stakeProxy setFactoryByStakeType',tx.hash);


  //=====================================
  // 3. 프로시에 해당 로직이 별도로 필요하면 로직을 만들어서 연결한다 .
  // 3-1. 로직 생성
  const Stake2Logic = await ethers.getContractFactory("Stake2Logic");
  let stake2logic = await Stake2Logic.deploy();
  tx =  await stake2logic.deployed();
  console.log("Stake2Logic:", stake2logic.address);
  deployInfo = {
    name: "Stake2Logic",
    address: stake2logic.address
  }
  if(deployInfo.address != null && deployInfo.address.length > 0  ){
    save(process.env.NETWORK, deployInfo);
  }
  printGasUsedOfUnits('Stake2Logic Deploy',tx);
  //=====================================

  // 3-2. 로직을 프록시에 연결


  // const Stake2LogicAddress = loadDeployed(process.env.NETWORK, "Stake2Logic");
  // let stake2logic = await ethers.getContractAt("Stake2Logic", Stake2LogicAddress);


  const Stake1Proxy = await ethers.getContractAt("Stake1Proxy", proxy);
  console.log("Stake1Proxy:", Stake1Proxy.address);


  tx =  await Stake1Proxy.setAliveImplementation(
    stake2logic.address,
    true);
  console.log("Stake2Logic setAliveImplementation: " );
  printGasUsedOfUnits('Stake2Logic setAliveImplementation',tx.hash );




  // attach stake2logic
  let _func1 = Web3EthAbi.encodeFunctionSignature("balanceOf(address,address)") ;
  let _func2 = Web3EthAbi.encodeFunctionSignature("balanceOfTOS(address)") ;
  let _func3 = Web3EthAbi.encodeFunctionSignature("createVault2(uint256,uint256,bytes32,address[4],string)") ;
  let _func4 = Web3EthAbi.encodeFunctionSignature("setVaultLogicByPhase(uint256,address)") ;

  tx =  await Stake1Proxy.setImplementation(
    stake2logic.address,
    ethers.BigNumber.from("1"),
    true);
  console.log("Stake2Logic setImplementation: " );
  printGasUsedOfUnits('Stake2Logic setImplementation',tx.hash );
  //=====================================

  tx =  await Stake1Proxy.setSelectorImplementations(
        [_func1, _func2, _func3, _func4],
        stake2logic.address);
  console.log("Stake2Logic setSelectorImplementations: " );
  printGasUsedOfUnits('Stake2Logic setSelectorImplementations', tx.hash);

  //=====================================
  // 로직2로 연동하는 프록시 인터페이스 설정
  // this.stakeEntry2 = await ethers.getContractAt("Stake2Logic",this.stake1proxy.address);
  // return this.stakeEntry2 ;
}


async function main() {

  const [deployer, user1] = await ethers.getSigners();
  const users = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  await addStake2LogicAndVault2Factory();


  console.log("finish phase2-setting");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
