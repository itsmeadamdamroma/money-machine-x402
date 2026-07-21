# Swarm: x402 promotion + white-space products

**Date:** 2026-07-21  
**Moltbook DMs:** not available in API (and account suspended for duplicate comments until ~2026-07-21T23:12Z)

---

## A) What already exists (saturated)

| Category | Status | Typical price |
|----------|--------|---------------|
| Crypto prices / DeFi mirrors | **MAX saturated** | $0.001–0.02 |
| Weather | **Saturated** | $0.001–0.01 |
| URL → markdown scrape | **Saturated** | $0.001–0.03 |
| Screenshots | **Saturated** | $0.005–0.04 |
| Generic web search | **Saturated** (Tavily/Exa own mindshare) | $0.001–0.01 |
| Browser sessions | Few brands (Browserbase) | $0.01–0.12/session |
| PDF→text | Moderate | $0.004–0.02 |
| Agent email (CuseTheJuice etc.) | Present | ~$0.01/action |
| On-chain RPC helpers | Flooded | $0.001–0.01 |

**Your current generic scrape ($0.05)** sits in a **crowded** band. Agents already have Olostep, Superhighway, zlurp, agentsvc, etc. cheaper.

---

## B) Gaps nobody owns well (ship these)

| # | Product | Price | Why unique | Ship |
|---|---------|-------|------------|------|
| **1** | **GigRadar** — multi-board paid-gig search (Superteam, r/forhire, HN, public Freelancer) | $0.15/search | Near-empty; agents need **work** not weather | 8–16h |
| **2** | **LightHouse402** — real-browser Lighthouse/CWV scores | $0.12/URL | **0** bazaar hits for lighthouse | 6–12h |
| **3** | **DocClerk-x402** — invoice/PDF → **fields + Excel** | $0.25+ | Not plain PDF-to-text | 8–16h |
| **4** | **AxeLive** — Playwright + axe-core WCAG | $0.08/URL | Static a11y clones only | 6–10h |
| **5** | **ChangeBrief** — semantic page change monitor | $0.10/poll | Stateful history moat | 10–18h |
| **6** | **CrawlJudge** — robots+ToS “safe to scrape?” score | $0.03/domain | Fused rubric rare | 4–8h |
| **7** | **CatalogNorm** — collection page → product array | $0.20/page | Multi-item ecom extract | 8–14h |
| **8** | **JobSchema** — job URL → skills/salary schema | $0.07/URL | Not generic scrape | 6–12h |
| **9** | **BazaarPick** — task → ranked x402 tools meta-API | $0.02 | Agents lost in 25k junk listings | 4–8h |
| **10** | **GovFormMap** — public form field inventory | $0.15–0.40 | Field discovery rare | 8–16h |

**Recommended build order for Rocky stack (Playwright + already have x402 shell):**  
1) **LightHouse402** or **AxeLive** (fastest differentiation)  
2) **GigRadar** (highest strategic fit / Money Machine)  
3) **DocClerk-x402** (higher $ / call)

---

## C) Promotion channels (NO Moltbook spam)

### Do first or listings fail

1. **Stable HTTPS domain** (Railway/Fly/VPS) — tunnels get 503 and **rejected** by x402-list  
2. **CDP facilitator + 1 real settle** → appears in Bazaar (main agent search)  
3. `declareDiscoveryExtension` + rich description  
4. `/.well-known/x402` + `/openapi.json`

### Ranked promo (48h after domain)

| Rank | Action | Link |
|------|--------|------|
| 1 | CDP Bazaar via settle | https://docs.cdp.coinbase.com/x402/bazaar |
| 2 | a2alist submit ($0.99) | https://a2alist.ai/submit |
| 3 | x402scan register | https://www.x402scan.com/resources/register |
| 4 | x402-list.com (needs own domain) | https://x402-list.com/submit |
| 5 | x402bazaar.org | https://www.x402bazaar.org/register |
| 6 | PR awesome-x402 | https://github.com/xpaysh/awesome-x402 |
| 7 | Discord #x402 **one** post | https://discord.gg/cdp |
| 8 | TG builders **one** post | https://t.me/x402builders |
| 9 | r/x402 show-and-tell | https://www.reddit.com/r/x402/ |
| 10 | X replies under @CoinbaseDev #x402 | quality replies only |

### Avoid

- Moltbook mass comments (banned 24h already)  
- Tunnel URLs as permanent listing  
- Weather/scrape clones as “unique”  

---

## D) Discovery API (for you)

```bash
# Browse catalog
curl -s 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=50&offset=0'

# Search
curl -s 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/search?query=lighthouse'

# Your merchant routes (after CDP settle)
curl -s 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/merchant?payTo=0x5Cc3c4E5020Ec3D81E392658eFe7b27966872CE7'
```

---

## E) Honest economics

- Protocol has many listings; **organic agent buyers are thin** for long-tail endpoints.  
- **Unique + high willingness-to-pay** + **CDP index** + **stable host** is the only x402 path that can work.  
- Parallel: human **$99 scrape jobs** still faster for first fiat dollar.

---

## Next build command (when you say go)

Ship **LightHouse402** as new routes on `x402-scrape-api` OR start **GigRadar** parsers — pick one.
