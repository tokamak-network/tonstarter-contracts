const { time } = require("@openzeppelin/test-helpers");
const MAXTIME = 94608000;

const name = "TONStarter";
const symbol = "TOS";
const version = "1.0";

const findClosestPoint = (history, timestamp) => {
  if (history.length === 0) {
    return null;
  }
  let left = 0;
  let right = history.length;
  while (left + 1 < right) {
    const mid = Math.floor((left + right) / 2);
    if (history[mid].timestamp <= timestamp) left = mid;
    else right = mid;
  }
  return history[left];
};

const calculateBalanceOfLock = async ({ lockId, timestamp, lockTOS }) => {
  const userHistory = await lockTOS.pointHistoryOf(lockId);

  const foundPoint = await findClosestPoint(userHistory, timestamp);

  if (foundPoint == null) return 0;
  const currentBias = foundPoint.slope * (timestamp - foundPoint.timestamp);

  const MULTIPLIER = Math.pow(10, 18);
  return Math.floor(
    (foundPoint.bias > currentBias ? foundPoint.bias - currentBias : 0) /
      MULTIPLIER
  );
};

const calculateBalanceOfUser = async ({ user, timestamp, lockTOS }) => {
  const locks = await lockTOS.locksOf(user.address);

  let accBalance = 0;
  for (const lockId of locks) {
    let val = await calculateBalanceOfLock({  lockId, timestamp , lockTOS });

    accBalance += val;
    //accBalance += await calculateBalanceOfLock({ lockTOS, lockId, timestamp });
  }
  return accBalance;
};

const approve = async ({ lockTOS, tos, user, amount }) => {
  await (await tos.connect(user).approve(lockTOS.address, amount)).wait();
};

const createLock = async ({ lockTOS, user, amount, unlockTime }) => {
  await (await lockTOS.connect(user).createLock(amount, unlockTime)).wait();
};

const createLockWithPermit = async ({
  user,
  amount,
  unlockWeeks,
  tos,
  lockTOS,
}) => {
  const nonce = parseInt(await tos.nonces(user.address));
  const deadline = parseInt(await time.latest()) + 1000;
  const rawSignature = await user._signTypedData(
    {
      chainId: parseInt(await network.provider.send("eth_chainId")),
      name: name,
      version: version,
      verifyingContract: tos.address,
    },
    {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    {
      owner: user.address,
      spender: lockTOS.address,
      value: amount,
      nonce,
      deadline,
    }
  );
  const signature = ethers.utils.splitSignature(rawSignature);
  await (
    await lockTOS
      .connect(user)
      .createLockWithPermit(
        amount,
        unlockWeeks,
        deadline,
        signature.v,
        signature.r,
        signature.s
      )
  ).wait();

  const userLocks = await lockTOS.connect(user).locksOf(user.address);
  if (userLocks.length === 0) {
    return null;
  }
  const lockId = userLocks[userLocks.length - 1];
  return lockId;
};

module.exports = {
  calculateBalanceOfUser,
  calculateBalanceOfLock,
  createLockWithPermit,
};
