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
const { AMM_PRIVATE_KEY, AMM_PROVIDER_URL, REACTOR_CONTRACT_ADDRESS, } = process.env;
const provider = new fuels_1.Provider(AMM_PROVIDER_URL);
const wallet = fuels_1.Wallet.fromPrivateKey(AMM_PRIVATE_KEY, provider);
async function runSwapUSDCIn() {
    const baseToken = '0x0e992cf93b0608b91810c8019b1efec87581e27c26f85a356ffe7b307c5a8611'; // USDC
    const quoteToken = '0x20e155534c6351321855c44ef045a11cee96616c507278ed407b0946dbd68995'; // FUEL
    const feeTier = reactor_sdk_ts_1.FeeAmount.MEDIUM;
    const poolId = [baseToken, quoteToken, feeTier];
    let tokenIn = baseToken;
    let tokenOut = quoteToken;
    let usdcDecimals = 6;
    let amountIn = 1000 * 10 ** usdcDecimals;
    let minAmountOut = 0;
    let swapRes = await (0, reactor_sdk_ts_1.swapExactIn)(REACTOR_CONTRACT_ADDRESS, wallet, poolId, tokenIn, tokenOut, amountIn, minAmountOut);
    console.log(`USDC swap exact in success: ${swapRes.isStatusSuccess}`);
}
async function runSwapFUELIn() {
    const baseToken = '0x0e992cf93b0608b91810c8019b1efec87581e27c26f85a356ffe7b307c5a8611'; // USDC
    const quoteToken = '0x20e155534c6351321855c44ef045a11cee96616c507278ed407b0946dbd68995'; // FUEL
    const feeTier = reactor_sdk_ts_1.FeeAmount.MEDIUM;
    const poolId = [baseToken, quoteToken, feeTier];
    let tokenIn = quoteToken;
    let tokenOut = baseToken;
    let fuelDecimals = 9;
    let amountIn = 180000 * 10 ** fuelDecimals;
    let minAmountOut = 0;
    let swapRes = await (0, reactor_sdk_ts_1.swapExactIn)(REACTOR_CONTRACT_ADDRESS, wallet, poolId, tokenIn, tokenOut, amountIn, minAmountOut);
    console.log(`FUEL swap exact in success: ${swapRes.isStatusSuccess}`);
}
runSwapUSDCIn();
runSwapFUELIn();
//# sourceMappingURL=runSwaps.js.map