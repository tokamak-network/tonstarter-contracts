const { ethers } = require('hardhat')
const { BigNumber } = require("ethers")


async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    //private 배포
    // let ownerAddress = "0x47462B8062F87F63D84EBB9E0d931d38bD3F6F75" //mainnet
    
    let domAddress = "0x14f9C438dD5008b1c269659AA3234cBcB431a844"   //rinkeby (saleToken)
    // let domAddress = "" //mainnet (saleToken)
    let tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0" //rinkeby (getToken)
    // let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5" //mainnet (getToken)
    let ownerAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea" //rinkeby (getTokenOwner)
    // let ownerAddress = ""   //mainnet (getTokenOwner)
    // let wtonAddress = "0x709bef48982bbfd6f2d4be24660832665f53406c"  //rinkeby (wtonToken)
    let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2" //mainnet (wtonToken)


    const privateSale = await ethers.getContractFactory('PrivateSale')
    const saleContract = await privateSale.deploy()
    console.log("saleContract Address: ", saleContract.address)
    await saleContract.deployed()

    console.log("finish")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });