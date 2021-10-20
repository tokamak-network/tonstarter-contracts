# TONStarter Contracts

## Deployed on Mainnet

* "TOS": "0x409c4D8cd5d2924b9bc5509230d16a61289c8153"

* "StakeTON": "0xD08C561507fD6F6Df662a239Bb49B8A773e6e411"

* "StakeTONProxyFactory": "0x4eA3C549C9A041Ad7B83003cd8572b9DBdeEC7F1"

* "StakeTONFactory": "0x8Dde0854A6A6781720E0a4462a8648c89D861b16"

* "StakeFactory": "0x942286FC535Cab49b7C8b650369305ba8b4a2e4c"

* "StakeRegistry": "0x4Fa71D6964a97c043CA3103407e1B3CD6b5Ab367"

* "Stake1Vault": "0xfE78C5A77323274A1afc6669C5ebd2494981ae8d"

* "StakeVaultFactory": "0x0f559A3130e5390f59694ad931B04a5904b8C130"

* "Stake1Logic": "0xcC0b93aF31d3c85416CbdF8Fc471C1D8da6768bb"

* "Stake1Proxy": "0x8e539e29D80fd4cB3167409A82787f3B80bf9113"

## Deployed related to pools

* "StakeVaultFactory": "0x87d03e876d0FaDa4A347dae56Eff6F023B08543B"

* "Stake2Vault": "0x6359722370754B2ca15DDa3a2f6fe000AE2e4327"

* "StakeUniswapV3": "0xA4cc74701AaB6A3280C768dC669881a8a5fA1C77"

* "StakeCoinageFactory": "0x27EEbEd0a0F17Bea0fdd1957ef9aAf1F770a6866"

* "StakeUniswapV3Factory": "0x0cfaE39054263B9269B89568B802a69c99e67Bb7"

* "Stake2Logic": "0x62c957BE256cD01695ddfE97d306A737aE179272"

* "Stake2VaultProxy": "0xB9C3531f1230De8E775F386f3B57d6dCB3F0202a"

* "StakeUniswapV3Proxy": "0xC1349A9a33A0682804c390a3968e26E5a2366153"

## Deployed StakeTONUpgrade

* "StakeTONUpgrade": "0x52b49091d274f093dc813A4b76aB7a6E8f4f8e00"

* "StakeTONUpgrade2": "0x07bc0a6036d8448da9cb06da859f35086533188c"

## Deployed StakeTONUpgrade3

* "StakeTONProxy2": "0xa16412acf22b70ddccebcafa75e773bb1879b341"

* "StakeTONUpgrade3": "0xe75d8392c2eed2425afc7fcfba88d340b493ccc2"

* "StakeTONControl": "0xacdded49ac67ba9c87b1bbc5cb248b1bd7dc0f19"


## Deployed related to DAO

* "LockTOS": "0x47f9FEbB2456d71Aab621F683AD680D71aF1306d"

* "LockTOSProxy": "0x69b4A202Fa4039B42ab23ADB725aA7b1e9EEBD79"

## Deployed related to PublicSale

* "PublicSale": "0xA2C90A682DC0849e9Ed8B781E06a73441b5CA1e6"

* "PublicSaleProxy": "0xBef737D725993847c345647ebA096500FdAE71c6"

### USING TOKAMAK CONTRACTS

* "TON": "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"

* "WTON": "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"

* "DepositManager": "0x56E465f654393fa48f007Ed7346105c7195CEe43"

* "SeigManager": "0x710936500aC59e8551331871Cbad3D33d5e0D909"

* "SwapProxy": "0x30e65B3A6e6868F044944Aa0e9C5d52F8dcb138d"


### Build Contracts with Truffle

`npm run compile:truffle`


### Test Contracts with Truffle

`npm run test:proxy`

`npm run test:stake.eth`

`npm run test:stake.ton`

`npm run test:stake.tokamak`

`npm run test:upgrade`

`npm run test:factory`

`npm run test:uniswapv3-simple`

`npm run test:uniswapv3-liquidity`


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

