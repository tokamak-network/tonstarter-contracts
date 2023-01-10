const { ethers, run } = require('hardhat')
const { BigNumber } = require("ethers")
const { isConstructorDeclaration } = require('typescript')

const publicFactoryJson = require('../../../artifacts/contracts/factory/PublicSaleProxyFactory.sol/PublicSaleProxyFactory.json')

//rinkeby
// const factoryAddress = "0xA5441241993c7046Af28a07ffc2577FCC6c0Dc8b"

//goerli
const factoryAddress = "0x561e901F100A8C5338Cc988079f985b2C10bc72B"

async function basicSetting() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contract with the account :", deployer.address)
    const publicSaleFactory = await ethers.getContractAt("PublicSaleProxyFactory", factoryAddress);

    //rinkeby
    // const publicSaleLogic = "0x22084203264bB069a8048ACb2AF934F4bC749aa1"
    // const tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0"
    // const wtonAddress = "0x709bef48982Bbfd6F2D4Be24660832665F53406C"
    // const lockTOSAddress = "0x5adc7de3a0B4A4797f02C3E99265cd7391437568"
    // const tosAddress = "0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd"
    // const uniRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

    //goerli
    const tonAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00"
    const wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6"
    const lockTOSAddress = "0x63689448AbEaaDb57342D9e0E9B5535894C35433"
    const tosAddress = "0x67F3bE272b1913602B191B3A68F7C238A2D81Bb9"
    const uniRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    const publicSaleLogic = "0xc562215fAF689D5123574de0cA0D7705785Bee24"

    await publicSaleFactory.basicSet(
        [
            tonAddress,
            wtonAddress,
            lockTOSAddress,
            tosAddress,
            uniRouter,
            publicSaleLogic
        ]
    )

    console.log("basicSet okay")

}

async function setAllSetting() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contract with the account :", deployer.address)

    const publicSaleFactory = await ethers.getContractAt("PublicSaleProxyFactory", factoryAddress);

    const minPer = 5
    const maxPer = 10

    const initialLiuiqidty = ""
    const eventAddr2 = "0x508d5FaDA6871348A5b4fb66f4A1F58b187Ce9Bd"
    const upgradeaddr = "0x15280a52E79FD4aB35F4B9Acbb376DCD72b44Fd1"


    const BASE_TEN = 10
    const decimals = 18
    let tier1 = 600
    let tier2 = 1200
    let tier3 = 2200
    let tier4 = 6000
    let bigTier1 = BigNumber.from(tier1).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigTier2 = BigNumber.from(tier2).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigTier3 = BigNumber.from(tier3).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigTier4 = BigNumber.from(tier4).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let delayTime = 604800;

    await publicSaleFactory.allSet(
        [
            upgradeaddr,
            initialLiuiqidty,
            eventAddr2
        ],
        [
            minPer,
            maxPer,
            bigTier1,
            bigTier2,
            bigTier3,
            bigTier4,
            delayTime
        ]
    )

    console.log("setting finish")

}

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contract with the account :", deployer.address)


}


basicSetting()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

// verifyTest()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });