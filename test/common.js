const { web3 } = require("@openzeppelin/test-environment");

const PERMIT_TYPEHASH =
  "0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9";
const signatureValidTime = 60 * 2;
async function getSignature(_private, owner, spender, value, deadline) {
  const _data = web3.utils.soliditySha3(
    { t: "bytes32", v: PERMIT_TYPEHASH },
    { t: "address", v: owner },
    { t: "address", v: spender },
    { t: "uint256", v: value },
    { t: "uint256", v: deadline }
  );
  const signTx = await web3.eth.accounts.sign(_data, _private);
  return signTx.signature;
}

function timeout(sec) {
  return new Promise((resolve) => {
    setTimeout(resolve, sec * 1000);
  });
}

module.exports = {
  getSignature,
  signatureValidTime,
  timeout,
};