const { ethers } = require('hardhat')
const { BigNumber } = require("ethers")


async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    const publicSaleProxyFactory = await ethers.getContractFactory('PublicSaleProxyFactory')
    const AddressContract = await publicSaleProxyFactory.deploy()
    console.log("AddressContract Address: ", AddressContract.address)
    await AddressContract.deployed()

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