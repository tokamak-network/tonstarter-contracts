const { ethers } = require('hardhat')
const { BigNumber } = require("ethers")


async function main() {
    const [deployer] = await ethers.getSigners()
    
    console.log("Deploying contract with the account :", deployer.address)
    
    //publicSaleProxy를 관리할 계정
    // let ownerAddress = "0xc575848f69C710dA33A978384114010bdb15f4db" //mainnet
    let ownerAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea" //rinkeby

    const publicSale = await ethers.getContractFactory('PublicSale')
    const saleContract = await publicSale.deploy()
    console.log("saleContract Address: ", saleContract.address)
    await saleContract.deployed()

    //setting address
    let docAddress = "0xb109f4c20bdb494a63e32aa035257fba0a4610a4" //rinkeby (saleToken)
    // let docAddress = "0x0e498afce58dE8651B983F136256fA3b8d9703bc" //mainnet (saleToken)
    let tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0" //rinkeby (getToken)
    // let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5" //mainnet (getToken)
    // let sTOSAddress = "0xc1545632e67cefF8ECaB83072118271577e66aDc" //rinkeby (sTosToken)(sTOS의 proxy)
    let sTOSAddress = "0x8487632Aa57d663A84E836c212977a022346c50D" //rinkeby (sTOSToken2)
    // let sTOSAddress = "" //mainnet (sTOS)
    
    //세일로 받은 TON을 관리할 주소
    // let getTonOwner = "0x642C239C9BEF6574FE3dc64B82dED55A30d0dc25" //mainnet
    let getTonOwner = "0x195c1D13fC588C0b1Ca8A78dd5771E0eE5A2EAe4" //rinkeby
    
    const saleProxy = await ethers.getContractFactory('PublicSaleProxy')
    const proxyContract = await saleProxy.deploy(saleContract.address, ownerAddress)
    await proxyContract.deployed()
    
    await proxyContract.connect(deployer).initialize(docAddress, tonAddress, getTonOwner, sTOSAddress)
    console.log("proxyContract Address : ", proxyContract.address)
    console.log("finish")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });