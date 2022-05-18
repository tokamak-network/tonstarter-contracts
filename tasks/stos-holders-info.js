const fs = require('fs');
// const {
//   getUpdateTONStakedAmount,
//   getUpdateStakersList,
//   getStakersList,
//   getLayer2List,
//   getTONStakedAmount,
//   erc20RecorderMint,
//   concatStakers,
//   getStakersListOfLayers,
//   getStakersListOfLayersChanged,
//   getAutocoinageData,
//   updateAutocoinageData,
//   getTotalSupplyLayer2,
//   getBalanceLayer2Account,
//   syncAutocoinageData,
//   getTotalSupplyLayer2WithAutyoCoinageSnapshot,
//   getBalanceLayer2AccountWithAutyoCoinageSnapshot,
//   viewAutoCoinageSnapshotAddress
// } = require("../test/helpers/ton-stakers");

task("get-stos-holder-list", "Retrieve sTos holder list into a file")
    .addParam("lockTosAddress", "LockTOS Address")
    .setAction(async ({ lockTosAddress }) => {
      await getSTOSHolderList(lockTosAddress);
    })

