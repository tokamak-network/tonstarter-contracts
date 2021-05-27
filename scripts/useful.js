const { findAccount } = require("../tasks/utils");

async function main() {
  const { RINKEBY_UNISWAP_V3_ACCOUNT2, RINKEBY_WETH_ADDRESS } = process.env;

  const account = await findAccount(RINKEBY_UNISWAP_V3_ACCOUNT2);
  const tx = await account.sendTransaction({
    to: RINKEBY_WETH_ADDRESS,
    value: 1000000000,
    data: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("deposit()"), ),
  });
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
