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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const fuels_1 = require("fuels");
const reactor_sdk_ts_1 = require("reactor-sdk-ts");
const grammy_1 = require("grammy");
const decimal_js_1 = __importDefault(require("decimal.js"));
dotenv.config();
const { AMM_PRIVATE_KEY, AMM_PROVIDER_URL, REACTOR_CONTRACT_ADDRESS, POOL_BASE_TOKEN, POOL_QUOTE_TOKEN, BASE_TOKEN_IN_SWAP_AMOUNT, QUOTE_TOKEN_IN_SWAP_AMOUNT, TG_TOKEN, FEE_TIER, } = process.env;
const provider = new fuels_1.Provider(AMM_PROVIDER_URL);
// const wallet: Account = Wallet.fromPrivateKey(AMM_PRIVATE_KEY!!, provider);
const ETH_ASSET = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';
async function sendMessage(message) {
    try {
        await bot.api.sendMessage('@reactor_bot_status', message);
    }
    catch (error) {
        // console.error(error);
        setTimeout(async () => {
            await sendMessage(message);
        }, error.parameters.retry_after * 1000);
    }
}
async function runSwapBaseTokenIn(wallet) {
    const baseToken = POOL_BASE_TOKEN;
    const quoteToken = POOL_QUOTE_TOKEN;
    const feeTier = Number(FEE_TIER);
    const poolId = [baseToken, quoteToken, feeTier];
    let tokenIn = baseToken;
    let tokenOut = quoteToken;
    let balance = await wallet.getBalance(baseToken);
    let minAmountOut = 0;
    let swapRes = await (0, reactor_sdk_ts_1.swapExactIn)(REACTOR_CONTRACT_ADDRESS, wallet, poolId, tokenIn, tokenOut, balance, minAmountOut);
    console.log(`swap base exact in success: ${swapRes.isStatusSuccess}`);
    const [baseTokenBalance, quoteTokenBalance, ethBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN),
        wallet.getBalance(POOL_QUOTE_TOKEN),
        wallet.getBalance(ETH_ASSET),
    ]);
    await sendMessage(`(${wallet.address.b256Address}): Swaps FUEL->USDC completed! FUEL ${(0, decimal_js_1.default)(baseTokenBalance.toString()).div(10 ** 9).toString()} USDC ${(0, decimal_js_1.default)(quoteTokenBalance.toString()).div(10 ** 6).toString()} ETH ${(0, decimal_js_1.default)(ethBalance.toString()).div(10 ** 9).toString()}`);
}
async function runSwapQuoteTokenIn(wallet) {
    const baseToken = POOL_BASE_TOKEN;
    const quoteToken = POOL_QUOTE_TOKEN;
    const feeTier = Number(FEE_TIER);
    const poolId = [baseToken, quoteToken, feeTier];
    let tokenIn = quoteToken;
    let tokenOut = baseToken;
    let balance = await wallet.getBalance(quoteToken);
    let minAmountOut = 0;
    let swapRes = await (0, reactor_sdk_ts_1.swapExactIn)(REACTOR_CONTRACT_ADDRESS, wallet, poolId, tokenIn, tokenOut, balance, minAmountOut);
    console.log(`swap quote exact in success: ${swapRes.isStatusSuccess}`);
    const [baseTokenBalance, quoteTokenBalance, ethBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN),
        wallet.getBalance(POOL_QUOTE_TOKEN),
        wallet.getBalance(ETH_ASSET),
    ]);
    await sendMessage(`(${wallet.address.b256Address}): Swaps USDC->FUEL completed! FUEL ${(0, decimal_js_1.default)(baseTokenBalance.toString()).div(10 ** 9).toString()} USDC ${(0, decimal_js_1.default)(quoteTokenBalance.toString()).div(10 ** 6).toString()} ETH ${(0, decimal_js_1.default)(ethBalance.toString()).div(10 ** 9).toString()}`);
}
async function fetchBalancesRetry(wallet) {
    console.log('RETRY FETCH BALANCES');
    // let [baseTokenBalance, quoteTokenBalance] = [new BN(0), new BN(0)];
    try {
        return await Promise.all([
            wallet.getBalance(POOL_BASE_TOKEN),
            wallet.getBalance(POOL_QUOTE_TOKEN),
        ]);
    }
    catch (error) {
        console.log('RETRY FETCH BALANCES ERROR:', error);
        // return [];
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(0);
            }, 1000);
        });
        return await fetchBalancesRetry(wallet);
    }
}
async function runSwaps(wallet) {
    console.log('FETCHING BALANCES....');
    let [baseTokenBalance, quoteTokenBalance] = [new fuels_1.BN(0), new fuels_1.BN(0)];
    try {
        [baseTokenBalance, quoteTokenBalance] = await Promise.all([
            wallet.getBalance(POOL_BASE_TOKEN),
            wallet.getBalance(POOL_QUOTE_TOKEN),
        ]);
    }
    catch (error) {
        console.log('FETCH BALANCES ERROR:', error);
        [baseTokenBalance, quoteTokenBalance] = await fetchBalancesRetry(wallet);
    }
    if (baseTokenBalance && quoteTokenBalance) {
        console.log('BALANCES: ', baseTokenBalance.toString(), quoteTokenBalance.toString());
        if ((0, decimal_js_1.default)(baseTokenBalance.toString()).div(10 ** 9).gt(3000)) {
            await runSwapBaseTokenIn(wallet);
            await runSwapQuoteTokenIn(wallet);
        }
        else if ((0, decimal_js_1.default)(quoteTokenBalance.toString()).div(10 ** 6).gt(10)) {
            await runSwapQuoteTokenIn(wallet);
            await runSwapBaseTokenIn(wallet);
        }
    }
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const bot = new grammy_1.Bot(TG_TOKEN);
app.listen(Number(process.env.PORT) || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT || 8080}`);
    bot.start({
        onStart: () => {
            console.log('Bot started!');
        }
    });
    const wallets = [
        process.env.AMM_PRIVATE_KEY,
        process.env.AMM_PRIVATE_KEY_1,
        process.env.AMM_PRIVATE_KEY_2,
        process.env.AMM_PRIVATE_KEY_3,
        process.env.AMM_PRIVATE_KEY_4,
        process.env.AMM_PRIVATE_KEY_5,
        process.env.AMM_PRIVATE_KEY_6,
        process.env.AMM_PRIVATE_KEY_7,
        process.env.AMM_PRIVATE_KEY_8,
        process.env.AMM_PRIVATE_KEY_9,
    ].filter(wallet => wallet !== undefined);
    let i = 0;
    for (const wallet of wallets) {
        setInterval(async () => {
            setTimeout(async () => {
                try {
                    await runSwaps(fuels_1.Wallet.fromPrivateKey(wallet, provider));
                    console.log('SWAP SUCCESS');
                }
                catch (error) {
                    console.log('SWAP ERROR: ', error);
                }
            }, i += 200);
        }, Number(process.env.SWAP_INTERVAL || 1000));
    }
}).on('error', (err) => {
    console.error(err);
});
app.get('/', (req, res) => {
    res.end('ok');
});
//# sourceMappingURL=runSwaps.js.map