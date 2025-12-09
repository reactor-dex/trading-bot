# Reactor Pool Trading Bot swap script

## Configuration for mainnet FUEL/USDC pool
Create `.env` :
```
AMM_PRIVATE_KEY=
AMM_PROVIDER_URL=https://mainnet.fuel.network/v1/graphql
REACTOR_CONTRACT_ADDRESS=0xe0eeb0f14dbc2793a1fb701c507f184f6d44f1cee08f83fe3837b8ef41f55818

# FUEL (9 decimals)
POOL_BASE_TOKEN=0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82

# USDC (6 decimals)
POOL_QUOTE_TOKEN=0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b

# Pool fee tier (0.005% LP fee + 0.005% protocol fee = 0.01%)
FEE_TIER=100
```

## Configuration for mainnet FUEL/MOOR pool
Create `.env` :
```
AMM_PRIVATE_KEY=
AMM_PROVIDER_URL=https://mainnet.fuel.network/v1/graphql
REACTOR_CONTRACT_ADDRESS=0xe0eeb0f14dbc2793a1fb701c507f184f6d44f1cee08f83fe3837b8ef41f55818

# FUEL (9 decimals)
POOL_BASE_TOKEN=0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82

# MOOR (9 decimals)
POOL_QUOTE_TOKEN=0xa9d7987a3f2c2fb02b287c3a2ef619046e930848c6050d31efef48ad6d3bdee8

# Pool fee tier (0.005% LP fee + 0.005% protocol fee = 0.01%) 
FEE_TIER=100
```

## Run

```shell
npx tsx ./src/runSwaps.ts
```

## Liquidity management, exact out swaps, LP fees collections, etc

More details at https://www.npmjs.com/package/reactor-sdk-ts
