/** GigRadar — public freelance/bounty boards → structured gigs */
import * as cheerio from "cheerio";

const UA = "MoneyMachine-GigRadar/1.0 (+x402 public research)";

async function fetchText(url, timeout = 15000) {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/json" },
    signal: AbortSignal.timeout(timeout),
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`upstream ${r.status} ${url}`);
  return { text: await r.text(), contentType: r.headers.get("content-type") || "" };
}

function moneyFrom(text) {
  if (!text) return null;
  const m = text.match(/\$\s?([\d,]+(?:\.\d{2})?)/);
  if (m) return Number(m[1].replace(/,/g, ""));
  const m2 = text.match(/([\d,]+)\s*USDC/i);
  if (m2) return Number(m2[1].replace(/,/g, ""));
  return null;
}

async function superteam() {
  const gigs = [];
  try {
    const { text } = await fetchText(
      "https://earn.superteam.fun/api/listings?status=open&take=30",
      20000,
    );
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : data.listings || data.data || [];
    for (const x of items.slice(0, 25)) {
      const reward = x.rewardAmount ?? x.usdValue ?? x.reward;
      gigs.push({
        title: x.title || x.name || "Superteam listing",
        budget_min: reward != null ? Number(reward) : null,
        budget_max: reward != null ? Number(reward) : null,
        currency: "USD",
        skills: (x.skills || []).map((s) => (typeof s === "string" ? s : s.label || s.name)).filter(Boolean),
        source: "superteam",
        url: x.slug
          ? `https://earn.superteam.fun/listings/${x.slug}`
          : x.link || "https://earn.superteam.fun/",
        posted_at: x.deadline || x.createdAt || null,
        remote: true,
        confidence: 0.85,
      });
    }
  } catch (e) {
    gigs.push({
      title: "Superteam fetch error",
      source: "superteam",
      error: String(e.message || e),
      confidence: 0,
    });
  }
  return gigs;
}

async function hnWhoIsHiring() {
  // Latest "Who is hiring" via HN Algolia
  const gigs = [];
  try {
    const q = encodeURIComponent("Who is hiring");
    const { text } = await fetchText(
      `https://hn.algolia.com/api/v1/search_by_date?query=${q}&tags=story,author_whoishiring&hitsPerPage=3`,
    );
    const data = JSON.parse(text);
    const story = (data.hits || [])[0];
    if (!story) return gigs;
    const id = story.objectID;
    const { text: itemText } = await fetchText(
      `https://hn.algolia.com/api/v1/items/${id}`,
      20000,
    );
    const item = JSON.parse(itemText);
    const children = item.children || [];
    for (const c of children.slice(0, 40)) {
      const body = (c.text || "").replace(/<[^>]+>/g, " ");
      if (body.length < 40) continue;
      const remote = /remote/i.test(body);
      gigs.push({
        title: body.slice(0, 120).replace(/\s+/g, " ").trim(),
        budget_min: moneyFrom(body),
        budget_max: moneyFrom(body),
        currency: "USD",
        skills: [],
        source: "hn_whoishiring",
        url: `https://news.ycombinator.com/item?id=${c.id}`,
        posted_at: c.created_at || null,
        remote,
        confidence: 0.7,
      });
    }
  } catch (e) {
    gigs.push({ title: "HN fetch error", source: "hn_whoishiring", error: String(e.message || e), confidence: 0 });
  }
  return gigs;
}

async function redditForhire() {
  const gigs = [];
  try {
    const { text } = await fetchText(
      "https://www.reddit.com/r/forhire/new.json?limit=30",
      15000,
    );
    const data = JSON.parse(text);
    const posts = data?.data?.children || [];
    for (const ch of posts) {
      const p = ch.data || {};
      const title = p.title || "";
      if (!/\[hiring\]|\[task\]/i.test(title) && !/^hiring/i.test(title)) continue;
      gigs.push({
        title: title.slice(0, 200),
        budget_min: moneyFrom(title + " " + (p.selftext || "")),
        budget_max: moneyFrom(title + " " + (p.selftext || "")),
        currency: "USD",
        skills: [],
        source: "reddit_forhire",
        url: `https://www.reddit.com${p.permalink || ""}`,
        posted_at: p.created_utc ? new Date(p.created_utc * 1000).toISOString() : null,
        remote: true,
        confidence: 0.75,
      });
    }
  } catch (e) {
    gigs.push({ title: "Reddit fetch error", source: "reddit_forhire", error: String(e.message || e), confidence: 0 });
  }
  return gigs;
}

async function freelancerPublic() {
  const gigs = [];
  try {
    const { text } = await fetchText(
      "https://www.freelancer.com/jobs/web-scraping/",
      15000,
    );
    const $ = cheerio.load(text);
    $("a[href*='/projects/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const title = $(el).text().replace(/\s+/g, " ").trim();
      if (!title || title.length < 8 || title.length > 120) return;
      if (!href.includes("/projects/")) return;
      const url = href.startsWith("http") ? href : `https://www.freelancer.com${href}`;
      gigs.push({
        title,
        budget_min: null,
        budget_max: null,
        currency: "USD",
        skills: ["web-scraping"],
        source: "freelancer_public",
        url: url.split("?")[0],
        posted_at: null,
        remote: true,
        confidence: 0.55,
      });
    });
    // dedupe by url
    const seen = new Set();
    return gigs.filter((g) => {
      if (seen.has(g.url)) return false;
      seen.add(g.url);
      return true;
    }).slice(0, 25);
  } catch (e) {
    return [{ title: "Freelancer fetch error", source: "freelancer_public", error: String(e.message || e), confidence: 0 }];
  }
}

export async function searchGigs({ skills = [], min_budget_usd = 0, sources = null, limit = 25 } = {}) {
  const want = sources && sources.length
    ? sources
    : ["superteam", "reddit_forhire", "hn_whoishiring", "freelancer_public"];
  const skillSet = (skills || []).map((s) => String(s).toLowerCase());

  const batches = await Promise.all([
    want.includes("superteam") ? superteam() : [],
    want.includes("reddit_forhire") ? redditForhire() : [],
    want.includes("hn_whoishiring") ? hnWhoIsHiring() : [],
    want.includes("freelancer_public") ? freelancerPublic() : [],
  ]);
  let gigs = batches.flat();

  if (skillSet.length) {
    gigs = gigs.filter((g) => {
      const blob = `${g.title} ${(g.skills || []).join(" ")}`.toLowerCase();
      return skillSet.some((s) => blob.includes(s));
    });
  }
  if (min_budget_usd > 0) {
    gigs = gigs.filter((g) => (g.budget_max || g.budget_min || 0) >= min_budget_usd || g.budget_min == null);
  }

  // rank: prefer with budget + higher confidence
  gigs.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  return {
    count: Math.min(gigs.length, limit),
    gigs: gigs.slice(0, limit),
    sources_queried: want,
    note: "Public listings only. Budgets may be missing on some sources.",
  };
}
