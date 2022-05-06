//setting해야하는 것
// 1. setAllValue -> setSnapshot + setExclusiveTime + setOpenTime + setClaim (시간 정의)
// 2. setSaleAmount -> (토큰판매량 설정)
// 3. setTier -> (tier설정 -> sTOS 기준)
// 4. setTierPercents -> (tier별 pool percents 설정 10%-> 1000 넣어야함)
// 5. setTokenPrice -> (토큰 판매가격 설정)

// 1.setAllValue (시간 및 claim 방법정의)
// 2.setAllAmount -> setSaleAmount + setTokenPrice (판매량과 가격 같이 설정)
// 3.setAllTier -> setTier + setTierPercents (티어기준, 분배 percents 같이설정)

const { ethers, network } = require('hardhat')
const { BigNumber } = require("ethers")

const publicJson = require('../../artifacts/contracts/sale/PublicSale.sol/PublicSale.json')

var abiPublic = publicJson.abi;
const proxyAddress = "0x7851E7002DE43576FE390e7904e7F59C44B13AAD"       //rinkeby
// const proxyAddress = "0x3B75d3f628C29d357b484EA7d091faEd63419267"       //mainnet
const adminAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"

// let net = 'rinkeby'
// let provider = ethers.getDefaultProvider();
// console.log(provider)

// let privateKey1 = process.env.RINKEBY_PRIVATE_KEY
// let wallet1 = new ethers.Wallet(privateKey1, ethers.provider)
// console.log("wallet1 address : ", wallet1.address)

// const publicSale = new ethers.Contract(proxyAddress, abiPublic, ethers.provider);

let snapshot
let whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime
let depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime
let claimStartTime, claimInterval, claimPeriod, claimFirst

async function setValue() {
    const [deployer] = await ethers.getSigners()
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);
    // const publicSale = await ethers.Contract("PublicSale", proxy, adminAddress);

    let epochTime = 1635148800      //2021년 10월 25일 월요일 오후 5:00:00 GMT+09:00
    let epochTimePeriod = 60      //10분 = 600 , 1분 = 60, 5분 = 300
    let epochTimeAdd = 1
    let claimIntervalTime = 2592000     //30Days
    let snapshotTime = 1635148740   //2021년 10월 25일 월요일 오후 4:59:00 GMT+09:00

    // snapshot = snapshotTime
    // whitelistStartTime = epochTime
    // whitelistEndTime = whitelistStartTime + (epochTimePeriod)
    // exclusiveStartTime = whitelistEndTime
    // exclusiveEndTime = exclusiveStartTime + (epochTimePeriod * epochTimeAdd)
    // depositStartTime = exclusiveEndTime
    // depositEndTime = depositStartTime + (epochTimePeriod)
    // openSaleStartTime = depositEndTime
    // openSaleEndTime = openSaleStartTime + (epochTimePeriod)
    // claimStartTime = depositEndTime
    // claimInterval = claimIntervalTime
    // claimPeriod = 6
    // claimFirst = 50
    // 1639468800,1639641599,1639641600,1639814399
    // 1639814400,1640159999
    // 1640160000,2592000,6,50
    // 1639468800,1639641599,1639641600,1639814399

    snapshot = 1642411080               //
    whitelistStartTime = 1642413180     //
    whitelistEndTime = 1642413300       //
    exclusiveStartTime = 1642413300     //
    exclusiveEndTime = 1642413600       //
    depositStartTime = 1642413600       //
    depositEndTime =   1642413660       //
    claimStartTime = 1642413660         //
    claimInterval = 60             //
    claimPeriod = 6
    claimFirst = 50

    let tx2 = await publicSale.connect(deployer).setAllValue(
        snapshot,
        [whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime],
        [depositStartTime, depositEndTime],
        [claimStartTime, claimInterval, claimPeriod, claimFirst]
    )
    await tx2.wait()

    let tx = Number(await publicSale.snapshot())
    console.log("tx :", tx, ", snapshot : ", snapshot)
}

async function setAllTier() {
    const [deployer] = await ethers.getSigners()
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);

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
    let tierPercents1 = 600
    let tierPercents2 = 1200
    let tierPercents3 = 2200
    let tierPercents4 = 6000

    let tx = await publicSale.connect(deployer).setAllTier(
        [bigTier1, bigTier2, bigTier3, bigTier4],
        [tierPercents1, tierPercents2, tierPercents3, tierPercents4]
    )
    await tx.wait()

    let tx2 = Number(await publicSale.tiersPercents(1))
    console.log("tx2 :", tx2, ", tierPercents1 : ", tierPercents1)
}

async function setAllAmount() {
    const [deployer] = await ethers.getSigners()
    console.log(deployer.address)
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);

    const BASE_TEN = 10
    const decimals = 18
    let exSaleAmount = 6000000     //6,000,000
    let openSaleAmount = 6000000    //6,000,000
    let bigAmount1 = BigNumber.from(exSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigAmount2 = BigNumber.from(openSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    // let salePrice = 20                  //0.20달러
    // let payPrice = 633                //6.33달러
    let salePrice = 200                  //rinkeby
    let payPrice = 10000                //rinkeby

    let tx = await publicSale.connect(deployer).setAllAmount(
        [bigAmount1, bigAmount2],
        [salePrice, payPrice]
    )
    await tx.wait()
    // console.log(tx)

    let tx2 = Number(await publicSale.saleTokenPrice())
    console.log("tx2 :", tx2, ", salePrice : ", salePrice)
}

async function setSaletotalAmount() {
    const [deployer] = await ethers.getSigners()
    console.log(deployer.address)
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);

    const BASE_TEN = 10
    const decimals = 18
    let exSaleAmount = 6000000     //6,000,000
    let openSaleAmount = 6000000    //6,000,000
    let bigAmount1 = BigNumber.from(exSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigAmount2 = BigNumber.from(openSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))

    let tx = await publicSale.connect(deployer).setSaleAmount(bigAmount1, bigAmount2)
    await tx.wait()

    console.log("success")
    // let tx2 = Number(await publicSale.totalExpectSaleAmount())
    // console.log("tx2 :", tx2, ", bigAmount1 : ", bigAmount1)
    // 17,500,000./000/000/000/000/000/000
    //  7,500,000./000/000/000/000/000/000 
}

async function resetData() {
    const [deployer] = await ethers.getSigners()
    console.log(deployer.address)
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);

    let tx = await publicSale.connect(deployer).resetAllData()
    await tx.wait()

    console.log("success");
    let tx2 = Number(await publicSale.startAddWhiteTime())
    console.log("tx2(0) :", tx2)
}

setValue()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

// setAllTier()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// setAllAmount()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// setSaletotalAmount()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// resetData()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });