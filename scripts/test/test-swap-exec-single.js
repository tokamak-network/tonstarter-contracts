const SwapRouterJson = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const WTON = require("../abis_plasma/WTON.json");


//const ISwapRouter = require("@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol");

//const WETH9 = require("./weth/weth.json");
//const web3util = require('web3-utils');
const {
  toBN,
  keccak256,
  soliditySha3,
} = require("web3-utils");

const loadDeployed = require("./load_deployed");
const { findAccount, soliditySha3Path } = require("../tasks/utils");

require("dotenv").config();

const registry = loadDeployed(process.env.NETWORK, "StakeRegistry");

function encodePath(path, fees) {
  const FEE_SIZE = 3

  if (path.length != fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
}

async function main() {

  const users = await findAccount('0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9');
  console.log('users',users.address);
  //console.log('ethers.provider',ethers.provider );

  const uniswapRouter = "0xe592427a0aece92de3edee1f18e0157c05861564";
  const uniswapNPM = "0xC4E54951aE132778970bB5273b8e642B15D92911";
  const uniswapFee = 500;
  const uniswapWeth = "0xc778417e063141139fce010982780140aa0cd5ab"; //0xc778417e063141139fce010982780140aa0cd5ab
  const uniswapRouter2 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const wton = "0x709bef48982bbfd6f2d4be24660832665f53406c"; //0x709bef48982bbfd6f2d4be24660832665f53406c
  const tos = "0x73a54e5c054aa64c1ae7373c2b5474d8afea08bd"; //0x73a54e5c054aa64c1ae7373c2b5474d8afea08bd


  let oneWTON = ethers.BigNumber.from('100000000000000000000000000000');
  console.log('oneWTON',oneWTON.toString());

  const wtonContract = new ethers.Contract(wton, WTON.abi, ethers.provider);
  console.log('wtonContract',wtonContract.address);

  const tx = await wtonContract.connect(users).approve(uniswapRouter, oneWTON, {
    gasLimit: 10000000,
    gasPrice: 5000000000,
  });
  await tx.wait();
  console.log("approve tx:", tx.hash);

  let deadline = Date.now()/1000 + 900;
  deadline = parseInt(deadline);

  let params = {
                    tokenIn: wton,
                    tokenOut: tos,
                    fee: 3000,
                    recipient: "0x3b9878Ef988B086F13E5788ecaB9A35E74082ED9",
                    deadline: deadline,
                    amountIn:  ethers.BigNumber.from('100000000000000000000000000000'),
                    amountOutMinimum: ethers.BigNumber.from('0'),
                    sqrtPriceLimitX96: ethers.BigNumber.from('0')
                };

  const uniswapRouter1 = new ethers.Contract(uniswapRouter, SwapRouterJson.abi, ethers.provider);
  console.log('uniswapRouter1',uniswapRouter1.address);


  const tx2 = await uniswapRouter1.connect(users).exactInputSingle(params, {
    gasLimit: 10000000,
    gasPrice: 5000000000,
  });

  console.log('exactInputSingle',tx2.hash);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
