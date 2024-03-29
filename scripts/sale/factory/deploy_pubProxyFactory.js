const { ethers, run } = require('hardhat')
const { BigNumber } = require("ethers")
const { isConstructorDeclaration } = require('typescript')


async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    const publicSaleProxyFactory = await ethers.getContractFactory('PublicSaleProxyFactory')
    const AddressContract = await publicSaleProxyFactory.deploy()
    console.log("AddressContract Address: ", AddressContract.address)
    await AddressContract.deployed()
    console.log("deploy finished")
    //rinkeby
    // const publicSaleLogic = "0xaf2aDD0Ca634aEf705344473cF8D56F51be949D4"
    // const publicSaleLogic = "0x3695e5f76Eb010f891a4233661CdC4CB68D9C17c"
    // const publicSaleLogic = "0x96f664D36301917991BB39085C36245661D687f7"
    // const publicSaleLogic = "0x1De31ADca817e9FA7da3D5ae58F262F839E199eC"
    // const publicSaleLogic = "0xB4c7C152f906B284c20D6b02c96E97C7ad89eF60"
    // const publicSaleLogic = "0x1429b6f933916BAB1AFa93e489d1B476B776f4E0"

    // const tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0"
    // const wtonAddress = "0x709bef48982Bbfd6F2D4Be24660832665F53406C"
    // // const lockTOSAddress = "0xc1545632e67cefF8ECaB83072118271577e66aDc"
    // const lockTOSAddress = "0x5adc7de3a0B4A4797f02C3E99265cd7391437568"
    // const tosAddress = "0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd"
    // const uniRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    
    // 0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0,0x709bef48982Bbfd6F2D4Be24660832665F53406C,0x5adc7de3a0B4A4797f02C3E99265cd7391437568,0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd,0xE592427A0AEce92De3Edee1F18E0157C05861564,0x1429b6f933916BAB1AFa93e489d1B476B776f4E0
    
    // const initialLiuiqidty = "0xBb3E39360Df9a024cbf4ABa28e0B8F4421e7525F"
    // const initialLiuiqidty = "0x529A38b13EF8d9F12Fd1c28b6c486152ada13300"
    // const initialLiuiqidty = "0x8eAF51C81E599c40D3d0Cc3A216519A62C8c0d1c"
    // const initialLiuiqidty = "0x98B792CEF9a23b4CB7530E06c8fD821FdB2fBF44"

    // const upgradeaddr = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1"

    // const eventAddr = "0xDdbb09f74ED25F056785655810Cc35c4BD453741"
    // // const eventAddr2 = "0x6eAb73266e1BDE7D823f278414e928e67C78FE20"
    // const eventAddr2 = "0x4aAd46a82c1D6fB74c5f552CFB947cB05870F0c6"

    //mainnet
    const publicSaleLogic = "0x603d3cbDA429ad08dF95B13A502784276B0f0B41"
    const tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5"
    const wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2"
    const lockTOSAddress = "0x69b4A202Fa4039B42ab23ADB725aA7b1e9EEBD79"
    const tosAddress = "0x409c4D8cd5d2924b9bc5509230d16a61289c8153"
    const uniRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

    const minPer = 5
    const maxPer = 10

    const initialLiuiqidty = "0xcf9A97F0CBBc2eB588E3e4301773d13267616F10"
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

    await AddressContract.basicSet(
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

    await AddressContract.allSet(
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

    // await AddressContract.setMaxMin(
    //     minPer,
    //     maxPer
    // )

    // await AddressContract.setUpgradeAdmin(
    //     upgradeaddr
    // )

    // await AddressContract.setVault(
    //     initialLiuiqidty
    // )

    // await AddressContract.setEventLog(
    //     eventAddr2
    // )

    // await AddressContract.setSTOS(
    //     bigTier1,
    //     bigTier2,
    //     bigTier3,
    //     bigTier4
    // )

    console.log("setting finish")


}

async function verifyTest() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    const publicSaleProxy = await ethers.getContractFactory('PublicSaleProxy')
    const contract = await publicSaleProxy.deploy()
    console.log("contract Address: ", contract.address)
    await contract.deployed()

    console.log("finish")
}

main()
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