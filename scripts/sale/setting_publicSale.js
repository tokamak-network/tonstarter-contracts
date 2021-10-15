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
const proxyAddress = "0xE352fF539852620B35454466aBF85684Fd989397"
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
let claimStartTime, claimInterval, claimPeriod

async function setValue() {
    const [deployer] = await ethers.getSigners()
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);
    // const publicSale = await ethers.Contract("PublicSale", proxy, adminAddress);

    let epochTime = 1634196000
    let epochTimePeriod = 300      //10분 = 600 , 1분 = 60, 5분 = 300
    let epochTimeAdd = 1
    let claimIntervalTime = 120
    let snapshotTime = 1634195940

    snapshot = snapshotTime
    whitelistStartTime = epochTime
    whitelistEndTime = whitelistStartTime + (epochTimePeriod)
    exclusiveStartTime = whitelistEndTime
    exclusiveEndTime = exclusiveStartTime + (epochTimePeriod * epochTimeAdd)
    depositStartTime = exclusiveEndTime
    depositEndTime = depositStartTime + (epochTimePeriod)
    openSaleStartTime = depositEndTime
    openSaleEndTime = openSaleStartTime + (epochTimePeriod)
    claimStartTime = openSaleEndTime
    claimInterval = claimIntervalTime
    claimPeriod = 6

    //4시 19분 스냅샷 (다오페이지 링크)
    //4시 20분 시작 (5분단위)

    let tx2 = await publicSale.connect(deployer).setAllValue(
        snapshot,
        [whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime],
        [depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime],
        [claimStartTime, claimInterval, claimPeriod]
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
    console.log(tx)

    let tx2 = Number(await publicSale.tiersPercents(1))
    console.log("tx2 :", tx2, ", tierPercents1 : ", tierPercents1)
}

async function setAllAmount() {
    const [deployer] = await ethers.getSigners()
    console.log(deployer.address)
    const publicSale = await ethers.getContractAt("PublicSale", proxyAddress);

    const BASE_TEN = 10
    const decimals = 18
    let exSaleAmount = 14000000
    let openSaleAmount = 6000000
    let bigAmount1 = BigNumber.from(exSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let bigAmount2 = BigNumber.from(openSaleAmount).mul(BigNumber.from(BASE_TEN).pow(decimals))
    let salePrice = 20
    let payPrice = 12000

    let tx = await publicSale.connect(deployer).setAllAmount(
        [bigAmount1, bigAmount2],
        [salePrice, payPrice]
    )
    console.log(tx)

    let tx2 = Number(await publicSale.saleTokenPrice())
    console.log("tx2 :", tx2, ", salePrice : ", salePrice)
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