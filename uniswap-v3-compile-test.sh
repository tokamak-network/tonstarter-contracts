npx hardhat compile
cp -r ../plasma-evm-contracts/artifacts/contracts/* ./artifacts/contracts
npx hardhat test test/uniswap-v3-stake/stake-uniswap-v3-liquidity.test.js --no-compile
