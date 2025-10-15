# Reactor Pool Trading Bot swap script
## Configuration for mainnet FUEL/USDC pool
Create `.env` :
```
AMM_PRIVATE_KEY=
AMM_PROVIDER_URL=https://mainnet.fuel.network/v1/graphql
REACTOR_CONTRACT_ADDRESS=0xbf42e11139c671af25030d291d9cf7fd1f8dbe01b6af69f5a8eda097544e3b7e

# FUEL (9 decimals)
POOL_BASE_TOKEN=0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82

# USDC (6 decimals)
POOL_QUOTE_TOKEN=0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b

# amounts for 1 FUEL with full decimals
BASE_TOKEN_IN_SWAP_AMOUNT=1000000000
QUOTE_TOKEN_IN_SWAP_AMOUNT=3225
```
## Run
```shell
npx tsx ./src/runSwaps.ts
```

## Liquidity management, exact out swaps, LP fees collections, etc
More details at https://www.npmjs.com/package/reactor-sdk-ts