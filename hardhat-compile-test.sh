npx hardhat compile
cp -r ../plasma-evm-contracts/artifacts/contracts/* ./artifacts/contracts
npx hardhat test test/hardhat-test/lock-tos.test.js --no-compile
