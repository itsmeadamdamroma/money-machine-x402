/**
 * MoneyMachine x402 Multi-Service API (Base USDC)
 * Unique products + classic scrape.
 */
import "dotenv/config";
import express from "express";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme as ExactEvmServerScheme } from "@x402/evm/exact/server";
import { x402Facilitator } from "@x402/core/facilitator";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { registerExactEvmScheme } from "@x402/evm/exact/facilitator";
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { searchGigs } from "./lib/gigradar.js";
import { judgeUrl } from "./lib/crawljudge.js";
import { extractPdfFromUrl } from "./lib/docclerk.js";
import { lightPack, axeLite } from "./lib/browsertools.js";

const PORT = Number(process.env.PORT || 4021);
const NETWORK = process.env.NETWORK || "eip155:8453";
const pk = process.env.EVM_PRIVATE_KEY;
if (!pk) {
  console.error("Missing EVM_PRIVATE_KEY");
  process.exit(1);
}
const account = privateKeyToAccount(pk);
const payTo = account.address;

const P = {
  demo: process.env.PRICE_DEMO || "$0.01",
  scrape: process.env.PRICE_SCRAPE || "$0.05",
  gigradar: process.env.PRICE_GIGRADAR || "$0.15",
  lighthouse: process.env.PRICE_LIGHTHOUSE || "$0.12",
  axe: process.env.PRICE_AXE || "$0.08",
  crawljudge: process.env.PRICE_CRAWLJUDGE || "$0.03",
  docclerk: process.env.PRICE_DOCCLERK || "$0.25",
};

const viemClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.BASE_RPC || "https://mainnet.base.org"),
}).extend(publicActions);

const evmSigner = toFacilitatorEvmSigner({
  address: account.address,
  getCode: viemClient.getCode,
  readContract: viemClient.readContract,
  verifyTypedData: viemClient.verifyTypedData,
  writeContract: viemClient.writeContract,
  sendTransaction: viemClient.sendTransaction,
  waitForTransactionReceipt: viemClient.waitForTransactionReceipt,
});

const facilitator = new x402Facilitator();
registerExactEvmScheme(facilitator, { signer: evmSigner, networks: NETWORK });

const resourceServer = new x402ResourceServer({
  verify: facilitator.verify.bind(facilitator),
  settle: facilitator.settle.bind(facilitator),
  getSupported: async () => facilitator.getSupported(),
}).register(NETWORK, new ExactEvmServerScheme());

function accept(price, description, extra = {}) {
  return {
    accepts: [{ scheme: "exact", price, network: NETWORK, payTo }],
    description,
    mimeType: "application/json",
    extensions: {
      ...declareDiscoveryExtension({
        output: { example: extra.example || { ok: true } },
        input: extra.input,
        bodyType: extra.bodyType,
      }),
    },
  };
}

const paymentRoutes = {
  "GET /v1/demo": accept(P.demo, "Demo public scrape quotes.toscrape.com → JSON rows"),
  "POST /v1/scrape": accept(P.scrape, "Public HTML scrape → texts+links. Body: {url, selector?}", {
    bodyType: "json",
    input: { example: { url: "https://example.com" } },
  }),
  "POST /v1/gigs/search": accept(
    P.gigradar,
    "GigRadar: public freelance/bounty boards → structured gigs (Superteam, r/forhire, HN hiring, Freelancer public). Body: {skills?, min_budget_usd?, sources?, limit?}",
    {
      bodyType: "json",
      input: { example: { skills: ["python", "playwright"], min_budget_usd: 50, limit: 20 } },
      example: { count: 10, gigs: [{ title: "…", budget_min: 100, source: "superteam", url: "https://…" }] },
    },
  ),
  "GET /v1/lighthouse": accept(
    P.lighthouse,
    "LightHouse-lite: Playwright Core Web Vitals proxy scores for a public URL. Query: url, strategy=mobile|desktop",
    { example: { scores: { overall_proxy: 72 }, metrics: { fcp_ms: 1200 } } },
  ),
  "POST /v1/a11y/audit": accept(
    P.axe,
    "Axe-lite a11y audit via real browser (images alt, labels, lang, buttons). Body: {url}",
    { bodyType: "json", input: { example: { url: "https://example.com" } } },
  ),
  "GET /v1/crawl/judge": accept(
    P.crawljudge,
    "CrawlJudge: robots.txt + ToS phrase signals → allow|careful|deny for agent scraping. Query: url",
  ),
  "POST /v1/doc/extract": accept(
    P.docclerk,
    "DocClerk-lite: public PDF URL → heuristic invoice/receipt fields. Body: {pdf_url}",
    { bodyType: "json", input: { example: { pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" } } },
  ),
};

const app = express();
app.use(express.json({ limit: "512kb" }));


app.get("/.well-known/agent.json", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "agent-card.json"));
});
app.get("/agent-card.json", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "agent-card.json"));
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "money-machine-x402-suite",
    payTo,
    network: NETWORK,
    prices: P,
    products: Object.keys(paymentRoutes),
  });
});

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html><meta charset=utf-8>
<title>MoneyMachine x402 Suite</title>
<body style="font-family:system-ui;max-width:800px;margin:2rem auto;padding:0 1rem">
<h1>MoneyMachine x402 Suite</h1>
<p>Pay-per-call APIs for agents · USDC on <b>Base</b> · Seller <code>${payTo}</code></p>
<ul>
<li>GET /health free</li>
<li>GET /v1/demo ${P.demo} — sample scrape</li>
<li>POST /v1/scrape ${P.scrape} — HTML scrape</li>
<li>POST /v1/gigs/search ${P.gigradar} — <b>GigRadar</b> paid gigs</li>
<li>GET /v1/lighthouse?url= ${P.lighthouse} — <b>LightHouse-lite</b></li>
<li>POST /v1/a11y/audit ${P.axe} — <b>Axe-lite</b></li>
<li>GET /v1/crawl/judge?url= ${P.crawljudge} — <b>CrawlJudge</b></li>
<li>POST /v1/doc/extract ${P.docclerk} — <b>DocClerk-lite</b></li>
</ul>
<p><a href="/openapi.json">openapi.json</a> · <a href="/.well-known/x402">.well-known/x402</a></p>
</body>`);
});

app.get("/openapi.json", (_req, res) => {
  res.json({
    openapi: "3.0.3",
    info: { title: "MoneyMachine x402 Suite", version: "2.0.0" },
    servers: [{ url: process.env.PUBLIC_BASE || `http://localhost:${PORT}` }],
    paths: {
      "/health": { get: { summary: "Health" } },
      "/v1/demo": { get: { summary: "Demo scrape", "x-x402-price": P.demo } },
      "/v1/scrape": { post: { summary: "Scrape", "x-x402-price": P.scrape } },
      "/v1/gigs/search": { post: { summary: "GigRadar", "x-x402-price": P.gigradar } },
      "/v1/lighthouse": { get: { summary: "LightHouse-lite", "x-x402-price": P.lighthouse } },
      "/v1/a11y/audit": { post: { summary: "Axe-lite", "x-x402-price": P.axe } },
      "/v1/crawl/judge": { get: { summary: "CrawlJudge", "x-x402-price": P.crawljudge } },
      "/v1/doc/extract": { post: { summary: "DocClerk-lite", "x-x402-price": P.docclerk } },
    },
  });
});

