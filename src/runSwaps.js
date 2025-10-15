"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const fuels_1 = require("fuels");
const reactor_sdk_ts_1 = require("reactor-sdk-ts");
dotenv.config();
const { AMM_PRIVATE_KEY, AMM_PROVIDER_URL, REACTOR_CONTRACT_ADDRESS, POOL_BASE_TOKEN, POOL_QUOTE_TOKEN, BASE_TOKEN_IN_SWAP_AMOUNT, QUOTE_TOKEN_IN_SWAP_AMOUNT, } = process.env;
const provider = new fuels_1.Provider(AMM_PROVIDER_URL);
const wallet = fuels_1.Wallet.fromPrivateKey(AMM_PRIVATE_KEY, provider);
async function runSwapBaseTokenIn() {
    const baseToken = POOL_BASE_TOKEN;
    const quoteToken = POOL_QUOTE_TOKEN;
    const feeTier = reactor_sdk_ts_1.FeeAmount.LOW;
    const poolId = [baseToken, quoteToken, feeTier];
    let tokenIn = baseToken;
    let tokenOut = quoteToken;
    let amountIn = BASE_TOKEN_IN_SWAP_AMOUNT;
    let minAmountOut = 0;
    let swapRes = await (0, reactor_sdk_ts_1.swapExactIn)(REACTOR_CONTRACT_ADDRESS, wallet, poolId, tokenIn, tokenOut, amountIn, minAmountOut);
    console.log(`swap base exact in success: ${swapRes.isStatusSuccess}`);
}
async function runSwapQuoteTokenIn() {
    const baseToken = POOL_BASE_TOKEN;
    const quoteToken = POOL_QUOTE_TOKEN;
    const feeTier = reactor_sdk_ts_1.FeeAmount.LOW;
    const poolId = [baseToken, quoteToken, feeTier];
    let tokenIn = quoteToken;
    let tokenOut = baseToken;
    let amountIn = QUOTE_TOKEN_IN_SWAP_AMOUNT;
    let minAmountOut = 0;
    let swapRes = await (0, reactor_sdk_ts_1.swapExactIn)(REACTOR_CONTRACT_ADDRESS, wallet, poolId, tokenIn, tokenOut, amountIn, minAmountOut);
    console.log(`swap quote exact in success: ${swapRes.isStatusSuccess}`);
}
runSwapBaseTokenIn();
runSwapQuoteTokenIn();
//# sourceMappingURL=runSwaps.js.map