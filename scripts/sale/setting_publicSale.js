//setting해야하는 것
// 1. setAllValue -> setSnapshot + setExclusiveTime + setOpenTime + setClaim (시간 정의)
// 2. setSaleAmount -> (토큰판매량 설정)
// 3. setTier -> (tier설정 -> sTOS 기준)
// 4. setTierPercents -> (tier별 pool percents 설정 10%-> 1000 넣어야함)
// 5. setTokenPrice -> (토큰 판매가격 설정)

// 1.setAllValue (시간 및 claim 방법정의)
// 2.setAllAmount setSaleAmount + setTokenPrice (판매량과 가격 같이 설정)
// 3.setAllTier -> setTier + setTierPercents (티어기준, 분배 percents 같이설정)

const { ethers, network } = require('hardhat')
const { BigNumber } = require("ethers")

const publicJson = require('../../artifacts/contracts/sale/PublicSale.sol/PublicSale.json')

var abiPublic = publicJson.abi;
const proxyAddress = "0x230f12eb4A37055dC0E11B3f7405c9EE94E71ee9"
const adminAddress = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"

// let infura = {
//     projectId: "086aad6219cf436eb12e2ceae00e3b29",
//     projectSecret: "eeec8f27bd4e46ca864000283436309a"
// }

// const network = ethers.providers.getNetwork("rinkeby")
// const provider = new ethers.providers.InfuraProvider(network, infura)
// const wallet = new ethers.Wallet(privateKey1, provider)

let net = 'rinkeby'
let provider = ethers.getDefaultProvider(net);
console.log(provider)

let privateKey1 = process.env.RINKEBY_PRIVATE_KEY
let wallet1 = new ethers.Wallet(privateKey1, provider)
console.log("wallet1 address : ", wallet1.address)

const publicSale = new ethers.Contract(proxyAddress, abiPublic, provider);

let snapshot
let whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime
let depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime
let claimStartTime, claimInterval, claimPeriod


// async function setValue() {
//     const [deployer] = await ethers.getSigners()
//     // const publicSale = await ethers.Contract("PublicSale", proxy, adminAddress);

//     let epochTime = 1633668934
//     let epochTimePeriod = 1800      //30분
//     let epochTimeAdd = 1
//     let snapshotTime = 1633668934

//     snapshot = snapshotTime
//     whitelistStartTime = epochTime
//     whitelistEndTime = whitelistStartTime + (epochTimePeriod * epochTimeAdd)
//     exclusiveStartTime = whitelistEndTime
//     exclusiveEndTime = exclusiveStartTime + (epochTimePeriod * epochTimeAdd)
//     depositStartTime = exclusiveEndTime
//     depositEndTime = depositStartTime + (epochTimePeriod * epochTimeAdd)
//     openSaleStartTime = depositEndTime
//     openSaleEndTime = openSaleStartTime + (epochTimePeriod * epochTimeAdd)
//     claimStartTime = openSaleEndTime
//     claimInterval = (epochTimePeriod * epochTimeAdd)
//     claimPeriod = 6

//     await publicSale.connect(deployer).setAllValue(
//         snapshot,
//         [whitelistStartTime, whitelistEndTime, exclusiveStartTime, exclusiveEndTime],
//         [depositStartTime, depositEndTime, openSaleStartTime, openSaleEndTime],
//         [claimStartTime, claimInterval, claimPeriod]
//     )

//     let tx = Number(await publicSale.snapshot())
//     console.log("tx :", tx, ", snapshot : ", snapshot)
// }

// async function setSaleAmount() {
//     const BASE_TEN = 10
//     const decimals = 18
//     let amount1 = 200000
//     let bigExcluAmount = BigNumber.from(amount1).mul(BigNumber.from(BASE_TEN).pow(decimals))
//     let amount2 = 200000
//     let bigOpenAmount = BigNumber.from(amount2).mul(BigNumber.from(BASE_TEN).pow(decimals))

//     // 1000000000000000000 wei = 1 ether
//     // 1000000000000000000000000 wei = 1000000 ether
//     // let exclusiveSaleAmount = '1000000000000000000000000'
//     // let openSaleAmount = '1000000000000000000000000'
//     // let bigExcluAmount = ethers.BigNumber.from(exclusiveSaleAmount)
//     // let bigOpenAmount = ethers.BigNumber.from(openSaleAmount)

//     // let amount = 1
//     // let amount2 = ethers.utils.formatUnits(amount, 18)
//     // console.log(amount2)

//     // console.log(bigExcluAmount)
//     // console.log(Number(bigOpenAmount))

//     console.log("1")

//     let tx = await publicSale.connect(deployer).setSaleAmount(
//         bigExcluAmount,
//         bigOpenAmount
//     )
//     console.log(tx)
//     await tx.wait()
// }

// async function setTier() {
//     //wei단위로 변경해야함
//     let tier1 = 100
//     let tier2 = 200
//     let tier3 = 1000
//     let tier4 = 4000

//     await publicSale.connect(deployer).setTier(
//         tier1,
//         tier2,
//         tier3,
//         tier4
//     )
// }

// async function setTierPercents() { 
//     let tierPercents1 = 600
//     let tierPercents2 = 1200
//     let tierPercents3 = 2200
//     let tierPercents4 = 6000

//     await publicSale.connect(deployer).setTierPercents(
//         tierPercents1,
//         tierPercents2,
//         tierPercents3,
//         tierPercents4
//     )
// }

async function setTokenPrice() {
    // const [deployer] = await ethers.getSigners()
    // console.log(deployer.address)
    // console.log(publicSale)

    let saleTokenPrice = 10     //DOC토큰 가격
    let payTokenPrice = 10000   //TON토큰 가격

    let bigSalePrice = BigNumber.from(saleTokenPrice)
    let bigPayPrice = BigNumber.from(payTokenPrice)


    let tx = await publicSale.connect(wallet1).setTokenPrice(
        saleTokenPrice,
        payTokenPrice
    )
    console.log(tx)
    // await tx.wait()
}

// setValue()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// setSaleAmount()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// setTier()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

// setTierPercents()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });

setTokenPrice()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });