import cors from 'cors';
import { createHash } from 'crypto';
import Decimal from 'decimal.js';
import * as dotenv from 'dotenv';
import express from 'express';
import { Account, BigNumberish, BN, Provider, Wallet } from 'fuels';
import { Bot, GrammyError } from 'grammy';
import { swapExactIn } from 'reactor-sdk-ts';

dotenv.config();

const {
    AMM_PRIVATE_KEY,
    AMM_PROVIDER_URL,
    REACTOR_CONTRACT_ADDRESS,
    POOL_BASE_TOKEN,
    POOL_QUOTE_TOKEN,
    TG_TOKEN,
    FEE_TIER,
    STATE_API_KEY,
} = process.env;

const provider = new Provider(AMM_PROVIDER_URL!!);
// const wallet: Account = Wallet.fromPrivateKey(AMM_PRIVATE_KEY!!, provider);
const ETH_ASSET = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

async function sendMessage(message: string) {
    if (!bot) return
    try {
        await bot!!.api.sendMessage('@reactor_bot_status', message);
    } catch (error: unknown) {
        // console.error(error);
        setTimeout(async () => {
            await sendMessage(message);
        }, (error as GrammyError).parameters.retry_after! * 1000);
    }
}

type LastResult = {
    at: string;
    direction: 'BASE_TO_QUOTE' | 'QUOTE_TO_BASE';
    success: boolean;
};

type WalletState = {
    walletIdx: number;
    address?: string;
    intervalMaxMs: number;
    rngSeed: number;
    nextRunAt: number | null;
    lastResult?: LastResult;
};

const walletStates: WalletState[] = [];

async function runSwapBaseTokenIn(wallet: Account): Promise<boolean> {
    const baseToken = POOL_BASE_TOKEN!!;
    const quoteToken = POOL_QUOTE_TOKEN!!;
    const feeTier = Number(FEE_TIER!!);
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier];

    let tokenIn = baseToken;
    let tokenOut = quoteToken;
    let balance = await wallet.getBalance(baseToken);
    let minAmountOut = 0;
    let swapRes = await swapExactIn(
        REACTOR_CONTRACT_ADDRESS!!,
        wallet,
        poolId,
        tokenIn,
        tokenOut,
        balance,
        minAmountOut,
    );
    console.log(`swap base exact in success: ${swapRes.isStatusSuccess}`);

    const [baseTokenBalance, quoteTokenBalance, ethBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN!!),
        wallet.getBalance(POOL_QUOTE_TOKEN!!),
        wallet.getBalance(ETH_ASSET!!),
    ]);
    await sendMessage(
        `(${
            wallet.address.b256Address
        }): Swaps FUEL->USDC completed at ${new Date().toISOString()}! FUEL ${Decimal(
            baseTokenBalance.toString(),
        )
            .div(10 ** 9)
            .toString()} USDC ${Decimal(quoteTokenBalance.toString())
            .div(10 ** 6)
            .toString()} ETH ${Decimal(ethBalance.toString())
            .div(10 ** 9)
            .toString()}`,
    );
    return swapRes.isStatusSuccess;
}

async function runSwapQuoteTokenIn(wallet: Account): Promise<boolean> {
    const baseToken = POOL_BASE_TOKEN!!;
    const quoteToken = POOL_QUOTE_TOKEN!!;
    const feeTier = Number(FEE_TIER!!);
    const poolId: [string, string, BigNumberish] = [baseToken, quoteToken, feeTier];

    let tokenIn = quoteToken;
    let tokenOut = baseToken;
    let balance = await wallet.getBalance(quoteToken);
    let minAmountOut = 0;
    let swapRes = await swapExactIn(
        REACTOR_CONTRACT_ADDRESS!!,
        wallet,
        poolId,
        tokenIn,
        tokenOut,
        balance,
        minAmountOut,
    );
    console.log(`swap quote exact in success: ${swapRes.isStatusSuccess}`);

    const [baseTokenBalance, quoteTokenBalance, ethBalance] = await Promise.all([
        wallet.getBalance(POOL_BASE_TOKEN!!),
        wallet.getBalance(POOL_QUOTE_TOKEN!!),
        wallet.getBalance(ETH_ASSET!!),
    ]);
    await sendMessage(
        `(${
            wallet.address.b256Address
        }): Swaps USDC->FUEL completed at ${new Date().toISOString()}! FUEL ${Decimal(
            baseTokenBalance.toString(),
        )
            .div(10 ** 9)
            .toString()} USDC ${Decimal(quoteTokenBalance.toString())
            .div(10 ** 6)
            .toString()} ETH ${Decimal(ethBalance.toString())
            .div(10 ** 9)
            .toString()}`,
    );
    return swapRes.isStatusSuccess;
}

