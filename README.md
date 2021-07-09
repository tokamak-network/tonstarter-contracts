# ICO2.0 Contracts

## Using this Project


## Available Functionality

* pahse1 :

* phase2 :
*
### Build Contracts with Truffle

`npm run compile:truffle`


### Test Contracts with Truffle

`npm run test:stake.eth`

`npm run test:stake.ton`

`npm run test:stake.tokamak`

`npm run test:upgrade`

`npm run test:factory`

### Deploy to Ethereum

Create/modify network config in `hardhat.config.ts` and add API key and private key, then run:

* To deploy TOS ,
*
`npx hardhat run --network rinkeby scripts/deploy_1_tos.js`

* To deploy phase1 contracts ,
*
`npx hardhat run --network rinkeby scripts/deploy_2_contracts.js`

* To set init storage,
*
`npx hardhat run --network rinkeby scripts/deploy_3_set.js`

* To create vault,
*
you write down StakeType with TON or ETH in **deployed.networkname.input.json**

you write down VaultName in **deployed.networkname.input.json**
then,

`npx hardhat run --network rinkeby scripts/deploy_4_createVault.js`


it will display tx, then you have to find vault address using tx on etherscan.
**you write down VaultAddress in deployed.networkname.input.json**


* To create stakeContract in vault,

`npx hardhat run --network rinkeby scripts/deploy_5_createStakeContract.js`


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

