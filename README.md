# ICO2.0 Contracts

## Using this Project

## Available Functionality

### Build Contracts and Generate Typechain Typeings

`npm run compile`

### Run Contract Tests & Get Callstacks

In one terminal run `npx hardhat node`

Then in another run `npm run test` or `npm run test:mocha`

### Deploy to Ethereum

Create/modify network config in `hardhat.config.ts` and add API key and private key, then run:

`npx hardhat run --network rinkeby scripts/deploy.js`

### Verify on Etherscan

Using the [hardhat-etherscan plugin](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html), add Etherscan API key to `hardhat.config.ts`, then run:

`npx hardhat verify --network rinkeby <DEPLOYED ADDRESS>`

### To do the tokamak ton integration test
`git clone https://github.com/Onther-Tech/plasma-evm-contracts`
`npm run compile:plasma`


### solhint
`solhint ./contracts/*/*.sol`
