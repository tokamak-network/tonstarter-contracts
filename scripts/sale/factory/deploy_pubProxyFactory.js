const { ethers } = require('hardhat')
const { BigNumber } = require("ethers")


async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    const publicSaleProxyFactory = await ethers.getContractFactory('PublicSaleProxyFactory')
    const AddressContract = await publicSaleProxyFactory.deploy()
    console.log("AddressContract Address: ", AddressContract.address)
    await AddressContract.deployed()

    //rinkeby
    // const publicSaleLogic = "0xaf2aDD0Ca634aEf705344473cF8D56F51be949D4"
    // const publicSaleLogic = "0x3695e5f76Eb010f891a4233661CdC4CB68D9C17c"
    const publicSaleLogic = "0x96f664D36301917991BB39085C36245661D687f7"

    const tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0"
    const wtonAddress = "0x709bef48982Bbfd6F2D4Be24660832665F53406C"
    const lockTOSAddress = "0xc1545632e67cefF8ECaB83072118271577e66aDc"
    const tosAddress = "0x73a54e5C054aA64C1AE7373C2B5474d8AFEa08bd"
    const uniRouter = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    
    const minPer = 5
    const maxPer = 10

    // const initialLiuiqidty = "0xBb3E39360Df9a024cbf4ABa28e0B8F4421e7525F"
    const initialLiuiqidty = "0x529A38b13EF8d9F12Fd1c28b6c486152ada13300"

    const upgradeaddr = "0x8c595DA827F4182bC0E3917BccA8e654DF8223E1"

    const eventAddr = "0xDdbb09f74ED25F056785655810Cc35c4BD453741"
    const eventAddr2 = "0x6eAb73266e1BDE7D823f278414e928e67C78FE20"

    const BASE_TEN = 10
    const decimals = 18
    let tier1 = 10
    let tier2 = 20
    let tier3 = 30
    let tier4 = 40
    let bigTier1 = BigNumber.from(tier1).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigTier2 = BigNumber.from(tier2).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigTier3 = BigNumber.from(tier3).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigTier4 = BigNumber.from(tier4).mul(BigNumber.from(BASE_TEN).pow(decimals))

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

    await AddressContract.setMaxMin(
        minPer,
        maxPer
    )

    await AddressContract.setUpgradeAdmin(
        upgradeaddr
    )

    await AddressContract.setVault(
        initialLiuiqidty
    )

    await AddressContract.setEventLog(
        eventAddr2
    )

    await  AddressContract.setSTOS(
        bigTier1,
        bigTier2,
        bigTier3,
        bigTier4
    )

    console.log("finish")
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