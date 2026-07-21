# Promo submissions (do after stable domain)

**Current public (tunnel, temporary):** see `PUBLIC_URL.txt`  
**PayTo (Base):** `0x5Cc3c4E5020Ec3D81E392658eFe7b27966872CE7`

## Products (all x402, all 402-gated)

| Route | Price | Unique? |
|-------|-------|---------|
| GET /v1/demo | $0.01 | sample |
| POST /v1/scrape | $0.05 | commodity |
| **POST /v1/gigs/search** | **$0.15** | **GigRadar — rare** |
| **GET /v1/lighthouse** | **$0.12** | **LightHouse-lite — empty niche** |
| **POST /v1/a11y/audit** | **$0.08** | **Axe-lite** |
| **GET /v1/crawl/judge** | **$0.03** | **CrawlJudge** |
| **POST /v1/doc/extract** | **$0.25** | **DocClerk-lite** |

## 1) a2alist.ai — https://a2alist.ai/submit
- Name: MoneyMachine x402 Suite  
- URL: YOUR_DOMAIN  
- Description: GigRadar + Lighthouse + PDF extract + crawl judge + scrape for agents, USDC Base x402  
- Price: $0.03–$0.25  

## 2) x402scan — https://www.x402scan.com/resources/register
- Submit each path or base URL

## 3) x402-list.com — needs **non-tunnel domain**
- https://x402-list.com/submit

## 4) Discord #x402 (https://discord.gg/cdp) — ONE post
```
MoneyMachine x402 suite on Base (unique tools, not another weather API):
• GigRadar gigs search $0.15
• Lighthouse-lite vitals $0.12  
• DocClerk PDF fields $0.25
• CrawlJudge robots score $0.03
Demo: curl -i YOUR_DOMAIN/v1/demo → 402
PayTo: 0x5Cc3…2CE7
Public pages only.
```

## 5) GitHub PR awesome-x402
```markdown
- [MoneyMachine x402 Suite](YOUR_DOMAIN) - Agent APIs on Base USDC: GigRadar (freelance/bounty search), LightHouse-lite, a11y audit, CrawlJudge, DocClerk PDF extract, scrape. $0.01–$0.25/call.
```

## 6) CDP Bazaar (needs CDP API keys)
When you have CDP keys: set FACILITATOR to CDP, self-pay once, then:
`curl 'https://api.cdp.coinbase.com/platform/v2/x402/discovery/merchant?payTo=0x5Cc3c4E5020Ec3D81E392658eFe7b27966872CE7'`

## Blockers remaining
- [ ] Stable domain (Railway/Fly + DNS) — tunnels break listings  
- [ ] CDP keys for Bazaar index  
- [ ] Moltbook suspension ends ~24h after ban (no spam)  
