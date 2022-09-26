const fs = require('fs');


const getLockTosHolderList = async (lockTosAddress) => {

    const lockTOS = await ethers.getContractAt("LockTOS", lockTosAddress);

    let stosHolders = await lockTOS.allHolders();
    console.log('stosHolders',stosHolders);

    await fs.writeFileSync("./data/stos-holders.json", JSON.stringify(stosHolders));

    console.log('stos holder length : ',stosHolders.length);

    return stosHolders;
}


const getStosBalances = async (lockTosAddress, blockNumber) => {

    const lockTOS = await ethers.getContractAt(
        "LockTOS",
        lockTosAddress
    );

    lockTOS.defaultBlock = blockNumber;

    let stosHolders = await lockTOS.allHolders();
    console.log('stosHolders',stosHolders);
    let out = {};
    let accounts = [];
    let amounts = [];


    for(let i=0; i< stosHolders.length; i++){
        let account = stosHolders[i].toLowerCase();
        let balance = await lockTOS.balanceOf(account );

        accounts.push(account);
        amounts.push(balance.toString());
    }

    out.account = accounts;
    out.amounts = amounts;

    await fs.writeFileSync("./data/stos-balances.json", JSON.stringify(out));

    console.log('stos holder length : ',out.account.length);

    return out;
}



const getlockIds = async (lockTosAddress, blockNumber) => {

    const lockTOS = await ethers.getContractAt(
        "LockTOS",
        lockTosAddress
    );

    const block = await ethers.provider.getBlock();
    console.log('block.timestamp',block.timestamp);
    let currentTime = block.timestamp;

    lockTOS.defaultBlock = blockNumber;
    console.log('blockNumber',blockNumber);
    let lockIdCounter = await lockTOS.lockIdCounter();
    console.log('lockIdCounter',lockIdCounter.toString());
    let stosHolders = await lockTOS.allHolders();
    console.log('stosHolders',stosHolders );


    console.log('stosHolders.length',stosHolders.length );

    let out = {};
    let ids = [];
    let accounts = [];
    let amounts = [];
    let ends = [];
    let periods = [];
    let profits = [];

    for(let i=0; i< stosHolders.length; i++){
        let account = stosHolders[i].toLowerCase();
        let locks = await lockTOS.locksOf(account);
        if (locks.length == 0) continue;
        console.log('account\'s lockId\'s length ',account, locks.length );

        for (let j = 0; j < locks.length; ++j) {
            let id = locks[j];
            let info = await lockTOS.allLocks(id);
            let profit = "0";

            if(info.withdrawn == true){ // 이미 언스테이킹 한것,
                // console.log('withdrawn id',id.toString(), account, info.withdrawn, info.start.toString(), info.end.toString(), info.amount.toString() );

            } else {
                // console.log('id',id.toString(), account, info.withdrawn, info.start.toString(), info.end.toString(), info.amount.toString() );
                let period = parseInt(info.end.toString())-currentTime;
                if(period <= 0){ // 이미 종료일이 지난것은 ??
                    period = "0";

                } else {
                    //console.log('period',period );
                    profit = getProfit(info.amount, period);
                    if(profit > 0 ){
                        let profitStr = profit.toPrecision(50)+"";
                        let pos1 = profitStr.indexOf(".");
                        profit = profitStr.substring(0,pos1);
                        // console.log('profit', profit , profitStr, profitStr.substring(0,pos1));
                    } else  profit = "0";
                    // console.log('profit', profit  );
                }

                ids.push(id.toString());
                accounts.push(account);
                amounts.push(info.amount.toString());
                ends.push(info.end.toString());
                periods.push(period+"");
                profits.push(profit);
            }
        }
    }

    out.timestamp = currentTime;
    out.ids = ids;
    out.accounts = accounts;
    out.amounts = amounts;
    out.ends = ends;
    out.periods = periods;
    out.profits = profits;

    console.log(out);

    await fs.writeFileSync("./data/stos-ids-"+blockNumber+".json", JSON.stringify(out));

    console.log('stos id\'s length : ',out.ids.length);

    return out;
}

