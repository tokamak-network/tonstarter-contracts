"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePoolAddress = exports.POOL_BYTECODE_HASH = void 0;
var UniswapV3Pool_json_1 = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
var ethers_1 = require("ethers");
exports.POOL_BYTECODE_HASH = ethers_1.utils.keccak256(UniswapV3Pool_json_1.bytecode);
function computePoolAddress(factoryAddress, _a, fee) {
    //console.log('_a',_a);
    var tokenA = _a[0], tokenB = _a[1];
    var _b = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA], token0 = _b[0], token1 = _b[1];
    var constructorArgumentsEncoded = ethers_1.utils.defaultAbiCoder.encode(['address', 'address', 'uint24'], [token0, token1, fee]);
    var create2Inputs = [
        '0xff',
        factoryAddress,
        // salt
        ethers_1.utils.keccak256(constructorArgumentsEncoded),
        // init code hash
        exports.POOL_BYTECODE_HASH,
    ];
    var sanitizedInputs = "0x" + create2Inputs.map(function (i) { return i.slice(2); }).join('');
    return ethers_1.utils.getAddress("0x" + ethers_1.utils.keccak256(sanitizedInputs).slice(-40));
}
exports.computePoolAddress = computePoolAddress;
