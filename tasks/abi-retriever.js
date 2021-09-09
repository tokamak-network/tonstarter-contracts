const fs = require("fs");

task("write-contracts", "Deploy TOS").setAction(async () => {
  const lockTOSArtifact = await hre.artifacts.readArtifact("LockTOS");
  fs.writeFileSync(
    "./abis/LockTOS_ABI.json",
    JSON.stringify(lockTOSArtifact.abi, null, 2)
  );
  fs.writeFileSync("./abis/LockTOS_BYTECODE.json", lockTOSArtifact.bytecode);
  console.log({ lockTOSArtifact });

  const lockTOSProxyArtifact = await hre.artifacts.readArtifact("LockTOSProxy");
  fs.writeFileSync(
    "./abis/LockTOSProxy_ABI.json",
    JSON.stringify(lockTOSProxyArtifact.abi, null, 2)
  );
  fs.writeFileSync(
    "./abis/LockTOSProxy_BYTECODE.json",
    lockTOSProxyArtifact.bytecode
  );
});