function getProfit(amount, period) {
    let interestRate = 0.00008704505 ;  // 이자율 0.0087% = 0.000087 (APY =9.994%)
    let rebasePeriod = 60 * 60 * 8; // 8시간
    let n = Math.floor(parseFloat(period)/rebasePeriod);
    let pow = Math.pow(1+interestRate, n)
    if (n > 0){
        let profit = amount * pow;
        return (profit - amount);
    } else {
        return 0;
    }
}


const increaseLockTOSAmounts = async (lockTosAddress, blockNumber, adminAddress, round) => {
    //const [admin] = await ethers.getSigners();
    console.log('adminAddress',adminAddress);
    console.log('round',round);

    round = parseInt(round) ;

    // test local
    await hre.network.provider.send('hardhat_impersonateAccount',[adminAddress]);
    await hre.network.provider.send('hardhat_setBalance',[adminAddress, "0x10000000000000000000000000"]);

    let admin = await hre.ethers.getSigner(adminAddress) ;
    console.log('admin',admin.address);

    const addLockTosInfos = JSON.parse(await fs.readFileSync("./data/stos-ids-"+blockNumber+".json"));

    const lockTosABI = require("../../abis/LockTOSv2Logic0.json").abi;

    const lockTOS = new ethers.Contract(
        lockTosAddress,
        lockTosABI,
        ethers.provider
      );

    if(addLockTosInfos.ids == null) return;

    let len = addLockTosInfos.ids.length;
    let currentTime = addLockTosInfos.timestamp;
    let ids = addLockTosInfos.ids;
    let accounts = addLockTosInfos.accounts;
    let amounts = addLockTosInfos.amounts;
    let ends = addLockTosInfos.ends;
    let profits = addLockTosInfos.profits;
    console.log('len',len)
    console.log('currentTime',currentTime)
    // console.log('accounts',accounts)
    // console.log('amounts',amounts)
    // console.log('ends',ends)
    // console.log('profits',profits)

    let batchSize = 100; //360
    let loopCount = Math.floor(len/batchSize)+1;

    let maxRound = loopCount -1;
    console.log('loopCount',loopCount, 'maxRound',maxRound, 'round', round);
    let c = 0;
    //for(c = 0; c < loopCount; c++){
    if(round <= maxRound){
        c = round;
        let start = c * batchSize;
        let end = start + batchSize;
        if(end > addLockTosInfos.ids.length)  end = addLockTosInfos.ids.length;

        console.log('start',start)
        console.log('end',end)


        let idList = [];
        let accountList = [];
        let amountList = [];
        let profitList = [];

        try{
            if(!ids) return;
            if(!accounts) return;
            if(!amounts) return;
            if(!ends) return;
            if(!profits) return;

            for(let i = start; i < end; i++){
                idList.push(ethers.BigNumber.from(ids[i]));
                accountList.push(accounts[i]);
                amountList.push(ethers.BigNumber.from(amounts[i]));
                profitList.push(ethers.BigNumber.from(profits[i]));
            }
            // console.log(c, 'idList',idList)
            // console.log(c, 'accountList',accountList)
            // console.log(c, 'amountList',amountList)
            // console.log(c, 'profitList',profitList)


            let tx = await lockTOS.connect(admin).increaseAmountOfIds(
                        accountList,
                        idList,
                        profitList,
                        currentTime
                    );

            console.log(c, 'increaseLockTOSAmounts end ',start, end, tx.hash)

            await tx.wait();
            //await timeout(5);

        }catch(error){
          console.log('increaseLockTOSAmounts error',c, start, end, error);
          //break;
        }
      }
}


