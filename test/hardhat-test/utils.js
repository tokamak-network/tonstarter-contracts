async function directDeploy(contractName) {
  [deployer] = await ethers.getSigners();
  const contract = await ethers.getContractFactory(contractName);
  const instance = await contract.connect(deployer).deploy();
  return await instance.deployed();
}

async function deployPlasmaContracts(checkDeploy) {
  const obj = {};
  if (checkDeploy.TON) {
    const TONContract = await ethers.getContractFactory("TON");
    obj.TON = await TONContract.deploy();
    await obj.TON.deployed();
  }

  if (checkDeploy.WTON) {
    const WTONContract = await ethers.getContractFactory("WTON");
    obj.WTON = await WTONContract.deploy();
    await obj.WTON.deployed();
  }

  if (checkDeploy.Layer2Registry) {
    const WTONContract = await ethers.getContractFactory("WTON");
    obj.WTON = await WTONContract.deploy();
    await obj.WTON.deployed();
  }

  return obj;
}

async function deployPlasmaContracts(arr) {
}


module.exports = { deployContracts };