async function fetchBalancesRetry(wallet: Account) {
    console.log('RETRY FETCH BALANCES');
    // let [baseTokenBalance, quoteTokenBalance] = [new BN(0), new BN(0)];

    try {
        return await Promise.all([
            wallet.getBalance(POOL_BASE_TOKEN!!),
            wallet.getBalance(POOL_QUOTE_TOKEN!!),
        ]);
    } catch (error) {
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

async function runSwaps(wallet: Account, walletIdx: number) {
    console.log('FETCHING BALANCES....');
    let [baseTokenBalance, quoteTokenBalance] = [new BN(0), new BN(0)];
    try {
        [baseTokenBalance, quoteTokenBalance] = await Promise.all([
            wallet.getBalance(POOL_BASE_TOKEN!!),
            wallet.getBalance(POOL_QUOTE_TOKEN!!),
        ]);
    } catch (error) {
        console.log('FETCH BALANCES ERROR:', error);
        [baseTokenBalance, quoteTokenBalance] = await fetchBalancesRetry(wallet);
    }

    if (baseTokenBalance && quoteTokenBalance) {
        console.log('BALANCES: ', baseTokenBalance.toString(), quoteTokenBalance.toString());
        if (
            Decimal(baseTokenBalance.toString())
                .div(10 ** 9)
                .gt(3000)
        ) {
            const res1 = await runSwapBaseTokenIn(wallet);
            walletStates[walletIdx].lastResult = {
                at: new Date().toISOString(),
                direction: 'BASE_TO_QUOTE',
                success: res1,
            };
            const res2 = await runSwapQuoteTokenIn(wallet);
            walletStates[walletIdx].lastResult = {
                at: new Date().toISOString(),
                direction: 'QUOTE_TO_BASE',
                success: res2,
            };
        } else if (
            Decimal(quoteTokenBalance.toString())
                .div(10 ** 6)
                .gt(10)
        ) {
            const res1 = await runSwapQuoteTokenIn(wallet);
            walletStates[walletIdx].lastResult = {
                at: new Date().toISOString(),
                direction: 'QUOTE_TO_BASE',
                success: res1,
            };
            const res2 = await runSwapBaseTokenIn(wallet);
            walletStates[walletIdx].lastResult = {
                at: new Date().toISOString(),
                direction: 'BASE_TO_QUOTE',
                success: res2,
            };
        }
    }
}

const app = express();

app.use(cors());

app.use(express.json());

const bot = TG_TOKEN ? new Bot(TG_TOKEN!!) : null;

app.listen(Number(process.env.PORT) || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT || 8080}`);

    if (bot) {
        bot.start({
            onStart: () => {
                console.log('Bot started!');
            },
        });
    }


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
    ].filter((wallet) => wallet !== undefined);

    const baseIntervalMsEnv = Number(process.env.SWAP_INTERVAL || 10000);
    const maxIntervalMs = Math.max(baseIntervalMsEnv, 2000); // treat as max, enforce >= 2s
    const jitteredDelay = () => {
        const minMs = 2000;
        const maxMs = maxIntervalMs;
        const range = Math.max(maxMs - minMs, 0);
        return minMs + Math.floor(Math.random() * (range + 1)); // uniform [2s, max]
    };
    const initialDelay = () => {
        // Make initial delay clearly de-synchronized: uniform in [max, 3*max]
        const maxMs = maxIntervalMs;
        const extraRange = 2 * maxMs;
        return maxMs + Math.floor(Math.random() * (extraRange + 1));
    };

    wallets.forEach((walletPk, idx) => {
        // Per-wallet seeded RNG for independence
        const seedBuf = createHash('sha256').update(String(walletPk)).digest();
        let seed = seedBuf.readUInt32BE(0) ^ (Date.now() & 0xffffffff);
        const rng = () => {
            // mulberry32 PRNG
            seed = (seed + 0x6d2b79f5) >>> 0;
            let t = seed;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        // Per-wallet interval override: SWAP_INTERVAL_0..SWAP_INTERVAL_9
        const overrideEnv = (process.env as Record<string, string | undefined>)[
            `SWAP_INTERVAL_${idx}`
        ];
        const intervalMsForWallet = Number(overrideEnv || baseIntervalMsEnv);
        const maxMsForWallet = Math.max(intervalMsForWallet, 2000);

        const jitteredDelayForWallet = () => {
            const minMs = 2000;
            const range = Math.max(maxMsForWallet - minMs, 0);
            return minMs + Math.floor(rng() * (range + 1));
        };

        const initialDelayForWallet = () => {
            // Fixed spread for initial start: uniform in [2s, 120s]
            const minMs = 2000;
            const maxMs = 120000;
            const range = maxMs - minMs;
            return minMs + Math.floor(rng() * (range + 1));
        };

        const offsetMs = initialDelayForWallet();
        const address = Wallet.fromPrivateKey(walletPk!!, provider).address.b256Address;
        walletStates[idx] = {
            walletIdx: idx,
            address,
            intervalMaxMs: maxMsForWallet,
            rngSeed: seed >>> 0,
            nextRunAt: Date.now() + offsetMs,
        };
        console.log(
            `WALLET[${idx}] init: intervalMs=${maxMsForWallet}ms, offsetMs=${offsetMs}ms, startAt=${new Date(
                Date.now() + offsetMs,
            ).toISOString()}`,
        );

        const runOnce = async () => {
            try {
                await runSwaps(Wallet.fromPrivateKey(walletPk!!, provider), idx);
                console.log('SWAP SUCCESS');
            } catch (error) {
                console.log('SWAP ERROR: ', error);
            }
        };

        const scheduleNext = () => {
            const nextDelay = jitteredDelayForWallet();
            walletStates[idx].nextRunAt = Date.now() + nextDelay;
            const scheduledAt = Date.now() + nextDelay;
            console.log(
                `WALLET[${idx}] nextDelay=${nextDelay}ms, nextAt=${new Date(
                    scheduledAt,
                ).toISOString()}`,
            );
            setTimeout(async () => {
                const firedAt = Date.now();
                console.log(
                    `WALLET[${idx}] timerFiredAt=${new Date(firedAt).toISOString()}, driftMs=${
                        firedAt - scheduledAt
                    }`,
                );
                const execStart = Date.now();
                await runOnce();
                const execEnd = Date.now();
                console.log(`WALLET[${idx}] execDurationMs=${execEnd - execStart}`);
                scheduleNext();
            }, nextDelay);
        };

        setTimeout(async () => {
            const firedAt0 = Date.now();
            const scheduledAt0 = firedAt0 - offsetMs; // approximate schedule time based on current
            console.log(
                `WALLET[${idx}] initialTimerFiredAt=${new Date(
                    firedAt0,
                ).toISOString()}, initialDriftMs=${firedAt0 - scheduledAt0}`,
            );
            const execStart0 = Date.now();
            await runOnce();
            const execEnd0 = Date.now();
            console.log(`WALLET[${idx}] initialExecDurationMs=${execEnd0 - execStart0}`);
            scheduleNext();
        }, offsetMs);
    });
}).on('error', (err: unknown) => {
    console.error(err);
});

app.get('/', (req: express.Request, res: express.Response) => {
    res.end('ok');
});

app.get('/state', (req: express.Request, res: express.Response) => {
    if (!STATE_API_KEY) {
        res.status(503).json({ error: 'STATE_API_KEY not configured' });
        return;
    }
    const apiKey = req.header('x-api-key');
    if (apiKey !== STATE_API_KEY) {
        res.status(401).json({ error: 'unauthorized' });
        return;
    }
    res.json({ serverTime: new Date().toISOString(), wallets: walletStates });
});
