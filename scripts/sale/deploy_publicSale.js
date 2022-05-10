const { ethers } = require('hardhat')
const { BigNumber } = require("ethers")


// async function main() {
//     const [deployer] = await ethers.getSigners()
    
//     console.log("Deploying contract with the account :", deployer.address)
    
//     //publicSaleProxy를 관리할 계정
//     // let ownerAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea" //mainnet
//     // let ownerAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea" //rinkeby
//     let ownerAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea" //rinkeby

//     const publicSale = await ethers.getContractFactory('PublicSale')
//     const saleContract = await publicSale.deploy()
//     console.log("saleContract Address: ", saleContract.address)
//     await saleContract.deployed()

//     //setting address
//     // let docAddress = "0xb109f4c20bdb494a63e32aa035257fba0a4610a4" //rinkeby (saleToken)
//     // let docAddress = "0x0e498afce58dE8651B983F136256fA3b8d9703bc" //mainnet (saleToken)
//     let auraAddress = "0x14f9C438dD5008b1c269659AA3234cBcB431a844"   //rinkeby (saleToken)
//     // let auraAddress = "0xaEC59E5b4f8DbF513e260500eA96EbA173F74149"   //mainnet (saleToken)
//     let tonAddress = "0x44d4F5d89E9296337b8c48a332B3b2fb2C190CD0" //rinkeby (getToken)
//     // let tonAddress = "0x2be5e8c109e2197D077D13A82dAead6a9b3433C5" //mainnet (getToken)
//     // let sTOSAddress = "0xc1545632e67cefF8ECaB83072118271577e66aDc" //rinkeby (sTosToken)(sTOS의 proxy)
//     // let sTOSAddress = "0x8487632Aa57d663A84E836c212977a022346c50D" //rinkeby (sTOSToken2)
//     // let sTOSAddress = "0xecd5a04e6ae20da1b77db90fb33fb7a7a27784af" //rinkeby (sTOSToken3)
//     // let sTOSAddress = "0x8f66fadcfff73de561918052c070c445d68c0af4" //rinkeby (sTOSToken4)
//     let sTOSAddress = "0x515218bA1cED69547c040f03d9DCEC7D3FdEdc33" //rinkeby (sTOSToken5)

//     // let sTOSAddress = "0x69b4A202Fa4039B42ab23ADB725aA7b1e9EEBD79" //mainnet (sTOS)
    
//     //세일로 받은 TON을 관리할 주소
//     let getTonOwner = "0x195c1D13fC588C0b1Ca8A78dd5771E0eE5A2EAe4" //rinkeby
//     // let getTonOwner = "0x47462B8062F87F63D84EBB9E0d931d38bD3F6F75" //mainnet

//     // let saleContractAddress = "0xF3eE74585c12620eB865C462D7D9Df75Ae5d9b95"  //rinkeby

//     let wtonAddress = "0x709bef48982bbfd6f2d4be24660832665f53406c"  //rinkeby (wtonToken)
//     // let wtonAddress = "0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2" //mainnet (wtonToken)
    
//     const saleProxy = await ethers.getContractFactory('PublicSaleProxy')
//     const proxyContract = await saleProxy.deploy(saleContract.address)    
//     await proxyContract.deployed()
//     console.log("proxyContract Address : ", proxyContract.address)

    
//     await proxyContract.connect(deployer).initialize(auraAddress, tonAddress, getTonOwner, sTOSAddress, wtonAddress)
//     // console.log("proxyContract Address : ", proxyContract.address)
//     console.log("finish")
// }

async function testERC20() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contract with the account :", deployer.address)

    const erc20token = await ethers.getContractFactory("ERC20Mock");
    const saleToken = await erc20token.deploy("testDoM", "DoM");
    console.log("saleToken Address: ", saleToken.address)
    await saleToken.deployed();
    console.log("finish");
}

async function deployLogic() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contract with the account :", deployer.address)

    const publicSale = await ethers.getContractFactory('PublicSale')
    const saleContract = await publicSale.deploy()
    console.log("saleContract Address: ", saleContract.address)
    await saleContract.deployed();
    console.log("finish");
}

async function deployLogicTest() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contract with the account :", deployer.address)

    const publicSale = await ethers.getContractFactory('PublicSaleTest')
    const saleContract = await publicSale.deploy()
    console.log("saleContract Address: ", saleContract.address)
    await saleContract.deployed();
    console.log("finish");
}

// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// testERC20()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// deployLogic()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

deployLogicTest()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
