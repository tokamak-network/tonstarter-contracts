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
        console.log(holder, "\t", parseFloat(ethers.utils.formatEther(balance)).toFixed(3), "\t", tier);
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

task("get-stos-lost", "Deploy TOS").setAction(async () => {
    const lockTOSAddress = "0x69b4a202fa4039b42ab23adb725aa7b1e9eebd79";
    const lockTOS = await ethers.getContractAt("LockTOS", lockTOSAddress);

    const activeHolders = await lockTOS.activeHolders();
    const holdersWithBalance = [];
    const startDate = Math.floor((new Date(2021, 8, 18)).getTime()/ 1000); // 17th September
    const endDate = Math.floor((new Date(2021, 9, 21)).getTime() / 1000); // 20th October
    for (const holder of activeHolders) {
        const startBalance = parseInt(
            ethers.utils.formatEther(await lockTOS.balanceOfAt(holder, startDate))
        );
        const endBalance = parseInt(
            ethers.utils.formatEther(await lockTOS.balanceOfAt(holder, endDate))
        );
        const balance = parseInt(
            ethers.utils.formatEther(await lockTOS.balanceOf(holder))
        );
        
        // console.log({ holder, startDate, endDate, startBalance, endBalance });
        
        // console.log(holder, ethers.utils.formatEther(balanceNow));
        holdersWithBalance.push({
            holder: holder,
            startBalance,
            endBalance,
            lost: endBalance - startBalance,
            balance 
        });
    }

    holdersWithBalance.sort((a, b) => b.lost - a.lost);

    console.log(`Address\tBalance\tStart\tEnd\tLost`);
    for (const { holder, startBalance, endBalance, lost, balance } of holdersWithBalance) {
        console.log(`${holder}\t${balance}\t${startBalance}\t${endBalance}\t${lost}`);
    }
});