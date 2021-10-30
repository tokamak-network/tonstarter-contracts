const { BigNumber } = require("ethers");
const { ethers, upgrades } = require("hardhat");
const utils = ethers.utils;
const save = require("../save_deployed");
const loadDeployed = require("../load_deployed");

const { printGasUsedOfUnits } = require("../log_tx");

const StakeUniswapV3Json = require("../../artifacts/contracts/stake/StakeUniswapV3.sol/StakeUniswapV3.json");
const requireWeb3 = require('web3')
const powerWeb3 = new requireWeb3(`${process.env.ARCHIVE_WHOST}`);

const EventController = require('../../controller/event.back.controller.js')
var database = require('../../models/database');

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
const {
  timeout
} = require("../../utils/deploy_common.js");

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

  let contractAddress = "0xC1349A9a33A0682804c390a3968e26E5a2366153"
  contractAddress = contractAddress.toLowerCase()

  const StakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", "0xC1349A9a33A0682804c390a3968e26E5a2366153");

  let startBlockNumber = 12991501
  let latestBlockNumber = 13347570
  /**
   event Staked(
        address indexed to,
        address indexed poolAddress,
        uint256 tokenId,
        uint256 amount
    );
     */
  let topic0 = ethers.utils.id("Staked(address,address,uint256,uint256)")



  let abi =  {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "poolAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Staked",
      "type": "event"
    }

  try{
        let block = startBlockNumber;
        database.initialize();

        const logs = await ethers.provider.getLogs({
          address: contractAddress,
          fromBlock: startBlockNumber,
          toBlock: 'latest',
          topics: [topic0]
        }).catch((error) => console.error("BACKEND : ", error))

        if(logs !=null){
            for(let i=0; i< logs.length ; i++){
                console.log( i , logs[i]);
                let item =  logs[i];
                let contractInfo = {
                    contract : contractAddress,
                    contractName : "StakeUniswapV3",
                    eventName : "Staked"
                }
                let data = {
                  from:'',
                  to: '',
                  value : '',
                  tokenId: 0
                }

                if(item.data!=null){
                  const eventObj = Web3EthAbi.decodeLog(
                      abi.inputs,
                      item.data,
                      item.topics.slice(1)
                    )

                    data.from = eventObj.to
                    data.to = eventObj.poolAddress
                    data.tokenId = parseInt(eventObj.tokenId)
                    data.value = eventObj.amount
                    console.log('data' ,data)
                }

                var eventController = new EventController();
                await timeout(1);
                await eventController.insertEvent(contractInfo, data, item, 1, 0, async function(err, out){
                  if(err) {
                    console.log('insertEvent  err :', err) ;
                  }
                  console.log('insertEvent :', out) ;
                });

                //if( (i % 10) == 0 ) await timeout(1);
            }
        }
  }catch(error){
      console.log('StakeUniswapV3 Contract err :', error) ;
      process.exit();
  }

 }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });