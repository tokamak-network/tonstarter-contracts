

const routerABI = require('./abis/v3SwapRouterABI.json');
const erc20ABI = require('./abis/erc20ABI.json');

const {
  toBN,
  toWei,
  fromWei,
  keccak256,
  soliditySha3,
  solidityKeccak256,
} = require("web3-utils");

/**
Converting WETH to DAI is OK. However, changing DAI to WETH did not work.
const fromTokenAddress = `0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735`; //  DAI
const toTokenAddress = `0xc778417E063141139Fce010982780140Aa0cD5Ab`; // WETH
*/
const fromTokenAddress = `0xc778417E063141139Fce010982780140Aa0cD5Ab`; //  DAI
const toTokenAddress = `0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735`; // WETH
const routerAddress = `0xe592427a0aece92de3edee1f18e0157c05861564`; // rinkeby Swap Router

(async () => {
	const accounts = await ethers.getSigners();
	const user = accounts[2];
	console.log('user', user.address);

	const DAI = await ethers.getContractAt(erc20ABI, fromTokenAddress);
	let userBalance = await DAI.balanceOf(user.address);
	console.log('userBalance', userBalance.toString());

	await DAI.connect(user).approve(routerAddress, userBalance);

	const expiryDate = Math.floor(Date.now() / 1000) + 900;

	let sendAmount = toWei('0.1','ether');

	const params = {
		tokenIn: fromTokenAddress,
		tokenOut: toTokenAddress,
		fee: 500,
		recipient: user.address ,
		deadline: expiryDate,
		amountIn: sendAmount,
		amountOutMinimum: 0,
		sqrtPriceLimitX96: 0,
  	};

	const Router = await ethers.getContractAt(routerABI, routerAddress);

	// let gasValue = await Router.estimateGas.exactInputSingle(params);
	// console.log('gasValue ', gasValue);
	await Router.connect(user).exactInputSingle(params); //gas: 238989
	console.log('exactInputSingle done');
})();