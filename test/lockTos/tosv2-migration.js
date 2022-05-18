const fs = require('fs');

const getStosHolderList = async (lockTosAddress) => {
    const LockTOSABI = JSON.parse(await fs.readFileSync("./abi/LockTOS_ABI.json")).abi;
    const lockTOS = new ethers.Contract(
        lockTosAddress,
        LockTOSABI,
        ethers.provider
    );

    let stosHolders = await lockTOS.allHolders();
    console.log('stosHolders',stosHolders);

    await fs.writeFileSync("./data/stos-holders.json", JSON.stringify(stosHolders));
    return stosHolders;
}
