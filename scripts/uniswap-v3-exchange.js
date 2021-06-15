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

const tosAddress = loadDeployed(process.env.NETWORK, "TOS");
const wtonAddress = loadDeployed(process.env.NETWORK, "WTON");
const wethAddress = loadDeployedInitVariable(
  process.env.NETWORK,
  "WethAddress"
);
const npmAddress = loadDeployedInitVariable(
  process.env.NETWORK,
  "NonfungiblePositionManager"
);

async function main() {
  const [signer] = await ethers.getSigners();
  // const npm = new ethers.Contract(npmAddress, NPM_ABI);
  const stakeTonAddress = "0x77a44BD31F4399B4e367b52f63891E458598F494";
  const StakeTon =

  const amountOutMinimum = 10;

  const params = {
    recipient: swapper.address,
    path,
    amountIn,
    amountOutMinimum,
    deadline,
  };

  const tx = await router.connect(swapper).exactInput(params, {
    gasLimit: 10000000,
    gasPrice: 5000000000,
  });
  await tx.wait();

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
  await mintPosition(
    wethAddress,
    tosAddress,
    toWei("0.01", "ether").toString(),
    toWei(toBN("100000"), "ether").toString()
  );
  await mintPosition(
    wtonAddress,
    wethAddress,
    toWei(toBN("100"), "ether").toString(),
    toWei("0.01", "ether").toString()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
