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

// const { sigUtil } = require("eth-sig-util") ;
// const { TypedDataUtils } = require("ethers-eip712");

const NonfungiblePositionManagerJson = require("../../abis_uniswap3_periphery/NonfungiblePositionManager.json");
const TOS_ABI = require('../../build/contracts/TOS.json').abi;

require("dotenv").config();

const zeroAddress = "0x0000000000000000000000000000000000000000";
const ADMIN_ROLE = keccak256("ADMIN");

const tostoken = loadDeployed(process.env.NETWORK, "TOS");
const proxy = loadDeployed(process.env.NETWORK, "Stake1Proxy");
const ton = loadDeployed(process.env.NETWORK, "TON");

async function main() {

  const [deployer, user1, user2] = await  ethers.getSigners();
  const users = await  ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address, process.env.NETWORK);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // const {
  //   toBN,
  //   toWei,
  //   fromWei,
  //   keccak256,
  //   soliditySha3,
  //   solidityKeccak256,
  // } = require("web3-utils");

  //var TOSContract = "0xA4E9bd12013D67F14c94587ADc440B1D7C1DDd53";
  let name = "Uniswap V3 Positions NFT-V1";
  let symbol = "UNI-V3-POS";
  let version = "1";
  const tokenId3476 =  ethers.BigNumber.from("3476");
  const tokenId3484 =  ethers.BigNumber.from("3484");
  const tokenId3690 =  ethers.BigNumber.from("3690");


  // let token = {
  //   id: tokenId3476,
  //   name: '3476',
  //   sender : user1
  // }

  // let token = {
  //   id: tokenId3484,
  //   name: '3484',
  //   sender : user2
  // }

  let token = {
    id: tokenId3690,
    name: '3690',
    sender : user1
  }

  const NonfungiblePositionManagerAddress = process.env.NonfungiblePositionManager;
  const NPMContract = new ethers.Contract(
    NonfungiblePositionManagerAddress,
    NonfungiblePositionManagerJson.abi,  ethers.provider);

  let DOMAIN_SEPARATOR = await NPMContract.DOMAIN_SEPARATOR();
  //let EIP712Domain = '0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f';
  let PERMIT_TYPEHASH = await NPMContract.PERMIT_TYPEHASH();
  let position = await NPMContract.positions(token.id);
  let nonce = parseInt(position.nonce);
  //nonce++;
  let deadline = Date.now() / 1000 ;
  deadline = parseInt(deadline) + 100;
  from = token.sender.address;
  to = process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS;
  console.log('nonce',nonce);

  //================================================

  const Permit = [
      {name:"spender",type:"address"},
      {name:"tokenId",type:"uint256"},
      {name:"nonce",type:"uint256"},
      {name:"deadline",type:"uint256"}
  ];

  const message1 = {
    owner: token.sender.address,
    spender: process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS,
    tokenId: token.id,
    nonce: nonce,
    deadline: deadline
  };

  let netId = await ethers.provider.send("eth_chainId", []);
  console.log('netId',netId);


  const typedData = {
    types: {
      EIP712Domain: [
        {name: "name", type: "string"},
        {name: "version", type: "string"},
        {name: "chainId", type: "uint256"},
        {name: "verifyingContract", type: "address"},
      ],
      Permit: Permit,
    },
    primaryType: 'Permit',
    domain:{name:name,version:version,chainId:netId,verifyingContract:process.env.NonfungiblePositionManager},
    message: message1
  }


  /*
  const Web3 = require('web3');
  let web3 = new Web3(hre.ethers.provider);
  var params = [from, typedData]
  console.dir(params)
  var method = 'eth_signTypedData_v3'
  web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, async function (err, result) {
      if (err) return console.dir(err)
      if (result.error) {
        //alert(result.error.message)
        console.log(result.error.message);

      }
      if (result.error) return console.error('ERROR', result)
      console.log('TYPED SIGNED:' + JSON.stringify(result.result))

      const signature = result.result.substring(2);
      const r = "0x" + signature.substring(0, 64);
      const s = "0x" + signature.substring(64, 128);
      const v = parseInt(signature.substring(128, 130), 16);

      console.log('TYPED r:' , r)
      console.log('TYPED s:' , s)
      console.log('TYPED v:' , v)

    })
  */
  //const Web = new web3('https://rinkeby.infura.io/v3/'+process.env.InfuraKey);

  // //var provider = await hre.ethers.providers.JsonRpcProvider;
  // const provider = new hre.ethers.providers.JsonRpcProvider({
  //   url: 'https://rinkeby.infura.io/v3/'+process.env.InfuraKey
  // })
  // let bal = await provider.getBalance(user1.address);
  // console.log('bal',bal);
  // let sig = await provider.signTypedData(typedData, user1.address);
  // console.log('sig',sig);

  // provider.personalSign(msg, address).then(...); // which doesn't exist yet in ethers provider
  // provider.signTypedData(msgParams, address).then(...); // new as per EIP above but supported by MM

  //const provider = new ethers.providers.Web3Provider(window.ethereum)

  //const sig = sigUtil.signTypedMessage(process.env.ACCOUNT1_PK, { data: typedData }, 'V3');

  //let sig = await ethers.provider.send("eth_signTypedData_v4", [typedData]);
  //console.log('sig',sig);

  //  var wallet = new ethers.Wallet(process.env.ACCOUNT1_PK, ethers.provider);

  // const signature = await wallet.signTypedData(typedData);



  //const utils = sigUtil.TypedDataUtils;
  //TypedDataUtils
  //const sig = sigUtil.signTypedData(process.env.ACCOUNT1_PK, { data: typedData }, 'V4');
  // const digest = TypedDataUtils.encodeDigest(typedData)
  // const digestHex = ethers.utils.hexlify(digest)

  // var wallet = new ethers.Wallet(process.env.ACCOUNT1_PK, ethers.provider);
  // const signature = wallet.signMessage(digest)
   const domain =  {name:name,version:version,chainId:netId,verifyingContract:process.env.NonfungiblePositionManager} ;
  const types = {types: Permit};
  const value = message1;

  // let sg = await user1._signTypedData(domain, types, value);
  // console.log('sg',sg);

signature = await user1._signTypedData(domain, types, value);
console.log('signature',signature);


  // var wallet = new ethers.Wallet(process.env.ACCOUNT1_PK, ethers.provider);
  //  console.log('wallet',wallet);
  // const signature = await wallet.signTypedData(typedData);


  // console.log('signature',signature);
  // const signature1 = signature.substring(2);
  //   const r = "0x" + signature1.substring(0, 64);
  //   const s = "0x" + signature1.substring(64, 128);
  //   const v = parseInt(signature1.substring(128, 130), 16);

  //   console.log('TYPED r:' , r)
  //   console.log('TYPED s:' , s)
  //   console.log('TYPED v:' , v)

  //================================================

  let owner = await NPMContract.ownerOf(token.id);
  console.log("owner:", owner);
  console.log("token.sender:", token.sender.address);


  // const stakeUniswapV3 = await ethers.getContractAt("StakeUniswapV3", process.env.PHASE2_STAKE_UNISWAPV3_ADDRESS);
  // console.log("stakeUniswapV3:", stakeUniswapV3.address);

  // let tx = await stakeUniswapV3.connect(token.sender).stakePermit(token.id, deadline, v, r, s);
  // console.log("stakeUniswapV3 stake", tx.hash);

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
