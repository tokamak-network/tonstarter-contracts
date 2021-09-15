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
  //const stakeRegistry = await ethers.getContractAt("StakeRegistry", registry);

  // const path =  ethers.utils.soliditySha3(
  //   { type: "address", value: wton },
  //   { type: "uint24", value: 1000 },
  //   { type: "address", value: uniswapWeth },
  //   { type: "uint24", value: 1000 },
  //   { type: "address", value: tos },
  //   );
  //const path = soliditySha3Path(wton, uniswapWeth, tos);
  /*
  const soliditySha3Path = async (wton, weth, tos ) => {
  const accounts = await ethers.getSigners();
  const user = accounts[0];

  const path =  ethers.provider.utils.soliditySha3(
    { type: "address", value: wton },
    { type: "uint24", value: 1000 },
    { type: "address", value: weth },
    { type: "uint24", value: 1000 },
    { type: "address", value: tos },
    );

  return path;
};*/
  /*
  let path = await soliditySha3(
          {type: 'address', value: wton},
          {type: 'uint24', value: 500},
          {type: 'address', value: uniswapWeth},
          {type: 'uint24', value: 500},
          {type: 'address', value: tos}
      );
  */

 // let path = await soliditySha3(wton, 500, uniswapWeth, 500, tos);
 // let path = await soliditySha3(wton, 1000, uniswapWeth, 1000, tos);
  let path1 = await soliditySha3(wton, 3000, uniswapWeth);

  let path2 = await soliditySha3(uniswapWeth, 3000, tos);
  let path3 = encodePath([wton, uniswapWeth, tos], [3000,3000]);

console.log('path1',path1);
console.log('path2',path2);
console.log('path3',path3);
console.log('path','0x709bef48982bbfd6f2d4be24660832665f53406c000bb8c778417e063141139fce010982780140aa0cd5ab000bb873a54e5c054aa64c1ae7373c2b5474d8afea08bd');
const ADMIN_ROLE = keccak256("ADMIN");

console.log('ADMIN_ROLE',ADMIN_ROLE);

return;


  const uniswapRouter1 = new ethers.Contract(uniswapRouter, SwapRouterJson.abi, ethers.provider);
  const wtonContract = new ethers.Contract(wton, WTON.abi, ethers.provider);

  let deadline = Date.now()/1000 + 900;
  deadline = parseInt(deadline);

  // ISwapRouter.ExactInputParams params =
  //               ISwapRouter.ExactInputParams({
  //                   path: path,
  //                   recipient: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E',
  //                   amountIn:  ethers.BigNumber.from('100000000000000000000'),
  //                   amountOutMinimum: ethers.BigNumber.from('0'),
  //                   deadline: deadline
  //               });
/*
  try {
    const estimateGas1 = await wtonContract.estimateGas.approve(uniswapRouter, ethers.BigNumber.from('1000000000000000000'));
    let gasInt1 = estimateGas1 * 1.5;
    gasInt1 = parseInt(gasInt1);
    overrideOptions1 = {
      gasLimit: gasInt1,
    };
  } catch (error) {
    console.error(error);
  }

  const tx1 = await wtonContract.connect(users).approve(uniswapRouter, ethers.BigNumber.from('1000000000000000000'));
  await tx1.wait();
  console.log("approve tx1:", tx1.hash);
  */

  let params = {
                    path: path,
                    recipient: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E',
                    amountIn:  ethers.BigNumber.from('1000000000000000000'),
                    amountOutMinimum: ethers.BigNumber.from('0'),
                    deadline: deadline
                };

const params1 = {
  path: path,
  recipient: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E',
  amountIn: ethers.BigNumber.from('1000000000000000000'),
  amountOutMinimum: ethers.BigNumber.from('0') ,
  deadline: deadline
};


const params2 = {
  path: "0x709bef48982bbfd6f2d4be24660832665f53406c000bb8c778417e063141139fce010982780140aa0cd5ab000bb873a54e5c054aa64c1ae7373c2b5474d8afea08bd",
  recipient: '0x865264b30eb29A2978b9503B8AfE2A2DDa33eD7E',
  amountIn: ethers.BigNumber.from('1000000000000000000'),
  amountOutMinimum: ethers.BigNumber.from('0') ,
  deadline: deadline
};
  console.log('params',params2 );

  try {
    const estimateGas = await uniswapRouter1.estimateGas.exactInput(params2);
    let gasInt = estimateGas * 1.5;
    gasInt = parseInt(gasInt);
    overrideOptions = {
      gasLimit: gasInt,
    };
  } catch (error) {
    console.error(error);
  }
  //const tx = await uniswapRouter1.connect(users).exactInput(params1);

  const tx = await uniswapRouter1.connect(users).exactInput(params2);

  await tx.wait();
  console.log("exactInput tx:", tx.hash);


  // let amountOut = await uniswapRouter1.connect(users).exactInput(params1);

  // console.log("stakeRegistry ExactInputParams amountOut:", amountOut);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
