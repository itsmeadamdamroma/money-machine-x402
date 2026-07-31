<div align="center">

<h1>MoneyMachine x402 — 21 AI APIs that accept USDC</h1>

<p>Agent-native AI APIs on Base. No API keys. No subscriptions. No credit cards.<br>
Agents pay per call with <strong>USDC on Base</strong> via the <a href="https://x402.org">x402 protocol</a>.</p>

<br>

<img src="https://img.shields.io/badge/🤖_21_AI_APIs-success?style=for-the-badge" alt="21 AI APIs">
<img src="https://img.shields.io/badge/💰_x402_USDC-purple?style=for-the-badge" alt="x402 USDC">
<img src="https://img.shields.io/badge/🔑_Zero_API_Keys-blue?style=for-the-badge" alt="No API keys">
<img src="https://img.shields.io/badge/⛓️_Base_Network-0052FF?style=for-the-badge" alt="Base">
<img src="https://img.shields.io/badge/🔓_Open_Source-green?style=for-the-badge" alt="Open source">
<img src="https://img.shields.io/badge/⚡_Self--Facilitated-orange?style=for-the-badge" alt="Self-facilitated">

[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Base Network](https://img.shields.io/badge/Base-USDC-0052FF?style=flat-square&logo=coinbase&logoColor=white)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/x402-Micropayments-purple?style=flat-square)](https://x402.org)
[![Website](https://img.shields.io/badge/Website-mazzagrp.com-26A5E4?style=flat-square)](https://mazzagrp.com/apis)

</div>

---

> **MoneyMachine** is a suite of 21 production AI APIs that accept crypto payments via the x402 protocol. Agents authenticate with wallet signatures — no API keys, no signup, no credit card. Every call is paid in USDC on Base, settled instantly on-chain. Self-hosted or use our hosted endpoint at `api.mazzagrp.com`.

## Why x402?

Traditional API billing is broken for AI agents:

| Problem | x402 Solution |
|---------|---------------|
| Agents can't sign up for accounts | Wallet signature = identity |
| Agents can't enter credit cards | Pay per call with USDC |
| Subscription pricing wastes money | Pay only for what you use |
| API keys get leaked | No keys — just signatures |
| Rate limits on free tiers | No rate limits — pay per call |

## Quick Start

```bash
# Clone and run
git clone https://github.com/itsmeadamdamroma/money-machine-x402.git
cd money-machine-x402
cp .env.example .env   # Add your EVM_PRIVATE_KEY
npm install
npx playwright install chromium
npm start              # → http://localhost:4021
```

### Pay for a call (no API key needed)

```bash
# The server returns HTTP 402 with a payment request
curl http://localhost:4021/v1/demo

# HTTP/1.1 402 Payment Required
# X-PAYMENT: base:0x123...  # EIP-712 payment payload
# Your x402 client signs and retries:
curl -H "X-PAYMENT: <signed-payment>" http://localhost:4021/v1/demo
# → {"result": "Hello from MoneyMachine!"}
```

## All 21 Endpoints

| # | Endpoint | Method | Path | Price | Description |
|---|----------|--------|------|-------|-------------|
| 1 | Demo | GET | `/v1/demo` | $0.01 | Test x402 payment flow |
| 2 | Scrape | POST | `/v1/scrape` | $0.05 | AI web scraping with extraction |
| 3 | **GigRadar** | POST | `/v1/gigs/search` | $0.15 | Find freelance gigs across 20+ platforms |
| 4 | Lighthouse | GET | `/v1/lighthouse?url=` | $0.12 | Performance audit for any URL |
| 5 | A11y Audit | POST | `/v1/a11y/audit` | $0.08 | WCAG accessibility audit |
| 6 | CrawlJudge | GET | `/v1/crawl/judge?url=` | $0.03 | Evaluate if a URL is crawlable |
| 7 | **DocClerk** | POST | `/v1/doc/extract` | $0.25 | Extract text from PDF/DOCX/images |
| 8 | Sentiment | POST | `/v1/sentiment` | $0.10 | Sentiment + emotion detection |
| 9 | Summarize | POST | `/v1/summarize` | $0.10 | AI summarization with key points |
| 10 | Translate | POST | `/v1/translate` | $0.12 | Neural translation, 100+ languages |
| 11 | Classify | POST | `/v1/classify` | $0.08 | Custom category text classification |
| 12 | NER | POST | `/v1/ner` | $0.10 | Named Entity Recognition |
| 13 | Embeddings | POST | `/v1/embeddings` | $0.05 | Text embeddings for semantic search |
| 14 | Code Review | POST | `/v1/code-review` | $0.15 | AI code review with security analysis |
| 15 | **Text-to-SQL** | POST | `/v1/sql-generate` | $0.12 | Natural language to SQL for enterprise schemas |
| 16 | **RAG** | POST | `/v1/rag-query` | $0.20 | RAG with citations and multi-hop reasoning |
| 17 | **WebAgent** | POST | `/v1/web-agent` | $0.50 | Browser automation for real tasks |
| 18 | **Sheets** | POST | `/v1/sheets-automation` | $0.30 | Multi-step spreadsheet automation |
| 19 | Roleplay | POST | `/v1/roleplay` | $0.10 | Character engine for brand personas |
| 20 | Negotiation | POST | `/v1/negotiation` | $0.15 | Negotiation training simulator |
| 21 | **Knowledge Recall** | POST | `/v1/knowledge-recall` | $0.25 | Zero-hallucination recall with citations |

### Machine-Readable Metadata

```bash
curl http://localhost:4021/openapi.json    # OpenAPI 3.1 spec
curl http://localhost:4021/.well-known/x402  # x402 service metadata
```

## Code Examples

### Python

```python
import requests

# 1. First call returns 402 with payment request
r = requests.post("https://api.mazzagrp.com/v1/sentiment",
    json={"text": "I love this product!"})
# → 402, headers contain x402 payment payload

# 2. Sign with your wallet and retry
from eth_account import Account
signed = sign_x402_payment(r.headers["X-PAYMENT"], private_key)
r = requests.post("https://api.mazzagrp.com/v1/sentiment",
    json={"text": "I love this product!"},
    headers={"X-PAYMENT": signed})
print(r.json())
# → {"sentiment": "positive", "confidence": 0.98, "emotions": {"joy": 0.85}}
```

### JavaScript

```javascript
import { fetchWithPayment } from "@x402/core";

// One-liner — x402 client handles signing + retry
const res = await fetchWithPayment("https://api.mazzagrp.com/v1/sentiment", {
  method: "POST",
  body: JSON.stringify({ text: "I love this product!" })
});
const data = await res.json();
// → { sentiment: "positive", confidence: 0.98 }
```

### curl

```bash
# Step 1: Get payment request
curl -X POST https://api.mazzagrp.com/v1/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this product!"}'
# → 402 + X-PAYMENT header

# Step 2: Sign and retry (use x402 CLI)
x402 pay https://api.mazzagrp.com/v1/sentiment '{"text":"I love this product!"}'
```

## Self-Hosting vs Hosted

| | Self-Hosted | Hosted (api.mazzagrp.com) |
|---|-------------|---------------------------|
| Cost | Free (open source) | Pay per call in USDC |
| Setup | 5 min | Zero setup |
| Facilitator | Your own wallet | Our facilitator |
| Rate limits | None | None |
| Uptime | Your server | 99.9% SLA |

## Docker

```bash
docker build -t moneymachine .
docker run -p 4021:4021 -e EVM_PRIVATE_KEY=0x... moneymachine
```

## How x402 Works

```
1. Agent → API:     "I want to call /v1/sentiment"
2. API → Agent:     402 Payment Required + EIP-712 payload
3. Agent signs:     Signs with wallet private key
4. Agent → API:     Original request + X-PAYMENT header
5. API verifies:     Checks signature on-chain
6. API → Agent:      200 OK + result
```

No API keys. No signup. No credit card. Just wallet signatures and USDC.

## Use Cases

- **AI Agents**: Autonomous agents that need to call APIs but can't sign up for accounts
- **Developers**: Pay-per-call without subscription lock-in
- **Startups**: No minimum spend, no monthly fees
- **Crypto-native apps**: Native USDC payments, no fiat onramp needed

## Roadmap

- [x] 21 API endpoints live
- [x] x402 self-facilitator
- [x] OpenAPI 3.1 spec
- [x] Docker support
- [ ] Python SDK (`pip install moneymachine`)
- [ ] JavaScript SDK (`npm install moneymachine`)
- [ ] MCP server integration
- [ ] HuggingFace Spaces demos
- [ ] Agent marketplace listing

## License

MIT — do whatever you want. Fork it, host it, sell it, build on it.

## Links

- 🌐 [Website](https://mazzagrp.com/apis)
- 📖 [API Docs](https://mazzagrp.com/api-docs)
- 💬 [Telegram](https://t.me/Mazza_Group_)
- 🐦 [X/Twitter](https://x.com/Mazza_Group_)
- 📝 [Blog](https://mazzagrp.com/blog)
- ⚡ [x402 Protocol](https://x402.org)
- ⛓️ [Base Network](https://base.org)

---

<div align="center">
<sub>Built by <a href="https://github.com/itsmeadamdamroma">Mazza Group LLC</a>. Powered by x402.</sub>
</div>
