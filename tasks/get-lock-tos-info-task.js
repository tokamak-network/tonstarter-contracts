task("get-lock-tos-balances", "Deploy TOS").setAction(async () => {
    const lockTOSAddress = "0x69b4a202fa4039b42ab23adb725aa7b1e9eebd79";
    const lockTOS = await ethers.getContractAt("LockTOS", lockTOSAddress);

    const activeHolders = await lockTOS.activeHolders();
    console.log({ activeHolders });
    const holdersWithBalance = [];
    for (const holder of activeHolders) {
        const balanceNow = (await lockTOS.balanceOf(holder));
        // console.log(holder, ethers.utils.formatEther(balanceNow));
        holdersWithBalance.push({
            holder: holder,
            balance: balanceNow
        });
    }
    holdersWithBalance.sort((a, b) => b.balance - a.balance);

    for (const { holder, balance } of holdersWithBalance) {
        let tier = "No Tier";
        const balanceInt = parseInt(ethers.utils.formatEther(balance));
        // console.log({ balanceInt });
        if (balanceInt < 600) {
            tier = "No Tier";
        } else if (balanceInt < 1200) {
            tier = "Tier 1";
        } else if (balanceInt < 2200) {
            tier = "Tier 2";
        } else if (balanceInt < 6000) {
            tier = "Tier 3";
        } else {
            tier = "Tier 4";
        }
        console.log(`${holder}\t${parseFloat(ethers.utils.formatEther(balance)).toFixed(3)}\t${tier}`);
    }
});

task("get-lock-tos-snapshot", "Snapshot").setAction(async () => {
    const lockTOSAddress = "0x69b4a202fa4039b42ab23adb725aa7b1e9eebd79";
    const lockTOS = await ethers.getContractAt("LockTOS", lockTOSAddress);
    const DOCTokenAddress = "0x0e498afce58dE8651B983F136256fA3b8d9703bc";
    const DOCToken = await ethers.getContractAt("LockTOS", DOCTokenAddress);

    const totalSupply = parseFloat(ethers.utils.formatEther(await lockTOS.totalSupply())).toFixed(2);
    console.log({ totalSupply });

    const activeHolders = await lockTOS.activeHolders();

    const holdersWithBalance = [];
    for (const holder of activeHolders) {
        const balanceNow = parseFloat(ethers.utils.formatEther(await lockTOS.balanceOf(holder)));
        holdersWithBalance.push({
            holder: holder,
            balance: balanceNow
        });
    }

    holdersWithBalance.sort((a, b) => b.balance - a.balance);
    const date = '2021.11.05';
    for (const { holder, balance } of holdersWithBalance) {
        const rat = parseFloat(balance / totalSupply);
        const percentage = parseFloat((rat) * 100).toFixed(4);
        const doc = rat * 62500;
        console.log(`${date}\t${holder}\t${balance.toFixed(4)}\t${percentage}%\t${doc.toFixed(4)}`);
    }
});

const balanceOfABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
]

task("get-doc-tiers-sold", "Deploy TOS").setAction(async () => {
    const lockTOSAddress = "0x69b4a202fa4039b42ab23adb725aa7b1e9eebd79";
    const lockTOS = await ethers.getContractAt("LockTOS", lockTOSAddress);
    const DOCTokenAddress = "0x0e498afce58dE8651B983F136256fA3b8d9703bc";
    const DOCToken = await ethers.getContractAt("LockTOS", DOCTokenAddress);
    console.log({ DOCToken });
    const b = await DOCToken.balanceOf(DOCTokenAddress);
    const activeHolders = await lockTOS.activeHolders();
    const holdersWithBalance = [];
    for (const holder of activeHolders) {
        const balanceNow = (await lockTOS.balanceOf(holder));
        // console.log(holder, ethers.utils.formatEther(balanceNow));
        holdersWithBalance.push({
            holder: holder,
            balance: balanceNow
        });
    }
    holdersWithBalance.sort((a, b) => b.balance - a.balance);
    const tiersSoldAmount = [0, 0, 0, 0, 0];

    for (const { holder, balance } of holdersWithBalance) {
        let tier = "No Tier";
        const balanceInt = parseInt(ethers.utils.formatEther(balance));
        const docBalance = parseInt(await DOCToken.balanceOf(holder));
        console.log({ docBalance });
        // console.log({ balanceInt });
        if (balanceInt < 600) {
            tier = "No Tier";
            tiersSoldAmount[0] += docBalance;
        } else if (balanceInt < 1200) {
            tier = "Tier 1";
            tiersSoldAmount[1] += docBalance;
        } else if (balanceInt < 2200) {
            tier = "Tier 2";
            tiersSoldAmount[2] += docBalance;
        } else if (balanceInt < 6000) {
            tier = "Tier 3";
            tiersSoldAmount[3] += docBalance;
        } else {
            tier = "Tier 4";
            tiersSoldAmount[4] += docBalance;
        }
        // console.log(holder, "\t", parseFloat(ethers.utils.formatEther(balance)).toFixed(3), "\t", tier);
    }
    console.log("No Tier Sold:\t", tiersSoldAmount[0]);
    console.log("Tier 1 Sold:\t", tiersSoldAmount[1]);
    console.log("Tier 2 Sold:\t", tiersSoldAmount[2]);
    console.log("Tier 3 Sold:\t", tiersSoldAmount[3]);
    console.log("Tier 4 Sold:\t", tiersSoldAmount[4]);
    
});
const PublicSaleABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "totalWhitelists",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"        
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_index",
                "type": "uint256"
            },
        ],
        "name": "whitelists",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]
task("get-whitelists", "Deploy TOS").setAction(async () => {
    const address = "0xbef737d725993847c345647eba096500fdae71c6";
    const publicSale = new ethers.Contract(address, PublicSaleABI, ethers.provider);
    const count = parseInt(await publicSale.totalWhitelists());
    console.log({ count });
    for (let i = 0; i < count; ++i) {
        const addr = await publicSale.whitelists(i);
        console.log(addr);
    }
});

task("get-stos-lost", "Deploy TOS").setAction(async () => {
    const lockTOSAddress = "0x69b4a202fa4039b42ab23adb725aa7b1e9eebd79";
    const lockTOS = await ethers.getContractAt("LockTOS", lockTOSAddress);

    const activeHolders = await lockTOS.activeHolders();
    const holdersWithBalance = [];
    const startDate = Math.floor((new Date(2021, 8, 18)).getTime()/ 1000); // 17th September
    const endDate = Math.floor((new Date(2021, 9, 21)).getTime() / 1000); // 20th October
    for (const holder of activeHolders) {
        let change = 0;
        let countDays = 0;
        let lastBalance = null;
        for(let loopTime = startDate; loopTime < endDate; loopTime += 86400) {
            const balance = parseInt(
                ethers.utils.formatEther(await lockTOS.balanceOfAt(holder, loopTime))
            );
            if (lastBalance != null) {
                change += Math.min(0, balance - lastBalance);
            }

            lastBalance = balance;
            countDays += 1;
        }
        const average = parseFloat(change / countDays);
        const decrease = parseFloat(average).toFixed(2); 
        console.log(`${holder}\t${change}\t${decrease}\t${countDays}`);
        holdersWithBalance.push({
            holder,
            change,
            countDays,
            decrease,
        });
    }

    holdersWithBalance.sort((a, b) => b.decrease - a.decrease);

    console.log(`Address\Change\tCount days\tAverage`);
    for (const { holder, change, decrease, countDays } of holdersWithBalance) {
        console.log(`${holder}\t${change}\t${countDays}\t${decrease}`);
    }
});