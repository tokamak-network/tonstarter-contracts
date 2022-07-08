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



const applyStosBalances = async (lockTosAddress, blockNumber) => {

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

module.exports = {
    getLockTosHolderList,
    getStosBalances,
    applyStosBalances,
    applyStosBalances
}