const compareLockTOSAmounts = async (lockTosAddress, blockNumber) => {
    const [admin] = await ethers.getSigners();

    const addLockTosInfos = JSON.parse(await fs.readFileSync("./data/stos-ids-"+blockNumber+".json"));

    const lockTosABI = require("../../abis/LockTOSv2Logic0.json").abi;

    const lockTOS = new ethers.Contract(
        lockTosAddress,
        lockTosABI,
        ethers.provider
      );
    if(addLockTosInfos.ids == null) return;

    let len = addLockTosInfos.ids.length;
    let currentTime = addLockTosInfos.timestamp;
    let ids = addLockTosInfos.ids;
    let accounts = addLockTosInfos.accounts;
    let amounts = addLockTosInfos.amounts;
    let ends = addLockTosInfos.ends;
    let profits = addLockTosInfos.profits;
    console.log('len',len)

    let start = 0;
    let end = addLockTosInfos.ids.length;

    console.log('start',start)
    console.log('end',end)


    let idList = [];
    let accountList = [];
    let amountList = [];
    let profitList = [];

    try{
        if(!ids) return;
        if(!accounts) return;
        if(!amounts) return;
        if(!ends) return;
        if(!profits) return;

        for(let i = start; i < end; i++){

            let id = ethers.BigNumber.from(ids[i]);
            let amount = ethers.BigNumber.from(amounts[i]);
            let profit = profits[i];
            let info = await lockTOS.locksInfo(id);

            if(profit != "0"){
                if(info.amount.gt(amount)) {
                    console.log('ok ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString() );
                } else {
                    console.log('wrong ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString());
                }
            } else {
                if(info.amount.eq(amount)) {
                    console.log('ok ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString() );
                } else {
                    console.log('wrong ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString());
                }
            }
        }

    }catch(error){
        console.log('compareLockTOSAmoutn error', start, end, error);
    }

}


const migrateStakeAndeLockTOS = async (stakeAddress, blockNumber, adminAddress, round) => {
    //const [admin] = await ethers.getSigners();
    console.log('stakeAddress',stakeAddress);
    console.log('adminAddress',adminAddress);
    console.log('round',round);

    round = parseInt(round) ;
    // await hre.network.provider.send('hardhat_impersonateAccount',[adminAddress]);
    // await hre.network.provider.send('hardhat_setBalance',[adminAddress, "0x10000000000000000000000000"]);
    let admin = await hre.ethers.getSigner(adminAddress) ;
    console.log('admin',admin.address);

    const addLockTosInfos = JSON.parse(await fs.readFileSync("./data/stos-ids-"+blockNumber+".json"));

    const StakingV2ABI = require("../../abis/StakingV2.json").abi;

    const stakingV2 = new ethers.Contract(
        stakeAddress,
        StakingV2ABI,
        ethers.provider
      );

    if(addLockTosInfos.ids == null) return;

    let len = addLockTosInfos.ids.length;
    let currentTime = addLockTosInfos.timestamp;
    let ids = addLockTosInfos.ids;
    let accounts = addLockTosInfos.accounts;
    let amounts = addLockTosInfos.amounts;
    let ends = addLockTosInfos.ends;
    let profits = addLockTosInfos.profits;
    console.log('len',len)
    console.log('currentTime',currentTime)
    // console.log('accounts',accounts)
    // console.log('amounts',amounts)
    // console.log('ends',ends)
    // console.log('profits',profits)

    let batchSize = 100; //360
    let loopCount = Math.floor(len/batchSize)+1;

    let maxRound = loopCount -1;
    console.log('loopCount',loopCount, 'maxRound',maxRound, 'round', round);
    let c = 0;
    //for(c = 0; c < loopCount; c++){
    if(round <= maxRound){
        c = round;
        let start = c * batchSize;
        let end = start + batchSize;
        if(end > addLockTosInfos.ids.length)  end = addLockTosInfos.ids.length;

        console.log('start',start)
        console.log('end',end)


        let idList = [];
        let accountList = [];
        let amountList = [];
        // let profitList = [];
        let endList = [];

        try{
            if(!ids) return;
            if(!accounts) return;
            if(!amounts) return;
            if(!ends) return;
            if(!profits) return;

            for(let i = start; i < end; i++){
                idList.push(ethers.BigNumber.from(ids[i]));
                accountList.push(accounts[i]);
                amountList.push(ethers.BigNumber.from(amounts[i]));
                endList.push(ethers.BigNumber.from(ends[i]));
                // profitList.push(ethers.BigNumber.from(profits[i]));
            }
            console.log(c, 'idList',idList)
            // console.log(c, 'accountList',accountList)
            // console.log(c, 'amountList',amountList)
            // console.log(c, 'endList',endList)

            let tx = await stakingV2.connect(admin).syncSTOS(
                        accountList,
                        amountList,
                        endList,
                        idList
                    );

            console.log(c, 'migrateStakeAndeLockTOS end ',start, end, tx.hash)

            await tx.wait();
            //await timeout(5);

        }catch(error){
          console.log('migrateStakeAndeLockTOS error',c, start, end, error);
          //break;
        }
      }
 }




 const compareStakeAnfLockTOSAmounts = async (stakeAddress, lockTosAddress, blockNumber) => {
    const [admin] = await ethers.getSigners();

    const addLockTosInfos = JSON.parse(await fs.readFileSync("./data/stos-ids-"+blockNumber+".json"));
    const StakingV2ABI = require("../../abis/StakingV2.json").abi;
    const lockTosABI = require("../../abis/LockTOSv2Logic0.json").abi;

    const stakingV2 = new ethers.Contract(
        stakeAddress,
        StakingV2ABI,
        ethers.provider
      );

    const lockTOS = new ethers.Contract(
        lockTosAddress,
        lockTosABI,
        ethers.provider
      );

    if(addLockTosInfos.ids == null) return;

    let len = addLockTosInfos.ids.length;
    let currentTime = addLockTosInfos.timestamp;
    let ids = addLockTosInfos.ids;
    let accounts = addLockTosInfos.accounts;
    let amounts = addLockTosInfos.amounts;
    let ends = addLockTosInfos.ends;
    let profits = addLockTosInfos.profits;
    console.log('len',len)

    let start = 0;
    let end = addLockTosInfos.ids.length;

    console.log('start',start)
    console.log('end',end)

    let idList = [];
    let accountList = [];
    let amountList = [];
    let profitList = [];

    try{
        if(!ids) return;
        if(!accounts) return;
        if(!amounts) return;
        if(!ends) return;
        if(!profits) return;

        for(let i = start; i < end; i++){

            let id = ethers.BigNumber.from(ids[i]);
            let amount = ethers.BigNumber.from(amounts[i]);
            let profit = profits[i];
            let lockTosInfo = await lockTOS.locksInfo(id);
            let stakeId = await stakingV2.lockTOSId(id);
            let stakeInfo = await stakingV2.allStakings(stakeId);

            if(profit != "0"){
                if(info.amount.gt(amount)) {
                    console.log('ok ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString() );
                } else {
                    console.log('wrong ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString());
                }
            } else {
                if(info.amount.eq(amount)) {
                    console.log('ok ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString() );
                } else {
                    console.log('wrong ', id.toString(), 'original ', amount.toString(), ',profit',profit, 'increase',info.amount.toString());
                }
            }
        }

    }catch(error){
        console.log('compareStakeAnfLockTOSAmounts error', start, end, error);
    }

}

function timeout(sec) {
    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    });
}

module.exports = {
    getLockTosHolderList,
    getStosBalances,
    getlockIds,
    increaseLockTOSAmounts,
    compareLockTOSAmounts,
    migrateStakeAndeLockTOS,
    compareStakeAnfLockTOSAmounts
}