app.get("/.well-known/x402", (_req, res) => {
  res.json({
    version: 2,
    payTo,
    network: NETWORK,
    resources: Object.entries(paymentRoutes).map(([route, cfg]) => ({
      route,
      price: cfg.accepts[0].price,
      description: cfg.description,
    })),
  });
});

app.use(paymentMiddleware(paymentRoutes, resourceServer));

function logPayment(kind, price, extra = "") {
  const line = `${new Date().toISOString()}\t${kind}\t${price}\t${payTo}\t${extra}\n`;
  fs.appendFileSync(path.join(process.cwd(), "payments.log"), line);
  console.log("[PAID]", line.trim());
}

function blockPrivate(url) {
  const u = new URL(url);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("http(s) only");
  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(u.hostname) || u.hostname.endsWith(".local"))
    throw new Error("private hosts blocked");
  return u;
}

app.get("/v1/demo", async (_req, res) => {
  try {
    const url = "https://quotes.toscrape.com/";
    const html = await fetch(url, { headers: { "User-Agent": "MoneyMachine/2.0" }, signal: AbortSignal.timeout(15000) }).then((r) => r.text());
    const $ = cheerio.load(html);
    const rows = [];
    $(".quote").each((_, el) => {
      rows.push({
        title: $(el).find(".text").text().trim().slice(0, 200),
        author: $(el).find(".author").text().trim(),
        tags: $(el).find(".tag").map((i, t) => $(t).text().trim()).get().join(", "),
      });
    });
    logPayment("demo", P.demo);
    res.json({ source: url, count: rows.length, rows: rows.slice(0, 20) });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/v1/scrape", async (req, res) => {
  try {
    const url = String(req.body?.url || "").trim();
    blockPrivate(url);
    const selector = String(req.body?.selector || "h1,h2,h3,p,a,li").slice(0, 200);
    const html = await fetch(url, {
      headers: { "User-Agent": "MoneyMachine/2.0" },
      signal: AbortSignal.timeout(20000),
    }).then((r) => {
      if (!r.ok) throw new Error(`upstream ${r.status}`);
      return r.text();
    });
    const $ = cheerio.load(html);
    const texts = [];
    $(selector).each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t.length > 2) texts.push(t.slice(0, 300));
    });
    const links = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("http")) links.push({ href, text: $(el).text().trim().slice(0, 100) });
    });
    logPayment("scrape", P.scrape, url);
    res.json({ url, title: $("title").text().trim(), texts: [...new Set(texts)].slice(0, 50), links: links.slice(0, 30) });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/v1/gigs/search", async (req, res) => {
  try {
    const result = await searchGigs({
      skills: req.body?.skills || [],
      min_budget_usd: Number(req.body?.min_budget_usd || 0),
      sources: req.body?.sources || null,
      limit: Math.min(Number(req.body?.limit || 25), 50),
    });
    logPayment("gigradar", P.gigradar, JSON.stringify(req.body || {}));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/v1/lighthouse", async (req, res) => {
  try {
    const url = String(req.query.url || "").trim();
    blockPrivate(url);
    const strategy = req.query.strategy === "desktop" ? "desktop" : "mobile";
    const result = await lightPack(url, strategy);
    logPayment("lighthouse", P.lighthouse, url);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/v1/a11y/audit", async (req, res) => {
  try {
    const url = String(req.body?.url || "").trim();
    blockPrivate(url);
    const result = await axeLite(url);
    logPayment("a11y", P.axe, url);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.get("/v1/crawl/judge", async (req, res) => {
  try {
    const url = String(req.query.url || "").trim();
    blockPrivate(url);
    const result = await judgeUrl(url);
    logPayment("crawljudge", P.crawljudge, url);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/v1/doc/extract", async (req, res) => {
  try {
    const pdf_url = String(req.body?.pdf_url || "").trim();
    blockPrivate(pdf_url);
    const result = await extractPdfFromUrl(pdf_url);
    logPayment("docclerk", P.docclerk, pdf_url);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`MoneyMachine x402 suite :${PORT} payTo=${payTo}`);
  console.log(JSON.stringify(P));
});
