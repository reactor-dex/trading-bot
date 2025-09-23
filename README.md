# Reactor Pool Trading Bot swap script
## Configuration
Create `.env` :
```
AMM_PRIVATE_KEY=
AMM_PROVIDER_URL=https://testnet.fuel.network/v1/graphql
REACTOR_CONTRACT_ADDRESS=0xebb4551879ecd41eeb720f50ca05344843acc4e05128537deb41bc92e254717d
```
## Run
```shell
npx tsx ./src/runSwaps.ts
```

## Liquidity management, exact out swaps, LP fees collections, etc
More details at https://www.npmjs.com/package/reactor-sdk-ts