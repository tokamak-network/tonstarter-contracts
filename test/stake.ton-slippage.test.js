const chai = require("chai");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3EthAbi = require('web3-eth-abi');
const {
  keccak256,
} = require("web3-utils");

let TOSToken = require('../abis/TOS.json');
let UniswapV3Factory = require('../abis/UniswapV3Factory.json');
let UniswapV3Pool = require('../abis/UniswapV3Pool.json');

let StakeTONProxy2 = require('../abis/StakeTONProxy2.json');
let StakeTONProxy = require('../abis/StakeTONProxy.json');

// // mainnet
// let deployedInfo = {
//     stakeTON_1: "0x9a8294566960ab244d78d266ffe0f284cdf728f1",
//     stakeTON_2: "0x7da4e8ab0bb29a6772b6231b01ea372994c2a49a",
//     wtontosPoolAddress: "0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4",
// }
// let contractInfos = {
//     "TOS": "0x409c4D8cd5d2924b9bc5509230d16a61289c8153",
//     "StakeTON": "0xD08C561507fD6F6Df662a239Bb49B8A773e6e411",
//     "StakeTONProxyFactory": "0x4eA3C549C9A041Ad7B83003cd8572b9DBdeEC7F1",
//     "StakeTONFactory": "0x8Dde0854A6A6781720E0a4462a8648c89D861b16",
//     "StakeFactory": "0x942286FC535Cab49b7C8b650369305ba8b4a2e4c",
//     "StakeRegistry": "0x4Fa71D6964a97c043CA3103407e1B3CD6b5Ab367",
//     "Stake1Vault": "0xfE78C5A77323274A1afc6669C5ebd2494981ae8d",
//     "StakeVaultFactory": "0x0f559A3130e5390f59694ad931B04a5904b8C130",
//     "Stake1Logic": "0xcC0b93aF31d3c85416CbdF8Fc471C1D8da6768bb",
//     "Stake1Proxy": "0x8e539e29D80fd4cB3167409A82787f3B80bf9113",
//     "TON": "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5",
//     "WTON": "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2",
//     "DepositManager": "0x56E465f654393fa48f007Ed7346105c7195CEe43",
//     "SeigManager": "0x710936500aC59e8551331871Cbad3D33d5e0D909",
//     "SwapProxy": "0x30e65B3A6e6868F044944Aa0e9C5d52F8dcb138d",
// }


// rinkeby "TON29 #1" "TON29 #2"
let deployedInfo = {
    stakeTON_1: "0xbcb1886464826c2d1d3349d83e394ecc846cf230",
    stakeTON_2: "0x7f04b39582812224d202c68efdc069583aa89e80",
    wtontosPoolAddress: "0x1c0ce9aaa0c12f53df3b4d8d77b82d6ad343b4e4",
}
let contractInfos = {
    "TOS": "0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd",
    "StakeTONLogic": "0x492CB2b2d4003BC2eDE83Eb131ec4E9cA195fa85",
    "StakeTONProxyFactory": "0xbf02D635679411CB0ffbf56D0Ecb6A247eAc248d",
    "StakeTONFactory": "0xB805E4b75417d49b48A7bd66F966c1421C3ffDB2",
    "StakeFactory": "0xc6C95ae30A4e90e2d1BFEd4DCd8aC94C1df864f2",
    "StakeRegistry": "0x6915eC2110FcCd31f1358a5B07e8DB286521d450",
    "Stake1Vault": "0x26e038DE3bD8A6869E21f7aD8F434B21e6fA5b8E",
    "StakeVaultFactory": "0xAdfb288d0B849f764Ac9B40788F40727A83bd49B",
    "Stake1Logic": "0xc451633062211245295c9bDaE8b871fc0876b25E",
    "Stake1Proxy": "0xd53e6EaA528840a3625eb93DF2FA63F37Bd1EB7f",
    "TON": "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0",
    "WTON": "0x709bef48982Bbfd6F2D4Be24660832665F53406C",
    "DepositManager": "0x57F5CD759A5652A697D539F1D9333ba38C615FC2",
    "SeigManager": "0x957DaC3D3C4B82088A4939BE9A8063e20cB2efBE",
    "SwapProxy": "0x8032d21F59CDB42C9c94a3A41524D4CCF0Cae96c",
    "StakeUniswapV3": "0x99b09c6CfF45C778a4F5fBF7a4EAD6c3DEBfdcBb",
    "NonfungiblePositionManager": "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
}


describe("TokamakStakeUpgrade4", function () {
    let tokamakStakeUpgrade4;
    let stakeTON1, stakeTONProxy, stakeTON1Proxy, stakeTON1Proxy2,  stakeTON2;
    let provider;

    before(async function () {
        accounts = await ethers.getSigners();
        [admin1, admin2] = accounts;
        provider = ethers.provider;

        // await ethers.provider.send("hardhat_setBalance", [
        //     admin1.address,
        //   "0x56BC75E2D63100000",
        // ]);
        // await ethers.provider.send("hardhat_setBalance", [
        //     admin2.address,
        //   "0x56BC75E2D63100000",
        // ]);
    });

    it("StakeTON1", async function () {
        console.log("deployedInfo.stakeTON_1", deployedInfo.stakeTON_1);

        stakeTONProxy = await ethers.getContractAt(StakeTONProxy.abi, deployedInfo.stakeTON_1, provider);
        //console.log("stakeTONProxy",stakeTONProxy);
        let imp0 = await stakeTONProxy["implementation()"]();
        console.log("imp0",imp0);


        stakeTON1Proxy2 = await ethers.getContractAt(StakeTONProxy2.abi, deployedInfo.stakeTON_1);

        let imp2_0 = await stakeTON1Proxy2["implementation2(uint256)"](ethers.BigNumber.from("0"));
        console.log("imp2_0",imp2_0);
        let imp2_1 = await stakeTON1Proxy2.implementation2(ethers.BigNumber.from("1"));
        console.log("imp2_1",imp2_1);
        let imp2_2 = await stakeTON1Proxy2.implementation2(ethers.BigNumber.from("2"));
        console.log("imp2_2",imp2_2);
    });

    it("add function", async function () {
        let _func1 = Web3EthAbi.encodeFunctionSignature("withdraw()") ;
    });

});
