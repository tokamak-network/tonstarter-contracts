# ICO2.0 Contracts

## Using this Project

## Available Functionality

### Build Contracts and Generate Typechain Typeings

`npm run compile`

### Deploy to Ethereum

Create/modify network config in `hardhat.config.ts` and add API key and private key, then run:

To deploy,
`npx hardhat run --network rinkeby scripts/deploy_1.js`

To set init storage,
`npx hardhat run --network rinkeby scripts/deploy_2.js`

To create vault,
`npx hardhat run --network rinkeby scripts/deploy_createvault_1.js`

To create stakeContract in vault,
Modify the vault address in deploy_createvault_1

### Verify on Etherscan

Using the [hardhat-etherscan plugin](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html), add Etherscan API key to `hardhat.config.ts`, then run:

`npx hardhat verify --network rinkeby <DEPLOYED ADDRESS>`

### To do the tokamak ton integration test
`git clone https://github.com/Onther-Tech/plasma-evm-contracts`
`npm run compile:plasma`

### lint
`npm run lint`

### To generate documents by solidity-docgen
`npm run docify`


### To generate UML by sol2uml
`sol2uml ./contracts`

