import * as dotenv from 'dotenv';
import { Account, BigNumberish, Provider, Wallet } from 'fuels';
import { FeeAmount, swapExactIn } from 'reactor-sdk-ts';

dotenv.config();

const {
    AMM_PRIVATE_KEY,
    AMM_PROVIDER_URL,
    REACTOR_CONTRACT_ADDRESS,
    POOL_BASE_TOKEN,
    POOL_QUOTE_TOKEN,
    BASE_TOKEN_IN_SWAP_AMOUNT,
    QUOTE_TOKEN_IN_SWAP_AMOUNT,
} = process.env;

const provider = new Provider(AMM_PROVIDER_URL!!);
const wallet: Account = Wallet.fromPrivateKey(AMM_PRIVATE_KEY!!, provider);

async function runSwapBaseTokenIn() {
    const baseToken = POOL_BASE_TOKEN!!
    const quoteToken = POOL_QUOTE_TOKEN!!
    const feeTier = FeeAmount.LOW
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier]

    let tokenIn = baseToken
    let tokenOut = quoteToken
    let amountIn = BASE_TOKEN_IN_SWAP_AMOUNT!!
    let minAmountOut = 0
    let swapRes = await swapExactIn(
        REACTOR_CONTRACT_ADDRESS!!,
        wallet,
        poolId,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut
    );
    console.log(`swap base exact in success: ${swapRes.isStatusSuccess}`)
}

async function runSwapQuoteTokenIn() {
    const baseToken = POOL_BASE_TOKEN!!
    const quoteToken = POOL_QUOTE_TOKEN!!
    const feeTier = FeeAmount.LOW
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier]

    let tokenIn = quoteToken
    let tokenOut = baseToken
    let amountIn = QUOTE_TOKEN_IN_SWAP_AMOUNT!!
    let minAmountOut = 0
    let swapRes = await swapExactIn(
        REACTOR_CONTRACT_ADDRESS!!,
        wallet,
        poolId,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut
    );
    console.log(`swap quote exact in success: ${swapRes.isStatusSuccess}`)
}

async function runSwaps() {
    await runSwapBaseTokenIn()
    await runSwapQuoteTokenIn()
}

runSwaps()
