# TONStarter Contracts


## Deployed on Mainnet

* "TOS": "0x1b481bca7156E990E2d90d1EC556d929340E9fC3"

* "StakeTON": "0x153564312134aB3aFa7b7939a85b6393A10994A7"

* "StakeTONProxyFactory": "0x4AD54f06570A2516e8126151322991AEac83c2B6"

* "StakeTONFactory": "0x4ba47a61A60Be0173EDce4c813C288Ed160e1691"

* "StakeFactory": "0x56aE22BD9Aa0DAFF6dD904Fcc926a22ac8Fd396A"

* "StakeRegistry": "0xDE12311Ed2091acfF7366b4a5992D2b594f389be"

* "Stake1Vault": "0xdD32EDB5aE267df42694Ba0A71ddA319F810E3Fe"

* "StakeVaultFactory": "0xa5602BC6923D834C9A33A3e1FE0dFEEC98e6f44f"

* "Stake1Logic": "0xE05a245015F17D876CD938761576AFC39d8d8b16"

* "Stake1Proxy": "0x5F60D1F8720336A76bfb05A0AFCBa471F9673D9f"

### USING TOKAMAK CONTRACTS

* "TON": "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"

* "WTON": "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"

* "DepositManager": "0x56E465f654393fa48f007Ed7346105c7195CEe43"

* "SeigManager": "0x710936500aC59e8551331871Cbad3D33d5e0D909"

* "SwapProxy": "0x30e65B3A6e6868F044944Aa0e9C5d52F8dcb138d"

`Tag`: [deploy on mainnet](https://github.com/Onther-Tech/ico20-contracts/commit/f8d474a27cd33a0b17e34d04c81fd03e138d43e8)


##

### Build Contracts with Truffle

`npm run compile:truffle`


### Test Contracts with Truffle

`npm run test:proxy`

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

### compile
`git clone --recursive https://github.com/Onther-Tech/tonstarter-contracts.git`

`git checkout develop`

`npm run compile:uniswap3-core`

`npm run compile:uniswap3-periphery`

`npm run compile:plasma`

`npm run compile:truffle`

`npm install`


### test
`npm run test:proxy`

`npm run test:stake.ton`

`npm run test:stake.tokamak`

`npm run test:uniswapv3`

`npm run test:upgrade-stakeTON`

`npm run test:stake.eth`



### lint
`npm run lint`

### To generate documents by solidity-docgen
`npm run docify`


### To generate UML by sol2uml
`sol2uml ./contracts`

