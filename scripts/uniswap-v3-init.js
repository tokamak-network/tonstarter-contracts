const { toBN, toWei, keccak256, fromWei } = require("web3-utils");
const {
  abi: NPM_ABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const approveABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const {
  encodePriceSqrt,
  getMinTick,
  getMaxTick,
  TICK_SPACINGS,
  FeeAmount,
} = require("../tasks/utils");

const loadDeployed = require("./load_deployed");
const loadDeployedInitVariable = require("./load_deployed_init");
const { increase } = require("@openzeppelin/test-helpers/src/time");

const fldAddress = loadDeployed(process.env.NETWORK, "FLD");
const wtonAddress = loadDeployed(process.env.NETWORK, "WTON");
const wethAddress = loadDeployedInitVariable(
  process.env.NETWORK,
  "WethAddress"
);
const npmAddress = loadDeployedInitVariable(
  process.env.NETWORK,
  "NonfungiblePositionManager"
);
const exchangeFee = loadDeployedInitVariable(process.env.NETWORK, "UniswapFee");

async function approve(token, amount) {
  const [signer] = await ethers.getSigners();
  const tokenContract = new ethers.Contract(token, approveABI);
  const tx = await tokenContract.connect(signer).approve(npmAddress, amount, {
    gasLimit: 10000000,
    gasPrice: 6000000000,
  });
  await tx.wait();
}

async function createPool(token0, token1) {
  const [signer] = await ethers.getSigners();
  const npm = new ethers.Contract(npmAddress, NPM_ABI);
  const initParams = [token0, token1, exchangeFee, encodePriceSqrt(1, 1)];
  console.log({ initParams });
  const tx = await npm
    .connect(signer)
    .createAndInitializePoolIfNecessary(...initParams, {
      gasLimit: 10000000,
      gasPrice: 5000000000,
    });
  await tx.wait();
}

async function mintPosition(token0, token1, amount0, amount1) {
  const [signer] = await ethers.getSigners();
  const npm = new ethers.Contract(npmAddress, NPM_ABI);

  await approve(token0, amount0);
  await approve(token1, amount1);

  const mintParams = {
    token0,
    token1,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0,
    amount1Min: 0,
    deadline: "1000000000000000000",
    recipient: signer.address,
    fee: FeeAmount.LOW,
    tickLower: getMinTick(TICK_SPACINGS[FeeAmount.LOW]),
    tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.LOW]),
  };

  console.log({ mintParams });

  const tx = await npm.connect(signer).mint(mintParams, {
    gasLimit: 10000000,
    gasPrice: 6000000000,
  });
  await tx.wait();
}

async function increaseLiquidity(tokenId, token0, token1, amount0, amount1) {
  const [signer] = await ethers.getSigners();
  const npm = new ethers.Contract(npmAddress, NPM_ABI);

  await approve(token0, amount0);
  await approve(token1, amount1);

  const params = {
    tokenId,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0,
    amount1Min: 0,
    deadline: "1000000000000000000",
  };
  console.log({ params });

  const tx = await npm.connect(signer).increaseLiquidity(params, {
    gasLimit: 10000000,
    gasPrice: 10000000000,
  });
  await tx.wait();
}

async function main() {
  // await createPool(wethAddress, fldAddress);
  // await createPool(wtonAddress, wethAddress);

  // await mintPosition(
  //   wethAddress,
  //   fldAddress,
  //   toWei("0.01", "ether").toString(),
  //   toWei("100000", "ether").toString()
  // );
  // await mintPosition(
  //   wtonAddress,
  //   wethAddress,
  //   toWei("100", "ether").toString(),
  //   toWei("0.01", "ether").toString()
  // );

  // await increaseLiquidity(
  //   1048,
  //   wethAddress,
  //   fldAddress,
  //   toWei("0.1", "ether").toString(),
  //   toWei("100", "ether").toString()
  // );

  await increaseLiquidity(
    1049,
    wtonAddress,
    wethAddress,
    toWei("0.1", "ether").toString(),
    toWei("10000000000", "ether").toString()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
