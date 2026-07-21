# MoneyMachine x402 Suite

Unique + classic agent APIs. **USDC on Base** via x402 self-facilitator.

## Run
```bash
cp .env.example .env   # or use existing .env with EVM_PRIVATE_KEY
npm install
npx playwright install chromium
npm start              # :4021
```

## Products
| Method | Path | Price |
|--------|------|-------|
| GET | /health | free |
| GET | /v1/demo | $0.01 |
| POST | /v1/scrape | $0.05 |
| POST | /v1/gigs/search | **$0.15 GigRadar** |
| GET | /v1/lighthouse?url= | **$0.12** |
| POST | /v1/a11y/audit | **$0.08** |
| GET | /v1/crawl/judge?url= | **$0.03** |
| POST | /v1/doc/extract | **$0.25 DocClerk** |

Machine metadata: `/openapi.json` · `/.well-known/x402`

## Docker
```bash
docker build -t mm-x402 .
docker run --env-file .env -p 4021:4021 mm-x402
```
