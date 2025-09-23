import * as dotenv from 'dotenv';
import { Account, BigNumberish, Provider, Wallet } from 'fuels';
import { FeeAmount, swapExactIn } from 'reactor-sdk-ts';

dotenv.config();

const {
    AMM_PRIVATE_KEY,
    AMM_PROVIDER_URL,
    REACTOR_CONTRACT_ADDRESS,
} = process.env;

const provider = new Provider(AMM_PROVIDER_URL!!);
const wallet: Account = Wallet.fromPrivateKey(AMM_PRIVATE_KEY!!, provider);

async function runSwapUSDCIn() {
    const baseToken = '0x0e992cf93b0608b91810c8019b1efec87581e27c26f85a356ffe7b307c5a8611' // USDC
    const quoteToken = '0x20e155534c6351321855c44ef045a11cee96616c507278ed407b0946dbd68995' // FUEL
    const feeTier = FeeAmount.MEDIUM
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier]

    let tokenIn = baseToken
    let tokenOut = quoteToken
    let usdcDecimals = 6
    let amountIn = 1000 * 10 ** usdcDecimals
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
    console.log(`USDC swap exact in success: ${swapRes.isStatusSuccess}`)
}

async function runSwapFUELIn() {
    const baseToken = '0x0e992cf93b0608b91810c8019b1efec87581e27c26f85a356ffe7b307c5a8611' // USDC
    const quoteToken = '0x20e155534c6351321855c44ef045a11cee96616c507278ed407b0946dbd68995' // FUEL
    const feeTier = FeeAmount.MEDIUM
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier]

    let tokenIn = quoteToken
    let tokenOut = baseToken
    let fuelDecimals = 9
    let amountIn = 180000 * 10 ** fuelDecimals
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
    console.log(`FUEL swap exact in success: ${swapRes.isStatusSuccess}`)
}

runSwapUSDCIn()
runSwapFUELIn()
