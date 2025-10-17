import cors from 'cors';
import express from 'express';

import * as dotenv from 'dotenv';
import { Account, BigNumberish, Provider, Wallet } from 'fuels';
import { FeeAmount, swapExactIn } from 'reactor-sdk-ts';
import { Bot } from 'grammy';
import Decimal from 'decimal.js';

dotenv.config();

const {
    AMM_PRIVATE_KEY,
    AMM_PROVIDER_URL,
    REACTOR_CONTRACT_ADDRESS,
    POOL_BASE_TOKEN,
    POOL_QUOTE_TOKEN,
    BASE_TOKEN_IN_SWAP_AMOUNT,
    QUOTE_TOKEN_IN_SWAP_AMOUNT,
    TG_TOKEN,
} = process.env;

const provider = new Provider(AMM_PROVIDER_URL!!);
const wallet: Account = Wallet.fromPrivateKey(AMM_PRIVATE_KEY!!, provider);
const ETH_ASSET = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

async function runSwapBaseTokenIn(wallet: Account) {
    const baseToken = POOL_BASE_TOKEN!!
    const quoteToken = POOL_QUOTE_TOKEN!!
    const feeTier = FeeAmount.LOW
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier]

    let tokenIn = baseToken
    let tokenOut = quoteToken
    let balance = await wallet.getBalance(baseToken);
    let minAmountOut = 0
    let swapRes = await swapExactIn(
        REACTOR_CONTRACT_ADDRESS!!,
        wallet,
        poolId,
        tokenIn,
        tokenOut,
        balance,
        minAmountOut
    );
    console.log(`swap base exact in success: ${swapRes.isStatusSuccess}`)

    const [baseTokenBalance, quoteTokenBalance, ethBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN!!),
        wallet.getBalance(POOL_QUOTE_TOKEN!!),
        wallet.getBalance(ETH_ASSET!!),
    ]);
    bot.api.sendMessage('@reactor_bot_status', `(${wallet.address.b256Address}): Swaps FUEL->USDC completed! FUEL ${Decimal(baseTokenBalance.toString()).div(10 ** 9).toString()} USDC ${Decimal(quoteTokenBalance.toString()).div(10 ** 6).toString()} ETH ${Decimal(ethBalance.toString()).div(10 ** 9).toString()}`);
}

async function runSwapQuoteTokenIn(wallet: Account) {
    const baseToken = POOL_BASE_TOKEN!!
    const quoteToken = POOL_QUOTE_TOKEN!!
    const feeTier = FeeAmount.LOW
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier]

    let tokenIn = quoteToken
    let tokenOut = baseToken
    let balance = await wallet.getBalance(quoteToken);
    let minAmountOut = 0
    let swapRes = await swapExactIn(
        REACTOR_CONTRACT_ADDRESS!!,
        wallet,
        poolId,
        tokenIn,
        tokenOut,
        balance,
        minAmountOut
    );
    console.log(`swap quote exact in success: ${swapRes.isStatusSuccess}`)

    const [baseTokenBalance, quoteTokenBalance, ethBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN!!),
        wallet.getBalance(POOL_QUOTE_TOKEN!!),
        wallet.getBalance(ETH_ASSET!!),
    ]);
    bot.api.sendMessage('@reactor_bot_status', `(${wallet.address.b256Address}): Swaps USDC->FUEL completed! FUEL ${Decimal(baseTokenBalance.toString()).div(10 ** 9).toString()} USDC ${Decimal(quoteTokenBalance.toString()).div(10 ** 6).toString()} ETH ${Decimal(ethBalance.toString()).div(10 ** 9).toString()}`);

}

async function runSwaps(wallet: Account) {
    let [baseTokenBalance, quoteTokenBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN!!),
        wallet.getBalance(POOL_QUOTE_TOKEN!!),
    ]);

    if (baseTokenBalance.gt(0)) {
        await runSwapBaseTokenIn(wallet)
        await runSwapQuoteTokenIn(wallet)
    } else {
        await runSwapQuoteTokenIn(wallet)
        await runSwapBaseTokenIn(wallet)
    }
}

const app = express();

app.use(cors());

app.use(express.json());

const bot = new Bot(TG_TOKEN!!);

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

    for (const wallet of wallets) {
        setInterval(async () => {
            try {   
                await runSwaps(Wallet.fromPrivateKey(wallet, provider));
            } catch (error) {
                console.error(error);
            }
        }, Number(process.env.SWAP_INTERVAL || 1000));
    }
}).on('error', (err) => {
    console.error(err);
});

app.get('/', (req, res) => {
    res.end('ok');
});