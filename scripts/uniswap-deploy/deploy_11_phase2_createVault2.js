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

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");
const VAULT_NAME = keccak256(process.env.PHASE2_ETHTOS_NAME)
const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const weth9 = loadDeployed(process.env.NETWORK, "WETH9");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");

const NonfungiblePositionManager = loadDeployed(process.env.NETWORK, "NonfungiblePositionManager");
const UniswapV3Factory = loadDeployed(process.env.NETWORK, "UniswapV3Factory");
const SwapRouter = loadDeployed(process.env.NETWORK, "SwapRouter");

async function main() {

  const [deployer, user1] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const provider = ethers.provider;
  const stakeEntry2 = await ethers.getContractAt("Stake2Logic", proxy);
  console.log("stakeEntry2:", stakeEntry2.address);

   /// @dev create vault2
    /// @param _cap  allocated reward amount
    /// @param _miningPerSecond  the mining per second
    /// @param _phase  phase of TOS platform
    /// @param _vaultName  vault's name's hash
    /// @param _stakeType  it's 2, StakeUniswapV3 staking type
    /// @param _uniswapInfo  npm, poolFactory, token0, token1
    /// @param _name   name
  let allocateAmount =utils.parseUnits(process.env.PHASE2_ETHTOS_ALLOCATED, 18);
  let miningPerSecond = utils.parseUnits(process.env.PHASE2_MINING_PER_SECOND, 0);
  let phase = ethers.BigNumber.from("2");
  let stakeType = ethers.BigNumber.from("2");

  let tx = await stakeEntry2.createVault2(
    allocateAmount,
    miningPerSecond,
    NonfungiblePositionManager,
      UniswapV3Factory,
      weth9,
      tostoken,
    "UniswapV3 WETH-TOS"
  );
  const receipt = await tx.wait();
  console.log("createVault2 :", tx.hash);
  printGasUsedOfUnits('createVault2 ',tx.hash);

  for(let i=0; i< receipt.logs.length ;i++){

    if(receipt.logs[i].event == "CreatedStakeContract2"){
        vaultAddress = receipt.logs[i].args.vault;
        stakeContractAddress = receipt.logs[i].args.stakeContract;

        deployInfo = {
          name: "UniswapV3Vault(WETH-TOS)",
          address: vaultAddress
        }
        if(deployInfo.address != null && deployInfo.address.length > 0  ){
          save(process.env.NETWORK, deployInfo);
        }

        deployInfo = {
          name: "UniswapV3StakeContract(WETH-TOS)",
          address: stakeContractAddress
        }
        if(deployInfo.address != null && deployInfo.address.length > 0  ){
          save(process.env.NETWORK, deployInfo);
        }
    }
  }

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
